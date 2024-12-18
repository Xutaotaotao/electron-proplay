import React, { useState } from 'react';
import {
  HomeOutlined,
  CommentOutlined,
  WindowsOutlined,
  DatabaseOutlined,
  LaptopOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout, Menu, theme } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const { Content, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem('首页', '/main', <HomeOutlined />),
  getItem('IPC 通信', '/ipc', <CommentOutlined />),
  getItem('窗口池', '/window', <WindowsOutlined />),
  getItem('数据库', '/db', <DatabaseOutlined />),
  getItem('原生模块', '/native', <LaptopOutlined />)
];

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const location = useLocation();
  const navigate = useNavigate();

  const menuOnSelect = ({ key }:any) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <Menu onSelect={menuOnSelect} selectedKeys={[location.pathname]} mode="inline" items={items} />
      </Sider>
      <Layout>
        <Content style={{ margin: '12px' }}>
          <div
            style={{
              padding: 12,
              minHeight: '100%',
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
           <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;