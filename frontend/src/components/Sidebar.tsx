import React from 'react';
import { Layout, Menu } from 'antd';
import {
    DashboardOutlined,
    HomeOutlined,
    FileTextOutlined,
    ToolOutlined,
    NotificationOutlined,
    UserOutlined,
    BookOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
        { key: '/units', icon: <HomeOutlined />, label: 'Units Management' },
        { key: '/billing', icon: <FileTextOutlined />, label: 'Billing & Finance' },
        { key: '/tickets', icon: <ToolOutlined />, label: 'Ticketing' },
        { key: '/announcements', icon: <NotificationOutlined />, label: 'Announcements' },
        { key: '/users', icon: <UserOutlined />, label: 'User Directory' },
        { key: '/sla-guide', icon: <BookOutlined />, label: 'SLA Guide' },
    ];

    return (
        <Sider
            breakpoint="lg"
            collapsedWidth="0"
            className="min-h-screen shadow-lg"
            theme="light"
            width={260}
        >
            <div className="p-6 text-center border-b border-gray-100">
                <h1 className="text-xl font-bold text-primary m-0 uppercase tracking-tighter">OSFRC</h1>
                <p className="text-[10px] text-gray-400 m-0">Operational System for Residential Complex</p>
            </div>
            <Menu
                mode="inline"
                selectedKeys={[location.pathname]}
                items={menuItems}
                onClick={({ key }) => navigate(key)}
                className="pt-4 border-none"
            />
        </Sider>
    );
};

export default Sidebar;
