import React, { useState, useEffect, useRef } from 'react';
import { GeneratedCharacter, ChatMessage } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ChatViewProps {
  character: GeneratedCharacter;
  onSendMessage: (message: string) => void;
  onBack: () => void;
  isLoading: boolean;
}

const ChatView: React.FC<ChatViewProps> = ({ character, onSendMessage, onBack, isLoading }) => {
  const { t } = useLanguage();
  const [message, setMessage] = useState('');
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const chatHistory = character.postRecruitmentChatHistory;
  
  useEffect(() => {
    // Scroll to the bottom of the chat history
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.role === 'user';
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl ${isUser ? 'bg-indigo-600 text-white rounded-br-lg' : 'bg-slate-700 text-slate-200 rounded-bl-lg'}`}>
          <p className="text-sm whitespace-pre-wrap">{message.parts[0].text}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[80vh] bg-slate-900/50 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden ring-1 ring-slate-700 animate-fade-in">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-center text-white">
              {t('chatWithCharacterTitle', { characterName: character.name })}
            </h2>
            <button
              onClick={onBack}
              className="py-1 px-3 border border-slate-600 rounded-md text-xs font-medium text-slate-200 bg-transparent hover:bg-slate-700"
            >
              {t('returnToSheetButton')}
            </button>
        </div>
      </div>

      {/* Chat History */}
      <div ref={chatHistoryRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
        {chatHistory.map((msg, index) => (
          <ChatBubble key={index} message={msg} />
        ))}
        {isLoading && (
           <div className="flex justify-start">
              <div className="max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl bg-slate-700 text-slate-200 rounded-bl-lg">
                 <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                 </div>
              </div>
           </div>
        )}
      </div>

      {/* Input Form */}
      <div className="flex-shrink-0 p-4 border-t border-slate-700">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('chatPlaceholder')}
            className="block w-full bg-slate-800 border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-200 placeholder-gray-500 transition duration-150"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !message.trim()}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {t('sendMessageButton')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;