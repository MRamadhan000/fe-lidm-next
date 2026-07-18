'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import LoadingPage from '@/components/LoadingPage';

const roles = [
  {
    title: 'Siswa',
    desc: 'Masuk untuk belajar dan bermain.',
    icon: '🧒',
    color: 'bg-blue-100',
    path: '/auth/login/siswa',
  },
  {
    title: 'Guru',
    desc: 'Pantau perkembangan.',
    icon: '👩‍🏫',
    color: 'bg-green-100',
    path: '/auth/login/guru',
  },
  {
    title: 'Orang Tua',
    desc: 'Lihat perkembangan belajar anak.',
    icon: '👨‍👩‍👦',
    color: 'bg-pink-100',
    path: '/auth/login/orang-tua',
  },
  {
    title: 'Admin',
    desc: 'Kelola sistem EduGrahita.',
    icon: '⚙️',
    color: 'bg-amber-100',
    path: '/auth/login/admin',
  },
];

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  if (isLoading) {
    return <LoadingPage onComplete={() => setIsLoading(false)} />;
  }

  return (
    <main className="min-h-screen bg-[#F5F7F2] flex items-center justify-center px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-6xl"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-[#E1EAD8] rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-lg border border-[#DDE2D8]">
            <span className="text-5xl">🚀</span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-[#2D332D]">
            Selamat Datang di{' '}
            <span className="text-[#8DAA7B]">EduGrahita</span>
          </h1>

          <p className="text-[#6B705C] text-lg mt-4 max-w-xl mx-auto">
            Pilih peran Anda untuk mulai menggunakan aplikasi.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role, index) => (
            <motion.div
              key={role.title}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{
                y: -8,
                scale: 1.03,
              }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push(role.path)}
              className="cursor-pointer rounded-3xl bg-white shadow-lg border border-gray-200 p-6 hover:border-[#8DAA7B] transition-all"
            >
              <div
                className={`w-20 h-20 ${role.color} rounded-2xl flex items-center justify-center text-5xl mx-auto mb-5`}
              >
                {role.icon}
              </div>

              <h2 className="text-2xl font-bold text-[#2D332D] text-center">
                {role.title}
              </h2>

              <p className="text-[#6B705C] text-center mt-3 text-sm leading-relaxed">
                {role.desc}
              </p>

              <button
                className="mt-6 w-full bg-[#8DAA7B] hover:bg-[#769464] text-white font-bold py-3 rounded-xl transition"
              >
                Masuk
              </button>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <footer className="text-center mt-14 text-xs text-[#6B705C]/60 font-semibold tracking-widest uppercase">
          EduGrahita © 2026
        </footer>
      </motion.div>
    </main>
  );
}