'use client';

import { Level } from '@/types/learning'; // Pastikan path benar

interface TabAdminModulBelajarLevelProps {
  selectedLevelId: string | null;
  levels: Level[]; // Menerima daftar level dari database
  onSelectLevel: (id: string) => void;
}

export default function TabAdminModulBelajarLevel({
  selectedLevelId,
  levels,
  onSelectLevel
}: TabAdminModulBelajarLevelProps) {
  const sortedLevels = [...levels].sort((left, right) => left.orderNumber - right.orderNumber);
  
  return (
    <div className="bg-white p-3 rounded-2xl border border-[#DDE2D8] shadow-sm space-y-2">
      <span className="text-[10px] font-black text-[#6B705C] uppercase tracking-wider block">
        Pilih Tingkatan (Level) Pembelajaran:
      </span>
      
      {/* Jika levels kosong, tampilkan indikator loading/kosong */}
      {levels.length === 0 ? (
        <p className="text-[10px] text-slate-400 italic">Memuat level...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {sortedLevels.map((lvl) => (
            <button
              key={lvl.id}
              type="button"
              onClick={() => onSelectLevel(lvl.id)}
              className={`py-3 px-3 rounded-xl font-bold text-xs cursor-pointer transition-all text-left ${
                selectedLevelId === lvl.id
                  ? 'bg-[#8DAA7B] text-white shadow-sm ring-2 ring-[#4A5043]'
                  : 'bg-[#F5F7F2] text-[#6B705C] hover:bg-[#E1EAD8]/50 border border-[#DDE2D8]'
              }`}
            >
              <span className="block text-[11px] uppercase tracking-wider opacity-80">Level {lvl.orderNumber}</span>
              <span className="block text-sm mt-0.5">{lvl.name}</span>
              <span className="block mt-1 font-medium text-[10px] leading-snug opacity-90">{lvl.description}</span>
              <span className="block mt-1 text-[10px] opacity-75">Bobot: {lvl.weight} | Modul: {lvl.modules?.length || 0}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}