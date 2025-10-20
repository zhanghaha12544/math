'use client';

import React from 'react';
import KaTeXRenderer from '@/components/KaTeXRenderer';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  // 检测内容中是否包含数学公式
  const hasMath = /\$.*\$|\\[a-zA-Z]|frac|lim|sum|int|sqrt|alpha|beta|gamma|delta|theta|lambda|mu|pi|sigma|phi|omega|\\begin|\\end/.test(message.content);
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''} group`}>
      {/* 头像 */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 ${
        isUser 
          ? 'bg-gray-200 hover:bg-gray-300' 
          : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg'
      }`}>
        {isUser ? (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ) : (
          <span className="text-white font-bold text-sm">研</span>
        )}
      </div>

      {/* 消息内容 */}
      <div className={`flex-1 max-w-3xl ${isUser ? 'flex flex-col items-end' : ''}`}>
        <div className={`rounded-lg px-4 py-3 shadow-sm transition-all duration-300 group-hover:shadow-lg ${
          isUser 
            ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
            : 'bg-white border border-gray-200 hover:border-indigo-300'
        }`}>
          {/* 消息文本 */}
          <div className="prose prose-sm max-w-none">
            {hasMath ? (
              <div className={`${isUser ? 'text-white' : 'text-gray-900'}`}>
                <KaTeXRenderer 
                  latex={message.content} 
                  displayMode={false} 
                />
              </div>
            ) : (
              <p className={`whitespace-pre-wrap ${isUser ? 'text-white' : 'text-gray-900'}`}>
                {message.content}
              </p>
            )}
          </div>
        </div>
        
        {/* 时间戳 */}
        <div className={`mt-1 text-xs text-gray-500 ${isUser ? 'text-right' : 'text-left'}`}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
