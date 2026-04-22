import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0F172A] font-sans relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#C5A059] opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-[#C5A059] opacity-5 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md p-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-[#C5A059] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-[#C5A059]/20 transform rotate-3">
            <span className="text-white text-3xl font-display font-bold">A</span>
          </div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">
            AutoHub <span className="text-[#C5A059]">Admin</span>
          </h2>
          <p className="text-gray-400 mt-2 text-sm font-light">Enter your credentials to access the portal</p>
        </div>

        {error && (
          <div className="p-4 mb-6 text-sm text-red-200 bg-red-900/30 border border-red-500/20 rounded-xl flex items-center">
            <svg className="w-5 h-5 mr-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest ml-1">
              Work Email
            </label>
            <div className="relative group">
              <input
                type="email"
                required
                placeholder="name@company.com"
                className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#C5A059]/50 focus:border-[#C5A059] focus:outline-none transition-all text-white placeholder-gray-500 group-hover:border-white/20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest ml-1">
                Password
              </label>
              <a href="#" className="text-xs text-[#C5A059] hover:text-[#D4B57A] transition-colors">Forgot?</a>
            </div>
            <div className="relative group">
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#C5A059]/50 focus:border-[#C5A059] focus:outline-none transition-all text-white placeholder-gray-500 group-hover:border-white/20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-[#C5A059] hover:bg-[#D4B57A] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#C5A059]/20 active:scale-[0.98] mt-4"
          >
            Access Dashboard
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-xs">
            &copy; 2026 AutoHub Management System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
