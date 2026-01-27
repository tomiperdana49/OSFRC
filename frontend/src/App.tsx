import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import TicketsPage from './pages/TicketsPage';
import UnitsPage from './pages/UnitsPage';
import BillingPage from './pages/BillingPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import UsersPage from './pages/UsersPage';
import SLAGuidePage from './pages/SLAGuidePage';
import MainLayout from './layouts/MainLayout';
import 'antd/dist/reset.css';
import './index.css';

function App() {
    return (
        <Router>
            <MainLayout>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/units" element={<UnitsPage />} />
                    <Route path="/billing" element={<BillingPage />} />
                    <Route path="/tickets" element={<TicketsPage />} />
                    <Route path="/announcements" element={<AnnouncementsPage />} />
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/sla-guide" element={<SLAGuidePage />} />
                </Routes>
            </MainLayout>
        </Router>
    );
}

export default App;
