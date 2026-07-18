'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, X, ClipboardList } from 'lucide-react';
import { Level } from '@/types/learning';

interface TabAdminModulBelajarModulProps {
  levels: Level[];
  selectedLevelId: string | null;
  onDeleteModule: (moduleId: string, title: string) => void;
  onManageQuestions: (moduleId: string) => void;
  refreshData: () => Promise<void>;
}

export default function TabAdminModulBelajarModul({
  levels,
  selectedLevelId,
  onDeleteModule,
  onManageQuestions,
  refreshData
}: TabAdminModulBelajarModulProps) {
  const [showAddModule, setShowAddModule] = useState(false);
  const [moduleTitle, setModuleTitle] = useState('');

  // Mencari data level yang sedang dipilih
  const currentLevel = levels.find((l) => l.id === selectedLevelId);
  const modules = [...(currentLevel?.modules || [])].sort((left, right) => left.orderNumber - right.orderNumber);

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleTitle.trim() || !selectedLevelId) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/learning-modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: moduleTitle,
          description: "Deskripsi default",
          level_id: selectedLevelId,
          orderNumber: modules.length + 1
        }),
      });
      
      await refreshData();
      setModuleTitle('');
      setShowAddModule(false);
    } catch {
      alert("Gagal membuat modul");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black text-[#6B705C] uppercase tracking-wider block">
            Daftar Modul Belajar ({currentLevel?.name || 'Pilih Level'})
          </span>
          <span className="text-xs text-[#4A5043] font-semibold">
            Total: {modules.length} Modul
          </span>
        </div>
        <button
          onClick={() => setShowAddModule(!showAddModule)}
          className="bg-[#8DAA7B] hover:bg-[#7a9969] text-white font-bold text-xs py-1.5 px-3 rounded-full flex items-center gap-1 cursor-pointer transition-all shadow-sm"
        >
          {showAddModule ? <X size={14} /> : <Plus size={14} />} {showAddModule ? 'Batal' : 'Tambah Modul'}
        </button>
      </div>

      {showAddModule && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleCreateModule}
          className="bg-white rounded-2xl p-4 border-2 border-[#E1EAD8] shadow-md space-y-3"
        >
          <div className="space-y-1">
            <label className="text-[10px] font-black text-[#6B705C] uppercase">Nama/Judul Modul:</label>
            <input
              type="text"
              required
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
              className="w-full bg-[#F5F7F2] border border-[#DDE2D8] rounded-xl py-2 px-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#8DAA7B]"
            />
          </div>
          <button type="submit" className="w-full py-2 bg-[#8DAA7B] text-white rounded-xl font-bold text-xs">
            Simpan Modul
          </button>
        </motion.form>
      )}

      <div className="space-y-2.5">
        {modules.map((m) => (
          <div key={m.id} className="bg-white p-3.5 rounded-2xl border border-[#DDE2D8] shadow-sm space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-xs text-[#2D332D] block">{m.title}</span>
                <p className="text-[10px] text-[#6B705C] font-medium mt-0.5">{m.description}</p>
                <p className="text-[9px] text-[#8DAA7B] font-bold mt-1">
                  Urutan {m.orderNumber} · Bobot {m.weight} · {m.questions?.length || 0} Soal
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onManageQuestions(m.id)}
                  className="px-2 py-1 bg-[#8DAA7B]/10 text-[#4A5043] rounded-lg text-[9px] font-bold flex items-center gap-1"
                >
                  <ClipboardList size={10} /> Kelola Soal
                </button>
                <button
                  onClick={() => onDeleteModule(m.id, m.title)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {(m.questions || []).length === 0 ? (
                <p className="text-[10px] text-slate-400 italic">Belum ada soal di modul ini.</p>
              ) : (
                <div className="grid gap-2">
                  {[...(m.questions || [])]
                    .sort((left, right) => left.orderNumber - right.orderNumber)
                    .map((question) => (
                      <div key={question.id} className="rounded-xl border border-[#E1EAD8] bg-[#F9FBF7] p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold text-[#2D332D]">{question.title}</p>
                            <p className="text-[10px] text-[#6B705C] mt-0.5">{question.instruction}</p>
                            <p className="text-[9px] text-[#8DAA7B] font-bold mt-1">
                              Urutan {question.orderNumber} · Bobot {question.weight} · {question.items?.length || 0} Item
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}