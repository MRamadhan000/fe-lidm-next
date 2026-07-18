'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, X, ChevronRight, Save, Plus, Loader2 } from 'lucide-react';
import { LearningModule } from '@/types/learning'; 

interface TabAdminModulBelajarSoalProps {
  module: LearningModule;
  onBackToModules: () => void;
  refreshData: () => Promise<void>;
  onDeleteQuestion: (questionId: string, title: string) => void;
}

export default function TabAdminModulBelajarSoal({
  module,
  onBackToModules,
  refreshData,
  onDeleteQuestion
}: TabAdminModulBelajarSoalProps) {
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionWeight, setQuestionWeight] = useState<number>(20);
  const [tempObjects, setTempObjects] = useState<{name: string, price: number}[]>([]);
  
  // Input Temp Item State
  const [objName, setObjName] = useState('');
  const [objPrice, setObjPrice] = useState<number>(1000);
  const questions = [...(module.questions || [])].sort((left, right) => left.orderNumber - right.orderNumber);

  const handleAddTempObject = () => {
    if (!objName.trim()) return;
    setTempObjects(prev => [...prev, { name: objName, price: objPrice }]);
    setObjName('');
    setObjPrice(1000);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tempObjects.length === 0) return alert("Tambahkan minimal 1 item!");

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:3000/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module_id: module.id,
          title: questionTitle,
          weight: questionWeight,
          items: tempObjects // Backend memproses ini menjadi relasi items
        }),
      });

      if (!response.ok) throw new Error();

      await refreshData();
      // Reset form total
      setTempObjects([]);
      setQuestionTitle('');
      setShowAddQuestion(false);
    } catch {
      alert("Gagal menyimpan soal, silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-[#DDE2D8] flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBackToModules} className="p-2 hover:bg-[#F5F7F2] rounded-xl border border-[#DDE2D8]">
            <ChevronRight size={18} className="rotate-180 text-[#6B705C]" />
          </button>
          <div>
            <span className="text-[9px] font-black text-[#8DAA7B] uppercase tracking-wider">Modul:</span>
            <h2 className="text-sm font-bold text-[#2D332D]">{module.title}</h2>
          </div>
        </div>
        <button
          onClick={() => setShowAddQuestion(!showAddQuestion)}
          className="flex items-center gap-2 bg-[#8DAA7B] text-white font-black text-[11px] py-2 px-4 rounded-full hover:bg-[#7a966a]"
        >
          {showAddQuestion ? <X size={14} /> : <Plus size={14} />}
          {showAddQuestion ? 'Tutup' : 'Tambah Soal'}
        </button>
      </div>

      {/* Form Section */}
      <AnimatePresence>
        {showAddQuestion && (
          <motion.form
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            onSubmit={handleFormSubmit}
            className="bg-[#F5F7F2] rounded-2xl p-5 border border-[#8DAA7B]/30 space-y-4"
          >
            <div className="flex gap-2">
              <input
                required
                className="flex-1 bg-white p-2.5 rounded-xl text-xs font-bold border"
                placeholder="Judul Soal..."
                value={questionTitle}
                onChange={(e) => setQuestionTitle(e.target.value)}
              />
              <input
                type="number"
                className="w-20 bg-white p-2.5 rounded-xl text-xs font-bold border text-center"
                value={questionWeight}
                onChange={(e) => setQuestionWeight(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <input className="flex-1 p-2.5 text-xs rounded-xl border" placeholder="Nama Barang" value={objName} onChange={(e) => setObjName(e.target.value)} />
                <input type="number" className="w-24 p-2.5 text-xs rounded-xl border" value={objPrice} onChange={(e) => setObjPrice(Number(e.target.value))} />
                <button type="button" onClick={handleAddTempObject} className="bg-[#6B705C] text-white px-4 rounded-xl text-xs font-bold">Add</button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {tempObjects.map((obj, i) => (
                  <span key={i} className="bg-white px-3 py-1 rounded-full text-[10px] font-bold border flex items-center gap-2">
                    {obj.name} <span className="text-[#8DAA7B]">Rp{obj.price.toLocaleString()}</span>
                    <button type="button" onClick={() => setTempObjects(prev => prev.filter((_, idx) => idx !== i))}><X size={10}/></button>
                  </span>
                ))}
              </div>
            </div>

            <button disabled={isSubmitting} type="submit" className="w-full py-3 bg-[#8DAA7B] text-white rounded-xl text-xs font-black flex items-center justify-center gap-2">
              {isSubmitting ? <Loader2 className="animate-spin" size={14}/> : <Save size={14} />} 
              {isSubmitting ? 'Menyimpan...' : 'Simpan Soal'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* List Soal */}
      <div className="grid gap-2">
        {questions.map((q) => {
          const items = [...(q.items || [])].sort((left, right) => left.orderNumber - right.orderNumber);

          return (
          <div key={q.id} className="bg-white p-4 rounded-2xl border border-[#DDE2D8] space-y-3">
            <div className="flex justify-between items-start gap-3">
              <div>
                <p className="text-xs font-black">{q.title}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{q.instruction}</p>
                <p className="text-[10px] text-[#8DAA7B] font-bold mt-1">
                  Urutan {q.orderNumber} · Bobot {q.weight} · {items.length} Barang
                </p>
              </div>
              <button onClick={() => onDeleteQuestion(q.id, q.title)} className="text-rose-500 p-2 hover:bg-rose-50 rounded-lg">
                <Trash2 size={15} />
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {items.map((item) => (
                <div key={item.id} className="rounded-xl border border-[#E1EAD8] bg-[#F9FBF7] p-3 flex gap-3 items-start">
                  <div
                    className="h-14 w-14 overflow-hidden rounded-lg border border-[#DDE2D8] bg-white shrink-0 bg-center bg-cover"
                    style={item.image ? { backgroundImage: `url(${item.image})` } : undefined}
                    aria-hidden="true"
                  >
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#2D332D] truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Tipe: {item.type}</p>
                    <p className="text-[10px] text-slate-500">Harga: Rp{item.price.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500">Jumlah: {item.quantity} · Bobot: {item.weight} · Urutan: {item.orderNumber}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}