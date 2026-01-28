import React, { useState, useEffect } from 'react';
import { Card, Tabs, Table, Button, Modal, Form, Input, message, Popconfirm, Tag, Typography, Space, Row, Col } from 'antd';
import { SettingOutlined, TagOutlined, PlusOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import api from '../api';

const { Title, Text, Paragraph } = Typography;

const TicketCategoriesSettings = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState<number | null>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await api.get('/ticket-categories');
            setCategories(response.data);
        } catch (error) {
            message.error('Failed to fetch categories');
        }
        setLoading(false);
    };

    const handleAdd = () => {
        setEditingId(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record: any) => {
        setEditingId(record.id);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/ticket-categories/${id}`);
            message.success('Category removed');
            fetchCategories();
        } catch (error) {
            message.error('Category is in use or cannot be deleted');
        }
    };

    const handleModalSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editingId) {
                await api.patch(`/ticket-categories/${editingId}`, values);
                message.success('Category updated');
            } else {
                await api.post('/ticket-categories', values);
                message.success('Category added');
            }
            setIsModalVisible(false);
            fetchCategories();
        } catch (error) {
            message.error('Please fix form errors');
        }
    };

    const columns = [
        {
            title: 'Category Name',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <Tag color="blue" className="font-bold px-3 py-1">{text}</Tag>
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            render: (text: string) => <Text type="secondary">{text || '-'}</Text>
        },
        {
            title: 'Action',
            key: 'action',
            render: (record: any) => (
                <Space>
                    <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
                    <Popconfirm
                        title="Delete Category?"
                        description="This might affect existing tickets using this category."
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Button icon={<DeleteOutlined />} size="small" danger />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Title level={4} className="!m-0">Ticket Categories</Title>
                    <Text type="secondary">Define and manage categories for maintenance requests.</Text>
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Add Category</Button>
            </div>

            <Card className="shadow-sm border-none">
                <Table
                    dataSource={categories}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                />
            </Card>

            <Modal
                title={editingId ? 'Edit Category' : 'New Ticket Category'}
                open={isModalVisible}
                onOk={handleModalSubmit}
                onCancel={() => setIsModalVisible(false)}
                destroyOnClose
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item
                        name="name"
                        label="Category Name"
                        rules={[{ required: true, message: 'Please enter name' }]}
                    >
                        <Input placeholder="e.g. Plumbing, Electrical..." />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Description (Optional)"
                    >
                        <Input.TextArea placeholder="What does this category cover?" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

const SettingsPage = () => {
    return (
        <div className="p-10 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="mb-10">
                    <Title level={2} className="!m-0 flex items-center gap-3">
                        <SettingOutlined className="text-gray-400" /> System Settings
                    </Title>
                    <Text type="secondary">Manage global configurations and master data.</Text>
                </div>

                <Tabs
                    defaultActiveKey="tickets"
                    items={[
                        {
                            key: 'tickets',
                            label: (
                                <Space>
                                    <TagOutlined /> Ticketing
                                </Space>
                            ),
                            children: <TicketCategoriesSettings />,
                        },
                        {
                            key: 'general',
                            label: (
                                <Space>
                                    <InfoCircleOutlined /> General
                                </Space>
                            ),
                            children: (
                                <Card className="text-center p-20 py-32 bg-gray-100/50">
                                    <Text type="secondary">General system settings will be available in future updates.</Text>
                                </Card>
                            ),
                        },
                    ]}
                />
            </div>
        </div>
    );
};

export default SettingsPage;
