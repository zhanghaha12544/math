// 测试网络连接和API
const testConnection = async () => {
  console.log('🔍 测试网络连接...');
  
  try {
    // 测试基本的网络连接
    const response = await fetch('https://www.google.com', {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    });
    console.log('✅ 基本网络连接正常');
  } catch (error) {
    console.log('❌ 基本网络连接失败:', error.message);
  }

  try {
    // 测试Gemini API连接
    console.log('🔍 测试Gemini API连接...');
    const response = await fetch('https://generativelanguage.googleapis.com', {
      method: 'HEAD',
      signal: AbortSignal.timeout(10000)
    });
    console.log('✅ Gemini API服务器可访问');
  } catch (error) {
    console.log('❌ Gemini API服务器连接失败:', error.message);
  }

  try {
    // 测试本地API
    console.log('🔍 测试本地API...');
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '测试连接' }),
      signal: AbortSignal.timeout(5000)
    });
    
    const data = await response.json();
    console.log('✅ 本地API响应:', response.status, data.mock ? '(模拟回复)' : '(真实API)');
  } catch (error) {
    console.log('❌ 本地API测试失败:', error.message);
  }
};

testConnection();


