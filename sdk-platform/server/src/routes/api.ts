import express from 'express';
import { StatsService } from '../services/statsService';
import { EventDefinitionService } from '../services/eventDefinitionService';
import { TrackingService } from '../services/trackingService';
import { Connection } from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';

export function createApiRouter(db: Connection) {
  const router = express.Router();
  const statsService = new StatsService(db);
  const eventDefinitionService = new EventDefinitionService(db);
  const trackingService = new TrackingService(db);

  // 事件追踪接口
  router.post('/track', async (req, res) => {
    try {
      const eventData = req.body;
      await trackingService.trackEvent(eventData);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error tracking event:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  // 获取事件定义列表
  router.get('/event-definitions', async (req, res) => {
    try {
      const projectId = req.query.projectId as string;
      if (!projectId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Project ID is required' 
        });
      }

      const events = await eventDefinitionService.getEventDefinitions(projectId);
      res.json({ success: true, data: events });
    } catch (error) {
      console.error('Error getting event definitions:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  // 创建事件定义
  router.post('/event-definitions', async (req, res) => {
    try {
      const data = await eventDefinitionService.createEventDefinition(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      console.error('Error creating event definition:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  // 更新事件定义
  router.put('/event-definitions/:id', async (req, res) => {
    try {
      const data = await eventDefinitionService.updateEventDefinition(
        req.params.id,
        req.body
      );
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error updating event definition:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  // 删除事件定义
  router.delete('/event-definitions/:id', async (req, res) => {
    try {
      const projectId = req.query.projectId as string;
      if (!projectId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Project ID is required' 
        });
      }

      await eventDefinitionService.deleteEventDefinition(req.params.id, projectId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting event definition:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  // 获取事件分析数据
  router.get('/events/analysis', async (req, res) => {
    try {
      const params = {
        projectId: req.query.projectId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        events: (req.query.events as string).split(',').filter(Boolean)
      };

      console.log('接收到事件分析请求:', params);

      if (!params.projectId || !params.startDate || !params.endDate || !params.events.length) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required parameters' 
        });
      }

      const data = await statsService.getEventAnalysis(params);
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error getting event analysis:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  // 获取漏斗分析数据
  router.get('/funnel/analysis', async (req, res) => {
    try {
      const params = {
        projectId: req.query.projectId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        stages: (req.query.stages as string).split(',').filter(Boolean)
      };

      console.log('接收到漏斗分析请求:', params);

      if (!params.projectId || !params.startDate || !params.endDate || !params.stages.length) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required parameters' 
        });
      }

      const data = await statsService.getFunnelAnalysis(params);
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error getting funnel analysis:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  // 获取统计数据
  router.get('/stats', async (req, res) => {
    try {
      const data = await statsService.getStats({
        projectId: req.query.projectId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        eventName: req.query.eventName as string
      });
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error getting stats:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  // 获取仪表盘概览数据
  router.get('/dashboard/overview', async (req, res) => {
    try {
      const projectId = req.query.projectId as string;
      if (!projectId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Project ID is required' 
        });
      }

      const data = await statsService.getDashboardOverview(projectId);
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error getting dashboard overview:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  // 创建项目
  router.post('/projects', async (req, res) => {
    try {
      const { name, description } = req.body;
      const id = uuidv4();
      
      await db.execute(
        'INSERT INTO projects (id, name, description) VALUES (?, ?, ?)',
        [id, name, description]
      );

      res.status(201).json({ 
        success: true, 
        data: { id, name, description } 
      });
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  // 获取项目列表
  router.get('/projects', async (req, res) => {
    try {
      const [rows] = await db.execute('SELECT * FROM projects ORDER BY created_at DESC');
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error('Error getting projects:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  return router;
} 