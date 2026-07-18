'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, User, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Jika menggunakan Next.js App Router

export default function LoginSiswaPage() {
  const [username, setUsername] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      alert("Silakan masukkan nama kamu dulu ya!");
      return;
    }
    
    // Logika login kamu di sini (misal: simpan ke localStorage atau state global)
    console.log("Login sebagai:", username);
    // router.push('/dashboard');
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
          <div className="w-16 h-16 rounded-2xl bg-[#E1EAD8] flex items-center justify-center text-3xl shadow-sm border border-[#DDE2D8] mx-auto mb-3">
            🧒
          </div>
          <h3 className="font-display text-xl font-bold text-[#2D332D]">Halo, Teman!</h3>
          <p className="text-[#6B705C] text-xs font-bold mt-1">Masukkan nama kamu untuk mulai belajar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <label className="text-xs font-extrabold text-[#4A5043] ml-1 mb-1 block">Nama Pengguna:</label>
            <div className="flex items-center bg-[#F5F7F2] rounded-2xl px-4 py-3 border-2 border-[#DDE2D8] focus-within:border-[#8DAA7B] transition-all">
              <User className="w-5 h-5 text-[#8DAA7B] mr-3" />
              <input
                type="text"
                placeholder="Contoh: Budi"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-transparent outline-none font-bold text-[#2D332D] placeholder:text-[#BCC1B5]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#8DAA7B] hover:bg-[#7ba068] text-white rounded-2xl font-display font-extrabold text-sm border-b-4 border-[#4A5043] active:translate-y-0.5 active:border-b-0 cursor-pointer shadow-md transition-all flex items-center justify-center gap-2 mt-2"
          >
            <LogIn className="w-5 h-5" />
            MULAI BERMAIN
          </button>
        </form>

        <p className="mt-6 text-center text-[10px] font-bold text-[#6B705C]/60">
          EduGrahita © 2026
        </p>
      </motion.div>
    </main>
  );
}