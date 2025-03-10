import React, { useEffect } from 'react';
import TrackingSDK from '../sdk/TrackingSDK';

const ExampleComponent: React.FC = () => {
  useEffect(() => {
    // 获取SDK实例
    const trackingSDK = TrackingSDK.getInstance();
    
    // 添加自定义事件
    trackingSDK.trackEvent('component_mounted', {
      componentName: 'ExampleComponent',
      timestamp: new Date().toISOString(),
    });
  }, []);

  const handleButtonClick = () => {
    const trackingSDK = TrackingSDK.getInstance();
    
    // 手动触发自定义事件
    trackingSDK.trackEvent('button_clicked', {
      buttonName: 'test-button',
      customData: 'some value',
    });

    // 模拟一个错误，测试错误捕获
    try {
      throw new Error('Test error');
    } catch (error) {
      console.error('Caught error:', error);
    }
  };

  return (
    <div className="example-component">
      <h1>示例组件</h1>
      <p>这个组件展示了如何使用埋点SDK</p>
      
      <button 
        onClick={handleButtonClick}
        style={{
          padding: '10px 20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        测试按钮
      </button>

      <div style={{ marginTop: '20px' }}>
        <p>功能说明：</p>
        <ul>
          <li>页面加载时会自动触发 pageview 事件</li>
          <li>点击页面任何元素会自动触发 click 事件</li>
          <li>点击测试按钮会触发自定义事件</li>
          <li>任何 JS 错误都会被自动捕获并上报</li>
        </ul>
      </div>
    </div>
  );
};

export default ExampleComponent; 