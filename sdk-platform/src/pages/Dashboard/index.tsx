import React, { useState, useEffect } from 'react';
import { Card, Row, Col, DatePicker, Statistic, Spin, message } from 'antd';
import { Line } from '@ant-design/plots';
import dayjs from 'dayjs';
import { apiService } from '@/services/api';

const { RangePicker } = DatePicker;

const Dashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(7, 'day'),
    dayjs()
  ]);
  const [loading, setLoading] = useState(false);
  const [statsData, setStatsData] = useState<any[]>([]);
  const [overview, setOverview] = useState({
    todayPV: 0,
    todayUV: 0,
    avgPages: 0,
    avgDuration: 0
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stats, overviewData] = await Promise.all([
        apiService.getStats({
          projectId: 'demo-project',
          startDate: dateRange[0].format('YYYY-MM-DD'),
          endDate: dateRange[1].format('YYYY-MM-DD')
        }),
        apiService.getDashboardOverview('demo-project')
      ]);

      setStatsData(stats);
      setOverview(overviewData);
    } catch (error) {
      message.error('获取数据失败');
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const lineConfig = {
    data: statsData.map(item => [
      { date: item.date, value: item.pv, type: 'PV' },
      { date: item.date, value: item.uv, type: 'UV' }
    ]).flat(),
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'wave-in',
        duration: 1000,
      },
    },
  };

  return (
    <Spin spinning={loading}>
      <div>
        <div style={{ marginBottom: 16 }}>
          <RangePicker
            value={dateRange}
            onChange={(dates) => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
          />
        </div>

        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card>
              <Statistic
                title="今日PV"
                value={overview.todayPV}
                suffix="次"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="今日UV"
                value={overview.todayUV}
                suffix="人"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="人均访问页面"
                value={overview.avgPages}
                precision={2}
                suffix="页"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="平均停留时间"
                value={overview.avgDuration}
                precision={1}
                suffix="分钟"
              />
            </Card>
          </Col>
        </Row>

        <Card title="访问趋势" style={{ marginTop: 16 }}>
          <Line {...lineConfig} />
        </Card>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Card title="Top 5 访问页面">
              {/* 这里可以添加表格或列表组件 */}
            </Card>
          </Col>
          <Col span={12}>
            <Card title="用户来源分布">
              {/* 这里可以添加饼图组件 */}
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  );
};

export default Dashboard; 