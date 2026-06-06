import os
from dotenv import load_dotenv

load_dotenv()

_db_url = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")
if _db_url.startswith("postgres://"):
    _db_url = _db_url.replace("postgres://", "postgresql://", 1)
SQLALCHEMY_DATABASE_URL = _db_url


def get_nlq_response(query: str):
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        from langchain_community.utilities import SQLDatabase
        from langchain_community.agent_toolkits import create_sql_agent

        db = SQLDatabase.from_uri(SQLALCHEMY_DATABASE_URL)
        llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0)
        agent_executor = create_sql_agent(llm, db=db, agent_type="tool-calling", verbose=True)
        result = agent_executor.invoke({"input": query})
        return result["output"]
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
            return "The AI Assistant is currently busy (API quota reached). Please try again in a minute."
        return f"Error processing query: {error_msg}. Please make sure GOOGLE_API_KEY is set."


def get_ai_insight(stats: dict):
    try:
        if not os.getenv("GOOGLE_API_KEY"):
            return "Company health is stable. (Configure Gemini for real-time insights)"

        from langchain_google_genai import ChatGoogleGenerativeAI
        llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0.7)
        prompt = f"As a business consultant, provide a 1-2 sentence positive and professional insight based on these ERP stats: {stats}. Focus on the most important metric."
        response = llm.invoke(prompt)
        return response.content
    except Exception as e:
        if "429" in str(e):
            return f"Growth looks promising based on your ${stats.get('revenue', 0):,.0f} revenue."
        return "Operational data is within normal parameters."


def score_lead(lead_data: dict):
    try:
        if not os.getenv("GOOGLE_API_KEY"):
            score = 50
            if "Referral" in lead_data.get("source", ""):
                score = 80
            priority = "Warm" if score > 70 else "Cold"
            return {"score": score, "priority": priority}

        from langchain_google_genai import ChatGoogleGenerativeAI
        import json
        import re

        llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0)
        prompt = f"""
        Analyze this marketing lead and provide a JSON response with 'score' (0-100) and 'priority' ('Hot', 'Warm', 'Cold').
        Lead: {lead_data}
        Base the score on the quality of the source and professional nature of the email.
        """
        response = llm.invoke(prompt)
        content = response.content
        match = re.search(r'\{.*\}', content, re.DOTALL)
        if match:
            return json.loads(match.group())
        return {"score": 50, "priority": "Warm"}
    except Exception:
        return {"score": 40, "priority": "Cold"}


def mock_nlq_response(query: str):
    return f"This is a mock response to: '{query}'. To enable real AI responses, please configure a Gemini API Key (GOOGLE_API_KEY)."
