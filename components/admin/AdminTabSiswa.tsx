
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, X, Loader2 } from 'lucide-react';
import { User } from '@/types/user';

interface AdminTabAkunSiswaProps {
  onPushSystemLog: (user: string, action: string, badge: string, badgeColor: string) => void;
}

export default function AdminTabAkunSiswa({ onPushSystemLog }: AdminTabAkunSiswaProps) {
  const [students, setStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddStudent, setShowAddStudent] = useState(false);

  // Fetch Data Siswa
  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:3000/users/role?role=STUDENT');
      const data = await res.json();
      setStudents(data);
    } catch (error) {
      console.error("Gagal mengambil data siswa:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDeleteStudent = async (id: string, name: string) => {
    try {
      // Implementasi delete ke API Anda:
      // await fetch(`http://localhost:3000/users/${id}`, { method: 'DELETE' });
      
      setStudents(students.filter(s => s.id !== id));
      onPushSystemLog('Administrator', `Menghapus akun siswa: ${name}`, 'Penghapusan', 'bg-rose-100 text-rose-800');
    } catch (error) {
      alert("Gagal menghapus data");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 font-sans text-[#2D332D]">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black text-[#6B705C] uppercase tracking-wider block">Data Siswa</span>
          <span className="text-xs text-[#4A5043] font-semibold">Total: {students.length} Siswa Terdaftar</span>
        </div>
        <button 
          onClick={() => setShowAddStudent(!showAddStudent)} 
          className="bg-[#8DAA7B] text-white font-bold text-xs py-1.5 px-3 rounded-full flex items-center gap-1"
        >
          {showAddStudent ? <X size={14} /> : <Plus size={14} />} {showAddStudent ? 'Batal' : 'Tambah Siswa'}
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[#8DAA7B]" /></div>
      ) : (
        <div className="space-y-2.5">
          {students.map((s) => (
            <div key={s.id} className="bg-white p-3.5 rounded-2xl border border-[#DDE2D8] shadow-sm flex items-center justify-between">
              <div className="flex items-start gap-3">
                <span className="text-2xl bg-[#F5F7F2] p-2 rounded-full border border-[#DDE2D8]">🎓</span>
                <div>
                  <span className="font-bold text-xs text-[#2D332D]">{s.fullName}</span>
                  <p className="text-[10px] text-[#6B705C] font-semibold">Username: {s.username}</p>
                  <p className="text-[9px] text-[#8DAA7B] font-bold">📧 {s.email}</p>
                </div>
              </div>
              <button 
                onClick={() => handleDeleteStudent(s.id, s.fullName)}
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