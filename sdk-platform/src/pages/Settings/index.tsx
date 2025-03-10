import React, { useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Space, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { EventDefinition } from '@/types';

const Settings: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventDefinition | null>(null);
  const [form] = Form.useForm();

  // 示例数据
  const [events, setEvents] = useState<EventDefinition[]>([
    {
      id: '1',
      projectId: 'demo-project',
      eventName: 'pageview',
      description: '页面访问事件',
      paramsSchema: {
        page: 'string',
        title: 'string'
      }
    },
    {
      id: '2',
      projectId: 'demo-project',
      eventName: 'click',
      description: '点击事件',
      paramsSchema: {
        element: 'string',
        position: 'object'
      }
    }
  ]);

  const columns = [
    {
      title: '事件名称',
      dataIndex: 'eventName',
      key: 'eventName',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '参数定义',
      dataIndex: 'paramsSchema',
      key: 'paramsSchema',
      render: (schema: Record<string, string>) => (
        <pre>{JSON.stringify(schema, null, 2)}</pre>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: EventDefinition) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingEvent(record);
              form.setFieldsValue({
                ...record,
                paramsSchema: JSON.stringify(record.paramsSchema, null, 2)
              });
              setIsModalVisible(true);
            }}
          >
            编辑
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleSubmit = async (values: any) => {
    try {
      const paramsSchema = JSON.parse(values.paramsSchema);
      const eventData = {
        ...values,
        paramsSchema,
        projectId: 'demo-project'
      };

      if (editingEvent) {
        // 更新事件
        const updatedEvents = events.map(event =>
          event.id === editingEvent.id ? { ...eventData, id: event.id } : event
        );
        setEvents(updatedEvents);
        message.success('事件更新成功');
      } else {
        // 创建事件
        const newEvent = {
          ...eventData,
          id: String(events.length + 1)
        };
        setEvents([...events, newEvent]);
        message.success('事件创建成功');
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingEvent(null);
    } catch (error) {
      message.error('参数定义格式错误');
    }
  };

  const handleDelete = (event: EventDefinition) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除事件 "${event.eventName}" 吗？`,
      onOk: () => {
        setEvents(events.filter(e => e.id !== event.id));
        message.success('事件删除成功');
      },
    });
  };

  return (
    <div>
      <Card
        title="事件配置"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingEvent(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            新建事件
          </Button>
        }
      >
        <Table columns={columns} dataSource={events} rowKey="id" />
      </Card>

      <Modal
        title={editingEvent ? '编辑事件' : '新建事件'}
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingEvent(null);
          form.resetFields();
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="eventName"
            label="事件名称"
            rules={[{ required: true, message: '请输入事件名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="paramsSchema"
            label="参数定义"
            rules={[
              { required: true, message: '请输入参数定义' },
              {
                validator: async (_, value) => {
                  if (value) {
                    try {
                      JSON.parse(value);
                    } catch (error) {
                      throw new Error('参数定义必须是有效的JSON格式');
                    }
                  }
                },
              },
            ]}
          >
            <Input.TextArea
              rows={6}
              placeholder="请输入JSON格式的参数定义，例如：&#10;{&#10;  &quot;page&quot;: &quot;string&quot;,&#10;  &quot;title&quot;: &quot;string&quot;&#10;}"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Settings; 