import React, { useState, useEffect } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  SettingOutlined,
  LineChartOutlined,
  ApartmentOutlined
} from '@ant-design/icons';
import { Layout, Menu, Button, theme, Select, Modal, Form, Input, message } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import { apiService, Project } from '@/services/api';
import logo from '@/assets/1.jpg';

const { Header, Sider, Content } = Layout;
const { Option } = Select;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { colorBgContainer } = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('demo-project');

  // 获取项目列表
  const fetchProjects = async () => {
    try {
      const projectList = await apiService.getProjects();
      setProjects(projectList);
      // 如果没有选中的项目，选择第一个
      if (!selectedProject && projectList.length > 0) {
        setSelectedProject(projectList[0].id);
      }
    } catch (error) {
      message.error('获取项目列表失败');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '数据概览',
    },
    {
      key: '/events',
      icon: <LineChartOutlined />,
      label: '事件分析',
    },
    {
      key: '/funnel',
      icon: <ApartmentOutlined />,
      label: '漏斗分析',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '事件配置',
    },
  ];

  const handleCreateProject = async (values: any) => {
    try {
      await apiService.createProject(values);
      message.success('项目创建成功');
      setIsModalVisible(false);
      form.resetFields();
      // 刷新项目列表
      fetchProjects();
    } catch (error) {
      message.error('项目创建失败');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div style={{ 
          height: 48, 
          margin: 16, 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          padding: '4px',
          transition: 'all 0.3s'
        }}>
          <img 
            src={logo} 
            alt="Logo" 
            style={{ 
              height: '100%',
              width: collapsed ? '48px' : '160px',
              objectFit: 'contain',
              transition: 'all 0.3s',
              borderRadius: '6px'
            }}
          />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={[location.pathname]}
          items={menuItems}
          onSelect={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 24px', justifyContent: 'space-between' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 64, height: 64 }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Select
                value={selectedProject}
                style={{ width: 200 }}
                onChange={setSelectedProject}
              >
                {projects.map(project => (
                  <Option key={project.id} value={project.id}>
                    {project.name}
                  </Option>
                ))}
              </Select>
              <Button type="primary" onClick={() => setIsModalVisible(true)}>创建项目</Button>
            </div>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            background: colorBgContainer,
            minHeight: 280,
            overflow: 'auto'
          }}
        >
          {children}
        </Content>
      </Layout>

      <Modal
        title="创建新项目"
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateProject}
        >
          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="项目描述"
            rules={[{ required: true, message: '请输入项目描述' }]}
          >
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default MainLayout; 