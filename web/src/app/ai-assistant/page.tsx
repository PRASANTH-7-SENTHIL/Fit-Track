'use client';

import React, { useState, useRef, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAppStore } from '@/store';
import {
  Bot,
  Send,
  User,
  Sparkles,
  Dumbbell,
  Apple,
  Scale,
  RefreshCw,
  HeartPulse,
} from 'lucide-react';
import { ChatMessage } from '@/types';

export default function AIAssistantPage() {
  const { profile, dailyTargets, todayNutrition, todayActivity, chatMessages, addChatMessage } = useAppStore();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const defaultMessages: ChatMessage[] = [
    {
      id: 'm1',
      role: 'assistant',
      content: `Greetings ${profile?.fullName || 'Athlete'}! I am your FitTrack AI Personal Health Coach. I have your metabolic baseline calibrated (${profile?.weightKg || 74} kg, goal: ${profile?.fitnessGoal?.replace('_', ' ') || 'muscle building'}). Ask me anything regarding workout optimization, macro distribution, Indian meals, or recovery science!`,
      timestamp: '10:00 AM',
    },
  ];

  const messages = chatMessages.length ? chatMessages : defaultMessages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    addChatMessage(userMsg);
    if (!textToSend) setInput('');
    setIsTyping(true);

    // Intelligent context-aware fitness assistant responses
    setTimeout(() => {
      let responseText = '';
      const q = query.toLowerCase();

      if (q.includes('protein') || q.includes('egg') || q.includes('chicken') || q.includes('soya')) {
        responseText = `Based on your goal of ${profile?.fitnessGoal || 'muscle building'}, your protein target is ${dailyTargets?.proteinG || 160}g per day. Great high-protein Indian options include boiled eggs (6g/egg), chicken breast (31g/100g), boiled soya chunks (26g/50g), paneer (18g/100g), and Greek yogurt or curd (10g/bowl).`;
      } else if (q.includes('workout') || q.includes('push') || q.includes('squat') || q.includes('exercise')) {
        responseText = `For optimal progressive overload, structure your sessions 3-4 days weekly. Ensure compound movements like push-ups and bodyweight squats are performed with full range of motion. Rest 45-60 seconds between sets to maximize hypertrophy and cardiovascular conditioning.`;
      } else if (q.includes('calorie') || q.includes('tdee') || q.includes('deficit') || q.includes('burn')) {
        responseText = `Your current daily calorie target is calibrated at ${dailyTargets?.calories || 2450} kcal. With your BMR of approximately ${Math.round(10 * (profile?.weightKg || 74) + 6.25 * (profile?.heightCm || 178) - 5 * (profile?.age || 25) + 5)} kcal, staying consistent with your daily target will maintain healthy energy balance without metabolic slowdown.`;
      } else if (q.includes('dosa') || q.includes('idli') || q.includes('rice') || q.includes('chapati')) {
        responseText = `2 pieces of plain Dosa with sambar contain ~260 kcal (6g protein, 44g carbs). 2 medium Chapatis contain ~208 kcal (7g protein, 36g carbs). Both are wholesome energy sources; pairing them with lentils (dal) or eggs creates a balanced amino acid profile.`;
      } else {
        responseText = `I have logged your question in your fitness profile! With your current weight of ${profile?.weightKg || 74} kg and daily step goal of ${dailyTargets?.steps || 10000} steps, staying hydrated (aim for 2.8L water) and maintaining consistent sleep (7-8 hours) will drive the highest transformation velocity.`;
      }

      const botMsg: ChatMessage = {
        id: 'msg_bot_' + Date.now(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      addChatMessage(botMsg);
      setIsTyping(false);
    }, 800);
  };

  const quickChips = [
    'How do I hit my 160g protein target with Indian foods?',
    'What should I eat before my morning workout?',
    'How many calories in 2 Dosas vs 2 Chapatis?',
    'Tips to burn 500 extra calories today',
  ];

  return (
    <AppShell
      title="AI Fitness Assistant"
      subtitle="Context-aware personal coach trained in nutrition, hypertrophy, and metabolic science"
    >
      <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-12rem)] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Top Coach Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-lime-400 flex items-center justify-center text-slate-950 shadow-md">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <span>FitTrack AI Coach</span>
                <span className="h-2 w-2 rounded-full bg-lime-400 animate-pulse" />
              </h3>
              <p className="text-[11px] text-slate-400">Contextualized to {profile?.fullName || 'Athlete'}</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-lime-400 border border-slate-700">
            Active Neural Model
          </span>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => {
            const isBot = m.role === 'assistant';
            return (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${isBot ? '' : 'flex-row-reverse'}`}
              >
                <div
                  className={`h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    isBot
                      ? 'bg-gradient-to-tr from-blue-600 to-lime-400 text-white'
                      : 'bg-slate-700 text-slate-200'
                  }`}
                >
                  {isBot ? <Sparkles className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>

                <div
                  className={`p-4 rounded-2xl max-w-md text-xs leading-relaxed ${
                    isBot
                      ? 'bg-slate-950 border border-slate-800 text-slate-200 shadow-md'
                      : 'bg-blue-600 text-white shadow-md'
                  }`}
                >
                  <p>{m.content}</p>
                  <span
                    className={`text-[9px] block mt-1.5 ${
                      isBot ? 'text-slate-500' : 'text-blue-200'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 pl-11">
              <div className="h-2 w-2 rounded-full bg-lime-400 animate-bounce" />
              <div className="h-2 w-2 rounded-full bg-lime-400 animate-bounce [animation-delay:0.2s]" />
              <div className="h-2 w-2 rounded-full bg-lime-400 animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] ml-1">Analyzing metabolic records...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 bg-slate-950/60 border-t border-slate-800/80 overflow-x-auto flex gap-2 no-scrollbar">
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="text-[11px] px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 whitespace-nowrap transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about workouts, calories, protein, Indian foods..."
              className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 shadow-md transition-all disabled:opacity-40"
            >
              <Send className="h-4 w-4 stroke-[2.5]" />
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
