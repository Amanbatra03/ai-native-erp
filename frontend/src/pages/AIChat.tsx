import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { askAI } from '../api';
import { clsx } from 'clsx';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ThinkingDots = () => (
  <div className="flex items-center gap-1 px-4 py-3">
    <span className="thinking-dot w-1.5 h-1.5 bg-gray-500 rounded-full" />
    <span className="thinking-dot w-1.5 h-1.5 bg-gray-500 rounded-full" />
    <span className="thinking-dot w-1.5 h-1.5 bg-gray-500 rounded-full" />
  </div>
);

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your AI ERP assistant. Ask me anything about your companies, contacts, deals, employees, and finances." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQueries = [
    "What is our net income?",
    "Largest deal by company?",
    "Show low stock items",
    "Engineering team list",
    "Top suppliers"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (customQuery?: string) => {
    const queryToSend = customQuery || input.trim();
    if (!queryToSend || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: queryToSend }]);
    setIsLoading(true);

    try {
      const response = await askAI(queryToSend);
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "I encountered an error. Please check if the backend is running and the API key is set." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-screen bg-[#050505]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/[0.06] flex justify-between items-center bg-[#080808]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_12px_rgba(37,99,235,0.3)]">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">AI Assistant</h1>
            <p className="text-[10px] text-gray-600">Natural language insights over your ERP data</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-blue-600/10 border border-blue-500/20 px-2.5 py-1 rounded-full">
          <Sparkles size={11} className="text-blue-400" />
          <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wide">Gemini 2.0 Flash</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={clsx(
              "flex gap-3 max-w-2xl",
              msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div className={clsx(
              "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
              msg.role === 'assistant'
                ? "bg-blue-600/90 text-white shadow-[0_0_8px_rgba(37,99,235,0.25)]"
                : "bg-white/10 text-gray-300"
            )}>
              {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
            </div>
            <div className={clsx(
              "px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-[85%]",
              msg.role === 'assistant'
                ? "bg-[#111] text-gray-200 rounded-tl-sm border border-white/[0.07]"
                : "bg-blue-600 text-white rounded-tr-sm"
            )}>
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 max-w-2xl">
            <div className="w-7 h-7 rounded-lg bg-blue-600/90 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_8px_rgba(37,99,235,0.25)]">
              <Bot size={14} />
            </div>
            <div className="bg-[#111] rounded-2xl rounded-tl-sm border border-white/[0.07]">
              <ThinkingDots />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-6 pb-5 pt-4 border-t border-white/[0.06] bg-[#080808]">
        <div className="max-w-2xl mx-auto space-y-3">
          {/* Suggested queries */}
          <div className="flex flex-wrap gap-1.5">
            {suggestedQueries.map((query, i) => (
              <button
                key={i}
                onClick={() => handleSend(query)}
                className="text-[11px] text-gray-500 hover:text-gray-200 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-white/[0.12] px-3 py-1.5 rounded-full transition-all duration-150"
              >
                {query}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question about your business…"
              className="w-full bg-[#0f0f0f] border border-white/[0.08] focus:border-blue-500/50 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-gray-700 outline-none transition-all duration-150"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-600 hover:text-blue-400 disabled:opacity-30 transition-colors duration-150"
            >
              <Send size={16} />
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] text-gray-700 mt-3 uppercase tracking-[0.15em] font-semibold">
          AI-Native ERP · Gemini 2.0 Flash
        </p>
      </div>
    </div>
  );
};

export default AIChat;
