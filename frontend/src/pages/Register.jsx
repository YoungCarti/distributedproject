import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
      
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4 animate-fade-in">
      <div className="glass-panel w-full max-w-md p-10">
        <h2 className="text-3xl font-bold text-slate-800 text-center mb-2">Create Account</h2>
        <p className="text-slate-500 text-center mb-8">Join the Smart Community Service</p>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm border border-red-100">{error}</div>}
        {success && <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-6 text-sm border border-green-100">{success}</div>}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">Full Name</label>
            <input name="name" type="text" required value={formData.name} onChange={handleChange} placeholder="John Doe"
              className="input-field" />
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">Email Address</label>
            <input name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="john@example.com"
              className="input-field" />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">Phone Number</label>
            <input name="phone" type="tel" required value={formData.phone} onChange={handleChange} placeholder="+60 123456789"
              className="input-field" />
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">Password</label>
            <input name="password" type="password" required value={formData.password} onChange={handleChange} placeholder="••••••••"
              className="input-field" />
          </div>

          <button type="submit" className="btn-primary mt-4 py-3">
            Register
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-500">
          Already have an account? <Link to="/login" className="font-semibold text-blue-600 hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}
