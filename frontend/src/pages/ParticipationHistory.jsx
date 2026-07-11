import { useState, useEffect } from 'react';

export default function ParticipationHistory() {
  const [history, setHistory] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/users/${user.id}/registrations`)
      .then(res => res.json())
      .then(data => setHistory(data));
  }, [user.id]);

  return (
    <div className="animate-fade-in">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-indigo-600 tracking-tight mb-2">My Participation History</h1>
        <p className="text-lg text-gray-500">Track all the activities you have registered for.</p>
      </div>

      {history.length === 0 ? (
        <div className="glass delay-1 animate-fade-in text-center py-20 px-8 rounded-3xl">
          <div className="text-5xl mb-4">📝</div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">No activities yet</h3>
          <p className="text-gray-500">You haven't registered for any activities. Head over to the Discover page to find one!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {history.map((item, idx) => {
            const delayClass = `delay-${(idx % 3) + 1}`;
            return (
              <div key={item.id} className={`glass animate-fade-in ${delayClass} flex justify-between items-center py-6 px-8 rounded-2xl`}>
                <div className="flex items-center gap-6">
                  <div className="bg-white/50 p-4 rounded-xl border border-white/20 text-2xl">
                    📅
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{item.activity}</h3>
                    <span className="text-sm text-gray-500">Registered on {item.date}</span>
                  </div>
                </div>
                <span className="badge badge-success text-sm py-2 px-4">
                  {item.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
