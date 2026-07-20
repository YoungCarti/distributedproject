import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('activities');
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState({ activities: 0, registrations: 0, announcements: 0 });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser || storedUser.role !== 'admin') {
      navigate('/login');
    } else {
      setUser(storedUser);
      fetchSummary();
    }
  }, [navigate]);

  const fetchSummary = async () => {
    try {
      const [actRes, regRes, annRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/activities`),
        fetch(`${import.meta.env.VITE_API_URL}/registrations`),
        fetch(`${import.meta.env.VITE_API_URL}/announcements`)
      ]);
      const actData = await actRes.json();
      const regData = await regRes.json();
      const annData = await annRes.json();
      setSummary({
        activities: actData.length || 0,
        registrations: regData.length || 0,
        announcements: annData.length || 0
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-600 mt-1">Manage activities, view registrations, and post announcements.</p>
        </div>
        <button 
          onClick={() => { localStorage.removeItem('user'); navigate('/login'); }} 
          className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
        >
          Logout Admin
        </button>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-6 border-l-4 border-indigo-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Activities</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{summary.activities}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 text-xl">
              🎯
            </div>
          </div>
        </div>
        <div className="glass-panel p-6 border-l-4 border-emerald-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Registrations</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{summary.registrations}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 text-xl">
              👥
            </div>
          </div>
        </div>
        <div className="glass-panel p-6 border-l-4 border-amber-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-500 text-sm font-medium">Active Announcements</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{summary.announcements}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 text-xl">
              📢
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 mb-6">
        {['activities', 'registrations', 'announcements'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium text-sm transition-colors relative ${
              activeTab === tab ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-md" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="glass-panel p-6">
        {activeTab === 'activities' && <ManageActivities />}
        {activeTab === 'registrations' && <ViewRegistrations />}
        {activeTab === 'announcements' && <ManageAnnouncements />}
      </div>
    </div>
  );
}

// Subcomponent: Manage Activities
function ManageActivities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  
  const initialFormState = { title: '', description: '', category: 'General', capacity: '', date: '', time: '', venue: '' };
  const [formData, setFormData] = useState(initialFormState);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/activities`);
      const data = await res.json();
      setActivities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isEditing 
      ? `${import.meta.env.VITE_API_URL}/activities/${currentActivity.id}` 
      : `${import.meta.env.VITE_API_URL}/activities`;
    const method = isEditing ? 'PUT' : 'POST';
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormData(initialFormState);
        setIsEditing(false);
        setCurrentActivity(null);
        fetchActivities();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (activity) => {
    setIsEditing(true);
    setCurrentActivity(activity);
    setFormData({
      title: activity.title,
      description: activity.description,
      category: activity.category,
      capacity: activity.capacity,
      date: activity.date,
      time: activity.time,
      venue: activity.venue
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/activities/${id}`, { method: 'DELETE' });
      fetchActivities();
    } catch (err) {
      console.error(err);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setCurrentActivity(null);
    setFormData(initialFormState);
  };

  return (
    <div className="animate-fade-in delay-100">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">{isEditing ? 'Edit Activity' : 'Add New Activity'}</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <input name="title" value={formData.title} onChange={handleInputChange} placeholder="Activity Title" required className="input-field" />
        <input name="category" value={formData.category} onChange={handleInputChange} placeholder="Category" required className="input-field" />
        <input name="date" type="date" value={formData.date} onChange={handleInputChange} required className="input-field" />
        <input name="time" type="time" value={formData.time} onChange={handleInputChange} required className="input-field" />
        <input name="venue" value={formData.venue} onChange={handleInputChange} placeholder="Venue" required className="input-field" />
        <input name="capacity" type="number" value={formData.capacity} onChange={handleInputChange} placeholder="Capacity" required className="input-field" />
        <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Description" rows="2" className="input-field md:col-span-2" />
        
        <div className="md:col-span-2 flex space-x-3">
          <button type="submit" className="btn-primary flex-1">{isEditing ? 'Update Activity' : 'Create Activity'}</button>
          {isEditing && (
            <button type="button" onClick={cancelEdit} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors">
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2 className="text-xl font-semibold text-slate-800 mb-4">Existing Activities</h2>
      {loading ? (
        <p className="text-slate-500">Loading activities...</p>
      ) : activities.length === 0 ? (
        <p className="text-slate-500 italic">No activities found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 text-slate-600">
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Date/Time</th>
                <th className="py-3 px-4">Capacity</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activities.map(act => (
                <tr key={act.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-800">{act.title}</td>
                  <td className="py-3 px-4 text-slate-600">{act.date} • {act.time}</td>
                  <td className="py-3 px-4 text-slate-600">{act.capacity - act.slotsLeft} / {act.capacity}</td>
                  <td className="py-3 px-4 space-x-2">
                    <button onClick={() => handleEdit(act)} className="text-blue-600 hover:underline text-sm font-medium">Edit</button>
                    <button onClick={() => handleDelete(act.id)} className="text-red-600 hover:underline text-sm font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Subcomponent: View Registrations & Reports
function ViewRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegs = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/registrations`);
        const data = await res.json();
        setRegistrations(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRegs();
  }, []);

  const handleExportCSV = () => {
    if (registrations.length === 0) {
      alert('No data to export.');
      return;
    }
    
    const headers = ['Registration ID', 'Activity Name', 'User Name', 'User Email', 'Registration Date', 'Status'];
    const csvRows = [
      headers.join(','),
      ...registrations.map(r => 
        [r.id, `"${r.activity}"`, `"${r.userName}"`, `"${r.userEmail}"`, r.date, r.status].join(',')
      )
    ];
    
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "registrations_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in delay-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-slate-800">Registration Records</h2>
        <button onClick={handleExportCSV} className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors font-medium flex items-center space-x-2">
          <span>Export to CSV</span>
        </button>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading registrations...</p>
      ) : registrations.length === 0 ? (
        <p className="text-slate-500 italic">No registrations found yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 text-slate-600">
                <th className="py-3 px-4">Reg ID</th>
                <th className="py-3 px-4">Activity</th>
                <th className="py-3 px-4">Participant</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map(reg => (
                <tr key={reg.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-slate-500 text-sm">#{reg.id.toString().slice(-4)}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{reg.activity}</td>
                  <td className="py-3 px-4">
                    <div className="text-slate-800 font-medium">{reg.userName}</div>
                    <div className="text-slate-500 text-sm">{reg.userEmail}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{reg.date}</td>
                  <td className="py-3 px-4">
                    <span className="badge-green capitalize">{reg.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Subcomponent: Manage Announcements
function ManageAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ title: '', content: '' });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/announcements`);
      const data = await res.json();
      setAnnouncements(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormData({ title: '', content: '' });
        fetchAnnouncements();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/announcements/${id}`, { method: 'DELETE' });
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="animate-fade-in delay-100">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Post New Announcement</h2>
      <form onSubmit={handleSubmit} className="mb-8 space-y-4 w-full">
        <input 
          name="title" 
          value={formData.title} 
          onChange={(e) => setFormData({...formData, title: e.target.value})} 
          placeholder="Announcement Title" 
          required 
          className="input-field w-full" 
        />
        <textarea 
          name="content" 
          value={formData.content} 
          onChange={(e) => setFormData({...formData, content: e.target.value})} 
          placeholder="Announcement Content" 
          required 
          rows="3" 
          className="input-field w-full" 
        />
        <div className="flex justify-center">
          <button type="submit" className="btn-primary px-6">Post Announcement</button>
        </div>
      </form>

      <h2 className="text-xl font-semibold text-slate-800 mb-4">Past Announcements</h2>
      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : announcements.length === 0 ? (
        <p className="text-slate-500 italic">No announcements found.</p>
      ) : (
        <div className="space-y-4">
          {announcements.map(ann => (
            <div key={ann.id} className="p-4 border border-slate-200 rounded-xl bg-white flex justify-between items-start hover:border-slate-300 transition-colors">
              <div>
                <h3 className="font-semibold text-slate-800 text-lg">{ann.title}</h3>
                <p className="text-slate-600 mt-1">{ann.content}</p>
                <p className="text-sm text-slate-400 mt-2">Posted on: {ann.posted_date}</p>
              </div>
              <button 
                onClick={() => handleDelete(ann.id)} 
                className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                title="Delete Announcement"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
