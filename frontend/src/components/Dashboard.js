import React from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Agents from './Agents';
import UploadCSV from './UploadCSV';
import DistributedLists from './DistributedLists';

function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h3>Dashboard</h3>
        <nav>
          <NavLink to="/agents" className={({ isActive }) => isActive ? 'active' : ''}>
            Agents
          </NavLink>
          <NavLink to="/upload" className={({ isActive }) => isActive ? 'active' : ''}>
            Upload CSV
          </NavLink>
          <NavLink to="/distributed-lists" className={({ isActive }) => isActive ? 'active' : ''}>
            Distributed Lists
          </NavLink>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <div className="main-content">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/upload" element={<UploadCSV />} />
          <Route path="/distributed-lists" element={<DistributedLists />} />
        </Routes>
      </div>
    </div>
  );
}

function DashboardHome() {
  return (
    <div>
      <h2>Welcome to Agent Management System</h2>
      <p style={{ color: '#666', lineHeight: 1.6 }}>
        Use the sidebar to navigate. You can manage agents, upload CSV files,
        and view distributed lists.
      </p>
    </div>
  );
}

export default Dashboard;
