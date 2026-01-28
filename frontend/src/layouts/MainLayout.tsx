import React from 'react';
import { Layout, Button, Avatar, Space, Typography } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';

const { Content, Header } = Layout;
const { Text } = Typography;

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user) return <>{children}</>;

    return (
        <Layout className="min-h-screen" hasSider>
            <Sidebar />
            <Layout className="h-screen overflow-hidden">
                <Header className="bg-white px-8 flex justify-end items-center border-b border-gray-100 shadow-sm h-16 shrink-0">
                    <Space size="large">
                        <Space>
                            <Avatar icon={<UserOutlined />} className="bg-blue-600" />
                            <div className="flex flex-col leading-tight">
                                <Text strong className="text-gray-800">{user.name}</Text>
                                <Text type="secondary" className="text-[10px] uppercase tracking-wider">{user.role}</Text>
                            </div>
                        </Space>
                        <Button
                            icon={<LogoutOutlined />}
                            onClick={handleLogout}
                            type="text"
                            danger
                            className="hover:bg-red-50 flex items-center"
                        >
                            Logout
                        </Button>
                    </Space>
                </Header>
                <Content className="bg-gray-50 overflow-auto">
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
