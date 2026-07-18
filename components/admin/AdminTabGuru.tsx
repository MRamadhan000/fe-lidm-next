'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, X, Loader2 } from 'lucide-react';
import { User,} from '@/types/user';

interface AdminTabAkunGuruProps {
  onPushSystemLog: (user: string, action: string, badge: string, badgeColor: string) => void;
}

export default function AdminTabAkunGuru({ onPushSystemLog }: AdminTabAkunGuruProps) {
  const [teachers, setTeachers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddTeacher, setShowAddTeacher] = useState(false);

  // Fetch Data Guru
  const fetchTeachers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/role?role=TEACHER`);
      const data = await res.json();
      setTeachers(data);
    } catch (error) {
      console.error("Gagal mengambil data guru:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleDeleteTeacher = async (id: string, name: string) => {
    // Implementasi delete ke API Anda di sini
    try {
      // await fetch(`http://localhost:3000/users/${id}`, { method: 'DELETE' });
      setTeachers(teachers.filter(t => t.id !== id));
      onPushSystemLog('Administrator', `Menghapus akun guru: ${name}`, 'Penghapusan', 'bg-rose-100 text-rose-800');
    } catch (error) {
      alert("Gagal menghapus data");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 font-sans text-[#2D332D]">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black text-[#6B705C] uppercase tracking-wider block">Staff Pengajar</span>
          <span className="text-xs text-[#4A5043] font-semibold">Total: {teachers.length} Personel</span>
        </div>
        <button onClick={() => setShowAddTeacher(!showAddTeacher)} className="bg-[#8DAA7B] text-white font-bold text-xs py-1.5 px-3 rounded-full flex items-center gap-1">
          {showAddTeacher ? <X size={14} /> : <Plus size={14} />} {showAddTeacher ? 'Batal' : 'Tambah Guru'}
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[#8DAA7B]" /></div>
      ) : (
        <div className="space-y-2.5">
          {teachers.map((t) => (
            <div key={t.id} className="bg-white p-3.5 rounded-2xl border border-[#DDE2D8] shadow-sm flex items-center justify-between">
              <div className="flex items-start gap-3">
                <span className="text-2xl bg-[#F5F7F2] p-2 rounded-full border border-[#DDE2D8]">👩‍🏫</span>
                <div>
                  <span className="font-bold text-xs text-[#2D332D]">{t.fullName}</span>
                  <p className="text-[10px] text-[#6B705C] font-semibold">Username: {t.username}</p>
                  <p className="text-[9px] text-[#8DAA7B] font-bold">📧 {t.email}</p>
                </div>
              </div>
              <button 
                onClick={() => handleDeleteTeacher(t.id, t.fullName)}
                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}