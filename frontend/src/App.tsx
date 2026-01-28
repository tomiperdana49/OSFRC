import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import TicketsPage from './pages/TicketsPage';
import UnitsPage from './pages/UnitsPage';
import BillingPage from './pages/BillingPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import UsersPage from './pages/UsersPage';
import SLAGuidePage from './pages/SLAGuidePage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import MainLayout from './layouts/MainLayout';
import 'antd/dist/reset.css';
import './index.css';

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/*"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <Routes>
                                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/units" element={<ProtectedRoute roles={['admin']}><UnitsPage /></ProtectedRoute>} />
                                    <Route path="/billing" element={<ProtectedRoute roles={['admin']}><BillingPage /></ProtectedRoute>} />
                                    <Route path="/tickets" element={<TicketsPage />} />
                                    <Route path="/announcements" element={<ProtectedRoute roles={['admin']}><AnnouncementsPage /></ProtectedRoute>} />
                                    <Route path="/users" element={<ProtectedRoute roles={['admin']}><UsersPage /></ProtectedRoute>} />
                                    <Route path="/sla-guide" element={<ProtectedRoute roles={['admin']}><SLAGuidePage /></ProtectedRoute>} />
                                    <Route path="/settings" element={<ProtectedRoute roles={['admin']}><SettingsPage /></ProtectedRoute>} />
                                </Routes>
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
