'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Plus, Pencil, Trash2, Loader2, Ban, Banknote, Package } from 'lucide-react';
import { QuestionItemType } from '@/types/learning';
import QuestionItemForm from './TabAdminSoalItem/QuestionItemForm';
import { QuestionItemRecord } from './TabAdminSoalItem/types';

interface QuestionItemsPanelProps {
  apiUrl?: string;
  questionId: string;
  items: QuestionItemRecord[];
  /** Re-fetch parent data (e.g. the whole module) after any change. */
  onItemsChanged: () => void | Promise<void>;
  /** Minimum items a question must keep. Defaults to 1 per the "1 soal, minimal 1 item" rule. */
  minItemsRequired?: number;
}

/**
 * Drop this once per question to get a full item list + add / edit / delete
 * flow. Fully self-contained: only needs the question's id and its current
 * items, and calls `onItemsChanged` (usually the parent's `refreshData`)
 * whenever something is created, updated, or removed.
 */
export default function QuestionItemsPanel({
  apiUrl = process.env.NEXT_PUBLIC_API_URL,
  questionId,
  items,
  onItemsChanged,
  minItemsRequired = 1,
}: QuestionItemsPanelProps) {
  const [formMode, setFormMode] = useState<'closed' | 'add' | 'edit'>('closed');
  const [editingItem, setEditingItem] = useState<QuestionItemRecord | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const sortedItems = [...items].sort((left, right) => left.orderNumber - right.orderNumber);
  const belowMinimum = sortedItems.length < minItemsRequired;

  const openAddForm = () => {
    setEditingItem(null);
    setFormMode('add');
  };

  const openEditForm = (item: QuestionItemRecord) => {
    setEditingItem(item);
    setFormMode('edit');
  };

  const closeForm = () => {
    setFormMode('closed');
    setEditingItem(null);
  };

  const handleSaved = async () => {
    await onItemsChanged();
    closeForm();
  };

  const handleDelete = async (item: QuestionItemRecord) => {
    if (sortedItems.length <= minItemsRequired) {
      alert(`Tidak bisa menghapus item ini. Setiap soal wajib memiliki minimal ${minItemsRequired} item.`);
      return;
    }
    if (!confirm(`Hapus item "${item.name}"?`)) return;

    setDeletingItemId(item.id);
    try {
      const res = await fetch(`${apiUrl}/question-items/${item.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus item');
      await onItemsChanged();
    } catch {
      alert('Gagal menghapus item, silakan coba lagi.');
    } finally {
      setDeletingItemId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-[#DDE2D8] bg-white p-4 space-y-3">
      {belowMinimum && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-[10px] font-bold text-rose-600">
          <Ban size={12} /> Soal ini belum punya cukup item. Wajib minimal {minItemsRequired} item.
        </div>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        {sortedItems.map((item) => (
          <div key={item.id} className="rounded-xl border border-[#E1EAD8] bg-[#F9FBF7] p-3 flex gap-3 items-start">
            <div
              className="h-14 w-14 overflow-hidden rounded-lg border border-[#DDE2D8] bg-white shrink-0 bg-center bg-cover"
              style={item.image ? { backgroundImage: `url(${item.image})` } : undefined}
            >
              {!item.image && (
                <div className="h-full w-full flex items-center justify-center text-[#8DAA7B]">
                  {item.type === QuestionItemType.MONEY ? <Banknote size={16} /> : <Package size={16} />}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-1">
                <p className="text-xs font-bold text-[#2D332D] truncate">{item.name}</p>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEditForm(item)}
                    title="Edit item"
                    className="text-[#6B705C] p-1.5 hover:bg-white rounded-lg"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    disabled={deletingItemId === item.id}
                    title="Hapus item"
                    className="text-rose-500 p-1.5 hover:bg-rose-50 rounded-lg"
                  >
                    {deletingItemId === item.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Tipe: {item.type}</p>
              <p className="text-[10px] text-slate-500">Harga: Rp{item.price.toLocaleString()}</p>
              <p className="text-[10px] text-slate-500">
                Jumlah: {item.quantity} · Bobot: {item.weight} · Urutan: {item.orderNumber}
              </p>
            </div>
          </div>
        ))}
      </div>

      {formMode === 'closed' && (
        <button
          type="button"
          onClick={openAddForm}
          className="w-full flex items-center justify-center gap-2 border border-dashed border-[#8DAA7B]/50 text-[#4A5043] rounded-xl py-2.5 text-[11px] font-black hover:bg-[#F5F7F2]"
        >
          <Plus size={14} /> Tambah Item
        </button>
      )}

      <AnimatePresence>
        {formMode !== 'closed' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <QuestionItemForm
              key={editingItem?.id ?? 'new'}
              apiUrl={apiUrl}
              questionId={questionId}
              editingItem={editingItem}
              defaultOrderNumber={sortedItems.length + 1}
              onSaved={handleSaved}
              onCancel={closeForm}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}