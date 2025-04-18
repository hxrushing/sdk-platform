import React, { useState, useCallback } from 'react';
import { Layout, Menu, Dropdown } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '@/store';
import { throttle } from 'lodash';
import './index.less';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo, setUserInfo } = useStore();
  const [logoPosition, setLogoPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // 使用 useCallback 和 throttle 包装拖拽处理函数
  const handleDrag = useCallback(
    throttle((e: React.MouseEvent) => {
      if (!isDragging) return;

      const logoElement = document.querySelector('.logo') as HTMLElement;
      const userInfoElement = document.querySelector('.user-info') as HTMLElement;
      
      if (!logoElement || !userInfoElement) return;

      const logoRect = logoElement.getBoundingClientRect();
      const userInfoRect = userInfoElement.getBoundingClientRect();

      // 计算 logo 中心点
      const logoCenterX = e.clientX;
      const logoCenterY = e.clientY;

      // 计算用户信息区域中心点
      const userInfoCenterX = userInfoRect.left + userInfoRect.width / 2;
      const userInfoCenterY = userInfoRect.top + userInfoRect.height / 2;

      // 计算距离
      const distance = Math.sqrt(
        Math.pow(logoCenterX - userInfoCenterX, 2) +
        Math.pow(logoCenterY - userInfoCenterY, 2)
      );

      console.log('Logo center:', { x: logoCenterX, y: logoCenterY });
      console.log('User info center:', { x: userInfoCenterX, y: userInfoCenterY });
      console.log('Distance:', distance);

      // 如果距离小于阈值，触发事件
      if (distance < 150) {
        console.log('Logo dragged near user info!');
        // 这里可以添加您想要触发的具体事件
      }

      // 更新 logo 位置
      setLogoPosition({
        x: e.clientX - logoRect.width / 2,
        y: e.clientY - logoRect.height / 2
      });
    }, 100), // 100ms 的节流时间
    [isDragging]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement && e.target.closest('.logo')) {
      setIsDragging(true);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // 重置 logo 位置
    setLogoPosition({ x: 0, y: 0 });
  };

  const handleLogout = () => {
    setUserInfo(null);
    navigate('/login');
  };

  const menuItems = [
    {
      key: 'dashboard',
      label: '数据概览',
      onClick: () => navigate('/dashboard')
    },
    {
      key: 'events',
      label: '事件管理',
      onClick: () => navigate('/events')
    },
    {
      key: 'analysis',
      label: '数据分析',
      onClick: () => navigate('/analysis')
    }
  ];

  const userMenuItems = [
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      onClick: handleLogout
    }
  ];

  return (
    <Layout className="main-layout">
      <Header className="header">
        <div 
          className="logo"
          style={{
            transform: `translate(${logoPosition.x}px, ${logoPosition.y}px)`
          }}
          onMouseDown={handleMouseDown}
        >
          SDK Platform
        </div>
        {userInfo && (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div className="user-info">
              <UserOutlined />
              <span>{userInfo.username}</span>
            </div>
          </Dropdown>
        )}
      </Header>
      <Layout>
        <Sider width={200}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname.split('/')[1]]}
            items={menuItems}
          />
        </Sider>
        <Content className="content">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 