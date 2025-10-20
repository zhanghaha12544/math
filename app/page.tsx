'use client';

import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from '../components/ChatMessage';
import KaTeXRenderer from '../components/KaTeXRenderer';
import Sidebar from '../components/Sidebar';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '你好！我是研数精解AI助手，专门帮助解决考研数学问题。你可以问我任何数学相关的问题，包括高等数学、线性代数、概率论等。',
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 保存会话到 localStorage
  const saveSession = (sessionId: string, title: string, messages: Message[]) => {
    console.log('保存会话:', { sessionId, title, messageCount: messages.length });
    
    const session = {
      id: sessionId,
      title,
      messages,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const existingSessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
    const sessionIndex = existingSessions.findIndex((s: any) => s.id === sessionId);
    
    if (sessionIndex >= 0) {
      existingSessions[sessionIndex] = session;
      console.log('更新现有会话:', sessionIndex);
    } else {
      existingSessions.push(session);
      console.log('添加新会话');
    }
    
    localStorage.setItem('chatSessions', JSON.stringify(existingSessions));
    console.log('会话已保存到 localStorage，总数:', existingSessions.length);
  };

  // 生成会话标题（基于第一条用户消息）
  const generateSessionTitle = (messages: Message[]) => {
    const firstUserMessage = messages.find(msg => msg.role === 'user');
    if (firstUserMessage) {
      return firstUserMessage.content.length > 30 
        ? firstUserMessage.content.substring(0, 30) + '...'
        : firstUserMessage.content;
    }
    return '新对话';
  };

  // 开始新对话
  const startNewConversation = () => {
    setCurrentSessionId(null);
    setMessages([
      {
        id: '1',
        content: '你好！我是研数精解AI助手，专门帮助解决考研数学问题。你可以问我任何数学相关的问题，包括高等数学、线性代数、概率论等。',
        role: 'assistant',
        timestamp: new Date()
      }
    ]);
  };

  // 加载历史会话
  const loadSession = (session: any) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // 如果是新对话，生成新的会话ID
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = Date.now().toString();
      setCurrentSessionId(sessionId);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // 调用后端API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput
        })
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

            const assistantMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: data.response,
              role: 'assistant',
              timestamp: new Date()
            };
            
            const finalMessages = [...updatedMessages, assistantMessage];
            setMessages(finalMessages);
            
            // 保存会话到历史记录
            if (sessionId) {
              const title = generateSessionTitle(finalMessages);
              saveSession(sessionId, title, finalMessages);
            }
    } catch (error) {
      console.error('API调用错误:', error);
      
      let errorContent = '';
      if (error instanceof Error) {
        if (error.message.includes('500')) {
          errorContent = '网络连接出现问题，可能是由于网络限制或服务器维护。请检查网络连接或稍后重试。';
        } else if (error.message.includes('timeout')) {
          errorContent = '请求超时，请检查网络连接或稍后重试。';
        } else {
          errorContent = `抱歉，发生了错误：${error.message}。请稍后重试。`;
        }
      } else {
        errorContent = '抱歉，发生了未知错误。请稍后重试。';
      }
      
            const errorMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: errorContent,
              role: 'assistant',
              timestamp: new Date()
            };
            
            const finalMessages = [...updatedMessages, errorMessage];
            setMessages(finalMessages);
            
            // 保存会话到历史记录（包括错误消息）
            if (sessionId) {
              const title = generateSessionTitle(finalMessages);
              saveSession(sessionId, title, finalMessages);
            }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 移动端遮罩层 */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* 侧边栏 */}
      <div className={`${sidebarOpen ? 'block animate-scale-in' : 'hidden'} lg:block relative z-50`}>
        <Sidebar
          onSessionSelect={(session) => {
            loadSession(session);
            setSidebarOpen(false); // 移动端选择会话后自动关闭侧边栏
          }}
          onNewConversation={() => {
            startNewConversation();
            setSidebarOpen(false); // 移动端开始新对话后自动关闭侧边栏
          }}
          currentSessionId={currentSessionId}
        />
      </div>

      {/* 主聊天区域 */}
      <div className="flex-1 flex flex-col">
        {/* 聊天头部 */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">研</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">研数精解AI</h1>
                <p className="text-sm text-gray-500">考研数学智能助手</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-500">在线</span>
              </div>
              <a 
                href="/network-status"
                className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                网络诊断
              </a>
            </div>
          </div>
        </div>

        {/* 聊天消息区域 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message, index) => (
              <div 
                key={message.id} 
                className="message-bubble"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ChatMessage message={message} />
              </div>
            ))}
            
            {/* 加载状态 */}
            {isLoading && (
              <div className="flex items-start space-x-3 animate-fade-in">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">研</span>
                </div>
                <div className="bg-white rounded-lg px-4 py-3 shadow-lg border hover:shadow-xl transition-all duration-300 card-hover">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce loading-dots"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce loading-dots" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce loading-dots" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 输入区域 */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-3">
              <div className="flex-1">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="输入你的数学问题..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows={1}
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:hover:scale-100 disabled:shadow-md btn-hover"
              >
                <span>发送</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            
            {/* 快捷问题建议 */}
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                '求极限 lim(x→0) (sin x)/x',
                '如何求不定积分 ∫x²dx',
                '线性代数的特征值怎么求',
                '概率论中的贝叶斯公式'
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInputValue(suggestion)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-md"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



