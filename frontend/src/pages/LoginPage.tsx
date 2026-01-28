import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Layout } from 'antd';
import { UserOutlined, LockOutlined, HomeOutlined } from '@ant-design/icons';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Content } = Layout;

const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/login', values);
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            message.success('Welcome back, ' + response.data.user.name);
            navigate('/dashboard');
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout className="min-h-screen bg-gray-100 flex items-center justify-center">
            <Content className="w-full max-w-md p-4">
                <Card className="shadow-2xl border-none rounded-2xl overflow-hidden p-6">
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                            <HomeOutlined className="text-4xl text-white" />
                        </div>
                        <Title level={2} className="m-0 text-blue-800">OSFRC</Title>
                        <Text type="secondary" className="text-sm">Operational System for Residential Complex</Text>
                    </div>

                    <Form
                        name="login_form"
                        layout="vertical"
                        onFinish={onFinish}
                        size="large"
                    >
                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'Please input your email!' },
                                { type: 'email', message: 'Please enter a valid email!' }
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined className="text-gray-400" />}
                                placeholder="Email Address"
                                className="rounded-lg h-12"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: 'Please input your Password!' }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined className="text-gray-400" />}
                                placeholder="Password"
                                className="rounded-lg h-12"
                            />
                        </Form.Item>

                        <Form.Item className="mb-0">
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="w-full h-12 rounded-lg bg-blue-600 hover:bg-blue-700 font-bold transition-all"
                                loading={loading}
                            >
                                LOG IN
                            </Button>
                        </Form.Item>
                    </Form>

                    <div className="mt-8 text-center">
                        <Text type="secondary" className="text-xs">
                            © 2026 Wordix Tech. All rights reserved.
                        </Text>
                    </div>
                </Card>
            </Content>
        </Layout>
    );
};

export default LoginPage;
