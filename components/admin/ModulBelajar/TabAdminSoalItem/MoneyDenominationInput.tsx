'use client';

import React from 'react';
import { Banknote, Plus, X } from 'lucide-react';
import { MoneyRow, RUPIAH_PRESETS, emptyMoneyRow } from './types';

interface MoneyDenominationInputProps {
  rows: MoneyRow[];
  onChange: (rows: MoneyRow[]) => void;
}

/**
 * Editable list of {nominal, jumlah} pairs used to build a QuestionItem's
 * `moneyNominals` payload. Fully controlled — parent owns the state.
 */
export default function MoneyDenominationInput({ rows, onChange }: MoneyDenominationInputProps) {
  const addRow = () => onChange([...rows, emptyMoneyRow()]);

  const removeRow = (idx: number) =>
    onChange(rows.length > 1 ? rows.filter((_, i) => i !== idx) : rows);

  const updateRow = (idx: number, field: keyof MoneyRow, value: string) =>
    onChange(rows.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));

  const addPresetDenom = (denom: number) => {
    const existingIdx = rows.findIndex((row) => row.denom === String(denom));
    if (existingIdx >= 0) {
      onChange(
        rows.map((row, i) =>
          i === existingIdx ? { ...row, qty: String(Number(row.qty || '0') + 1) } : row
        )
      );
      return;
    }
    const withoutEmpty = rows.filter((row) => row.denom.trim() !== '');
    onChange([...withoutEmpty, { denom: String(denom), qty: '1' }]);
  };

  return (
    <div className="space-y-2 rounded-xl border border-[#DDE2D8] bg-white p-3">
      <div className="flex items-center gap-2 text-[#4A5043]">
        <Banknote size={13} className="text-[#8DAA7B]" />
        <span className="text-[10px] font-black uppercase tracking-wider">Pecahan Uang</span>
      </div>
      <p className="text-[10px] text-[#6B705C]">
        Tambahkan pecahan yang tersedia beserta jumlah lembar/keping. Bisa lebih dari satu pecahan.
      </p>

      <div className="flex flex-wrap gap-1.5">
        {RUPIAH_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => addPresetDenom(preset)}
            className="rounded-full border border-[#8DAA7B]/40 bg-[#F5F7F2] px-2.5 py-1 text-[10px] font-bold text-[#4A5043] hover:bg-[#EAF1E4]"
          >
            +Rp{preset.toLocaleString()}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {rows.map((row, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="number"
              className="flex-1 p-2 text-xs rounded-lg border"
              placeholder="Nominal, contoh: 5000"
              value={row.denom}
              onChange={(e) => updateRow(idx, 'denom', e.target.value)}
            />
            <span className="text-[10px] text-[#6B705C] font-bold">x</span>
            <input
              type="number"
              min={1}
              className="w-20 p-2 text-xs rounded-lg border text-center"
              placeholder="Jumlah"
              value={row.qty}
              onChange={(e) => updateRow(idx, 'qty', e.target.value)}
            />
            <button
              type="button"
              onClick={() => removeRow(idx)}
              className="text-rose-500 p-1.5 hover:bg-rose-50 rounded-lg"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-1.5 text-[10px] font-black text-[#8DAA7B] hover:text-[#6f9260]"
      >
        <Plus size={12} /> Tambah Baris Pecahan
      </button>
    </div>
  );
}
