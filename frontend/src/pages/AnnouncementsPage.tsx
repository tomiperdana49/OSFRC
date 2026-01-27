import React, { useEffect, useState } from 'react';
import { Card, Button, Modal, Form, Input, List, Typography, message, Tag, Space, Row, Col } from 'antd';
import { NotificationOutlined, PlusOutlined, DeleteOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import api from '../api';

const { Title, Text, Paragraph } = Typography;

const AnnouncementsPage = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const response = await api.get('/announcements');
            setAnnouncements(response.data);
        } catch (error) {
            message.error('Failed to load announcements');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            const values = await form.validateFields();
            await api.post('/announcements', {
                ...values,
                createdById: 1, // Defaulting to first admin for demo
            });
            message.success('Announcement published successfully');
            setIsModalVisible(false);
            form.resetFields();
            fetchAnnouncements();
        } catch (error) {
            message.error('Please check the form fields');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/announcements/${id}`);
            message.success('Announcement removed');
            fetchAnnouncements();
        } catch (error) {
            message.error('Failed to remove announcement');
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <Row gutter={[24, 24]} className="max-w-5xl mx-auto">
                <Col span={24}>
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <Title level={2} className="m-0 flex items-center gap-3">
                                <NotificationOutlined className="text-blue-600" /> Announcements
                            </Title>
                            <Text type="secondary">Broadcast news, events, and important updates to all residents.</Text>
                        </div>
                        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setIsModalVisible(true)} className="bg-blue-600 h-12 px-6 rounded-lg">
                            Post New
                        </Button>
                    </div>
                </Col>

                <Col span={24}>
                    {loading ? (
                        <div className="text-center py-20"><Text type="secondary">Loading announcements...</Text></div>
                    ) : (
                        <List
                            grid={{ gutter: 24, column: 1 }}
                            dataSource={announcements}
                            renderItem={(item: any) => (
                                <List.Item>
                                    <Card
                                        className="shadow-sm border-none hover:shadow-md transition-shadow"
                                        actions={[
                                            <Button key="delete" type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(item.id)}>Delete</Button>
                                        ]}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <Title level={4} className="m-0 text-blue-800">{item.title}</Title>
                                            <Tag color="blue" icon={<CalendarOutlined />}>
                                                {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </Tag>
                                        </div>
                                        <Paragraph className="text-gray-600 leading-relaxed text-base">
                                            {item.content}
                                        </Paragraph>
                                        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2">
                                            <UserOutlined className="text-gray-400" />
                                            <Text type="secondary" className="text-xs">Published by: <span className="font-bold">{item.createdBy?.name || 'Admin'}</span></Text>
                                        </div>
                                    </Card>
                                </List.Item>
                            )}
                        />
                    )}
                </Col>
            </Row>

            <Modal
                title="Post New Announcement"
                open={isModalVisible}
                onOk={handleCreate}
                onCancel={() => setIsModalVisible(false)}
                okText="Publish"
                okButtonProps={{ className: 'bg-blue-600' }}
                destroyOnClose
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item
                        name="title"
                        label="Announcement Title"
                        rules={[{ required: true, message: 'Please enter a title' }]}
                    >
                        <Input placeholder="e.g. Scheduled Power Maintenance" size="large" />
                    </Form.Item>
                    <Form.Item
                        name="content"
                        label="Content / Details"
                        rules={[{ required: true, message: 'Please enter content' }]}
                    >
                        <Input.TextArea rows={6} placeholder="Describe the announcement in detail..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AnnouncementsPage;
