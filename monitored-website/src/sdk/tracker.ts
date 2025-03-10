import { TrackerConfig, EventData, UserEnvironment, ErrorInfo, CommonParams } from './types';

class Tracker {
  private static instance: Tracker;
  private config: TrackerConfig;
  private commonParams: CommonParams = {};
  private userEnvironment: UserEnvironment;

  private constructor(config: TrackerConfig) {
    this.config = config;
    this.userEnvironment = this.getUserEnvironment();
    this.setupErrorListener();
  }

  // 单例模式获取实例
  public static getInstance(config?: TrackerConfig): Tracker {
    if (!Tracker.instance && config) {
      Tracker.instance = new Tracker(config);
    }
    return Tracker.instance;
  }

  // 初始化
  public init(config: TrackerConfig) {
    this.config = config;
    console.log('Tracker initialized with config:', config);
  }

  // 设置通用参数
  public setCommonParams(params: CommonParams) {
    this.commonParams = { ...this.commonParams, ...params };
  }

  // 获取用户环境信息
  private getUserEnvironment(): UserEnvironment {
    const ua = navigator.userAgent;
    const screenResolution = `${window.screen.width}x${window.screen.height}`;
    
    return {
      browser: this.getBrowserInfo(),
      browserVersion: this.getBrowserVersion(),
      os: this.getOSInfo(),
      osVersion: this.getOSVersion(),
      deviceType: /Mobile|Tablet|iPad|iPhone|Android/.test(ua) ? 'mobile' : 'desktop',
      screenResolution
    };
  }

  // 获取浏览器信息
  private getBrowserInfo(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    if (ua.includes('MSIE') || ua.includes('Trident/')) return 'IE';
    return 'Unknown';
  }

  // 获取浏览器版本
  private getBrowserVersion(): string {
    const ua = navigator.userAgent;
    const match = ua.match(/(Chrome|Firefox|Safari|Edge|MSIE|Trident)\/?(\d+)/i);
    return match ? match[2] : 'Unknown';
  }

  // 获取操作系统信息
  private getOSInfo(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'MacOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  // 获取操作系统版本
  private getOSVersion(): string {
    const ua = navigator.userAgent;
    const match = ua.match(/(?:Windows NT|Mac OS X|Android|iOS)\s*([0-9._]+)/i);
    return match ? match[1] : 'Unknown';
  }

  // 上报事件
  public track(eventData: EventData) {
    const data = {
      ...eventData,
      projectId: this.config.projectId,
      userId: this.config.userId,
      timestamp: eventData.timestamp || Date.now(),
      environment: this.userEnvironment,
      commonParams: this.commonParams
    };

    this.sendData(data);
  }

  // 错误监听设置
  private setupErrorListener() {
    window.addEventListener('error', (event) => {
      const errorInfo: ErrorInfo = {
        message: event.message,
        stack: event.error?.stack,
        type: 'runtime',
        timestamp: Date.now()
      };
      this.trackError(errorInfo);
    });

    window.addEventListener('unhandledrejection', (event) => {
      const errorInfo: ErrorInfo = {
        message: event.reason?.message || 'Promise rejection',
        stack: event.reason?.stack,
        type: 'promise',
        timestamp: Date.now()
      };
      this.trackError(errorInfo);
    });
  }

  // 上报错误
  public trackError(errorInfo: ErrorInfo) {
    const data = {
      eventName: 'error',
      eventParams: errorInfo,
      projectId: this.config.projectId,
      userId: this.config.userId,
      timestamp: Date.now(),
      environment: this.userEnvironment,
      commonParams: this.commonParams
    };

    this.sendData(data);
  }

  // 发送数据到服务器
  private async sendData(data: any) {
    try {
      const response = await fetch(this.config.requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.error('Failed to send tracking data:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending tracking data:', error);
    }
  }
}

export default Tracker; 