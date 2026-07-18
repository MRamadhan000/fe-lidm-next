'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trash2,
  X,
  ChevronRight,
  ChevronDown,
  Save,
  Plus,
  Loader2,
  Sparkles,
  Pencil,
  Layers,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { LearningModule } from '@/types/learning';
import QuestionItemsPanel from './TabAdminSoalItem/QuestionItemsPanel';
import { QuestionItemRecord } from './TabAdminSoalItem/types';

type QuestionRecord = NonNullable<LearningModule['questions']>[number];

interface TabAdminModulBelajarSoalProps {
  module: LearningModule;
  onBackToModules: () => void;
  refreshData: () => Promise<void>;
  onDeleteQuestion: (questionId: string, title: string) => void;
}

const MIN_ITEMS_PER_QUESTION = 1;

export default function TabAdminModulBelajarSoal({
  module,
  onBackToModules,
  refreshData,
  onDeleteQuestion,
}: TabAdminModulBelajarSoalProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // ===== SOAL (QUESTION) — CREATE =====
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionInstruction, setQuestionInstruction] = useState('');
  const [questionWeight, setQuestionWeight] = useState<number>(20);
  const [questionOrder, setQuestionOrder] = useState<number>((module.questions?.length ?? 0) + 1);

  // ===== SOAL — EDIT =====
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editInstruction, setEditInstruction] = useState('');
  const [editWeight, setEditWeight] = useState<number>(0);
  const [editOrder, setEditOrder] = useState<number>(0);

  // ===== ITEM MANAGEMENT TOGGLE =====
  const [managingQuestionId, setManagingQuestionId] = useState<string | null>(null);
  const [infoBanner, setInfoBanner] = useState<string | null>(null);

  const questions = [...(module.questions || [])].sort((left, right) => left.orderNumber - right.orderNumber);

  const extractId = (payload: unknown) => {
    if (!payload || typeof payload !== 'object') return null;
    const candidate = payload as { id?: string; data?: { id?: string }; question?: { id?: string } };
    return candidate.id ?? candidate.data?.id ?? candidate.question?.id ?? null;
  };

  // ---------- SOAL: CREATE ----------
  const resetQuestionDraft = () => {
    setQuestionTitle('');
    setQuestionInstruction('');
    setQuestionWeight(20);
    setQuestionOrder((module.questions?.length ?? 0) + 1);
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingQuestion(true);
    try {
      const res = await fetch(`${API_URL}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: module.id,
          title: questionTitle,
          instruction: questionInstruction,
          weight: questionWeight,
          orderNumber: questionOrder,
        }),
      });

      if (!res.ok) throw new Error('Gagal membuat soal');

      const payload = await res.json();
      const newQuestionId = extractId(payload);
      if (!newQuestionId) throw new Error('Response soal tidak mengembalikan id');

      await refreshData();
      resetQuestionDraft();
      setShowAddQuestion(false);

      // Langsung arahkan admin ke panel kelola item, karena minimal 1 item wajib ada.
      setManagingQuestionId(newQuestionId);
      setInfoBanner('Soal berhasil dibuat. Tambahkan minimal 1 item untuk melengkapi soal ini.');
    } catch {
      alert('Gagal menyimpan soal, silakan coba lagi.');
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  // ---------- SOAL: EDIT ----------
  const startEditQuestion = (q: QuestionRecord) => {
    setEditingQuestionId(q.id);
    setEditTitle(q.title);
    setEditInstruction(q.instruction ?? '');
    setEditWeight(q.weight);
    setEditOrder(q.orderNumber);
  };

  const cancelEditQuestion = () => setEditingQuestionId(null);

  const handleUpdateQuestion = async (e: React.FormEvent, questionId: string) => {
    e.preventDefault();
    setIsSavingQuestion(true);
    try {
      const res = await fetch(`${API_URL}/questions/${questionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          instruction: editInstruction,
          weight: editWeight,
          orderNumber: editOrder,
        }),
      });
      if (!res.ok) throw new Error('Gagal memperbarui soal');
      await refreshData();
      setEditingQuestionId(null);
    } catch {
      alert('Gagal memperbarui soal, silakan coba lagi.');
    } finally {
      setIsSavingQuestion(false);
    }
  };

  const toggleManagePanel = (questionId: string) => {
    setManagingQuestionId((prev) => (prev === questionId ? null : questionId));
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
          onClick={() => {
            setShowAddQuestion((prev) => !prev);
            setManagingQuestionId(null);
          }}
          className="flex items-center gap-2 bg-[#8DAA7B] text-white font-black text-[11px] py-2 px-4 rounded-full hover:bg-[#7a966a]"
        >
          {showAddQuestion ? <X size={14} /> : <Plus size={14} />}
          {showAddQuestion ? 'Tutup' : 'Tambah Soal'}
        </button>
      </div>

      {/* Info banner */}
      <AnimatePresence>
        {infoBanner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-between gap-3 rounded-2xl border border-[#8DAA7B]/40 bg-[#EEF4E9] px-4 py-3 text-[11px] font-bold text-[#4A5043]"
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-[#8DAA7B]" /> {infoBanner}
            </span>
            <button onClick={() => setInfoBanner(null)} className="text-[#8DAA7B] hover:text-[#4A5043]">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 1: Create SOAL only (no items here) */}
      <AnimatePresence>
        {showAddQuestion && (
          <motion.form
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            onSubmit={handleCreateQuestion}
            className="bg-[#F5F7F2] rounded-2xl p-5 border border-[#8DAA7B]/30 space-y-4"
          >
            <div className="flex items-center gap-2 text-[#4A5043]">
              <Sparkles size={14} className="text-[#8DAA7B]" />
              <span className="text-[10px] font-black uppercase tracking-wider">Langkah 1: Buat Soal</span>
            </div>
            <p className="text-[10px] text-[#6B705C]">
              Simpan soal terlebih dahulu. Setelah tersimpan, kamu akan diarahkan untuk menambahkan item (minimal {MIN_ITEMS_PER_QUESTION} item wajib).
            </p>

            <label className="space-y-1 block">
              <span className="block text-[10px] font-black text-[#6B705C] uppercase tracking-wider">Judul Soal</span>
              <input
                required
                className="w-full bg-white p-2.5 rounded-xl text-xs font-bold border"
                placeholder="Contoh: Sepatu"
                value={questionTitle}
                onChange={(e) => setQuestionTitle(e.target.value)}
              />
            </label>

            <label className="space-y-1 block">
              <span className="block text-[10px] font-black text-[#6B705C] uppercase tracking-wider">Instruksi Soal</span>
              <textarea
                required
                className="w-full bg-white p-2.5 rounded-xl text-xs font-bold border min-h-20"
                placeholder="Contoh: Urutkan barang berikut dari yang termurah ke termahal"
                value={questionInstruction}
                onChange={(e) => setQuestionInstruction(e.target.value)}
              />
            </label>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="block text-[10px] font-black text-[#6B705C] uppercase tracking-wider">Bobot Soal</span>
                <input
                  type="number"
                  className="w-full bg-white p-2.5 rounded-xl text-xs font-bold border text-center"
                  value={questionWeight}
                  onChange={(e) => setQuestionWeight(Number(e.target.value))}
                />
              </label>
              <label className="space-y-1">
                <span className="block text-[10px] font-black text-[#6B705C] uppercase tracking-wider">Urutan Soal</span>
                <input
                  type="number"
                  className="w-full bg-white p-2.5 rounded-xl text-xs font-bold border text-center"
                  value={questionOrder}
                  onChange={(e) => setQuestionOrder(Number(e.target.value))}
                />
              </label>
            </div>

            <button disabled={isSubmittingQuestion} type="submit" className="w-full py-3 bg-[#8DAA7B] text-white rounded-xl text-xs font-black flex items-center justify-center gap-2">
              {isSubmittingQuestion ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
              {isSubmittingQuestion ? 'Menyimpan...' : 'Simpan Soal & Lanjut Tambah Item'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* List Soal */}
      <div className="grid gap-2">
        {questions.map((q) => {
          const items = (q.items ?? []) as unknown as QuestionItemRecord[];
          const isManaging = managingQuestionId === q.id;
          const isEditingThis = editingQuestionId === q.id;
          const hasMinimumItems = items.length >= MIN_ITEMS_PER_QUESTION;

          return (
            <div key={q.id} className="bg-white p-4 rounded-2xl border border-[#DDE2D8] space-y-3">
              {isEditingThis ? (
                <form onSubmit={(e) => handleUpdateQuestion(e, q.id)} className="space-y-3">
                  <label className="space-y-1 block">
                    <span className="block text-[10px] font-black text-[#6B705C] uppercase tracking-wider">Judul Soal</span>
                    <input
                      required
                      className="w-full bg-[#F9FBF7] p-2.5 rounded-xl text-xs font-bold border"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                  </label>
                  <label className="space-y-1 block">
                    <span className="block text-[10px] font-black text-[#6B705C] uppercase tracking-wider">Instruksi Soal</span>
                    <textarea
                      required
                      className="w-full bg-[#F9FBF7] p-2.5 rounded-xl text-xs font-bold border min-h-16"
                      value={editInstruction}
                      onChange={(e) => setEditInstruction(e.target.value)}
                    />
                  </label>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="space-y-1">
                      <span className="block text-[10px] font-black text-[#6B705C] uppercase tracking-wider">Bobot</span>
                      <input
                        type="number"
                        className="w-full bg-[#F9FBF7] p-2.5 rounded-xl text-xs font-bold border text-center"
                        value={editWeight}
                        onChange={(e) => setEditWeight(Number(e.target.value))}
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="block text-[10px] font-black text-[#6B705C] uppercase tracking-wider">Urutan</span>
                      <input
                        type="number"
                        className="w-full bg-[#F9FBF7] p-2.5 rounded-xl text-xs font-bold border text-center"
                        value={editOrder}
                        onChange={(e) => setEditOrder(Number(e.target.value))}
                      />
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      disabled={isSavingQuestion}
                      type="submit"
                      className="flex-1 py-2.5 bg-[#8DAA7B] text-white rounded-xl text-xs font-black flex items-center justify-center gap-2"
                    >
                      {isSavingQuestion ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                      Simpan Perubahan
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditQuestion}
                      className="py-2.5 px-4 bg-[#F5F7F2] text-[#6B705C] rounded-xl text-xs font-bold"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <p className="text-xs font-black">{q.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{q.instruction}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-[#8DAA7B] font-bold">
                        Urutan {q.orderNumber} · Bobot {q.weight}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                          hasMinimumItems ? 'bg-[#8DAA7B]/10 text-[#4A5043]' : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {hasMinimumItems ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                        {items.length} Item{!hasMinimumItems && ' · Wajib min. 1'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => startEditQuestion(q)}
                      title="Edit soal"
                      className="text-[#6B705C] p-2 hover:bg-[#F5F7F2] rounded-lg"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteQuestion(q.id, q.title)}
                      title="Hapus soal"
                      className="text-rose-500 p-2 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )}

              {!isEditingThis && (
                <button
                  onClick={() => toggleManagePanel(q.id)}
                  className="w-full flex items-center justify-between rounded-xl border border-[#DDE2D8] bg-[#F9FBF7] px-3 py-2 text-[10px] font-black text-[#4A5043] uppercase tracking-wider hover:bg-[#F0F5EB]"
                >
                  <span className="flex items-center gap-2">
                    <Layers size={13} className="text-[#8DAA7B]" /> Kelola Item ({items.length})
                  </span>
                  <ChevronDown size={14} className={`transition-transform ${isManaging ? 'rotate-180' : ''}`} />
                </button>
              )}

              {/* Item management is fully delegated to QuestionItemsPanel — no duplicated logic here */}
              <AnimatePresence>
                {isManaging && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <QuestionItemsPanel
                      apiUrl={API_URL}
                      questionId={q.id}
                      items={items}
                      onItemsChanged={refreshData}
                      minItemsRequired={MIN_ITEMS_PER_QUESTION}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {questions.length === 0 && !showAddQuestion && (
          <div className="bg-white p-8 rounded-2xl border border-dashed border-[#DDE2D8] text-center">
            <p className="text-xs font-bold text-[#6B705C]">Belum ada soal di modul ini.</p>
            <p className="text-[10px] text-[#8DAA7B] mt-1">Klik &quot;Tambah Soal&quot; untuk membuat soal pertama.</p>
          </div>
        )}
      </div>
    </div>
  );
}