import { Connection } from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';

interface EventData {
  projectId: string;
  eventName: string;
  eventParams: Record<string, any>;
  uid?: string;
  deviceInfo: {
    userAgent: string;
    platform: string;
    language: string;
    screenResolution: string;
  };
  timestamp: number;
}

export class TrackingService {
  constructor(private db: Connection) {}

  async trackEvent(eventData: EventData): Promise<void> {
    try {
      console.log('开始处理事件追踪:', eventData);

      // 检查必要字段
      if (!eventData.projectId || !eventData.eventName) {
        throw new Error('Missing required fields: projectId or eventName');
      }

      // 检查事件定义是否存在，如果不存在则自动创建
      console.log('验证事件定义...');
      const exists = await this.validateEventDefinition(eventData.projectId, eventData.eventName);
      
      if (!exists) {
        console.log('事件定义不存在，正在创建...');
        await this.createEventDefinition(eventData.projectId, eventData.eventName);
      }

      // 准备插入数据
      const params = [
        eventData.projectId,
        eventData.eventName,
        JSON.stringify(eventData.eventParams || {}),
        eventData.uid || null,
        JSON.stringify(eventData.deviceInfo || {}),
        new Date(eventData.timestamp || Date.now())
      ];

      console.log('插入事件数据:', params);

      // 插入事件数据
      await this.db.execute(
        'INSERT INTO events (project_id, event_name, event_params, user_id, device_info, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
        params
      );

      console.log('事件追踪完成');
    } catch (err: any) {
      console.error('事件追踪失败:', err);
      console.error('错误详情:', err.stack);
      throw new Error(`Failed to track event: ${err.message}`);
    }
  }

  async validateEventDefinition(projectId: string, eventName: string): Promise<boolean> {
    try {
      console.log('验证事件定义:', { projectId, eventName });
      const [rows]: any = await this.db.execute(
        'SELECT COUNT(*) as count FROM event_definitions WHERE project_id = ? AND event_name = ?',
        [projectId, eventName]
      );
      const exists = rows[0].count > 0;
      console.log('事件定义存在:', exists);
      return exists;
    } catch (err: any) {
      console.error('验证事件定义失败:', err);
      throw new Error(`Failed to validate event definition: ${err.message}`);
    }
  }

  private async createEventDefinition(projectId: string, eventName: string): Promise<void> {
    try {
      console.log('创建事件定义:', { projectId, eventName });
      const id = uuidv4();
      await this.db.execute(
        'INSERT INTO event_definitions (id, project_id, event_name, description, params_schema) VALUES (?, ?, ?, ?, ?)',
        [
          id,
          projectId,
          eventName,
          `Auto-created event: ${eventName}`,
          '{}'
        ]
      );
      console.log('事件定义创建成功');
    } catch (err: any) {
      console.error('创建事件定义失败:', err);
      throw new Error(`Failed to create event definition: ${err.message}`);
    }
  }

  async getRecentEvents(projectId: string, limit: number = 100): Promise<any[]> {
    try {
      const [rows] = await this.db.execute(
        `SELECT * FROM events 
         WHERE project_id = ? 
         ORDER BY timestamp DESC 
         LIMIT ?`,
        [projectId, limit]
      );
      return rows as any[];
    } catch (err: any) {
      console.error('获取最近事件失败:', err);
      throw new Error(`Failed to get recent events: ${err.message}`);
    }
  }
} 