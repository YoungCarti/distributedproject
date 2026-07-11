import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import ActivityListing from './pages/ActivityListing';
import ActivityDetails from './pages/ActivityDetails';
import ParticipationHistory from './pages/ParticipationHistory';
import ScheduleAnnouncements from './pages/ScheduleAnnouncements';
import AdminDashboard from './pages/AdminDashboard';

// Layout component to wrap pages that need the Navbar
const UserLayout = () => (
  <>
    <Navbar />
    <div className="p-8 max-w-7xl mx-auto">
      <Outlet />
    </div>
  </>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* User Module Routes wrapped with Navbar Layout */}
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
