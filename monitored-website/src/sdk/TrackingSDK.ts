interface TrackingConfig {
  projectId: string;
  serverUrl: string;
  commonParams?: Record<string, any>;
}

interface DeviceInfo {
  userAgent: string;
  platform: string;
  language: string;
  screenResolution: string;
}

interface TrackEvent {
  eventName: string;
  eventType: 'click' | 'pageview' | 'error' | 'custom';
  eventParams?: Record<string, any>;
  timestamp: number;
  path: string;
  deviceInfo: DeviceInfo;
  elementInfo?: {
    tagName?: string;
    className?: string;
    id?: string;
    text?: string;
  };
}

class TrackingSDK {
  private static instance: TrackingSDK;
  private config: TrackingConfig;
  private commonParams: Record<string, any>;
  private initialized: boolean = false;

  private constructor(config: TrackingConfig) {
    this.config = config;
    this.commonParams = config.commonParams || {};
    this.init();
  }

  public static getInstance(config?: TrackingConfig): TrackingSDK {
    if (!TrackingSDK.instance && config) {
      TrackingSDK.instance = new TrackingSDK(config);
    }
    return TrackingSDK.instance;
  }

  private init(): void {
    if (this.initialized) return;
    
    // 初始化页面访问监听
    this.trackPageView();
    
    // 初始化点击事件监听
    this.initClickTracking();
    
    // 初始化错误监听
    this.initErrorTracking();

    this.initialized = true;
  }

  private getDeviceInfo(): DeviceInfo {
    const userAgent = navigator.userAgent;
    const language = navigator.language;
    const screenResolution = `${window.screen.width}x${window.screen.height}`;
    
    return {
      userAgent,
      platform: this.getOSInfo(userAgent),
      language,
      screenResolution,
    };
  }

  private getBrowserInfo(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private getBrowserVersion(userAgent: string): string {
    const match = userAgent.match(/(Chrome|Firefox|Safari|Edge)\/(\d+\.\d+)/);
    return match ? match[2] : 'Unknown';
  }

  private getOSInfo(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'MacOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private async sendToServer(event: TrackEvent): Promise<void> {
    try {
      console.log('准备发送事件数据:', event);
      
      // 构造符合后端期望的数据格式
      const data = {
        projectId: this.config.projectId,
        eventName: event.eventName,
        eventParams: {
          ...event.eventParams,
          path: event.path,
          eventType: event.eventType,
          ...(event.elementInfo && { elementInfo: event.elementInfo })
        },
        uid: this.commonParams.userId,
        deviceInfo: event.deviceInfo,
        timestamp: event.timestamp
      };

      console.log('发送数据到服务器:', data);

      const response = await fetch(`${this.config.serverUrl}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('事件数据发送成功');
    } catch (error) {
      console.error('发送事件数据失败:', error);
    }
  }

  private trackPageView(): void {
    // 监听路由变化
    window.addEventListener('popstate', () => {
      this.trackEvent('pageview', { path: window.location.pathname }, 'pageview');
    });

    // 初始页面加载
    this.trackEvent('pageview', { path: window.location.pathname }, 'pageview');
  }

  private initClickTracking(): void {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target) return;

      const elementInfo = {
        tagName: target.tagName.toLowerCase(),
        className: target.className,
        id: target.id,
        text: target.textContent?.trim(),
      };

      this.trackEvent('click', { elementInfo }, 'click');
    });
  }

  private initErrorTracking(): void {
    window.addEventListener('error', (event) => {
      this.trackEvent('error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack,
      }, 'error');
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackEvent('error', {
        type: 'unhandledrejection',
        message: event.reason?.message || 'Promise rejection',
        error: event.reason?.stack,
      }, 'error');
    });
  }

  public setCommonParams(params: Record<string, any>): void {
    this.commonParams = { ...this.commonParams, ...params };
  }

  public trackEvent(
    eventName: string,
    params?: Record<string, any>,
    eventType: 'click' | 'pageview' | 'error' | 'custom' = 'custom'
  ): void {
    const event: TrackEvent = {
      eventName,
      eventType,
      eventParams: params,
      timestamp: Date.now(),
      path: window.location.pathname,
      deviceInfo: this.getDeviceInfo(),
    };

    this.sendToServer(event);
  }
}

export default TrackingSDK; 