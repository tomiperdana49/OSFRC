import React from 'react';
import { Card, Table, Typography, Tag, Row, Col, Divider, List } from 'antd';
import { BookOutlined, ClockCircleOutlined, InfoCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const SLAGuidePage = () => {
    const slaData = [
        {
            category: 'Security / Emergency',
            priority: 'CRITICAL',
            time: '1 Hour',
            color: 'red',
            description: 'Immediate response required for safety or total facility failure.'
        },
        {
            category: 'Air / Water Leakage',
            priority: 'HIGH',
            time: '4 Hours',
            color: 'volcano',
            description: 'Pressurized water leaks or total water supply disruption.'
        },
        {
            category: 'Electrical / Power',
            priority: 'HIGH',
            time: '6 Hours',
            color: 'orange',
            description: 'Main power failure or dangerous electrical situations.'
        },
        {
            category: 'Internet / Connectivity',
            priority: 'MEDIUM',
            time: '24 Hours',
            color: 'blue',
            description: 'Broadband connection issues or router failures.'
        },
        {
            category: 'Common Facilities',
            priority: 'LOW',
            time: '3 Working Days',
            color: 'cyan',
            description: 'Minor repairs in gym, pool area, or corridors.'
        }
    ];

    const columns = [
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: (text: string) => <Text className="font-bold text-gray-700">{text}</Text>
        },
        {
            title: 'Default Priority',
            dataIndex: 'priority',
            key: 'priority',
            render: (priority: string, record: any) => <Tag color={record.color} className="font-bold">{priority}</Tag>
        },
        {
            title: 'Response SLA',
            dataIndex: 'time',
            key: 'time',
            render: (time: string, record: any) => (
                <Space>
                    <ClockCircleOutlined className={`text-${record.color}-500`} />
                    <Text className="font-mono font-bold">{time}</Text>
                </Space>
            )
        },
        {
            title: 'Scope / Description',
            dataIndex: 'description',
            key: 'description',
            render: (text: string) => <Text type="secondary" className="text-xs">{text}</Text>
        }
    ];

    // Manual Space since it's an inline import in columns
    const Space = ({ children }: { children: React.ReactNode }) => <div className="flex items-center gap-2">{children}</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <Row gutter={[24, 24]} className="max-w-6xl mx-auto">
                <Col span={24}>
                    <div className="mb-10 text-center">
                        <BookOutlined className="text-5xl text-blue-600 mb-4" />
                        <Title level={2} className="m-0 mb-2">Service Level Agreement (SLA) Guide</Title>
                        <Text type="secondary" className="text-lg">Standard operating procedures and resolution timeframes for Green Valley Residence.</Text>
                    </div>
                </Col>

                <Col span={24}>
                    <Card className="shadow-lg border-none rounded-xl overflow-hidden mb-8">
                        <div className="bg-blue-600 p-4 text-white flex items-center gap-3">
                            <InfoCircleOutlined style={{ fontSize: '20px' }} />
                            <span className="font-bold text-lg uppercase tracking-wider">Ticketing Resolution Policy</span>
                        </div>
                        <Table
                            columns={columns}
                            dataSource={slaData}
                            pagination={false}
                            rowKey="category"
                            className="custom-table"
                        />
                    </Card>
                </Col>

                <Col md={12} span={24}>
                    <Card
                        title={<Space><ThunderboltOutlined className="text-yellow-500" /> <b>Definition of "Overdue"</b></Space>}
                        className="shadow-sm border-none h-full"
                    >
                        <Paragraph>
                            A ticket is marked as <Tag color="error">OVERDUE</Tag> by the system when the <b>Estimation Completion Time</b> set during the assignment has passed and the ticket status is still not <b>Closed</b>.
                        </Paragraph>
                        <Divider />
                        <Title level={5}>Consequences:</Title>
                        <List
                            dataSource={[
                                'Automatic escalation to Head of Operations.',
                                'Immediate notification sent to assigned technician.',
                                'Record saved in Staff Monthly Performance Audit.',
                            ]}
                            renderItem={(item) => (
                                <List.Item className="border-none py-1">
                                    <Text type="secondary">• {item}</Text>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>

                <Col md={12} span={24}>
                    <Card
                        title={<Space><ClockCircleOutlined className="text-blue-500" /> <b>Working Hours</b></Space>}
                        className="shadow-sm border-none h-full"
                    >
                        <Paragraph>
                            The SLA count is based on Operational Hours for non-emergency categories:
                        </Paragraph>
                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 mt-4">
                            <div className="flex justify-between mb-2">
                                <Text className="font-bold">Mon - Fri</Text>
                                <Text>08:00 - 17:00</Text>
                            </div>
                            <div className="flex justify-between mb-2">
                                <Text className="font-bold">Saturday</Text>
                                <Text>08:00 - 12:00</Text>
                            </div>
                            <div className="flex justify-between text-red-500">
                                <Text className="font-bold">Sunday / Holidays</Text>
                                <Text>On-Call Emergency Only</Text>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
            <div className="p-10 text-center text-gray-400 text-xs">
                Standard Operating Procedure - Revision 2026.1
            </div>
        </div>
    );
};

export default SLAGuidePage;
