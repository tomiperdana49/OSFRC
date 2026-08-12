import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Modal, Form, Input, Select, message, Space, Typography, Tag, Row, Col, DatePicker, Statistic, Popconfirm } from 'antd';
import { DollarOutlined, ThunderboltOutlined, CheckCircleOutlined, WalletOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const BillingPage = () => {
    const [invoices, setInvoices] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(true);
    const [isGenerateModalVisible, setIsGenerateModalVisible] = useState(false);
    const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

    // Forms
    const [generateForm] = Form.useForm();
    const [paymentForm] = Form.useForm();
    const [editForm] = Form.useForm();

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const response = await api.get('/invoices');
            setInvoices(response.data);
        } catch (error) {
            message.error('Failed to load invoices');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateMonthly = async () => {
        try {
            const values = await generateForm.validateFields();
            await api.post('/invoices/generate-monthly', {
                period: values.period.format('YYYY-MM'),
            });
            message.success('Monthly invoices generated successfully');
            setIsGenerateModalVisible(false);
            fetchInvoices();
        } catch (error) {
            message.error('Generation failed');
        }
    };

    const handleRecordPayment = (invoice: any) => {
        setSelectedInvoice(invoice);
        paymentForm.setFieldsValue({
            amount: invoice.totalAmount - invoice.paidAmount,
            paymentDate: dayjs()
        });
        setIsPaymentModalVisible(true);
    };

    const submitPayment = async () => {
        try {
            const values = await paymentForm.validateFields();
            await api.post(`/invoices/${selectedInvoice.id}/pay`, {
                amount: values.amount,
                paymentDate: values.paymentDate.toISOString(),
                paymentMethod: values.paymentMethod,
                bankName: values.bankName,
                referenceNumber: values.referenceNumber,
            });
            message.success('Payment recorded and reconciled');
            setIsPaymentModalVisible(false);
            fetchInvoices();
        } catch (error) {
            message.error('Payment failed');
        }
    };

    const handleEdit = (invoice: any) => {
        setSelectedInvoice(invoice);
        editForm.setFieldsValue({
            totalAmount: invoice.totalAmount,
            dueDate: dayjs(invoice.dueDate),
            period: invoice.period,
        });
        setIsEditModalVisible(true);
    };

    const submitEdit = async () => {
        try {
            const values = await editForm.validateFields();
            await api.patch(`/invoices/${selectedInvoice.id}`, {
                ...values,
                dueDate: values.dueDate.toISOString(),
            });
            message.success('Invoice updated successfully');
            setIsEditModalVisible(false);
            fetchInvoices();
        } catch (error) {
            message.error('Failed to update invoice');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/invoices/${id}`);
            message.success('Invoice deleted and balance synced');
            fetchInvoices();
        } catch (error) {
            message.error('Failed to delete invoice');
        }
    };

    const statusTags: any = {
        'Paid': { className: 'bg-emerald-50 text-emerald-700', icon: <CheckCircleOutlined /> },
        'Unpaid': { className: 'bg-amber-50 text-amber-700', icon: <ThunderboltOutlined /> },
        'Overdue': { className: 'bg-red-50 text-red-700', icon: <ThunderboltOutlined /> },
    };

    const columns = [
        { title: 'Period', dataIndex: 'period', key: 'period', render: (text: string) => <Tag className="font-mono">{text}</Tag> },
        { title: 'Unit', dataIndex: 'unit', key: 'unit', render: (u: any) => <span className="font-bold">{u?.unitNumber}</span> },
        { title: 'Amount', dataIndex: 'totalAmount', key: 'totalAmount', render: (v: number) => `Rp ${Number(v).toLocaleString()}` },
        { title: 'Paid', dataIndex: 'paidAmount', key: 'paidAmount', render: (v: number) => `Rp ${Number(v).toLocaleString()}` },
        {
            title: 'Payment Detail',
            key: 'paymentDetail',
            render: (record: any) => {
                const latePayment = record.payments?.[record.payments.length - 1];
                if (!latePayment) return '-';
                return (
                    <div className="text-[11px] leading-tight">
                        <div><b>{latePayment.paymentMethod}</b> {latePayment.bankName && `(${latePayment.bankName})`}</div>
                        <div className="text-gray-400">{dayjs(latePayment.paymentDate).format('DD MMM YYYY')}</div>
                        {latePayment.referenceNumber && <div className="text-blue-500 font-mono">Ref: {latePayment.referenceNumber}</div>}
                    </div>
                );
            }
        },
        {
            title: 'Posted At',
            key: 'postedAt',
            render: (record: any) => {
                const latePayment = record.payments?.[record.payments.length - 1];
                return latePayment ? <Text type="secondary" className="text-[11px]">{dayjs(latePayment.createdAt).format('DD/MM/YY HH:mm')}</Text> : '-';
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag bordered={false} icon={statusTags[status]?.icon} className={`rounded-full px-3 font-medium ${statusTags[status]?.className || 'bg-gray-50 text-gray-600'}`}>
                    {status.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Action',
            key: 'action',
            render: (record: any) => (
                <Space size="small">
                    {record.status !== 'Paid' && (
                        <Button icon={<WalletOutlined />} type="primary" size="small" className="bg-green-600 border-none" onClick={() => handleRecordPayment(record)}>
                            Pay
                        </Button>
                    )}
                    <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
                    <Popconfirm
                        title="Delete invoice?"
                        description="This will also update the unit's outstanding balance."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Delete"
                        okButtonProps={{ danger: true }}
                    >
                        <Button icon={<DeleteOutlined />} danger size="small" />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const totalOutstanding = invoices.reduce((acc: number, inv: any) => acc + (Number(inv.totalAmount) - Number(inv.paidAmount)), 0);

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <Row gutter={[24, 24]} className="max-w-7xl mx-auto">
                <Col span={24}>
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <Title level={2} className="m-0 flex items-center gap-3">
                                <DollarOutlined className="text-blue-600" /> Billing & Finance
                            </Title>
                            <Text type="secondary">Manage invoices, payments, and financial reconciliation.</Text>
                        </div>
                        <Space>
                            <Card size="small" className="bg-white shadow-sm">
                                <Statistic title="Total Outstanding" value={totalOutstanding} prefix="Rp" valueStyle={{ fontSize: '18px', fontWeight: 'bold' }} />
                            </Card>
                            <Button type="primary" icon={<ThunderboltOutlined />} size="large" onClick={() => setIsGenerateModalVisible(true)} className="bg-blue-600 border-none h-14 px-8 rounded-lg shadow-lg">
                                Generate Billing
                            </Button>
                        </Space>
                    </div>
                    <div className="flex justify-start mb-6">
                        <Input
                            placeholder="Search by unit or period (e.g. A-01 or 2026-01)..."
                            prefix={<SearchOutlined className="text-gray-400" />}
                            className="w-1/3 h-12 rounded-lg shadow-sm"
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                        />
                    </div>
                </Col>

                <Col span={24}>
                    <Card className="shadow-sm border-none">
                        <Table
                            columns={columns}
                            dataSource={invoices.filter((inv: any) =>
                                (inv.unit?.unitNumber || '').toLowerCase().includes(searchText.toLowerCase()) ||
                                inv.period.toLowerCase().includes(searchText.toLowerCase())
                            )}
                            rowKey="id"
                            loading={loading}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showTotal: (total) => `Total ${total} tagihan`,
                                position: ['bottomRight']
                            }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Generate Modal */}
            <Modal
                title="Bulk Generate Invoices"
                open={isGenerateModalVisible}
                onOk={handleGenerateMonthly}
                onCancel={() => setIsGenerateModalVisible(false)}
                okText="Generate Now"
                okButtonProps={{ className: 'bg-blue-600' }}
            >
                <Form form={generateForm} layout="vertical" className="mt-4">
                    <Form.Item name="period" label="Billing Period" rules={[{ required: true }]}>
                        <DatePicker picker="month" className="w-full" size="large" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit Modal */}
            <Modal
                title={`Edit Invoice - ${selectedInvoice?.unit?.unitNumber}`}
                open={isEditModalVisible}
                onOk={submitEdit}
                onCancel={() => setIsEditModalVisible(false)}
                okText="Save Changes"
            >
                <Form form={editForm} layout="vertical" className="mt-4">
                    <Form.Item name="period" label="Period (YYYY-MM)" rules={[{ required: true }]}>
                        <Input disabled />
                    </Form.Item>
                    <Form.Item name="totalAmount" label="Total Amount (Rp)" rules={[{ required: true }]}>
                        <Input type="number" size="large" />
                    </Form.Item>
                    <Form.Item name="dueDate" label="Due Date" rules={[{ required: true }]}>
                        <DatePicker className="w-full" size="large" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Payment Modal */}
            <Modal
                title={`Record Payment - ${selectedInvoice?.unit?.unitNumber}`}
                open={isPaymentModalVisible}
                onOk={submitPayment}
                onCancel={() => setIsPaymentModalVisible(false)}
                okText="Post Payment"
                okButtonProps={{ className: 'bg-green-600' }}
            >
                <Form form={paymentForm} layout="vertical" className="mt-4">
                    <Form.Item name="paymentDate" label="Payment Date (Tgl Bayar)" rules={[{ required: true }]}>
                        <DatePicker className="w-full" size="large" format="DD MMM YYYY" />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="paymentMethod" label="Method" rules={[{ required: true }]} initialValue="Bank Transfer">
                                <Select size="large">
                                    <Select.Option value="Bank Transfer">Bank Transfer</Select.Option>
                                    <Select.Option value="Cash">Cash</Select.Option>
                                    <Select.Option value="QRIS">QRIS</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                noStyle
                                shouldUpdate={(prev, curr) => prev.paymentMethod !== curr.paymentMethod}
                            >
                                {({ getFieldValue }) =>
                                    getFieldValue('paymentMethod') !== 'Cash' ? (
                                        <Form.Item name="bankName" label="Bank Name" rules={[{ required: true }]}>
                                            <Select size="large" placeholder="Select Bank">
                                                <Select.Option value="BCA">BCA</Select.Option>
                                                <Select.Option value="Mandiri">Mandiri</Select.Option>
                                                <Select.Option value="BNI">BNI</Select.Option>
                                                <Select.Option value="Other">Other</Select.Option>
                                            </Select>
                                        </Form.Item>
                                    ) : null
                                }
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="referenceNumber" label="Reference / Transaction ID">
                        <Input placeholder="e.g. TRX-123456" size="large" />
                    </Form.Item>
                    <Form.Item name="amount" label="Amount Received (Rp)" rules={[{ required: true }]}>
                        <Input type="number" size="large" prefix="Rp" />
                    </Form.Item>
                    <div className="bg-blue-50 p-4 rounded text-blue-700 text-sm">
                        Outstanding: <b>Rp {Number(selectedInvoice?.totalAmount - selectedInvoice?.paidAmount).toLocaleString()}</b>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default BillingPage;
