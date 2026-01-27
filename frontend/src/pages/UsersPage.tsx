import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Modal, Form, Input, Select, message, Space, Typography, Tag, Row, Col, Avatar, Upload, Popconfirm } from 'antd';
import { UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined, MailOutlined, WhatsAppOutlined, SearchOutlined, IdcardOutlined, UploadOutlined } from '@ant-design/icons';
import api from '../api';

const { Title, Text } = Typography;
const { Option } = Select;

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState<number | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            message.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingId(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (user: any) => {
        setEditingId(user.id);
        form.setFieldsValue({
            name: user.name,
            email: user.email,
            whatsapp: user.whatsapp,
            ktpPhoto: user.ktpPhoto,
            role: user.role,
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/users/${id}`);
            message.success('User removed successfully');
            fetchUsers();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to remove user';
            message.error(errorMsg);
        }
    };

    const handleModalSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editingId) {
                await api.patch(`/users/${editingId}`, values);
                message.success('User updated successfully');
            } else {
                await api.post('/users', values);
                message.success('User registered successfully');
            }
            setIsModalVisible(false);
            fetchUsers();
        } catch (error) {
            message.error('Please check the form fields');
        }
    };

    const roleColors: any = {
        admin: 'volcano',
        staff: 'cyan',
        resident: 'blue',
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => (
                <Space>
                    <Avatar icon={<UserOutlined />} className="bg-blue-100 text-blue-600" />
                    <span className="font-bold text-gray-700">{text}</span>
                </Space>
            ),
        },
        {
            title: 'Contact',
            key: 'contact',
            render: (record: any) => (
                <Space direction="vertical" size={0}>
                    <Space className="text-gray-500 text-xs">
                        <MailOutlined /> {record.email}
                    </Space>
                    {record.whatsapp && (
                        <a
                            href={`https://wa.me/${record.whatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-green-600 hover:text-green-700 text-xs flex items-center gap-1"
                        >
                            <WhatsAppOutlined /> {record.whatsapp}
                        </a>
                    )}
                </Space>
            )
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => <Tag color={roleColors[role]} className="uppercase font-bold text-[10px]">{role}</Tag>
        },
        {
            title: 'KTP',
            dataIndex: 'ktpPhoto',
            key: 'ktp',
            render: (url: string) => url ? (
                <Button type="link" size="small" icon={<IdcardOutlined />} onClick={() => window.open(url, '_blank')}>View</Button>
            ) : <span className="text-gray-300">-</span>
        },
        {
            title: 'Action',
            key: 'action',
            render: (record: any) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} size="small" />
                    <Popconfirm
                        title="Remove user?"
                        description="Are you sure you want to remove this user? This may fail if the user is linked to units or tickets."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes, Delete"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                    >
                        <Button icon={<DeleteOutlined />} danger size="small" />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <Row gutter={[24, 24]} className="max-w-6xl mx-auto">
                <Col span={24}>
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <Title level={2} className="m-0 flex items-center gap-3">
                                <UserOutlined className="text-blue-600" /> User Directory
                            </Title>
                            <Text type="secondary">Manage system administrators, staff, and residents.</Text>
                        </div>
                        <div className="flex items-center gap-4">
                            <Input
                                placeholder="Search by name or email..."
                                prefix={<SearchOutlined className="text-gray-400" />}
                                className="w-64 h-12 rounded-lg"
                                onChange={(e) => setSearchText(e.target.value)}
                                allowClear
                            />
                            <Button type="primary" icon={<PlusOutlined />} size="large" onClick={handleCreate} className="bg-blue-600 h-12 px-8 rounded-lg">
                                Regiser New User
                            </Button>
                        </div>
                    </div>
                </Col>

                <Col span={24}>
                    <Card className="shadow-sm border-none">
                        <Table
                            columns={columns}
                            dataSource={users.filter((u: any) =>
                                u.name.toLowerCase().includes(searchText.toLowerCase()) ||
                                u.email.toLowerCase().includes(searchText.toLowerCase())
                            )}
                            rowKey="id"
                            loading={loading}
                            pagination={{ pageSize: 12 }}
                        />
                    </Card>
                </Col>
            </Row>

            <Modal
                title={editingId ? 'Update User Details' : 'Register New User'}
                open={isModalVisible}
                onOk={handleModalSubmit}
                onCancel={() => setIsModalVisible(false)}
                destroyOnClose
                okButtonProps={{ className: 'bg-blue-600' }}
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item
                        name="name"
                        label="Full Name"
                        rules={[{ required: true, message: 'Please enter full name' }]}
                    >
                        <Input placeholder="John Doe" size="large" />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email Address"
                        rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
                    >
                        <Input placeholder="john@example.com" size="large" />
                    </Form.Item>
                    <Form.Item
                        name="whatsapp"
                        label="WhatsApp Number"
                        rules={[{ message: 'Enter number with country code, e.g. 628123...' }]}
                    >
                        <Input placeholder="62812XXXXXX" size="large" prefix={<WhatsAppOutlined className="text-green-500" />} />
                    </Form.Item>
                    <Form.Item
                        name="role"
                        label="System Role"
                        rules={[{ required: true }]}
                        initialValue="resident"
                    >
                        <Select size="large">
                            <Option value="admin">Admin</Option>
                            <Option value="staff">Staff/Technician</Option>
                            <Option value="resident">Resident</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => prevValues.ktpPhoto !== currentValues.ktpPhoto}
                    >
                        {({ getFieldValue }) => (
                            <Form.Item label="KTP Photo Upload">
                                <Upload
                                    name="file"
                                    listType="picture"
                                    maxCount={1}
                                    customRequest={async ({ file, onSuccess, onError }: any) => {
                                        try {
                                            const formData = new FormData();
                                            formData.append('file', file);
                                            const response = await api.post('/upload', formData, {
                                                headers: { 'Content-Type': 'multipart/form-data' }
                                            });
                                            form.setFieldsValue({ ktpPhoto: response.data.url });
                                            onSuccess(response.data);
                                            message.success('KTP uploaded successfully');
                                        } catch (err) {
                                            onError(err);
                                            message.error('Upload failed');
                                        }
                                    }}
                                    onRemove={() => form.setFieldsValue({ ktpPhoto: null })}
                                    fileList={getFieldValue('ktpPhoto') ? [{
                                        uid: '-1',
                                        name: 'KTP_Photo.png',
                                        status: 'done',
                                        url: getFieldValue('ktpPhoto'),
                                    }] : []}
                                >
                                    <Button icon={<UploadOutlined />}>Click to Upload KTP</Button>
                                </Upload>
                            </Form.Item>
                        )}
                    </Form.Item>
                    {/* Hidden input to store the URL in form values */}
                    <Form.Item name="ktpPhoto" noStyle><Input type="hidden" /></Form.Item>
                </Form>
            </Modal>
        </div >
    );
};

export default UsersPage;
