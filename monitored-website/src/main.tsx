import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import TrackingSDK from './sdk/TrackingSDK'
import { sdkConfig } from './sdk/config'

// 初始化埋点SDK
const trackingSDK = TrackingSDK.getInstance(sdkConfig);

// 设置用户ID（如果有的话）
const userId = localStorage.getItem('userId');
if (userId) {
  trackingSDK.setCommonParams({ userId });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
