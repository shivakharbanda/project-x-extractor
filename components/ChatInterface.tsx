import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isTyping: boolean;
  onHoverLineItem: (lineNumbers: number[] | undefined) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isTyping,
  onHoverLineItem 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isTyping) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none`}>
      {/* Chat Window */}
      <div 
        className={`
          pointer-events-auto bg-white rounded-2xl shadow-2xl border border-slate-200 w-80 sm:w-96 
          transition-all duration-300 origin-bottom-right overflow-hidden flex flex-col
          ${isOpen ? 'scale-100 opacity-100 mb-4' : 'scale-90 opacity-0 h-0 w-0 mb-0'}
        `}
        style={{ maxHeight: '600px', height: '70vh' }}
      >
        {/* Header */}
        <div className="bg-indigo-600 p-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-semibold">Bid Assistant</h3>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="hover:bg-indigo-700 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.length === 0 && (
            <div className="text-center text-slate-500 mt-8 text-sm">
              <p>Ask questions like:</p>
              <ul className="mt-2 space-y-2">
                <li className="bg-white p-2 rounded border border-slate-200 cursor-pointer hover:border-indigo-300 transition-colors"
                    onClick={() => onSendMessage("What is the total value?")}>
                    "What is the total value?"
                </li>
                 <li className="bg-white p-2 rounded border border-slate-200 cursor-pointer hover:border-indigo-300 transition-colors"
                    onClick={() => onSendMessage("Which item is the most expensive?")}>
                    "Which item is the most expensive?"
                </li>
              </ul>
            </div>
          )}
          
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              onMouseEnter={() => msg.relatedLineItems && onHoverLineItem(msg.relatedLineItems)}
              onMouseLeave={() => onHoverLineItem(undefined)}
            >
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center shrink-0
                ${msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-indigo-100 text-indigo-600'}
              `}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              
              <div className={`
                max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed
                ${msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'}
                ${msg.relatedLineItems && msg.relatedLineItems.length > 0 ? 'ring-2 ring-yellow-400 ring-opacity-50 cursor-pointer' : ''}
              `}>
                {msg.text}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3">
               <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                 <Bot className="w-4 h-4" />
               </div>
               <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                 <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                 <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></span>
                 <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-200 shrink-0">
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about this bid..."
              className="w-full pl-4 pr-10 py-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
            />
            <button 
              type="submit" 
              disabled={!inputValue.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          pointer-events-auto shadow-xl transition-all duration-300
          flex items-center justify-center
          ${isOpen ? 'w-0 h-0 opacity-0 overflow-hidden' : 'w-14 h-14 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105'}
        `}
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    </div>
  );
};
