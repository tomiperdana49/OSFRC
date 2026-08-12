import React from 'react';
import { Layout, Menu } from 'antd';
import {
    DashboardOutlined,
    HomeOutlined,
    FileTextOutlined,
    ToolOutlined,
    NotificationOutlined,
    UserOutlined,
    BookOutlined,
    SettingOutlined,
    ApartmentOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Get user from localStorage
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const role = user?.role;

    const allItems = [
        { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
        { key: '/units', icon: <HomeOutlined />, label: 'Units Management', roles: ['admin'] },
        { key: '/billing', icon: <FileTextOutlined />, label: 'Billing & Finance', roles: ['admin'] },
        { key: '/tickets', icon: <ToolOutlined />, label: 'Ticketing' },
        { key: '/announcements', icon: <NotificationOutlined />, label: 'Announcements', roles: ['admin'] },
        { key: '/users', icon: <UserOutlined />, label: 'User Directory', roles: ['admin'] },
        { key: '/sla-guide', icon: <BookOutlined />, label: 'SLA Guide', roles: ['admin'] },
        { key: '/settings', icon: <SettingOutlined />, label: 'Settings', roles: ['admin'] },
    ];

    // Filter items based on role
    const menuItems = allItems.filter(item => {
        if (!item.roles) return true; // Accessible by all
        return role && item.roles.includes(role);
    });

    return (
        <Sider
            breakpoint="lg"
            collapsedWidth="0"
            className="min-h-screen border-r border-gray-100"
            theme="light"
            width={260}
        >
            <div className="p-6 flex items-center gap-3 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white text-lg shrink-0">
                    <ApartmentOutlined />
                </div>
                <div className="min-w-0">
                    <h1 className="text-base font-bold text-gray-900 m-0 leading-tight">OSFRC</h1>
                    <p className="text-[10px] text-gray-400 m-0 leading-tight truncate">Operational System for Residential Complex</p>
                </div>
            </div>
            <Menu
                mode="inline"
                selectedKeys={[location.pathname === '/dashboard' ? '/' : location.pathname]}
                items={menuItems}
                onClick={({ key }) => navigate(key)}
                className="pt-4 px-3 border-none"
            />
        </Sider>
    );
};

export default Sidebar;
