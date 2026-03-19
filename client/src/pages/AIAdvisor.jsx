import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import Markdown from 'react-markdown';
import { apiPost, apiGet } from '../utils/api';

export default function AIAdvisor() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your AI Personal Finance Advisor. How can I help you today? You can ask me about budgeting, debt repayment, tax planning (Section 80C, Old vs New Regime), or investment strategies (Mutual Funds, FDs, PPF)." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      let financialData = null;
      try {
        financialData = await apiGet('/api/finance/summary');
      } catch (err) {
        console.warn('Could not load financial context for AI');
      }

      const payload = { message: userMessage };
      if (financialData) payload.financialData = financialData;

      const data = await apiPost('/api/chat', payload);
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error processing your request. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col pb-6">
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-full">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-slate-900">Financial Advisor AI</h2>
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              Online & Ready
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={clsx("flex gap-4 max-w-[85%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
              <div className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                msg.role === 'user' ? "bg-slate-200" : "bg-slate-900"
              )}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-slate-600" /> : <Bot className="w-4 h-4 text-white" />}
              </div>
              <div className={clsx(
                "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                msg.role === 'user'
                  ? "bg-slate-900 text-white rounded-tr-none"
                  : "bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-none"
              )}>
                {msg.role === 'user' ? (
                  msg.content
                ) : (
                  <div className="markdown-body prose prose-sm prose-slate max-w-none">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-4 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-500 rounded-tl-none flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">Analyzing financial data...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your finances..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-2 p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 hide-scrollbar">
            {['How can I reduce my debt?', 'Analyze my spending', 'Tax saving tips under Section 80C', 'Best SIPs for beginners'].map(suggestion => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setInput(suggestion)}
                className="whitespace-nowrap px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
