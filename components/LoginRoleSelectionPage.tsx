"use client";

import React from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

export default function LoginRoleSelection() {
  const router = useRouter();

  // Fungsi navigasi langsung ke rute yang ditentukan
  const handleRoleClick = (role: "siswa" | "guru" | "orangtua" | "admin") => {
    router.push(`/auth/login/${role}`);
  };

  return (
    <div className="flex-1 bg-[#F5F7F2] p-5 flex flex-col h-full select-none justify-between relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#E1EAD8] opacity-40 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#FFD166] opacity-10 rounded-full blur-3xl pointer-events-none"></div>
    
      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-between z-10">
        {/* Header Section */}
        <div className="text-center pt-2 shrink-0">
          <div className="w-28 h-28 bg-[#E1EAD8] rounded-[36px] flex items-center justify-center mb-4 shadow-inner mx-auto mt-2">
            <div className="w-16 h-16 bg-[#8DAA7B] rounded-full flex items-center justify-center border-4 border-white shadow-md">
              <div className="text-white text-3xl">⭐</div>
            </div>
          </div>

          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#2D332D] mb-1">
            Halo Teman!
          </h1>
          <p className="text-[#6B705C] text-sm leading-relaxed max-w-xs mx-auto">
            Pilih siapa kamu hari ini untuk mulai berpetualang!
          </p>
        </div>

        {/* Role Selection Grid */}
        <div className="flex-1 flex flex-col justify-center gap-3.5 my-4">
          {/* Siswa Card */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRoleClick("siswa")}
            className="w-full bg-[#FFD166] hover:bg-[#FFC331] border-b-4 border-amber-600 rounded-[32px] p-5 flex items-center gap-5 text-left shadow-md text-[#5F4B1A] cursor-pointer"
          >
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm">
              🧒
            </div>
            <div className="flex-1">
              <span className="bg-white/60 text-[#5F4B1A] text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Rekomendasi Utama
              </span>
              <h3 className="font-display text-xl font-bold tracking-tight mt-0.5">
                Siswa (Anak)
              </h3>
              <span className="text-[#5F4B1A] text-xs opacity-80 block leading-tight font-semibold">
                Ayo Bermain & Belajar!
              </span>
            </div>
          </motion.button>

          {/* Grid Guru & Orang Tua */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleClick("guru")}
              className="bg-[#8ECAE6] hover:bg-[#72bcdb] border-b-4 border-sky-600 p-4 rounded-[32px] flex flex-col items-center justify-center gap-2 text-[#023047] cursor-pointer shadow-sm text-center"
            >
              <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">
                👩‍🏫
              </div>
              <span className="font-bold text-sm">Guru</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleClick("orangtua")}
              className="bg-[#A8E6CF] hover:bg-[#96dbbf] border-b-4 border-emerald-600 p-4 rounded-[32px] flex flex-col items-center justify-center gap-2 text-[#1B4332] cursor-pointer shadow-sm text-center"
            >
              <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">
                🏠
              </div>
              <span className="font-bold text-sm">Orang Tua</span>
            </motion.button>
          </div>

          {/* Admin Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => handleRoleClick("admin")}
            className="w-full bg-[#F0F0F0] hover:bg-[#e4e4e4] py-3.5 rounded-2xl flex items-center justify-center gap-2 text-[#777] border-b-4 border-slate-300 font-bold active:scale-95 cursor-pointer shadow-sm text-xs mt-1"
          >
            <span>⚙️</span>
            <span className="uppercase tracking-wider">Login Admin</span>
          </motion.button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-2 text-center text-[10px] font-bold text-[#6B705C]/60 shrink-0 z-10">
        Disusun khusus untuk SLB & Terapi Autis/Tunagrahita © 2026
      </div>
    </div>
  );
}
