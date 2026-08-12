import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Typography, Spin, message, Row, Col, Statistic } from 'antd';
import {
    NotificationOutlined,
    ApartmentOutlined,
    UserDeleteOutlined,
    WalletOutlined,
    FileAddOutlined,
    SyncOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    ToolOutlined,
    RightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const StatCard = ({ title, value, icon, iconBg, iconColor, onClick }: {
    title: string;
    value: React.ReactNode;
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    onClick?: () => void;
}) => (
    <div
        className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5 flex items-center gap-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
        onClick={onClick}
    >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${iconBg} ${iconColor}`}>
            {icon}
        </div>
        <div className="min-w-0">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate">{title}</div>
            <div className="text-2xl font-bold text-gray-900 mt-0.5">{value}</div>
        </div>
    </div>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    // Get user from localStorage
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const role = user?.role;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/dashboard');
            setData(response.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
            message.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading || !data) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <Spin size="large" tip="Loading Dashboard..." />
            </div>
        );
    }


    const ticketColumns = [
        { title: 'Unit', dataIndex: 'unit', key: 'unit' },
        { title: 'Category', dataIndex: 'category', key: 'category' },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const styles: Record<string, string> = {
                    'New': 'bg-blue-50 text-blue-700',
                    'In Progress': 'bg-amber-50 text-amber-700',
                    'Closed': 'bg-emerald-50 text-emerald-700',
                    'Overdue': 'bg-red-50 text-red-700',
                };
                return <Tag bordered={false} className={`rounded-full px-3 font-medium ${styles[status] || 'bg-gray-50 text-gray-600'}`}>{status}</Tag>;
            }
        },
        { title: 'Age', dataIndex: 'age', key: 'age' },
        { title: 'Assigned', dataIndex: 'assigned', key: 'assigned' },
    ];

    return (
        <div className="p-8">
            {/* Header / Welcome info (Optional, could just rely on Top Header) */}
            <div className="mb-8">
                <Title level={3} className="m-0">Welcome back, {user?.name}</Title>
                <Text type="secondary">Here is what is happening today in {dayjs().format('MMMM YYYY')}</Text>
            </div>

            {/* Main Unit KPIs */}
            {role === 'admin' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
                    <StatCard
                        title="Total Units"
                        value={data.kpi.totalUnits}
                        icon={<ApartmentOutlined />}
                        iconBg="bg-blue-50"
                        iconColor="text-blue-600"
                        onClick={() => navigate('/units')}
                    />
                    <StatCard
                        title="Units without Owner"
                        value={data.kpi.vacantUnits}
                        icon={<UserDeleteOutlined />}
                        iconBg="bg-slate-100"
                        iconColor="text-slate-500"
                        onClick={() => navigate('/units?filter=vacant')}
                    />
                    <StatCard
                        title="Outstanding Balance"
                        value={`Rp ${data.kpi.outstandingBalance / 1000000} jt`}
                        icon={<WalletOutlined />}
                        iconBg="bg-blue-50"
                        iconColor="text-blue-600"
                        onClick={() => navigate('/billing')}
                    />
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <StatCard
                    title="New (Open)"
                    value={data.kpi.openTickets}
                    icon={<FileAddOutlined />}
                    iconBg="bg-blue-50"
                    iconColor="text-blue-600"
                    onClick={() => navigate('/tickets?status=new')}
                />
                <StatCard
                    title="In Progress"
                    value={data.kpi.inProgressTickets}
                    icon={<SyncOutlined />}
                    iconBg="bg-amber-50"
                    iconColor="text-amber-600"
                    onClick={() => navigate('/tickets?status=in-progress')}
                />
                <StatCard
                    title="Solved"
                    value={data.kpi.solvedTickets}
                    icon={<CheckCircleOutlined />}
                    iconBg="bg-emerald-50"
                    iconColor="text-emerald-600"
                    onClick={() => navigate('/tickets?status=closed')}
                />
                <StatCard
                    title="Overdue"
                    value={data.kpi.overdueTickets}
                    icon={<WarningOutlined />}
                    iconBg="bg-red-50"
                    iconColor="text-red-600"
                    onClick={() => navigate('/tickets?status=overdue')}
                />
            </div>

            {/* Panels */}
            <div className={`grid grid-cols-1 ${role === 'admin' ? 'lg:grid-cols-2' : ''} gap-8 mb-10`}>
                {/* Open Tickets */}
                <Card
                    title={
                        <span className="flex items-center gap-2 py-1">
                            <ToolOutlined className="text-primary" />
                            <span className="font-semibold text-gray-800">Open Tickets</span>
                        </span>
                    }
                    variant="borderless"
                    styles={{
                        header: { borderBottom: '1px solid #f1f5f9' },
                        body: { padding: 0 }
                    }}
                    className="shadow-sm ring-1 ring-gray-100 overflow-hidden"
                >
                    <Table
                        columns={ticketColumns}
                        dataSource={data.openTickets}
                        pagination={false}
                        size="middle"
                        className="custom-table"
                    />
                    <div className="p-3 text-center border-t border-gray-50 bg-gray-50/50">
                        <Button type="link" icon={<RightOutlined className="text-[10px]" />} iconPosition="end" className="text-primary font-semibold" onClick={() => navigate('/tickets')}>View All Tickets</Button>
                    </div>

                    {/* Integrated Activity Log */}
                    <div className="border-t border-gray-50">
                        <div className="bg-gray-50 px-4 py-2 flex items-center gap-2 border-b border-gray-100">
                            <NotificationOutlined className="text-gray-400 text-xs" />
                            <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Recent Activity</span>
                        </div>
                        <div className="max-h-[200px] overflow-y-auto">
                            {data.activities.length > 0 ? data.activities.map((activity: any, idx: number) => (
                                <div key={idx} className={`p-3 flex gap-4 items-center text-[13px] ${idx !== data.activities.length - 1 ? 'border-b border-gray-50' : ''} hover:bg-gray-50 transition-colors`}>
                                    <span className="text-gray-400 font-mono text-xs whitespace-nowrap">{activity.time}</span>
                                    <span className="text-gray-600">{activity.text}</span>
                                </div>
                            )) : (
                                <div className="p-8 text-center text-gray-300 italic text-xs">No activity recorded today</div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Billing Summary (ONLY ADMIN) */}
                {role === 'admin' && (
                    <Card
                        title={
                            <span className="flex items-center gap-2 py-1">
                                <WalletOutlined className="text-primary" />
                                <span className="font-semibold text-gray-800">Billing Summary &mdash; {data.billingSummary.period}</span>
                            </span>
                        }
                        variant="borderless"
                        styles={{
                            header: { borderBottom: '1px solid #f1f5f9' },
                            body: { padding: '1.75rem 2rem' }
                        }}
                        className="shadow-sm ring-1 ring-gray-100"
                    >
                        <div className="space-y-5">
                            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                                <Text className="text-gray-500 font-medium">Total Invoices:</Text>
                                <Text className="font-bold text-xl text-gray-800 text-right">Rp {data.billingSummary.totalInvoices / 1000000} jt</Text>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                                <Text className="text-gray-500 font-medium">Paid:</Text>
                                <div className="text-right">
                                    <Text className="font-bold text-xl text-gray-800">Rp {data.billingSummary.paid / 1000000} jt </Text>
                                    <Text className="text-sm text-blue-500 ml-1">({data.billingSummary.paidPercentage}%)</Text>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pb-3">
                                <Text className="text-gray-500 font-medium">Outstanding:</Text>
                                <Text className="font-bold text-xl-[#334155] text-right">Rp {data.billingSummary.outstanding / 1000000} jt</Text>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <Text className="text-gray-400 font-bold uppercase tracking-wider text-[11px] block mb-4">Top Overdue Units</Text>
                                <div className="space-y-4">
                                    {data.billingSummary.topOverdueUnits.map((u: any, i: number) => (
                                        <div key={i} className="flex justify-between items-center group">
                                            <div className="flex gap-4 items-center">
                                                <span className="font-bold text-gray-700 w-12">{u.unit}</span>
                                                <Tag color="orange" className="border-none bg-orange-50 text-orange-600 rounded-full text-[10px] px-3">{u.duration}</Tag>
                                            </div>
                                            <span className="font-bold text-gray-800">Rp {u.amount / 1000000} jt</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 text-center mt-2">
                                <Button
                                    className="text-primary font-semibold border-primary/30 hover:!bg-primary hover:!text-white hover:!border-primary transition-all px-6"
                                    icon={<RightOutlined className="text-[10px]" />}
                                    iconPosition="end"
                                    onClick={() => navigate('/billing')}
                                >
                                    View Billing Details
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}
            </div>


        </div>
    );
};

export default Dashboard;
