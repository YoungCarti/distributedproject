import { useState, useEffect } from 'react';

export default function ScheduleAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/announcements`)
      .then(res => res.json())
      .then(data => setAnnouncements(data));
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-indigo-600 tracking-tight mb-2">Centre Announcements</h1>
        <p className="text-lg text-gray-500">Stay updated with the latest news and schedules.</p>
      </div>

      {announcements.length === 0 ? (
        <div className="glass delay-1 animate-fade-in text-center py-20 px-8 rounded-3xl">
          <div className="text-5xl mb-4">📢</div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Announcements</h3>
          <p className="text-gray-500">There are currently no announcements. Check back later!</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {announcements.map((notice, idx) => {
            const delayClass = `delay-${(idx % 3) + 1}`;
            return (
              <div key={notice.id} className={`glass animate-fade-in ${delayClass} p-8 rounded-2xl border-l-4 border-indigo-600 relative overflow-hidden`}>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-600 to-indigo-800"></div>
                <div className="flex justify-between items-start mb-5">
                  <div className="flex gap-4 items-center">
                    <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl text-xl">
                      📣
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 leading-tight">{notice.title}</h2>
                  </div>
                  <span className="badge badge-primary text-sm whitespace-nowrap">{notice.posted_date}</span>
                </div>
                <p className="text-gray-600 leading-relaxed text-lg ml-14">{notice.content}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
