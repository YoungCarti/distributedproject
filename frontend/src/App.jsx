import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Auth from './pages/Auth';
import ActivityListing from './pages/ActivityListing';
import ActivityDetails from './pages/ActivityDetails';
import ParticipationHistory from './pages/ParticipationHistory';
import ScheduleAnnouncements from './pages/ScheduleAnnouncements';
import AdminDashboard from './pages/AdminDashboard';

// Layout component with sidebar + top bar
const UserLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />

        {/* User Module Routes wrapped with Sidebar + Navbar Layout */}
        <Route element={<UserLayout />}>
          <Route path="/activities" element={<ActivityListing />} />
          <Route path="/activities/:id" element={<ActivityDetails />} />
          <Route path="/history" element={<ParticipationHistory />} />
          <Route path="/schedule" element={<ScheduleAnnouncements />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
