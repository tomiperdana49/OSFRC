import React from 'react';
import { Layout } from 'antd';
import Sidebar from '../components/Sidebar';

const { Content } = Layout;

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <Layout className="min-h-screen">
            <Sidebar />
            <Layout>
                <Content className="bg-gray-50 overflow-auto">
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
