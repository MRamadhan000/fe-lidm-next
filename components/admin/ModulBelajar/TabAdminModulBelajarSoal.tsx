'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, X, ChevronRight, Save, Plus, Loader2, ImagePlus, Sparkles } from 'lucide-react';
import { LearningModule, QuestionItemType } from '@/types/learning'; 

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
  const [tempObjects, setTempObjects] = useState<{
    type: QuestionItemType;
    name: string;
    image: string;
    imageFile: File | null;
    price: number;
    weight: number;
    quantity: number;
    orderNumber: number;
    moneyNominals: Record<string, number> | null;
  }[]>([]);
  
  // Input Temp Item State
  const [objType, setObjType] = useState<QuestionItemType>(QuestionItemType.PRODUCT);
  const [objName, setObjName] = useState('');
  const [objImage, setObjImage] = useState('');
  const [objImageFile, setObjImageFile] = useState<File | null>(null);
  const [objPrice, setObjPrice] = useState<number>(1000);
  const [objWeight, setObjWeight] = useState<number>(100);
  const [objQuantity, setObjQuantity] = useState<number>(1);
  const [objOrderNumber, setObjOrderNumber] = useState<number>(1);
  const [objMoneyNominals, setObjMoneyNominals] = useState('');
  const questions = [...(module.questions || [])].sort((left, right) => left.orderNumber - right.orderNumber);

  const resetItemDraft = () => {
    setObjType(QuestionItemType.PRODUCT);
    setObjName('');
    setObjImage('');
    setObjImageFile(null);
    setObjPrice(1000);
    setObjWeight(100);
    setObjQuantity(1);
    setObjOrderNumber((prev) => prev + 1);
    setObjMoneyNominals('');
  };

  const extractQuestionId = (payload: unknown) => {
    if (!payload || typeof payload !== 'object') return null;

    const candidate = payload as { id?: string; data?: { id?: string }; question?: { id?: string } };
    return candidate.id ?? candidate.data?.id ?? candidate.question?.id ?? null;
  };

  const handleAddTempObject = () => {
    if (!objName.trim()) {
      alert('Nama item wajib diisi.');
      return;
    }

    if (!objImageFile) {
      alert('Gambar item wajib diunggah.');
      return;
    }

    let parsedMoneyNominals: Record<string, number> | null = null;

    if (objType === QuestionItemType.MONEY) {
      if (!objMoneyNominals.trim()) {
        alert('Isi JSON moneyNominals jika tipe item adalah MONEY.');
        return;
      }

      try {
        const parsed = JSON.parse(objMoneyNominals);

        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          parsedMoneyNominals = parsed;
        } else {
          alert('moneyNominals harus berupa JSON object.');
          return;
        }
      } catch {
        alert('Format JSON moneyNominals tidak valid.');
        return;
      }
    }

    setTempObjects(prev => [...prev, {
      type: objType,
      name: objName,
      image: objImage,
      imageFile: objImageFile,
      price: objPrice,
      weight: objWeight,
      quantity: objQuantity,
      orderNumber: objOrderNumber,
      moneyNominals: parsedMoneyNominals,
    }]);
    resetItemDraft();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tempObjects.length === 0) return alert("Tambahkan minimal 1 item!");

    setIsSubmitting(true);
    try {
      const questionResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module_id: module.id,
          title: questionTitle,
          weight: questionWeight,
        }),
      });

      if (!questionResponse.ok) throw new Error('Gagal membuat soal');

      const questionPayload = await questionResponse.json();
      const questionId = extractQuestionId(questionPayload);

      if (!questionId) {
        throw new Error('Response soal tidak mengembalikan id');
      }

      for (const item of tempObjects) {
        const formData = new FormData();
        formData.append('questionId', questionId);
        formData.append('type', item.type);
        formData.append('name', item.name);
        if (item.imageFile) {
          formData.append('image', item.imageFile);
        }
        formData.append('price', String(item.price));
        formData.append('weight', String(item.weight));
        formData.append('quantity', String(item.quantity));
        formData.append('orderNumber', String(item.orderNumber));

        if (item.type === QuestionItemType.MONEY && item.moneyNominals) {
          formData.append('moneyNominals', JSON.stringify(item.moneyNominals));
        }

        const itemResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/question-items`, {
          method: 'POST',
          body: formData,
        });

        if (!itemResponse.ok) {
          throw new Error('Gagal membuat item soal');
        }
      }

      await refreshData();
      // Reset form total
      setTempObjects([]);
      setQuestionTitle('');
      setShowAddQuestion(false);
      resetItemDraft();
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
            <div className="grid gap-3 md:grid-cols-[1fr_120px]">
              <label className="space-y-1">
                <span className="block text-[10px] font-black text-[#6B705C] uppercase tracking-wider">Judul Soal</span>
                <input
                  required
                  className="w-full bg-white p-2.5 rounded-xl text-xs font-bold border"
                  placeholder="Contoh: Sepatu"
                  value={questionTitle}
                  onChange={(e) => setQuestionTitle(e.target.value)}
                />
              </label>
              <label className="space-y-1">
                <span className="block text-[10px] font-black text-[#6B705C] uppercase tracking-wider">Bobot Soal</span>
                <input
                  type="number"
                  className="w-full bg-white p-2.5 rounded-xl text-xs font-bold border text-center"
                  value={questionWeight}
                  onChange={(e) => setQuestionWeight(Number(e.target.value))}
                />
              </label>
            </div>

            <div className="rounded-2xl border border-[#DDE2D8] bg-white p-4 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-[#4A5043]">
                <Sparkles size={14} className="text-[#8DAA7B]" />
                <span className="text-[10px] font-black uppercase tracking-wider">Tambah Item Soal</span>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1">
                  <span className="block text-[10px] font-black text-[#6B705C] uppercase tracking-wider">Tipe Item</span>
                  <select
                    className="w-full p-2.5 text-xs rounded-xl border bg-white font-bold"
                    value={objType}
                    onChange={(e) => setObjType(e.target.value as QuestionItemType)}
                  >
                    <option value={QuestionItemType.PRODUCT}>PRODUCT</option>
                    <option value={QuestionItemType.MONEY}>MONEY</option>
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="block text-[10px] font-black text-[#6B705C] uppercase tracking-wider">Nama Item</span>
                  <input
                    className="w-full p-2.5 text-xs rounded-xl border"
                    placeholder="Contoh: Sepatu"
                    value={objName}
                    onChange={(e) => setObjName(e.target.value)}
                  />
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1">
                  <span className="block text-[10px] font-black text-[#6B705C] uppercase tracking-wider">Gambar Item</span>
                  <div className="rounded-xl border border-dashed border-[#DDE2D8] bg-[#F9FBF7] p-3 space-y-2">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="w-full text-xs"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setObjImageFile(file);
                        setObjImage(file ? URL.createObjectURL(file) : '');
                      }}
                    />
                    <div className="flex items-center gap-3">
                      <div className="h-16 w-16 overflow-hidden rounded-xl border border-[#DDE2D8] bg-white bg-center bg-cover shrink-0" style={objImage ? { backgroundImage: `url(${objImage})` } : undefined}>
                        {!objImage && <div className="h-full w-full flex items-center justify-center text-[#8DAA7B]"><ImagePlus size={18} /></div>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-[#4A5043]">{objImageFile ? objImageFile.name : 'Belum ada file dipilih'}</p>
                        <p className="text-[10px] text-[#6B705C]">Format: JPG, PNG, WEBP. Maks 3MB.</p>
                      </div>
                    </div>
                  </div>
                </label>

                <label className="space-y-1">
                  <span className="block text-[10px] font-black text-[#6B705C] uppercase tracking-wider">Harga Item</span>
                  <input
                    type="number"
                    className="w-full p-2.5 text-xs rounded-xl border"
                    value={objPrice}
                    onChange={(e) => setObjPrice(Number(e.target.value))}
                    placeholder="Contoh: 200000"
                  />
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <label className="space-y-1">
                  <span className="block text-[10px] font-black text-[#6B705C] uppercase tracking-wider">Bobot Item</span>
                  <input
                    type="number"
                    className="w-full p-2.5 text-xs rounded-xl border"
                    value={objWeight}
                    onChange={(e) => setObjWeight(Number(e.target.value))}
                    placeholder="100"
                  />
                </label>
                <label className="space-y-1">
                  <span className="block text-[10px] font-black text-[#6B705C] uppercase tracking-wider">Quantity</span>
                  <input
                    type="number"
                    className="w-full p-2.5 text-xs rounded-xl border"
                    value={objQuantity}
                    onChange={(e) => setObjQuantity(Number(e.target.value))}
                    placeholder="1"
                  />
                </label>
                <label className="space-y-1">
                  <span className="block text-[10px] font-black text-[#6B705C] uppercase tracking-wider">Urutan</span>
                  <input
                    type="number"
                    className="w-full p-2.5 text-xs rounded-xl border"
                    value={objOrderNumber}
                    onChange={(e) => setObjOrderNumber(Number(e.target.value))}
                    placeholder="1"
                  />
                </label>
              </div>

              {objType === QuestionItemType.MONEY && (
                <label className="space-y-1 block">
                  <span className="block text-[10px] font-black text-[#6B705C] uppercase tracking-wider">moneyNominals JSON</span>
                  <textarea
                    className="w-full p-2.5 text-xs rounded-xl border min-h-24 font-mono"
                    placeholder='{"1000": 2, "5000": 1}'
                    value={objMoneyNominals}
                    onChange={(e) => setObjMoneyNominals(e.target.value)}
                  />
                  <p className="text-[10px] text-[#6B705C]">Wajib diisi hanya jika tipe item adalah MONEY.</p>
                </label>
              )}

              <div className="flex justify-end">
                <button type="button" onClick={handleAddTempObject} className="bg-[#6B705C] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                  <Plus size={12} /> Tambah Item
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {tempObjects.map((obj, i) => (
                  <div key={i} className="w-full rounded-2xl border border-[#E1EAD8] bg-[#F9FBF7] p-3 flex items-start gap-3">
                    <div className="h-14 w-14 overflow-hidden rounded-xl border border-[#DDE2D8] bg-white bg-center bg-cover shrink-0" style={obj.image ? { backgroundImage: `url(${obj.image})` } : undefined} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span className="inline-flex items-center rounded-full bg-[#8DAA7B]/10 px-2 py-0.5 text-[10px] font-black text-[#4A5043]">{obj.type}</span>
                          <p className="text-sm font-bold text-[#2D332D] mt-1 truncate">{obj.name}</p>
                        </div>
                        <button type="button" onClick={() => setTempObjects(prev => prev.filter((_, idx) => idx !== i))} className="text-rose-500 hover:bg-rose-50 rounded-lg p-2">
                          <X size={12}/>
                        </button>
                      </div>
                      <div className="mt-2 grid gap-1 text-[10px] text-[#6B705C] sm:grid-cols-2">
                        <span>Harga: Rp{obj.price.toLocaleString()}</span>
                        <span>Bobot: {obj.weight}</span>
                        <span>Quantity: {obj.quantity}</span>
                        <span>Urutan: {obj.orderNumber}</span>
                      </div>
                      {obj.type === QuestionItemType.MONEY && (
                        <p className="mt-2 text-[10px] text-[#8DAA7B] font-bold">moneyNominals: {JSON.stringify(obj.moneyNominals)}</p>
                      )}
                    </div>
                  </div>
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