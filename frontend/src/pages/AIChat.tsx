import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { askAI } from '../api';
import { clsx } from 'clsx';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your AI ERP assistant. You can ask me questions about your companies, contacts, deals, employees, and finances. What would you like to know?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQueries = [
    "What is our net income?",
    "Which company has the largest deal?",
    "Show me low stock items",
    "List all employees in Engineering",
    "Who are our top suppliers?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (customQuery?: string) => {
    const queryToSend = customQuery || input.trim();
    if (!queryToSend || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: queryToSend }]);
    setIsLoading(true);

    try {
      const response = await askAI(queryToSend);
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error while processing your request. Please check if the backend is running and the API key is set." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-screen bg-black">
      <div className="p-6 border-b border-gray-800 flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="text-blue-500" />
            AI Assistant
            </h1>
            <p className="text-gray-400">Natural Language Insights over your ERP data</p>
        </div>
        <div className="bg-blue-600/10 border border-blue-500/30 px-3 py-1 rounded-full flex items-center gap-2">
            <Sparkles size={14} className="text-blue-400" />
            <span className="text-xs font-bold text-blue-400 uppercase tracking-tighter">Gemini 2.0 Flash</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={clsx(
              "flex gap-4 max-w-3xl",
              msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div className={clsx(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              msg.role === 'assistant' ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-200"
            )}>
              {msg.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
            </div>
            <div className={clsx(
              "px-4 py-2 rounded-2xl leading-relaxed",
              msg.role === 'assistant' ? "bg-gray-900 text-gray-100 rounded-tl-none border border-gray-800" : "bg-blue-600 text-white rounded-tr-none"
            )}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 max-w-3xl">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Bot size={18} />
            </div>
            <div className="px-4 py-2 rounded-2xl bg-gray-900 text-gray-100 rounded-tl-none flex items-center gap-2 border border-gray-800">
              <Loader2 size={16} className="animate-spin" />
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 border-t border-gray-800 bg-black">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Suggested Queries */}
          <div className="flex flex-wrap gap-2">
            {suggestedQueries.map((query, i) => (
                <button
                    key={i}
                    onClick={() => handleSend(query)}
                    className="text-xs bg-gray-900 hover:bg-gray-800 text-gray-300 px-3 py-1.5 rounded-lg border border-gray-800 transition-colors"
                >
                    {query}
                </button>
            ))}
          </div>

          <div className="relative">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask a question about your business..."
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
            >
                <Send size={20} />
            </button>
          </div>
        </div>
        <p className="text-center text-[10px] text-gray-500 mt-4 uppercase tracking-widest font-bold">
          AI-Native ERP Engine • powered by Gemini 2.0 Flash
        </p>
      </div>
    </div>
  );
};

export default AIChat;
