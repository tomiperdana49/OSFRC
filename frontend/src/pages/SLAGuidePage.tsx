import React from 'react';
import { Card, Table, Typography, Tag, Row, Col, Divider, List, Space, Badge } from 'antd';
import {
    BookOutlined,
    ClockCircleOutlined,
    InfoCircleOutlined,
    ThunderboltOutlined,
    SafetyCertificateOutlined,
    CustomerServiceOutlined,
    CalendarOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const SLAGuidePage = () => {
    const slaData = [
        {
            key: '1',
            category: 'Security / Life Safety',
            priority: 'CRITICAL',
            time: '1 Hour',
            color: 'red',
            description: 'Penanganan insiden keamanan, kebakaran, atau kebocoran gas yang mengancam keselamatan.'
        },
        {
            key: '2',
            category: 'Water supply failure',
            priority: 'HIGH',
            time: '4 Hours',
            color: 'volcano',
            description: 'Kebocoran pipa utama, pompa air mati total, atau ketiadaan suplai air ke unit.'
        },
        {
            key: '3',
            category: 'Electrical Major',
            priority: 'HIGH',
            time: '6 Hours',
            color: 'orange',
            description: 'Pemadaman listrik total pada satu lantai atau masalah panel listrik utama.'
        },
        {
            key: '4',
            category: 'Internet & Lift',
            priority: 'MEDIUM',
            time: '24 Hours',
            color: 'blue',
            description: 'Gangguan jaringan internet gedung atau masalah non-darurat pada lift.'
        },
        {
            key: '5',
            category: 'Standard Maintenance',
            priority: 'LOW',
            time: '3 Working Days',
            color: 'cyan',
            description: 'Perbaikan minor seperti penggantian lampu fasilitas atau pengecatan ulang area umum.'
        }
    ];

    const columns = [
        {
            title: 'Issue Category',
            dataIndex: 'category',
            key: 'category',
            render: (text: string) => <Text strong className="text-[#2c3e50]">{text}</Text>
        },
        {
            title: 'Priority Level',
            dataIndex: 'priority',
            key: 'priority',
            render: (priority: string, record: any) => (
                <Tag color={record.color} className="font-bold border-none px-3 py-1 rounded-full uppercase tracking-tighter">
                    {priority}
                </Tag>
            )
        },
        {
            title: 'Target Resolution (SLA)',
            dataIndex: 'time',
            key: 'time',
            render: (time: string) => (
                <Space>
                    <ClockCircleOutlined className="text-blue-500" />
                    <Text strong className="font-mono">{time}</Text>
                </Space>
            )
        },
        {
            title: 'Scope of Work',
            dataIndex: 'description',
            key: 'description',
            render: (text: string) => <Text type="secondary" className="text-xs italic">{text}</Text>
        }
    ];

    return (
        <div className="p-10 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="mb-12 text-center">
                    <div className="inline-block p-4 bg-blue-100 rounded-2xl mb-4">
                        <BookOutlined className="text-4xl text-blue-600" />
                    </div>
                    <Title level={1} className="!m-0 text-[#1a202c]">SLA Operational Guide</Title>
                    <Text className="text-gray-400 text-lg">Standard Operating Procedure Green Valley Residence - Rev 2026</Text>
                    <div className="flex justify-center gap-4 mt-6">
                        <Badge status="processing" text="Active Policy" />
                        <Badge status="success" text="Audited 2026" />
                    </div>
                </div>

                <Row gutter={[32, 32]}>
                    {/* Main Table Card */}
                    <Col span={24}>
                        <Card
                            className="shadow-xl border-none rounded-2xl overflow-hidden"
                            bodyStyle={{ padding: 0 }}
                        >
                            <div className="bg-[#2c3e50] p-6 text-white flex justify-between items-center">
                                <Space size="middle">
                                    <SafetyCertificateOutlined className="text-2xl text-yellow-400" />
                                    <div>
                                        <div className="font-bold text-lg uppercase tracking-widest">Resolution Matrix</div>
                                        <div className="text-[10px] opacity-60">Standardized across all technical departments</div>
                                    </div>
                                </Space>
                                <Tag color="gold" className="m-0">SLA-GVR-2026</Tag>
                            </div>
                            <Table
                                columns={columns}
                                dataSource={slaData}
                                pagination={false}
                                className="custom-table"
                            />
                            <div className="p-4 bg-yellow-50 text-yellow-800 text-xs border-t border-yellow-100">
                                <InfoCircleOutlined className="mr-2" />
                                <b>Catatan:</b> Waktu dihitung sejak ticket dalam status <b>"In Progress"</b> oleh staff.
                            </div>
                        </Card>
                    </Col>

                    {/* Policy Details */}
                    <Col md={12} span={24}>
                        <Card
                            title={<Space><ThunderboltOutlined className="text-orange-500" /> <b>Aturan Keterlambatan (Overdue)</b></Space>}
                            className="shadow-md border-none rounded-xl h-full"
                        >
                            <Paragraph className="text-gray-600">
                                Sistem secara otomatis akan memicu notifikasi <Tag color="error" className="m-0">Overdue</Tag> jika pengerjaan melewati batas waktu estimasi yang dijanjikan staf saat memulai pekerjaan.
                            </Paragraph>
                            <Title level={5}>Alur Eskalasi:</Title>
                            <List
                                className="mt-4"
                                dataSource={[
                                    'Menit 1-30: Notifikasi peringatan ke staff terkait.',
                                    'Menit 31-60: Laporan keterlambatan masuk ke Supervisor.',
                                    '> 1 Jam: Ticket masuk ke radar audit Manager Operational.',
                                ]}
                                renderItem={(item) => (
                                    <List.Item className="border-none py-1">
                                        <Badge status="default" text={<Text type="secondary">{item}</Text>} />
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Col>

                    <Col md={12} span={24}>
                        <Card
                            title={<Space><CustomerServiceOutlined className="text-blue-500" /> <b>Jam Operasional Layanan</b></Space>}
                            className="shadow-md border-none rounded-xl h-full"
                        >
                            <Paragraph className="text-gray-600">
                                Perhitungan SLA disesuaikan dengan ketersediaan teknisi di lokasi sesuai jadwal shift reguler:
                            </Paragraph>
                            <div className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-200 mt-4">
                                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                                    <Space><CalendarOutlined className="text-gray-400" /> <Text strong>Senin - Jumat</Text></Space>
                                    <Text className="font-mono bg-white px-3 py-1 rounded shadow-sm">08:00 - 17:00</Text>
                                </div>
                                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                                    <Space><CalendarOutlined className="text-gray-400" /> <Text strong>Sabtu</Text></Space>
                                    <Text className="font-mono bg-white px-3 py-1 rounded shadow-sm">08:00 - 12:00</Text>
                                </div>
                                <div className="flex justify-between items-center text-red-500">
                                    <Space><InfoCircleOutlined /> <Text strong className="text-red-500">Minggu & Libur</Text></Space>
                                    <Tag color="red" className="m-0">Emergencies Only</Tag>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>

                <Divider />
                <div className="text-center text-gray-400 text-[10px] pb-10 uppercase tracking-widest">
                    Green Valley Residence - Integrated Digital Platform © 2026
                </div>
            </div>
        </div>
    );
};

export default SLAGuidePage;
