'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Loader2, GraduationCap, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface StudentClassItem {
  id: string;
  class: {
    id: string;
    name: string;
    period: string;
  };
}

export default function DashboardSiswaPage() {
  const [classes, setClasses] = useState<StudentClassItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studentName, setStudentName] = useState('Teman');
  const router = useRouter();

  useEffect(() => {
    // 1. Ambil data user dari session (login sebelumnya)
    const session = localStorage.getItem('user_session');
    if (!session) {
      router.push('/login'); // Redirect jika belum login
      return;
    }

    const userData = JSON.parse(session);

    // 2. Fetch kelas siswa berdasarkan student_id
    const fetchClasses = async () => {
      try {
        setStudentName(userData.username);
        const res = await fetch(`http://localhost:3000/classes/student/${userData.id}`);
        const data = await res.json();
        setClasses(data);
      } catch (error) {
        console.error("Gagal mengambil data kelas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    router.push('/login');
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#8DAA7B]" /></div>;

  return (
    <main className="min-h-screen bg-[#F5F7F2] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Dashboard */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-[#2D332D]">Halo, {studentName}! 👋</h1>
            <p className="text-xs font-bold text-[#6B705C]">Pilih kelas untuk mulai belajar hari ini.</p>
          </div>
          <button onClick={handleLogout} className="p-2 bg-white rounded-xl border text-rose-500 hover:bg-rose-50 transition-all">
            <LogOut size={18} />
          </button>
        </div>

        {/* List Kelas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.length > 0 ? (
            classes.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(`/siswa/dashboard/${item.class.id}`)}
                className="bg-white p-5 rounded-3xl border-2 border-[#DDE2D8] flex items-center gap-4 text-left hover:border-[#8DAA7B] transition-all shadow-sm"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#E1EAD8] flex items-center justify-center">
                  <GraduationCap className="text-[#8DAA7B]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#2D332D]">{item.class.name}</h3>
                  <p className="text-[10px] font-bold text-[#6B705C] bg-[#F5F7F2] px-2 py-0.5 rounded-full inline-block">
                    Tahun {item.class.period}
                  </p>
                </div>
              </motion.button>
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-[#6B705C] font-bold">
              Belum ada kelas yang terdaftar.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}