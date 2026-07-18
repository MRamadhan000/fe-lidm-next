import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, KeyRound, ShieldAlert } from 'lucide-react';

interface LoginAdminProps {
  onLogin: (role: 'admin', targetId?: string) => void;
  onBack: () => void;
}

export default function LoginAdmin({ onLogin, onBack }: LoginAdminProps) {
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '123' || password === '' || password.trim().toLowerCase() === 'admin') {
      onLogin('admin', 'admin-main');
    } else {
      setErrorMsg('Kata sandi salah! Coba isi "123" atau kosongkan.');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  const handleQuickLogin = () => {
    onLogin('admin', 'admin-main');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-1 flex flex-col justify-between z-10 font-sans"
    >
      <div className="bg-white rounded-[36px] p-5 border-2 border-[#DDE2D8] shadow-lg flex-1 flex flex-col justify-between">
        <div>
          {/* Back button */}
          <button
            onClick={onBack}
            className="mb-4 flex items-center gap-1.5 text-xs font-bold text-[#4A5043] bg-[#E1EAD8]/60 px-3 py-1.5 rounded-full hover:bg-[#E1EAD8] transition-all cursor-pointer border border-[#DDE2D8]"
          >
            <ArrowLeft size={14} /> Kembali ke Peran
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F5F7F2] flex items-center justify-center text-2xl shadow-sm border border-[#DDE2D8]">
              ⚙️
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-[#2D332D] uppercase tracking-tight">
                Masuk Sebagai Admin
              </h3>
              <p className="text-[#6B705C] text-[11px] font-bold">
                Gunakan akun terdaftar atau klik Masuk Cepat.
              </p>
            </div>
          </div>

          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div className="space-y-3">
              <div className="bg-[#F5F7F2] rounded-2xl p-3 border border-[#DDE2D8] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-2xl shadow-inner border border-[#DDE2D8]">
                  🛡️
                </div>
                <div className="text-left">
                  <span className="font-bold text-xs text-[#2D332D] block">Administrator Utama</span>
                  <span className="text-[10px] font-semibold text-[#4A5043] block">Sistem Manajemen EduGrahita</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-extrabold text-[#4A5043]">Kata Sandi Admin:</label>
                  <span className="text-[9px] font-bold text-slate-400">Demo: bebas/123</span>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 w-4 h-4 text-[#6B705C]" />
                  <input
                    type="password"
                    placeholder="Masukkan sandi administrator..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#F5F7F2] border border-[#DDE2D8] rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-[#2D332D] focus:outline-none focus:border-[#8DAA7B]"
                  />
                </div>
              </div>
            </div>

            {errorMsg && (
              <p className="text-red-500 font-extrabold text-[11px] text-center bg-red-50 py-1.5 rounded-lg border border-red-200">
                ⚠️ {errorMsg}
              </p>
            )}

            <button
              type="submit"
              id="btn-login-admin-submit"
              className="w-full py-3.5 bg-[#8DAA7B] hover:bg-[#7ba068] text-white rounded-2xl font-display font-extrabold text-sm border-b-4 border-[#4A5043] active:translate-y-0.5 active:border-b-0 cursor-pointer shadow-md transition-all flex items-center justify-center gap-2 mt-4"
            >
              <span>🔑</span>
              MASUK SEKARANG
            </button>
          </form>
        </div>

        {/* Quick Demo Bypass */}
        <div className="pt-4 border-t border-[#DDE2D8] mt-6 text-center">
          <span className="text-[10px] font-bold text-[#6B705C] block mb-2">BINGUNG PASSWORD? MASUK CEPAT TANPA KETIK:</span>
          <button
            onClick={handleQuickLogin}
            id="btn-quick-login-admin-bypass"
            className="w-full py-2.5 bg-[#8ECAE6] hover:bg-[#72bcdb] text-[#023047] rounded-xl font-sans font-bold text-xs shadow-sm cursor-pointer border-b-2 border-sky-600 active:translate-y-0.5 active:border-b-0 transition-all flex items-center justify-center gap-1.5"
          >
            ⚡ MASUK CEPAT (DEMO BYPASS)
          </button>
        </div>
      </div>
    </motion.div>
  );
}
