import React, { useState, useEffect } from 'react';
import { Card, Row, Col, DatePicker, Button, Select, Table, Spin, message } from 'antd';
import { Funnel } from '@ant-design/plots';
import dayjs from 'dayjs';
import { apiService } from '@/services/api';
import type { EventDefinition } from '@/types';

const { RangePicker } = DatePicker;

const FunnelAnalysis: React.FC = () => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(7, 'day'),
    dayjs()
  ]);
  const [loading, setLoading] = useState(false);
  const [eventOptions, setEventOptions] = useState<EventDefinition[]>([]);
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [funnelData, setFunnelData] = useState<any[]>([]);

  // 获取事件定义列表
  const fetchEventDefinitions = async () => {
    try {
      const events = await apiService.getEventDefinitions('demo-project');
      setEventOptions(events);
      // 不再默认选择所有事件
      setSelectedStages([]);
    } catch (error) {
      message.error('获取事件列表失败');
      console.error('Error fetching event definitions:', error);
    }
  };

  // 获取漏斗数据
  const fetchFunnelData = async () => {
    if (selectedStages.length === 0) {
      setFunnelData([]);
      return;
    }

    try {
      setLoading(true);
      const data = await apiService.getFunnelAnalysis({
        projectId: 'demo-project',
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        stages: selectedStages
      });
      setFunnelData(data);
    } catch (error) {
      message.error('获取漏斗数据失败');
      console.error('Error fetching funnel data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDefinitions();
  }, []);

  const handleSearch = () => {
    fetchFunnelData();
  };

  const columns = [
    {
      title: '转化阶段',
      dataIndex: 'stage',
      key: 'stage',
      render: (text: string) => 
        eventOptions.find(e => e.eventName === text)?.description || text,
    },
    {
      title: '用户数',
      dataIndex: 'value',
      key: 'value',
      sorter: (a: any, b: any) => a.value - b.value,
    },
    {
      title: '转化率',
      dataIndex: 'rate',
      key: 'rate',
      render: (text: number) => text ? `${(text * 100).toFixed(2)}%` : '-',
    },
    {
      title: '环比',
      dataIndex: 'change',
      key: 'change',
      render: (text: number) => text ? `${text > 0 ? '+' : ''}${(text * 100).toFixed(2)}%` : '-',
    },
  ];

  const funnelConfig = {
    data: funnelData,
    xField: 'stage',
    yField: 'value',
    shape: 'funnel',
    label: {
      formatter: (datum: any) => {
        const index = funnelData.findIndex(item => item.stage === datum.stage);
        if (index === 0) return `${datum.value}`;
        const rate = datum.value / funnelData[index - 1].value;
        return `${datum.value} (${(rate * 100).toFixed(2)}%)`;
      },
    },
  };

  return (
    <Spin spinning={loading}>
      <div>
        <Card>
          <Row gutter={[16, 16]} align="middle">
            <Col>
              <RangePicker
                value={dateRange}
                onChange={(dates) => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
              />
            </Col>
            <Col flex="auto">
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="选择漏斗步骤"
                options={eventOptions.map(event => ({
                  label: event.description,
                  value: event.eventName
                }))}
                value={selectedStages}
                onChange={setSelectedStages}
              />
            </Col>
            <Col>
              <Button type="primary" onClick={handleSearch}>查询</Button>
            </Col>
          </Row>
        </Card>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Card title="转化漏斗">
              <Funnel {...funnelConfig} />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="转化明细">
              <Table columns={columns} dataSource={funnelData} pagination={false} />
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  );
};

export default FunnelAnalysis; 