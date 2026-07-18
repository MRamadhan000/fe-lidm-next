'use client';

import React, { useState } from 'react';
import { Save, X, Sparkles, Loader2, ImagePlus } from 'lucide-react';
import { QuestionItemType } from '@/types/learning';
import MoneyDenominationInput from './MoneyDenominationInput';
import { QuestionItemRecord, MoneyRow, moneyRowsFromNominals, moneyRowsToNominals, emptyMoneyRow } from './types';

interface QuestionItemFormProps {
  apiUrl?: string;
  questionId: string;
  /** Pass an existing item to edit it, or omit/null to create a new one. */
  editingItem?: QuestionItemRecord | null;
  /** Suggested orderNumber for a new item (ignored when editing). */
  defaultOrderNumber?: number;
  onSaved: () => void | Promise<void>;
  onCancel: () => void;
}

/**
 * Self-contained add/edit form for a QuestionItem. Owns its own draft state
 * and talks to the API directly (POST for create, PATCH for edit).
 *
 * Give this component a `key` tied to `editingItem?.id ?? 'new'` from the
 * parent so it remounts (and resets its draft) whenever you switch between
 * "add" and "edit" or between different items.
 */
export default function QuestionItemForm({
  apiUrl = process.env.NEXT_PUBLIC_API_URL,
  questionId,
  editingItem = null,
  defaultOrderNumber = 1,
  onSaved,
  onCancel,
}: QuestionItemFormProps) {
  const isEditing = !!editingItem;

  const [type, setType] = useState<QuestionItemType>(editingItem?.type ?? QuestionItemType.PRODUCT);
  const [name, setName] = useState(editingItem?.name ?? '');
  const [image, setImage] = useState(editingItem?.image ?? '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [price, setPrice] = useState<number>(editingItem?.price ?? 1000);
  const [weight, setWeight] = useState<number>(editingItem?.weight ?? 100);
  const [quantity, setQuantity] = useState<number>(editingItem?.quantity ?? 1);
  const [orderNumber, setOrderNumber] = useState<number>(editingItem?.orderNumber ?? defaultOrderNumber);
  const [moneyRows, setMoneyRows] = useState<MoneyRow[]>(moneyRowsFromNominals(editingItem?.moneyNominals));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTypeChange = (next: QuestionItemType) => {
    setType(next);
    setMoneyRows([emptyMoneyRow()]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Nama item wajib diisi.');
      return;
    }
    if (!isEditing && !imageFile) {
      alert('Gambar item wajib diunggah.');
      return;
    }

    let moneyNominals: Record<string, number> | null = null;
    if (type === QuestionItemType.MONEY) {
      moneyNominals = moneyRowsToNominals(moneyRows);
      if (!moneyNominals) {
        alert('Isi minimal satu pecahan uang beserta jumlahnya.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('questionId', questionId);
      formData.append('type', type);
      formData.append('name', name);
      if (imageFile) formData.append('image', imageFile);
      formData.append('price', String(price));
      formData.append('weight', String(weight));
      formData.append('quantity', String(quantity));
      formData.append('orderNumber', String(orderNumber));
      if (type === QuestionItemType.MONEY && moneyNominals) {
        formData.append('moneyNominals', JSON.stringify(moneyNominals));
      }

      const url = isEditing
        ? `${apiUrl}/question-items/${editingItem!.id}`
        : `${apiUrl}/question-items`;
      const res = await fetch(url, { method: isEditing ? 'PATCH' : 'POST', body: formData });
      if (!res.ok) throw new Error('Gagal menyimpan item');

      await onSaved();
    } catch {
      alert('Gagal menyimpan item, silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-[#8DAA7B]/30 bg-[#F5F7F2] p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#4A5043]">
          <Sparkles size={14} className="text-[#8DAA7B]" />
          <span className="text-[10px] font-black uppercase tracking-wider">
            {isEditing ? 'Edit Item' : 'Tambah Item Baru'}
          </span>
        </div>
        <button type="button" onClick={onCancel} className="text-[#6B705C] p-1 hover:bg-white rounded-lg">
          <X size={14} />
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <span className="block text-[10px] font-black text-[#6B705C] uppercase tracking-wider">Tipe Item</span>
          <select
            className="w-full p-2.5 text-xs rounded-xl border bg-white font-bold"
            value={type}
            onChange={(e) => handleTypeChange(e.target.value as QuestionItemType)}
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
            value={name}
            onChange={(e) => setName(e.target.value)}
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
                setImageFile(file);
                if (file) setImage(URL.createObjectURL(file));
              }}
            />
            <div className="flex items-center gap-3">
              <div
                className="h-16 w-16 overflow-hidden rounded-xl border border-[#DDE2D8] bg-white bg-center bg-cover shrink-0"
                style={image ? { backgroundImage: `url(${image})` } : undefined}
              >
                {!image && (
                  <div className="h-full w-full flex items-center justify-center text-[#8DAA7B]">
                    <ImagePlus size={18} />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-[#4A5043]">
                  {imageFile ? imageFile.name : isEditing ? 'Biarkan kosong jika tidak ganti gambar' : 'Belum ada file dipilih'}
                </p>
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
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
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
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
          />
        </label>
        <label className="space-y-1">
          <span className="block text-[10px] font-black text-[#6B705C] uppercase tracking-wider">Quantity</span>
          <input
            type="number"
            className="w-full p-2.5 text-xs rounded-xl border"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </label>
        <label className="space-y-1">
          <span className="block text-[10px] font-black text-[#6B705C] uppercase tracking-wider">Urutan</span>
          <input
            type="number"
            className="w-full p-2.5 text-xs rounded-xl border"
            value={orderNumber}
            onChange={(e) => setOrderNumber(Number(e.target.value))}
          />
        </label>
      </div>

      {type === QuestionItemType.MONEY && (
        <MoneyDenominationInput rows={moneyRows} onChange={setMoneyRows} />
      )}

      <div className="flex gap-2">
        <button
          disabled={isSubmitting}
          type="submit"
          className="flex-1 py-2.5 bg-[#8DAA7B] text-white rounded-xl text-xs font-black flex items-center justify-center gap-2"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
          {isSubmitting ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan Item' : 'Simpan Item'}
        </button>
        <button type="button" onClick={onCancel} className="py-2.5 px-4 bg-white text-[#6B705C] rounded-xl text-xs font-bold border">
          Batal
        </button>
      </div>
    </form>
  );
}
