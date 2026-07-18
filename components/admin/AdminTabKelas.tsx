'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, X, Loader2 } from 'lucide-react';
// Pastikan path ke file types sesuai
import { Class } from '@/types/class'; 

interface AdminTabKelasSLBProps {
  onPushSystemLog: (user: string, action: string, badge: string, badgeColor: string) => void;
}

export default function AdminTabKelasSLB({ onPushSystemLog }: AdminTabKelasSLBProps) {
  const [classrooms, setClassrooms] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddClass, setShowAddClass] = useState(false);

  // Fetch data dari backend
  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes`);
      const data = await res.json();
      setClassrooms(data);
    } catch (error) {
      console.error("Gagal mengambil data kelas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleDeleteClass = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus ${name}?`)) return;

    try {
      // await fetch(`http://localhost:3000/classes/${id}`, { method: 'DELETE' });
      setClassrooms(classrooms.filter(c => c.id !== id));
      onPushSystemLog('Administrator', `Menghapus kelas: ${name}`, 'Penghapusan', 'bg-rose-100 text-rose-800');
    } catch (error) {
      alert("Gagal menghapus data");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 font-sans text-[#2D332D]">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black text-[#6B705C] uppercase tracking-wider block">Ruang & Kelas SLB Grahita</span>
          <span className="text-xs text-[#4A5043] font-semibold">Total: {classrooms.length} Kelas Aktif</span>
        </div>
        <button
          onClick={() => setShowAddClass(!showAddClass)}
          className="bg-[#8DAA7B] hover:bg-[#7a9969] text-white font-bold text-xs py-1.5 px-3 rounded-full flex items-center gap-1 cursor-pointer transition-all shadow-sm"
        >
          {showAddClass ? <X size={14} /> : <Plus size={14} />} {showAddClass ? 'Batal' : 'Tambah Kelas'}
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[#8DAA7B]" /></div>
      ) : (
        <div className="space-y-2.5">
          {classrooms.map((c) => (
            <div key={c.id} className="bg-white p-3.5 rounded-2xl border border-[#DDE2D8] shadow-sm flex items-center justify-between">
              <div className="flex items-start gap-3">
                <span className="text-3xl bg-[#F5F7F2] p-1.5 rounded-full border border-[#DDE2D8]">🏫</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#2D332D]">{c.name}</span>
                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase bg-amber-50 text-amber-800">
                      {c.period}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#6B705C] font-semibold mt-1">
                    Wali Kelas: <strong className="text-[#4A5043]">{c.teacher?.fullName || 'Belum diatur'}</strong>
                  </p>
                  <p className="text-[9px] text-[#8DAA7B] font-bold mt-0.5">
                    👥 Terisi: {c.students?.length || 0} Siswa Terdaftar
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleDeleteClass(c.id, c.name)}
                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer transition-all shrink-0"
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