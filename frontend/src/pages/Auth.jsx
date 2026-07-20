import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Building2,
  Users,
  Bell,
  Calendar,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine mode from path
  const isRegister = location.pathname === '/register';

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState('');

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Clear messages when path/tab changes
  useEffect(() => {
    setError('');
    setSuccess('');
  }, [location.pathname]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store user details in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));

      // Role-based redirect
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/activities');
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation checks
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!organization) {
      setError('Please select an organization type');
      return;
    }

    if (!role) {
      setError('Please select a role');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          password,
          role,
          organization
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccess('Account created successfully! Switching to sign in...');

      // Clear registration specific fields
      setName('');
      setPhone('');
      setConfirmPassword('');
      setOrganization('');
      setRole('');

      // Wait 1.5s then toggle path to login
      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50 font-sans">
      {/* Left Column: Brand Showcase (Hidden on small screens) */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#0c2340] to-[#16355c] text-white flex-col justify-between p-12 relative overflow-hidden sticky top-0 h-screen">
        {/* Abstract Background Orbs */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>

        {/* Top: Branding */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="bg-purple-600 rounded-xl p-2.5 w-12 h-12 flex items-center justify-center shadow-md">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-white leading-none">Smart Community</h1>
            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Community Service Organizer</span>
          </div>
        </div>

        {/* Middle: Value Proposition */}
        <div className="my-auto py-12 relative z-10">
          <span className="text-xs font-semibold tracking-widest text-purple-400 mb-3 block uppercase">
            Do more good, together
          </span>
          <h2 className="font-serif text-2xl lg:text-4xl font-bold leading-tight mb-6">
            Centralized.Unity.Manage. <br />
            <span className="italic font-light">Multiply impact.</span>
          </h2>
          <p className="text-slate-300 text-sm max-w-sm leading-relaxed mb-8">
            For community centers with fragmented services (volunteer programs, educational workshops, health campaigns, etc) &mdash; all in one place.
          </p>

          {/* Quick-links / Badges */}
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <div className="flex items-center gap-2.5 px-4 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium border border-white/5 transition-all duration-200">
              <Users className="w-4 h-4 text-purple-400" />
              <span>Central Activity View</span>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium border border-white/5 transition-all duration-200">
              <Building2 className="w-4 h-4 text-purple-400" />
              <span>Event Registration System</span>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium border border-white/5 transition-all duration-200">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>Unified Schedules</span>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium border border-white/5 transition-all duration-200">
              <Shield className="w-4 h-4 text-purple-400" />
              <span>Participation Records</span>
            </div>
          </div>
        </div>

        {/* Bottom: Metrics */}
        <div className="border-t border-white/10 pt-8 grid grid-cols-3 gap-4 relative z-10">
          <div>
            <span className="block text-2xl lg:text-3xl font-serif font-bold text-white">12,400+</span>
            <span className="block text-[10px] text-slate-400 uppercase tracking-wider mt-1">Hours Served</span>
          </div>
          <div>
            <span className="block text-2xl lg:text-3xl font-serif font-bold text-white">340</span>
            <span className="block text-[10px] text-slate-400 uppercase tracking-wider mt-1">Active Volunteers</span>
          </div>
          <div>
            <span className="block text-2xl lg:text-3xl font-serif font-bold text-white">98</span>
            <span className="block text-[10px] text-slate-400 uppercase tracking-wider mt-1">Drives Completed</span>
          </div>
        </div>
      </div>

      {/* Right Column: Interaction Form */}
      <div className="lg:col-span-7 flex flex-col justify-between p-8 md:p-12 bg-slate-50 min-h-screen">

        {/* Main Content Area */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          {/* Header Mobile Brand (Only shown on small screens) */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="bg-purple-600 rounded-xl p-2 w-10 h-10 flex items-center justify-center shadow-md">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="font-serif text-xl font-bold tracking-tight text-slate-800 leading-none">Smart Community</h1>
              <span className="text-[9px] text-purple-600 font-bold uppercase tracking-wider">Community Service Organizer</span>
            </div>
          </div>

          {/* Toggle Switch Bar */}
          <div className="bg-slate-200/60 p-1.5 rounded-xl flex w-full relative mb-8 select-none">
            <button
              onClick={() => navigate('/login')}
              type="button"
              className={`w-1/2 text-center py-2.5 text-xs lg:text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${!isRegister
                ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              type="button"
              className={`w-1/2 text-center py-2.5 text-xs lg:text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${isRegister
                ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              Register
            </button>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="font-serif text-3xl font-bold text-slate-800 mb-2">
              {isRegister ? 'Register here' : 'Sign in to your account'}
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              {isRegister
                ? 'Create an account to join service drives in your area.'
                : 'Access your community portal, messages, and services.'}
            </p>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm border border-red-100 animate-fade-in">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-6 text-sm border border-green-100 animate-fade-in">
              {success}
            </div>
          )}

          {/* Render Active Form */}
          {!isRegister ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block mb-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field py-3 text-slate-800"
                  placeholder="jane@example.com"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                    Password <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field py-3 pr-10 text-slate-800"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="flex justify-end mt-2">
                  <a href="#forgot" className="text-xs font-semibold text-blue-600 hover:underline">
                    Forgot password?
                  </a>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-[#113155] hover:bg-[#0c2644] text-white rounded-lg font-bold text-sm tracking-wide shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block mb-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Maria Santos"
                  className="input-field py-3 text-slate-800"
                />
              </div>

              <div>
                <label className="block mb-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maria@email.com"
                  className="input-field py-3 text-slate-800"
                />
              </div>

              <div>
                <label className="block mb-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field py-3 pr-10 text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <span className="text-xs text-slate-400 mt-1 block">Minimum 8 characters</span>
              </div>

              <div>
                <label className="block mb-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field py-3 pr-10 text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                  Organization <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="input-field py-3 text-slate-800 bg-white"
                >
                  <option value="" disabled>Select your organization</option>
                  <option value="educational">Educational</option>
                  <option value="health">Health</option>
                  <option value="environment">Environment</option>
                  <option value="charity">Charity</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555 000 0000"
                    className="input-field py-3 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="input-field py-3 text-slate-800 bg-white"
                  >
                    <option value="" disabled>Your role</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="team leader">Team Leader</option>
                    <option value="program coordinator">Program Coordinator</option>
                    <option value="Partner Organizator">Partner Organizator</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3 bg-[#113155] hover:bg-[#0c2644] text-white rounded-lg font-bold text-sm tracking-wide shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              <p className="text-center text-[10px] text-slate-400 mt-2">
                By joining you agree to our <a href="#terms" className="underline hover:text-slate-600">Terms</a> and <a href="#privacy" className="underline hover:text-slate-600">Privacy Policy</a>.
              </p>
            </form>
          )}
        </div>

        {/* Footer info */}
        <p className="text-center text-[10px] text-slate-400 mt-8">
          &copy; 2026 Smart Community &middot; Community Service Organizer
        </p>
      </div>
    </div>
  );
}
