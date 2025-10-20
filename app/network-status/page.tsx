'use client';

import React, { useState, useEffect } from 'react';

export default function NetworkStatusPage() {
  const [status, setStatus] = useState({
    basicNetwork: '检测中...',
    geminiAPI: '检测中...',
    localAPI: '检测中...'
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const runTests = async () => {
      const results = { ...status };

      // 测试基本网络连接
      try {
        await fetch('https://www.google.com', {
          method: 'HEAD',
          signal: AbortSignal.timeout(5000)
        });
        results.basicNetwork = '✅ 正常';
      } catch (error) {
        results.basicNetwork = '❌ 失败 - 可能是网络限制或防火墙';
      }

      // 测试Gemini API
      try {
        await fetch('https://generativelanguage.googleapis.com', {
          method: 'HEAD',
          signal: AbortSignal.timeout(10000)
        });
        results.geminiAPI = '✅ 可访问';
      } catch (error) {
        results.geminiAPI = '❌ 无法访问 - 可能需要代理或VPN';
      }

      // 测试本地API
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: '测试连接' }),
          signal: AbortSignal.timeout(5000)
        });
        
        if (response.ok) {
          const data = await response.json();
          results.localAPI = data.mock ? '⚠️ 运行中(使用模拟回复)' : '✅ 运行中(连接AI)';
        } else {
          results.localAPI = '❌ API错误';
        }
      } catch (error) {
        results.localAPI = '❌ 连接失败';
      }

      setStatus(results);
      setIsLoading(false);
    };

    runTests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">网络连接诊断</h1>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">连接状态</h2>
          
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
              <span>正在检测网络连接...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium">基本网络连接</span>
                <span className={status.basicNetwork.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                  {status.basicNetwork}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium">Gemini API服务器</span>
                <span className={status.geminiAPI.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                  {status.geminiAPI}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium">本地API服务</span>
                <span className={
                  status.localAPI.includes('✅') ? 'text-green-600' : 
                  status.localAPI.includes('⚠️') ? 'text-yellow-600' : 'text-red-600'
                }>
                  {status.localAPI}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">解决方案</h3>
          <div className="space-y-2 text-blue-800">
            <p>• 如果基本网络连接失败，请检查你的网络设置</p>
            <p>• 如果Gemini API无法访问，可能需要使用代理或VPN</p>
            <p>• 如果本地API显示模拟回复，说明网络连接有问题，但应用仍可使用</p>
            <p>• 尝试刷新页面或重启开发服务器</p>
          </div>
        </div>

        <div className="mt-6">
          <a 
            href="/" 
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            ← 返回聊天界面
          </a>
        </div>
      </div>
    </div>
  );
}


