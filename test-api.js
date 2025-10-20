// 简单的API测试脚本
const testAPI = async () => {
  try {
    console.log('测试Gemini API集成...');
    
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: '请解释一下什么是导数'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }

    const data = await response.json();
    console.log('API响应:', data);
    
    if (data.error) {
      console.error('API错误:', data.error);
    } else {
      console.log('✅ API测试成功!');
      console.log('响应内容:', data.response.substring(0, 100) + '...');
    }
    
  } catch (error) {
    console.error('❌ API测试失败:', error.message);
  }
};

// 等待服务器启动
setTimeout(testAPI, 5000);
