import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ActivityListing() {
  const [activities, setActivities] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const navigate = useNavigate();
  
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/activities`)
      .then(res => res.json())
      .then(data => setActivities(data));
  }, []);

  const filteredActivities = activities.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || a.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-blue-600 tracking-tight mb-2">Discover Activities</h1>
          <p className="text-slate-500 text-lg">Find and join events in your community.</p>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="glass-panel animate-fade-in delay-100 flex flex-col md:flex-row gap-4 mb-12 p-4 rounded-2xl">
        <input 
          type="text" 
          placeholder="🔍 Search activities by name..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
        />
        <select 
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-base min-w-[180px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Categories</option>
          <option value="Environment">Environment</option>
          <option value="Charity">Charity</option>
          <option value="Education">Education</option>
          <option value="Health">Health</option>
        </select>
      </div>

      {/* Activity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredActivities.map((activity, idx) => {
          const delayClass = `delay-${((idx % 3) + 1) * 100}`;
          const isFullyBooked = activity.slotsLeft <= 0;

          return (
            <div key={activity.id} className={`glass-panel animate-fade-in ${delayClass} p-7 flex flex-col gap-5 relative overflow-hidden group`}>
              <div className="flex justify-between items-start">
                <span className="badge badge-primary">{activity.category}</span>
                <span className={`badge ${isFullyBooked ? 'badge-danger' : 'badge-success'}`}>
                  {isFullyBooked ? 'Full' : `${activity.slotsLeft} slots`}
                </span>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2 leading-snug group-hover:text-blue-600 transition-colors">{activity.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-2">
                  {activity.description}
                </p>
              </div>
              
              <div className="flex flex-col gap-2 mt-auto py-4 border-y border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <span>📅</span> <strong className="text-slate-700">{activity.date}</strong> at {activity.time}
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <span>📍</span> {activity.venue}
                </div>
              </div>
              
              <button 
                className="btn-primary w-full mt-2"
                onClick={() => navigate(`/activities/${activity.id}`)}
              >
                View Details
              </button>
            </div>
          );
        })}
        {filteredActivities.length === 0 && (
          <div className="glass-panel animate-fade-in delay-200 col-span-full py-16 px-8 text-center rounded-2xl">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">No activities found</h3>
            <p className="text-slate-500">Try adjusting your search or category filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
