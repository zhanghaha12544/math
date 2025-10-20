'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import KaTeXRenderer from '../../components/KaTeXRenderer';

interface ChatSession {
  id: string;
  title: string;
  messages: Array<{
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 从 localStorage 加载历史记录
  useEffect(() => {
    const savedSessions = localStorage.getItem('chatSessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        // 转换日期字符串为 Date 对象
        const sessionsWithDates = parsed.map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setSessions(sessionsWithDates);
      } catch (error) {
        console.error('加载历史记录失败:', error);
      }
    }
  }, []);

  // 过滤会话
  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.messages.some(msg => 
      msg.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // 删除会话
  const deleteSession = (sessionId: string) => {
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(updatedSessions);
    localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
    
    if (selectedSession?.id === sessionId) {
      setSelectedSession(null);
    }
  };

  // 清空所有历史记录
  const clearAllHistory = () => {
    if (confirm('确定要清空所有历史记录吗？此操作不可恢复。')) {
      setSessions([]);
      setSelectedSession(null);
      localStorage.removeItem('chatSessions');
    }
  };

  // 导出历史记录
  const exportHistory = () => {
    const dataStr = JSON.stringify(sessions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-history-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">研</span>
              </div>
              <span className="text-xl font-bold text-indigo-700">研数精解AI</span>
            </Link>
            <span className="text-gray-400">|</span>
            <h1 className="text-lg font-semibold text-gray-900">历史对话记录</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={exportHistory}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              导出记录
            </button>
            <button
              onClick={clearAllHistory}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              清空记录
            </button>
            <Link
              href="/"
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              返回聊天
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：会话列表 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border">
              {/* 搜索框 */}
              <div className="p-4 border-b">
                <input
                  type="text"
                  placeholder="搜索对话记录..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* 会话列表 */}
              <div className="max-h-96 overflow-y-auto">
                {filteredSessions.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    {searchTerm ? '没有找到匹配的对话记录' : '暂无历史对话记录'}
                  </div>
                ) : (
                  filteredSessions
                    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
                    .map((session) => (
                      <div
                        key={session.id}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedSession?.id === session.id ? 'bg-indigo-50 border-indigo-200' : ''
                        }`}
                        onClick={() => setSelectedSession(session)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {session.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {session.messages.length} 条消息
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDate(session.updatedAt)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSession(session.id);
                            }}
                            className="ml-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>

          {/* 右侧：会话详情 */}
          <div className="lg:col-span-2">
            {selectedSession ? (
              <div className="bg-white rounded-lg shadow-sm border">
                {/* 会话头部 */}
                <div className="p-4 border-b bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-900">{selectedSession.title}</h2>
                  <p className="text-sm text-gray-500">
                    创建于 {formatDate(selectedSession.createdAt)} | 
                    最后更新 {formatDate(selectedSession.updatedAt)}
                  </p>
                </div>

                {/* 消息列表 */}
                <div className="max-h-96 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {selectedSession.messages.map((message) => {
                      const isUser = message.role === 'user';
                      const hasMath = /\$.*\$|\\[a-zA-Z]|frac|lim|sum|int|sqrt|alpha|beta|gamma|delta|theta|lambda|mu|pi|sigma|phi|omega|\\begin|\\end/.test(message.content);
                      
                      return (
                        <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex items-start space-x-3 max-w-xl ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            {/* 头像 */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                              ${isUser 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                              }`}>
                              <span className="font-bold text-sm">
                                {isUser ? '你' : '研'}
                              </span>
                            </div>

                            {/* 消息气泡 */}
                            <div className={`rounded-lg px-4 py-3 shadow-sm ${
                              isUser 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-white border border-gray-200'
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
                              
                              {/* 时间戳 */}
                              <div className={`mt-1 text-xs ${isUser ? 'text-indigo-200' : 'text-gray-500'}`}>
                                {formatTime(message.timestamp)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">选择对话记录</h3>
                <p className="text-gray-500">从左侧列表中选择一个对话记录来查看详细内容</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

