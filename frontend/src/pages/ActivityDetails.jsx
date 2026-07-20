import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ActivityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/activities/${id}`)
      .then(res => res.json())
      .then(data => {
        setActivity(data);
        setLoading(false);
      });
  }, [id]);

  const handleRegister = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, activityId: activity.id })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message);
      
      setMessage({ text: data.message, type: 'success' });
      // Update local slots count
      setActivity({ ...activity, slotsLeft: activity.slotsLeft - 1 });
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="animate-fade-in text-blue-600 text-xl font-semibold">Loading Activity...</div>
    </div>
  );
  
  if (!activity.id) return (
    <div className="glass-panel animate-fade-in p-12 text-center max-w-2xl mx-auto mt-16 rounded-3xl">
      <h3 className="text-2xl font-bold text-slate-800">Activity not found</h3>
      <button onClick={() => navigate('/activities')} className="btn-primary mt-6 mx-auto">Back to Activities</button>
    </div>
  );

  const isFullyBooked = activity.slotsLeft <= 0;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto pb-16">
      <button 
        onClick={() => navigate('/activities')} 
        className="bg-transparent border-none text-slate-500 cursor-pointer mb-6 font-semibold flex items-center gap-2 hover:text-blue-600 transition-colors"
      >
        ← Back to Activities
      </button>
      
      <div className="glass-panel animate-fade-in delay-100 p-8 md:p-12 rounded-3xl">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <span className="badge badge-primary">{activity.category}</span>
          <span className={`badge ${isFullyBooked ? 'badge-danger' : 'badge-success'}`}>
            {isFullyBooked ? 'Fully Booked' : `${activity.slotsLeft} slots remaining`}
          </span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">{activity.title}</h1>
        <p className="text-slate-600 text-lg md:text-xl mb-12 leading-relaxed max-w-3xl">{activity.description}</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12 p-6 bg-slate-50 rounded-2xl border border-slate-200">
          <div>
            <span className="text-slate-500 text-sm block mb-1 uppercase tracking-wider font-semibold">Date</span>
            <strong className="text-slate-900 text-lg">{activity.date}</strong>
          </div>
          <div>
            <span className="text-slate-500 text-sm block mb-1 uppercase tracking-wider font-semibold">Time</span>
            <strong className="text-slate-900 text-lg">{activity.time}</strong>
          </div>
          <div>
            <span className="text-slate-500 text-sm block mb-1 uppercase tracking-wider font-semibold">Venue</span>
            <strong className="text-slate-900 text-lg">{activity.venue}</strong>
          </div>
          <div>
            <span className="text-slate-500 text-sm block mb-1 uppercase tracking-wider font-semibold">Capacity</span>
            <strong className="text-slate-900 text-lg">{activity.capacity} total slots</strong>
          </div>
        </div>

        {message.text && (
          <div className={`animate-fade-in p-4 px-6 rounded-xl mb-8 font-semibold border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
            {message.type === 'success' ? '✅ ' : '❌ '} {message.text}
          </div>
        )}

        <button 
          onClick={handleRegister} 
          disabled={isFullyBooked}
          className="btn-primary w-full p-4 text-xl rounded-2xl"
        >
          {isFullyBooked ? 'Activity is Fully Booked' : 'Register Now'}
        </button>
      </div>
    </div>
  );
}
