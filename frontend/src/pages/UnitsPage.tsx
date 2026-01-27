import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Table, Button, Card, Modal, Form, Input, Select, message, Space, Typography, Tag, Row, Col, Popconfirm, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, HomeOutlined, SearchOutlined, CalendarOutlined } from '@ant-design/icons';
import api from '../api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const UnitsPage = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const filter = queryParams.get('filter');

    const [units, setUnits] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState<number | null>(null);

    useEffect(() => {
        fetchUnits();
        fetchResidents();
    }, []);

    const fetchUnits = async () => {
        try {
            setLoading(true);
            const response = await api.get('/units');
            setUnits(response.data);
        } catch (error) {
            message.error('Failed to load units');
        } finally {
            setLoading(false);
        }
    };

    const fetchResidents = async () => {
        try {
            const response = await api.get('/users');
            // Only show users with 'resident' role as potential unit owners
            const filtered = response.data.filter((u: any) => u.role === 'resident');
            setResidents(filtered);
        } catch (err) {
            console.error('Failed to load residents', err);
        }
    };

    const handleCreate = () => {
        setEditingId(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (unit: any) => {
        setEditingId(unit.id);
        form.setFieldsValue({
            unitNumber: unit.unitNumber,
            ownerId: unit.owner?.id,
            basePrice: unit.basePrice,
            billingCycle: unit.billingCycle,
            invoiceDay: unit.invoiceDay,
            ownerSince: unit.ownerSince ? dayjs(unit.ownerSince) : null,
            yearlyDiscount: unit.yearlyDiscount,
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/units/${id}`);
            message.success('Unit deleted successfully');
            fetchUnits();
        } catch (error) {
            message.error('Failed to delete unit');
        }
    };

    const handleModalSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                ownerSince: values.ownerSince ? values.ownerSince.toISOString() : null,
            };
            if (editingId) {
                await api.patch(`/units/${editingId}`, payload);
                message.success('Unit updated successfully');
            } else {
                await api.post('/units', payload);
                message.success('Unit created successfully');
            }
            setIsModalVisible(false);
            fetchUnits();
        } catch (error) {
            message.error('Please check the form fields');
        }
    };

    const columns = [
        { title: 'Unit Number', dataIndex: 'unitNumber', key: 'unitNumber', render: (text: string) => <Tag color="blue" className="font-bold">{text}</Tag> },
        { title: 'Owner', dataIndex: 'owner', key: 'owner', render: (owner: any) => owner ? owner.name : 'No Owner' },
        { title: 'Unit Price', dataIndex: 'basePrice', key: 'basePrice', render: (val: number) => `Rp ${Number(val).toLocaleString()}` },
        { title: 'Cycle', dataIndex: 'billingCycle', key: 'billingCycle', render: (val: string) => <Tag color={val === 'Yearly' ? 'purple' : 'orange'}>{val}</Tag> },
        { title: 'Inv. Day', dataIndex: 'invoiceDay', key: 'invoiceDay', render: (val: number, record: any) => record.billingCycle === 'Monthly' ? `Tgl ${val}` : '-' },
        { title: 'Owner Since', dataIndex: 'ownerSince', key: 'ownerSince', render: (val: string) => val ? dayjs(val).format('DD MMM YYYY') : '-' },
        { title: 'Discount', dataIndex: 'yearlyDiscount', key: 'yearlyDiscount', render: (val: any, record: any) => record.billingCycle === 'Yearly' ? <Tag color="green">- Rp {Number(val || 0).toLocaleString()}</Tag> : '-' },
        { title: 'Outstanding Balance', dataIndex: 'outstandingBalance', key: 'outstandingBalance', render: (val: number) => `Rp ${val?.toLocaleString()}` },
        {
            title: 'Action',
            key: 'action',
            render: (record: any) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Popconfirm
                        title="Delete this unit?"
                        description="Are you sure you want to delete this unit? This action cannot be undone."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes, Delete"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                    >
                        <Button icon={<DeleteOutlined />} danger />
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
                                <HomeOutlined /> Units Management
                            </Title>
                            <Text type="secondary">Manage residential units and their ownership details.</Text>
                        </div>
                        <div className="flex items-center gap-4">
                            <Input
                                placeholder="Search unit or owner..."
                                prefix={<SearchOutlined className="text-gray-400" />}
                                className="w-64 h-12 rounded-lg"
                                onChange={(e) => setSearchText(e.target.value)}
                                allowClear
                            />
                            <Button type="primary" icon={<PlusOutlined />} size="large" onClick={handleCreate} className="h-12 px-8 rounded-lg">
                                Add New Unit
                            </Button>
                        </div>
                    </div>
                </Col>

                <Col span={24}>
                    <Card className="shadow-sm border-none">
                        <Table
                            columns={columns}
                            dataSource={units.filter((u: any) => {
                                // Search Filter
                                const passesSearch = u.unitNumber.toLowerCase().includes(searchText.toLowerCase()) ||
                                    (u.owner?.name || '').toLowerCase().includes(searchText.toLowerCase());

                                // Vacant Filter (from Dashboard)
                                if (filter === 'vacant') {
                                    return passesSearch && !u.owner;
                                }

                                return passesSearch;
                            })}
                            rowKey="id"
                            loading={loading}
                            pagination={{
                                pageSize: 12,
                                showSizeChanger: true,
                                showTotal: (total) => `Total ${total} Unit`,
                                position: ['bottomRight']
                            }}
                        />
                    </Card>
                </Col>
            </Row>

            <Modal
                title={editingId ? 'Edit Unit' : 'Create New Unit'}
                open={isModalVisible}
                onOk={handleModalSubmit}
                onCancel={() => setIsModalVisible(false)}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    className="mt-4"
                    onValuesChange={(changedValues, allValues) => {
                        // Auto-calculate discount ONLY if basePrice or billingCycle changed
                        if (allValues.billingCycle === 'Yearly' && (changedValues.basePrice !== undefined || changedValues.billingCycle !== undefined)) {
                            const basePrice = Number(allValues.basePrice || 0);
                            const discount = Math.floor(basePrice / 12);
                            form.setFieldsValue({ yearlyDiscount: discount });
                        }
                    }}
                >
                    <Form.Item
                        name="unitNumber"
                        label="Unit Number"
                        rules={[{ required: true, message: 'Please enter unit number' }]}
                    >
                        <Input placeholder="e.g. A-101" />
                    </Form.Item>
                    <Form.Item
                        name="ownerId"
                        label="Owner (Resident)"
                    >
                        <Select
                            placeholder="Select owner name"
                            showSearch
                            optionFilterProp="children"
                        >
                            {residents.map((res: any) => (
                                <Select.Option key={res.id} value={res.id}>
                                    {res.name} ({res.role})
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => prevValues.ownerId !== currentValues.ownerId}
                    >
                        {({ getFieldValue }) =>
                            getFieldValue('ownerId') ? (
                                <Form.Item
                                    name="ownerSince"
                                    label="Owner Registration Date (Start Date)"
                                    rules={[{ required: true, message: 'Harap isi tgl mulai kepemilikan/hunian' }]}
                                    className="mt-2"
                                >
                                    <DatePicker className="w-full" format="DD MMM YYYY" />
                                </Form.Item>
                            ) : null
                        }
                    </Form.Item>
                    <Form.Item
                        name="basePrice"
                        label="Service Charge (Base Price)"
                        rules={[{ required: true, message: 'Please enter unit price' }]}
                    >
                        <Input type="number" prefix="Rp" placeholder="e.g. 1500000" />
                    </Form.Item>
                    <Form.Item
                        name="billingCycle"
                        label="Billing Cycle"
                        rules={[{ required: true }]}
                        initialValue="Monthly"
                    >
                        <Select onChange={(val) => {
                            if (val === 'Monthly') {
                                form.setFieldsValue({ invoiceDay: 20, yearlyDiscount: 0 });
                            }
                        }}>
                            <Option value="Monthly">Monthly (Perbulan)</Option>
                            <Option value="Yearly">Yearly (Pertahun)</Option>
                        </Select>
                    </Form.Item>

                    {/* Conditional Field for Invoice Date */}
                    <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => prevValues.billingCycle !== currentValues.billingCycle}
                    >
                        {({ getFieldValue }) =>
                            getFieldValue('billingCycle') === 'Monthly' ? (
                                <Form.Item
                                    name="invoiceDay"
                                    label="Tanggal Generate Invoice (1-31)"
                                    rules={[{ required: true, message: 'Harap isi tgl tagihan' }]}
                                    initialValue={20}
                                    className="mt-4"
                                >
                                    <Input type="number" min={1} max={31} placeholder="Contoh: 20" />
                                </Form.Item>
                            ) : null
                        }
                    </Form.Item>

                    {/* Conditional Field for Yearly Discount */}
                    <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => prevValues.billingCycle !== currentValues.billingCycle}
                    >
                        {({ getFieldValue }) =>
                            getFieldValue('billingCycle') === 'Yearly' ? (
                                <Form.Item
                                    name="yearlyDiscount"
                                    label="Yearly Discount (Auto-calculated: 1/12 of Price)"
                                    rules={[{ required: true, message: 'Harap isi jumlah potongan' }]}
                                    initialValue={0}
                                    className="mt-4"
                                >
                                    <Input type="number" prefix="Rp" placeholder="Contoh: 50000" />
                                </Form.Item>
                            ) : null
                        }
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UnitsPage;
