import React, { useEffect } from 'react';
import TrackingSDK from '../sdk/TrackingSDK';
import { sdkConfig } from '../sdk/config';

const TestPage: React.FC = () => {
  useEffect(() => {
    // 测试设置用户ID
    const trackingSDK = TrackingSDK.getInstance();
    trackingSDK.setCommonParams({
      userId: 'test-user-001',
      userType: 'tester'
    });
  }, []);

  const handleCustomEvent = () => {
    const trackingSDK = TrackingSDK.getInstance();
    trackingSDK.trackEvent('custom_test_event', {
      testParam1: 'value1',
      testParam2: 'value2',
      timestamp: new Date().toISOString()
    });
  };

  const handleErrorTest = () => {
    // 测试错误捕获
    throw new Error('这是一个测试错误');
  };

  const handleAsyncErrorTest = async () => {
    // 测试异步错误捕获
    return Promise.reject(new Error('这是一个异步测试错误'));
  };

  return (
    <div className="test-page" style={{ padding: '20px' }}>
      <h1>埋点SDK测试页面</h1>
      
      <div style={{ marginBottom: '40px' }}>
        <h2>测试说明</h2>
        <p>本页面用于测试埋点SDK的各项功能，包括：</p>
        <ul>
          <li>页面访问埋点（自动触发）</li>
          <li>点击事件埋点（自动触发）</li>
          <li>自定义事件埋点</li>
          <li>错误捕获埋点</li>
          <li>用户身份设置</li>
        </ul>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        {/* 测试点击事件 */}
        <div className="test-section">
          <h3>1. 点击事件测试</h3>
          <button
            className="test-button"
            id="clickTest"
            style={buttonStyle}
            onClick={() => console.log('按钮被点击')}
          >
            测试点击埋点
          </button>
          <p>点击此按钮将自动触发点击事件埋点</p>
        </div>

        {/* 测试自定义事件 */}
        <div className="test-section">
          <h3>2. 自定义事件测试</h3>
          <button
            className="test-button"
            id="customEventTest"
            style={buttonStyle}
            onClick={handleCustomEvent}
          >
            触发自定义事件
          </button>
          <p>点击此按钮将触发一个自定义事件</p>
        </div>

        {/* 测试错误捕获 */}
        <div className="test-section">
          <h3>3. 错误捕获测试</h3>
          <button
            className="test-button"
            id="errorTest"
            style={{...buttonStyle, backgroundColor: '#ff4d4f'}}
            onClick={handleErrorTest}
          >
            测试同步错误
          </button>
          <button
            className="test-button"
            id="asyncErrorTest"
            style={{...buttonStyle, backgroundColor: '#ff4d4f', marginLeft: '10px'}}
            onClick={() => handleAsyncErrorTest()}
          >
            测试异步错误
          </button>
          <p>点击这些按钮将触发错误，SDK会自动捕获并上报</p>
        </div>

        {/* 测试结果展示 */}
        <div className="test-section" style={{ marginTop: '40px' }}>
          <h3>测试结果查看方式：</h3>
          <ol>
            <li>打开浏览器开发者工具</li>
            <li>切换到Network标签页</li>
            <li>筛选XHR请求</li>
            <li>查看发送到 {sdkConfig.serverUrl}/track 的请求</li>
            <li>或直接在sdk-platform平台查看数据</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

const buttonStyle = {
  padding: '10px 20px',
  fontSize: '16px',
  backgroundColor: '#1890ff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  marginBottom: '10px'
};

export default TestPage; 