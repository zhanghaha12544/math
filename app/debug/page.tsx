'use client';

import React, { useState, useEffect } from 'react';

export default function DebugPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [localStorageData, setLocalStorageData] = useState<string>('');

  const loadData = () => {
    const data = localStorage.getItem('chatSessions');
    setLocalStorageData(data || '无数据');
    
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setSessions(parsed);
      } catch (error) {
        console.error('解析失败:', error);
      }
    }
  };

  const clearData = () => {
    localStorage.removeItem('chatSessions');
    setSessions([]);
    setLocalStorageData('无数据');
  };

  const addTestSession = () => {
    const testSession = {
      id: Date.now().toString(),
      title: '测试对话',
      messages: [
        {
          id: '1',
          content: '你好',
          role: 'user',
          timestamp: new Date()
        },
        {
          id: '2',
          content: '你好！我是AI助手',
          role: 'assistant',
          timestamp: new Date()
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const existingSessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
    existingSessions.push(testSession);
    localStorage.setItem('chatSessions', JSON.stringify(existingSessions));
    loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">调试页面 - 历史记录测试</h1>
      
      <div className="space-y-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">操作</h2>
          <div className="space-x-4">
            <button
              onClick={loadData}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              刷新数据
            </button>
            <button
              onClick={addTestSession}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              添加测试会话
            </button>
            <button
              onClick={clearData}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              清空数据
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">localStorage 原始数据</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-40">
            {localStorageData}
          </pre>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">解析后的会话数据 ({sessions.length} 个)</h2>
          {sessions.length === 0 ? (
            <p className="text-gray-500">暂无会话数据</p>
          ) : (
            <div className="space-y-4">
              {sessions.map((session, index) => (
                <div key={session.id} className="border p-4 rounded">
                  <h3 className="font-medium">会话 {index + 1}: {session.title}</h3>
                  <p className="text-sm text-gray-600">ID: {session.id}</p>
                  <p className="text-sm text-gray-600">消息数: {session.messages?.length || 0}</p>
                  <p className="text-sm text-gray-600">创建时间: {new Date(session.createdAt).toLocaleString()}</p>
                  <p className="text-sm text-gray-600">更新时间: {new Date(session.updatedAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

