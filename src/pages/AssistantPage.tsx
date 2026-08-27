import React, { useState, useEffect, useRef } from 'react';
import { RecommendationResponse, ScoredProduct } from '../types';
import { api } from '../services/api';
import { ScoreBadge } from '../components/ScoreBadge';
import { useCompare } from '../context/CompareContext';
import { useToast } from '../context/ToastContext';
import {
  Bot,
  Send,
  Sparkles,
  User,
  ArrowRight,
  Plus,
  Check,
  Cpu,
  Layers,
  HelpCircle,
  RotateCcw,
  Sliders,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  recommendations?: RecommendationResponse;
  suggestedQuestions?: string[];
  isAiPowered?: boolean;
  timestamp: string;
}

interface AssistantPageProps {
  initialQuery?: string;
  onNavigate: (page: any, extra?: any) => void;
  onOpenWeightConfig: () => void;
}

export const AssistantPage: React.FC<AssistantPageProps> = ({
  initialQuery = '',
  onNavigate,
  onOpenWeightConfig,
}) => {
  const { addToCompare, isInCompare } = useCompare();
  const { showToast } = useToast();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Structured Query controls
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [budgetLimit, setBudgetLimit] = useState<number | ''>('');
  const [usagePurpose, setUsagePurpose] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  // Initial welcome message
  useEffect(() => {
    const welcomeMsg: ChatMessage = {
      id: 'msg-welcome',
      sender: 'assistant',
      text: 'Hello! I am **SmartBuy AI**, your objective shopping advisor. Tell me what product you are searching for, your budget, or your key use-case (e.g. *"I need a laptop under ₹60,000 for programming and long battery life"*), and I will calculate the highest value options for you.',
      suggestedQuestions: [
        'Best laptop under ₹60,000 for coding',
        'Top noise-cancelling headphones for travel',
        'Best camera phone under ₹40,000',
        'Smartwatch with long battery life for fitness',
      ],
      isAiPowered: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([welcomeMsg]);

    if (initialQuery) {
      handleSendMessage(initialQuery);
    }
  }, []);

  const handleSendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || isProcessing) return;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsProcessing(true);

    try {
      // Build structured request alongside text
      const assistantRes = await api.chatAssistant(text);

      const botMsg: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: 'assistant',
        text: assistantRes.reply,
        recommendations: assistantRes.recommendations,
        suggestedQuestions: assistantRes.suggestedQuestions,
        isAiPowered: assistantRes.isAiPowered,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, I encountered an issue analyzing the catalog. Please try rephrasing your search query.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStructuredSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let queryParts = [];
    if (selectedCategory !== 'All') queryParts.push(selectedCategory);
    if (budgetLimit) queryParts.push(`under ₹${budgetLimit}`);
    if (usagePurpose) queryParts.push(`for ${usagePurpose}`);

    const compiledQuery = queryParts.join(' ') || 'Recommend top products';
    handleSendMessage(compiledQuery);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-lg">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>SmartBuy AI Advisor</span>
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-full">
                Interactive Assistant
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              5-factor mathematical scoring + natural requirement matching
            </p>
          </div>
        </div>

        <button
          onClick={onOpenWeightConfig}
          className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Sliders className="w-3.5 h-3.5 text-indigo-500" />
          <span>Tune Algorithm Weights</span>
        </button>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[72vh]">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-4xl ${
                msg.sender === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`space-y-4 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white max-w-lg'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 flex-1'
                }`}
              >
                {/* Text Content */}
                <div className="whitespace-pre-line leading-relaxed font-normal">
                  {msg.text}
                </div>

                {/* Embedded Recommendations (if present) */}
                {msg.recommendations && msg.recommendations.recommendedProducts.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Top Algorithmic Matches</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {msg.recommendations.recommendedProducts.slice(0, 4).map((p) => {
                        const inCompare = isInCompare(p.id);
                        return (
                          <div
                            key={p.id}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3.5 space-y-3 shadow-xs"
                          >
                            <div className="flex items-start gap-3">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-14 h-14 object-cover rounded-xl bg-slate-100 shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div className="flex-1 min-w-0">
                                {p.badge && (
                                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500 text-white mb-1">
                                    {p.badge}
                                  </span>
                                )}
                                <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                  {p.name}
                                </h4>
                                <div className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400">
                                  ₹{p.priceINR.toLocaleString('en-IN')}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                              <ScoreBadge score={p.overallScore} label="Overall Match" size="sm" />
                              <span className="text-[11px] text-slate-500">{p.rating}★ rating</span>
                            </div>

                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug line-clamp-2">
                              {p.matchReason || p.pros[0]}
                            </p>

                            <div className="flex gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                              <button
                                onClick={() => {
                                  if (inCompare) {
                                    showToast('info', 'Product already in comparison list.');
                                  } else {
                                    addToCompare(p);
                                    showToast('success', `Added ${p.name} to comparison!`);
                                  }
                                }}
                                className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold border flex items-center justify-center gap-1 transition-colors ${
                                  inCompare
                                    ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-500 text-indigo-600 dark:text-indigo-300'
                                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {inCompare ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                {inCompare ? 'Compared' : 'Compare'}
                              </button>

                              <button
                                onClick={() => onNavigate('product', { productId: p.id })}
                                className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center gap-1"
                              >
                                Details <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Suggested Questions */}
                {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {msg.suggestedQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(q)}
                        className="text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-slate-700 transition-colors text-left"
                      >
                        &ldquo;{q}&rdquo;
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isProcessing && (
            <div className="flex gap-3 max-w-xl">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-2 text-slate-500">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]" />
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]" />
                <span className="font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  Evaluating catalog and computing scores...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputMessage);
            }}
            className="flex gap-2"
          >
            <input
              id="assistant-chat-input"
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your requirements (e.g. best lightweight laptop for college under 50k)..."
              className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />

            <button
              id="assistant-chat-submit-btn"
              type="submit"
              disabled={!inputMessage.trim() || isProcessing}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
