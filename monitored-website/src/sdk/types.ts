// SDK配置接口
export interface TrackerConfig {
  requestUrl: string;  // 数据上报地址
  projectId: string;   // 项目ID
  userId?: string;     // 用户ID
}

// 上报事件数据接口
export interface EventData {
  eventName: string;           // 事件名称
  eventParams?: Record<string, any>; // 事件参数
  timestamp?: number;          // 事件发生时间戳
}

// 用户环境信息接口
export interface UserEnvironment {
  browser: string;             // 浏览器信息
  browserVersion: string;      // 浏览器版本
  os: string;                  // 操作系统
  osVersion: string;          // 操作系统版本
  deviceType: string;         // 设备类型
  screenResolution: string;   // 屏幕分辨率
}

// 错误信息接口
export interface ErrorInfo {
  message: string;            // 错误信息
  stack?: string;            // 错误堆栈
  type: string;              // 错误类型
  timestamp: number;         // 错误发生时间
}

// 通用参数接口
export interface CommonParams {
  [key: string]: any;
} 