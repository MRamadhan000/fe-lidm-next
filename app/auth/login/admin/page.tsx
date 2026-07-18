'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, KeyRound, ShieldCheck, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginAdminPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Logika validasi admin sederhana
    if (password === '123' || password.toLowerCase() === 'admin') {
      console.log("Admin logged in successfully");
      // router.push('/admin/dashboard');
    } else {
      setError("Kata sandi salah! Coba '123'");
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F7F2] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm bg-white rounded-[36px] p-6 border-2 border-[#DDE2D8] shadow-lg"
      >
        {/* Back button */}
        <button
          onClick={() => window.history.back()}
          className="mb-6 flex items-center gap-1.5 text-xs font-bold text-[#4A5043] bg-[#E1EAD8]/60 px-3 py-1.5 rounded-full hover:bg-[#E1EAD8] transition-all cursor-pointer border border-[#DDE2D8]"
        >
          <ArrowLeft size={14} /> Kembali
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#F5F7F2] flex items-center justify-center text-3xl shadow-sm border border-[#DDE2D8] mx-auto mb-3">
            ⚙️
          </div>
          <h3 className="font-display text-xl font-bold text-[#2D332D]">Area Administrator</h3>
          <p className="text-[#6B705C] text-xs font-bold mt-1">Akses khusus manajemen sistem</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Admin Identity Display */}
          <div className="bg-[#F5F7F2] rounded-2xl p-3 border border-[#DDE2D8] flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-inner border border-[#DDE2D8]">
              🛡️
            </div>
            <div className="text-left">
              <span className="font-bold text-xs text-[#2D332D] block">Administrator Utama</span>
              <span className="text-[10px] font-semibold text-[#4A5043] block">EduGrahita System</span>
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="text-xs font-extrabold text-[#4A5043] ml-1">Kata Sandi Admin:</label>
            <div className="flex items-center bg-[#F5F7F2] rounded-2xl px-4 py-3 border-2 border-[#DDE2D8] focus-within:border-[#8DAA7B] transition-all">
              <KeyRound className="w-5 h-5 text-[#8DAA7B] mr-3" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent outline-none font-bold text-[#2D332D] placeholder:text-[#BCC1B5]"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 font-extrabold text-[11px] text-center bg-red-50 py-1.5 rounded-lg border border-red-200">
              ⚠️ {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-[#8DAA7B] hover:bg-[#7ba068] text-white rounded-2xl font-display font-extrabold text-sm border-b-4 border-[#4A5043] active:translate-y-0.5 active:border-b-0 cursor-pointer shadow-md transition-all flex items-center justify-center gap-2 mt-2"
          >
            <ShieldCheck className="w-5 h-5" />
            MASUK SEKARANG
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] font-bold text-[#6B705C]/60">
          EduGrahita © 2026
        </p>
      </motion.div>
    </main>
  );
}