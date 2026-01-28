import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Typography, Spin, message, Row, Col, Statistic } from 'antd';
import {
    PlusOutlined,
    DollarOutlined,
    NotificationOutlined,
    HomeOutlined,
    DownOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

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
                let color = 'blue';
                if (status === 'Overdue') color = 'red';
                if (status === 'New') color = 'cyan';
                return <Tag color={color}>{status}</Tag>;
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

            {/* KPI Cards Grid */}

            {/* Main Unit KPIs (2 Columns as requested)            {/* KPI Cards Grid */}
            {role === 'admin' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                    {[
                        { title: 'Total Units', value: data.kpi.totalUnits, color: 'bg-[#4a77b4]', path: '/units' },
                        { title: 'Units without Owner', value: data.kpi.vacantUnits, color: 'bg-[#5c88c4]', path: '/units?filter=vacant' },
                        { title: 'Outstanding Balance', value: `Rp ${data.kpi.outstandingBalance / 1000000} jt`, color: 'bg-[#7ba0c1]', path: '/billing' },
                    ].map((card, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transform transition hover:scale-[1.01] cursor-pointer flex flex-col"
                            onClick={() => navigate(card.path)}
                        >
                            <div className={`${card.color} text-white text-center py-3 font-bold text-[11px] uppercase tracking-widest`}>
                                {card.title}
                            </div>
                            <div className="flex-grow flex items-center justify-center py-8 text-4xl font-black text-[#2e3b4e]">
                                {card.value}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { title: 'New (Open)', value: data.kpi.openTickets, color: 'bg-[#40739e]', path: '/tickets?status=new' },
                    { title: 'In Progress', value: data.kpi.inProgressTickets, color: 'bg-[#f39c12]', path: '/tickets?status=in-progress' },
                    { title: 'Solved', value: data.kpi.solvedTickets, color: 'bg-[#27ae60]', path: '/tickets?status=closed' },
                    { title: 'Overdue', value: data.kpi.overdueTickets, color: 'bg-[#d14b4b]', path: '/tickets?status=overdue' },
                ].map((card, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transform transition hover:scale-[1.01] cursor-pointer flex flex-col"
                        onClick={() => navigate(card.path)}
                    >
                        <div className={`${card.color} text-white text-center py-3 font-bold text-[11px] uppercase tracking-widest`}>
                            {card.title}
                        </div>
                        <div className="flex-grow flex items-center justify-center py-8 text-4xl font-black text-[#2e3b4e]">
                            {card.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Panels */}
            <div className={`grid grid-cols-1 ${role === 'admin' ? 'lg:grid-cols-2' : ''} gap-8 mb-10`}>
                {/* Open Tickets */}
                <Card
                    title={<span className="text-white font-bold px-2">Open Tickets</span>}
                    variant="borderless"
                    styles={{
                        header: { backgroundColor: '#4a77b4', borderRadius: '4px 4px 0 0', minHeight: '45px' },
                        body: { padding: 0 }
                    }}
                    className="shadow-sm border border-gray-100 overflow-hidden"
                >
                    <Table
                        columns={ticketColumns}
                        dataSource={data.openTickets}
                        pagination={false}
                        size="middle"
                        className="custom-table"
                    />
                    <div className="p-4 text-center border-t bg-gray-50/50">
                        <Button type="link" className="text-[#4a77b4] font-bold" onClick={() => navigate('/tickets')}>View All Tickets &gt;</Button>
                    </div>

                    {/* Integrated Activity Log */}
                    <div className="border-t">
                        <div className="bg-gray-50 px-4 py-2 flex items-center gap-2 border-b">
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
                        title={<Title level={5} className="m-0 text-[#4a77b4] font-bold">Billing Summary - {data.billingSummary.period}</Title>}
                        variant="borderless"
                        styles={{ body: { padding: '2rem' } }}
                        className="shadow-sm border border-gray-100"
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

                            <div className="pt-8 text-center mt-4">
                                <Button
                                    type="link"
                                    className="text-[#4a77b4] font-bold border rounded px-6 py-1 hover:bg-[#4a77b4] hover:text-white transition-all"
                                    onClick={() => navigate('/billing')}
                                >
                                    View Billing Details &gt;
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
