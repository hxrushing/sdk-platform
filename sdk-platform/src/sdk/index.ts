import { v4 as uuidv4 } from 'uuid';

interface TrackEvent {
  eventName: string;
  eventParams?: Record<string, any>;
  timestamp: number;
}

interface CommonParams {
  uid?: string;
  deviceInfo: {
    userAgent: string;
    platform: string;
    language: string;
    screenResolution: string;
  };
  sdkVersion: string;
}

class AnalyticsSDK {
  private static instance: AnalyticsSDK;
  private commonParams: CommonParams;
  private endpoint: string;
  private projectId: string;

  private constructor(projectId: string, endpoint: string) {
    this.projectId = projectId;
    this.endpoint = endpoint;
    this.commonParams = {
      deviceInfo: this.getDeviceInfo(),
      sdkVersion: '1.0.0'
    };

    this.initErrorCapture();
  }

  public static getInstance(projectId: string, endpoint: string): AnalyticsSDK {
    if (!AnalyticsSDK.instance) {
      AnalyticsSDK.instance = new AnalyticsSDK(projectId, endpoint);
    }
    return AnalyticsSDK.instance;
  }

  private getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`
    };
  }

  public setUser(uid: string) {
    this.commonParams.uid = uid;
  }

  public track(eventName: string, eventParams?: Record<string, any>) {
    const event: TrackEvent = {
      eventName,
      eventParams,
      timestamp: Date.now(),
    };

    this.send({
      ...event,
      projectId: this.projectId,
      ...this.commonParams,
    });
  }

  private async send(data: any) {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  }

  private initErrorCapture() {
    window.addEventListener('error', (event) => {
      this.track('error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.track('unhandledRejection', {
        reason: event.reason,
      });
    });
  }
}

export default AnalyticsSDK; 