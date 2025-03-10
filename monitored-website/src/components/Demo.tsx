import React, { useEffect, useState } from 'react';
import Tracker from '../sdk/tracker';

const Demo: React.FC = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // 初始化埋点SDK
    const tracker = Tracker.getInstance({
      requestUrl: 'http://your-api-endpoint/track',
      projectId: 'demo-project',
      userId: 'user-123'
    });

    // 设置通用参数
    tracker.setCommonParams({
      pageUrl: window.location.href,
      platform: 'web'
    });

    // 页面加载事件上报
    tracker.track({
      eventName: 'page_view',
      eventParams: {
        pageName: 'Demo Page',
        loadTime: performance.now()
      }
    });
  }, []);

  const handleClick = () => {
    setCount(prev => prev + 1);
    
    // 点击事件上报
    const tracker = Tracker.getInstance();
    tracker.track({
      eventName: 'button_click',
      eventParams: {
        buttonName: 'increment',
        clickCount: count + 1
      }
    });
  };

  const triggerError = () => {
    // 故意触发一个错误来测试错误捕获
    throw new Error('This is a test error');
  };

  return (
    <div className="demo-container">
      <h1>埋点SDK演示</h1>
      <div className="counter-section">
        <p>计数器: {count}</p>
        <button onClick={handleClick}>
          增加计数
        </button>
        <button onClick={triggerError}>
          触发错误
        </button>
      </div>
      <div className="info-section">
        <h2>功能说明：</h2>
        <ul>
          <li>页面加载时会自动上报页面访问事件</li>
          <li>点击"增加计数"按钮会上报按钮点击事件</li>
          <li>点击"触发错误"按钮会产生一个错误并自动上报</li>
          <li>所有事件都会携带用户环境信息和通用参数</li>
        </ul>
      </div>
      <style>{`
        .demo-container {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        .counter-section {
          margin: 20px 0;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
        }
        .info-section {
          margin-top: 20px;
          padding: 20px;
          background-color: #f5f5f5;
          border-radius: 8px;
        }
        button {
          margin: 0 10px;
          padding: 8px 16px;
          background-color: #1890ff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        button:hover {
          background-color: #40a9ff;
        }
        ul {
          padding-left: 20px;
        }
        li {
          margin: 8px 0;
        }
      `}</style>
    </div>
  );
};

export default Demo; 