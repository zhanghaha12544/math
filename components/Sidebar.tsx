'use client';

import React, { useState, useEffect } from 'react';
import KaTeXRenderer from './KaTeXRenderer';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface SidebarProps {
  onSessionSelect?: (session: ChatSession) => void;
  onNewConversation?: () => void;
  currentSessionId?: string | null;
}

export default function Sidebar({ onSessionSelect, onNewConversation, currentSessionId }: SidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 从 localStorage 加载历史记录
  const loadSessions = () => {
    const savedSessions = localStorage.getItem('chatSessions');
    console.log('侧边栏加载历史记录:', savedSessions);
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        console.log('解析的历史记录:', parsed);
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
        console.log('设置的历史记录数量:', sessionsWithDates.length);
      } catch (error) {
        console.error('加载历史记录失败:', error);
      }
    } else {
      console.log('没有找到保存的历史记录');
    }
  };

  useEffect(() => {
    loadSessions();
    
    // 监听 localStorage 变化
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'chatSessions') {
        console.log('检测到 localStorage 变化，重新加载历史记录');
        loadSessions();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // 定期检查 localStorage 变化（用于同页面内的变化）
    const interval = setInterval(() => {
      const currentSessions = localStorage.getItem('chatSessions');
      if (currentSessions && JSON.stringify(sessions) !== currentSessions) {
        console.log('检测到会话变化，重新加载');
        loadSessions();
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // 过滤会话
  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.messages.some(msg => 
      msg.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // 删除会话
  const deleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这个对话吗？')) {
      const updatedSessions = sessions.filter(s => s.id !== sessionId);
      setSessions(updatedSessions);
      localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
    }
  };

  // 清空所有历史记录
  const clearAllHistory = () => {
    if (confirm('确定要清空所有历史记录吗？此操作不可恢复。')) {
      setSessions([]);
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
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
    }
  };

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-500 ease-in-out ${
      isCollapsed ? 'w-16' : 'w-80'
    }`}>
      {/* 头部 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">研</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">研数精解AI</span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <svg className={`w-5 h-5 transition-transform duration-500 ease-in-out ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* 新对话按钮 */}
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={onNewConversation}
              className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>新对话</span>
            </button>
          </div>

          {/* 搜索框 */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索对话记录..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:border-indigo-300 focus:shadow-lg"
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* 会话列表 */}
          <div className="flex-1 overflow-y-auto">
            {filteredSessions.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {searchTerm ? (
                  <div>
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p>没有找到匹配的对话记录</p>
                  </div>
                ) : (
                  <div>
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p>暂无历史对话记录</p>
                    <p className="text-sm mt-1">开始新对话来创建记录</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredSessions
                  .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
                  .map((session) => (
                    <div
                      key={session.id}
                      className={`p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-all duration-300 group hover:scale-105 hover:shadow-md ${
                        currentSessionId === session.id ? 'bg-indigo-50 border border-indigo-200 shadow-md' : ''
                      }`}
                      onClick={() => onSessionSelect?.(session)}
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
                          onClick={(e) => deleteSession(session.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all duration-300 hover:scale-110 active:scale-95"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* 底部操作 */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <button
              onClick={exportHistory}
              className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>导出记录</span>
            </button>
            <button
              onClick={clearAllHistory}
              className="w-full px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>清空记录</span>
            </button>
          </div>
        </>
      )}

      {/* 折叠状态下的图标 */}
      {isCollapsed && (
        <div className="flex flex-col items-center space-y-4 p-4">
          <button
            onClick={onNewConversation}
            className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl"
            title="新对话"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <div className="w-full h-px bg-gray-200"></div>
          {sessions.slice(0, 5).map((session) => (
            <button
              key={session.id}
              onClick={() => onSessionSelect?.(session)}
              className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 ${
                currentSessionId === session.id 
                  ? 'bg-indigo-100 text-indigo-600 shadow-md' 
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
              title={session.title}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
