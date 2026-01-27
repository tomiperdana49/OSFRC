import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Typography, Spin, message, Card, Row, Col, Modal, Form, Select, Space, Input, List, Divider, Avatar, Badge, DatePicker } from 'antd';
import {
    ToolOutlined,
    PlusOutlined,
    UserAddOutlined,
    CheckCircleOutlined,
    MessageOutlined,
    FilterOutlined,
    ClockCircleOutlined,
    AlertOutlined,
    UserOutlined,
    CalendarOutlined,
    SearchOutlined
} from '@ant-design/icons';
import api from '../api';
import dayjs from 'dayjs';
import { useLocation } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const TicketsPage = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const statusFilter = queryParams.get('status');

    const [loading, setLoading] = useState(true);
    const [tickets, setTickets] = useState<any[]>([]);
    const [searchText, setSearchText] = useState('');
    const [units, setUnits] = useState<any[]>([]);
    const [technicians, setTechnicians] = useState<any[]>([]);

    // Modals
    const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

    // Selection
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

    // Forms
    const [assignForm] = Form.useForm();
    const [createForm] = Form.useForm();
    const [commentForm] = Form.useForm();

    useEffect(() => {
        fetchData();
        fetchAuxData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/tickets');
            setTickets(response.data);
        } catch (error) {
            message.error('Failed to load tickets');
        } finally {
            setLoading(false);
        }
    };

    const fetchAuxData = async () => {
        try {
            const [usersRes, unitsRes] = await Promise.all([
                api.get('/users'),
                api.get('/units')
            ]);
            setTechnicians(usersRes.data.filter((u: any) => u.role === 'staff' || u.role === 'admin'));
            setUnits(unitsRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchTicketDetail = async (id: number) => {
        try {
            const response = await api.get(`/tickets/${id}`);
            setSelectedTicket(response.data);
            setIsDetailModalVisible(true);
        } catch (error) {
            message.error('Failed to load ticket details');
        }
    };

    const handleCreate = async () => {
        try {
            const values = await createForm.validateFields();
            await api.post('/tickets', values);
            message.success('Ticket reported successfully');
            setIsCreateModalVisible(false);
            createForm.resetFields();
            fetchData();
        } catch (error) {
            message.error('Please complete the form');
        }
    };

    const submitAssignment = async () => {
        try {
            const values = await assignForm.validateFields();
            await api.post(`/tickets/${selectedTicketId}/assign`, {
                technicianId: values.technicianId,
                estimate: values.estimate ? values.estimate.toISOString() : undefined
            });
            message.success('Technician assigned and estimate set');
            setIsAssignModalVisible(false);
            assignForm.resetFields();
            fetchData();
        } catch (error) {
            message.error('Assignment failed');
        }
    };

    const handleSubmitComment = async () => {
        try {
            const values = await commentForm.validateFields();
            await api.post(`/tickets/${selectedTicket?.id}/comments`, {
                text: values.text,
                authorId: 1 // Default to first admin for demo
            });
            message.success('Comment added');
            commentForm.resetFields();
            fetchTicketDetail(selectedTicket.id); // Refresh detail
        } catch (error) {
            message.error('Failed to post comment');
        }
    };

    const closeTicket = async (id: number, resolutionComment?: string) => {
        try {
            if (resolutionComment) {
                await api.post(`/tickets/${id}/comments`, {
                    text: resolutionComment,
                    authorId: 1
                });
            }
            await api.patch(`/tickets/${id}/status`, { status: 'Closed' });
            message.success('Ticket resolved and closed successfully');
            if (isDetailModalVisible) fetchTicketDetail(id);
            fetchData();
        } catch (error) {
            message.error('Failed to resolve ticket');
        }
    };

    const handleResolveWithComment = async () => {
        try {
            const values = await commentForm.validateFields();
            await closeTicket(selectedTicket.id, values.text);
            commentForm.resetFields();
        } catch (error) {
            message.error('Please enter a resolution comment to close the ticket');
        }
    };

    const priorityColors: any = { Low: 'blue', Medium: 'orange', High: 'volcano', Critical: 'red' };
    const statusColors: any = { New: 'cyan', 'In Progress': 'processing', Closed: 'success', Overdue: 'error' };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 70,
            render: (id: number) => <span className="font-mono text-gray-400">#{id}</span>
        },
        { title: 'Unit', dataIndex: 'unit', key: 'unit', render: (u: any) => <b className="text-blue-700">{u?.unitNumber}</b> },
        { title: 'Category', dataIndex: 'category', key: 'category' },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            render: (p: string) => <Tag color={priorityColors[p]} className="font-bold">{p?.toUpperCase()}</Tag>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => <Badge status={statusColors[status] as any} text={status} className="font-medium" />
        },
        {
            title: 'Estimate',
            dataIndex: 'estimatedCompletion',
            key: 'estimatedCompletion',
            render: (date: string) => date ? <Tag color="warning" icon={<ClockCircleOutlined />}>{dayjs(date).format('DD MMM HH:mm')}</Tag> : <span className="text-gray-300">-</span>
        },
        {
            title: 'Closed At',
            dataIndex: 'closedAt',
            key: 'closedAt',
            render: (date: string) => date ? <Tag color="success" icon={<CheckCircleOutlined />}>{dayjs(date).format('DD MMM HH:mm')}</Tag> : <span className="text-gray-300">-</span>
        },
        { title: 'Technician', dataIndex: 'assignedTo', key: 'assignedTo', render: (a: any) => a?.name || <span className="text-gray-300 italic">None</span> },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: any) => (
                <Space>
                    <Button size="small" icon={<MessageOutlined />} onClick={() => fetchTicketDetail(record.id)}>Detail</Button>
                    {(record.status === 'New' || record.status === 'In Progress') && (
                        <Button
                            size="small"
                            icon={<UserAddOutlined />}
                            onClick={() => {
                                setSelectedTicketId(record.id);
                                assignForm.setFieldsValue({
                                    technicianId: record.assignedTo?.id,
                                    estimate: record.estimatedCompletion ? dayjs(record.estimatedCompletion) : undefined
                                });
                                setIsAssignModalVisible(true);
                            }}
                        >
                            {record.assignedTo ? 'Re-assign' : 'Assign'}
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <Row gutter={[24, 24]} className="max-w-7xl mx-auto">
                <Col span={24}>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <Title level={2} className="m-0 flex items-center gap-3">
                                <ToolOutlined className="text-blue-600" /> Maintenance Center
                            </Title>
                            <Text type="secondary">Streamline maintenance operations and resident communication.</Text>
                        </div>
                        <div className="flex items-center gap-4">
                            <Input
                                placeholder="Search ID, unit, or staff..."
                                prefix={<SearchOutlined className="text-gray-400" />}
                                className="w-64 h-12 rounded-lg"
                                onChange={(e) => setSearchText(e.target.value)}
                                allowClear
                            />
                            <Button type="primary" icon={<PlusOutlined />} size="large" className="bg-blue-600 h-12 px-8 rounded-lg shadow-blue-200 shadow-lg" onClick={() => setIsCreateModalVisible(true)}>
                                New Request
                            </Button>
                        </div>
                    </div>
                </Col>

                <Col span={24}>
                    <Card className="shadow-sm border-none">
                        <Table
                            columns={columns}
                            dataSource={tickets.filter(t => {
                                // First: Filter by Status (from Dashboard)
                                if (statusFilter === 'open') return t.status === 'New' || t.status === 'In Progress';
                                if (statusFilter === 'overdue') return t.status === 'Overdue';
                                return true;
                            }).filter(t => {
                                // Second: Filter by Search Text
                                const s = searchText.toLowerCase();
                                return (
                                    t.id.toString().includes(s) ||
                                    (t.unit?.unitNumber || '').toLowerCase().includes(s) ||
                                    t.category.toLowerCase().includes(s) ||
                                    (t.assignedTo?.name || '').toLowerCase().includes(s)
                                );
                            })}
                            rowKey="id"
                            loading={loading}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showTotal: (total) => `Total ${total} ticket`,
                                position: ['bottomRight']
                            }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Create Ticket Modal */}
            <Modal
                title="Report Maintenance Issue"
                open={isCreateModalVisible}
                onOk={handleCreate}
                onCancel={() => setIsCreateModalVisible(false)}
                okText="Submit Request"
                width={600}
                destroyOnClose
            >
                <Form form={createForm} layout="vertical" className="mt-6">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="unitId" label="Unit Number" rules={[{ required: true }]}>
                                <Select placeholder="Select unit">
                                    {units.map(u => <Option key={u.id} value={u.id}>{u.unitNumber}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                                <Select placeholder="Select category">
                                    <Option value="Air">Air (Water)</Option>
                                    <Option value="Internet">Internet</Option>
                                    <Option value="Security">Security</Option>
                                    <Option value="Other">Other</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="priority" label="Priority" initialValue="Medium">
                        <Select>
                            <Option value="Low">Low</Option>
                            <Option value="Medium">Medium</Option>
                            <Option value="High">High</Option>
                            <Option value="Critical">Critical</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="description" label="Problem Description" rules={[{ required: true, min: 10 }]}>
                        <Input.TextArea rows={4} placeholder="Please describe the issue in detail..." />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Detail Modal */}
            <Modal
                title={selectedTicket ? `Ticket #${selectedTicket.id} Detail` : 'Detail'}
                open={isDetailModalVisible}
                onCancel={() => setIsDetailModalVisible(false)}
                footer={null}
                width={800}
            >
                {selectedTicket && (
                    <div className="py-2">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <Title level={3} className="mb-1">{selectedTicket.category} Issue</Title>
                                <Text className="text-gray-400">Unit: <b>{selectedTicket.unit?.unitNumber}</b> • Reported on {new Date(selectedTicket.createdAt).toLocaleString()}</Text>
                                {selectedTicket.estimatedCompletion && (
                                    <div className="mt-2">
                                        <Tag color="warning" icon={<CalendarOutlined />}>Target Selesai: {dayjs(selectedTicket.estimatedCompletion).format('DD MMMM YYYY, HH:mm')}</Tag>
                                    </div>
                                )}
                                {selectedTicket.closedAt && (
                                    <div className="mt-2">
                                        <Tag color="success" icon={<CheckCircleOutlined />}>Waktu Selesai: {dayjs(selectedTicket.closedAt).format('DD MMMM YYYY, HH:mm')}</Tag>
                                    </div>
                                )}
                            </div>
                            <div className="text-right">
                                <Tag color={statusColors[selectedTicket.status]} className="px-4 py-1 rounded-full">{selectedTicket.status.toUpperCase()}</Tag>
                                <div className="mt-2"><Tag color={priorityColors[selectedTicket.priority]}>PRIORITY: {selectedTicket.priority}</Tag></div>
                            </div>
                        </div>

                        <Card size="small" className="bg-gray-50 mb-6 border-none">
                            <Paragraph className="text-gray-700 m-0 p-2 italic">"{selectedTicket.description}"</Paragraph>
                        </Card>

                        <Divider className="m-0"><MessageOutlined /> Activity History</Divider>

                        <List
                            className="mt-4"
                            itemLayout="horizontal"
                            dataSource={selectedTicket.comments || []}
                            renderItem={(item: any) => (
                                <List.Item className="px-0">
                                    <List.Item.Meta
                                        avatar={<Avatar icon={<UserOutlined />} />}
                                        title={<div className="flex justify-between"><b>{item.author?.name}</b> <Text type="secondary" className="text-[10px]"><ClockCircleOutlined /> {new Date(item.createdAt).toLocaleTimeString()}</Text></div>}
                                        description={item.text}
                                    />
                                </List.Item>
                            )}
                            locale={{ emptyText: <Text type="secondary" className="italic py-4 block text-center">No logs recorded yet.</Text> }}
                        />

                        {selectedTicket.status !== 'Closed' && (
                            <div className="mt-8 pt-6 border-t">
                                <Title level={5}>Add Log / Comment</Title>
                                <Form form={commentForm} onFinish={handleSubmitComment}>
                                    <Form.Item name="text" rules={[{ required: true }]}>
                                        <Input.TextArea placeholder="Enter any update or repair notes..." rows={3} />
                                    </Form.Item>
                                    <div className="flex justify-between">
                                        <Button type="primary" htmlType="submit">Submit Update</Button>
                                        {selectedTicket.status === 'In Progress' && (
                                            <Button
                                                type="primary"
                                                className="bg-green-600 border-none"
                                                icon={<CheckCircleOutlined />}
                                                onClick={handleResolveWithComment}
                                            >
                                                Resolve Ticket
                                            </Button>
                                        )}
                                    </div>
                                </Form>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Assign Modal */}
            <Modal
                title="Assign Technician & Set Estimate"
                open={isAssignModalVisible}
                onOk={submitAssignment}
                onCancel={() => setIsAssignModalVisible(false)}
                destroyOnClose
            >
                <Form form={assignForm} layout="vertical" className="mt-4">
                    <Form.Item name="technicianId" label="Select Staff/Technician" rules={[{ required: true }]}>
                        <Select placeholder="Pick a technician">
                            {technicians.map((t: any) => (
                                <Option key={t.id} value={t.id}>{t.name} ({t.role})</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="estimate" label="Estimation Completion Time" rules={[{ required: true, message: 'Harap tentukan estimasi waktu selesai' }]}>
                        <DatePicker showTime className="w-full" format="YYYY-MM-DD HH:mm" />
                    </Form.Item>
                    <div className="bg-orange-50 p-3 rounded text-orange-700 text-xs">
                        <AlertOutlined /> Teknisi akan menerima target penyelesaian ini sebagai SLA pengerjaan.
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default TicketsPage;
