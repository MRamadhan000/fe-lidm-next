"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, X, Edit2, ClipboardList, Check } from "lucide-react";
import { Level } from "@/types/learning";

interface Module {
  id: string;
  title: string;
  description: string;
  orderNumber: number;
  weight: number;
  questions?: any[];
}

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
  refreshData,
}: TabAdminModulBelajarModulProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    orderNumber: 1,
    weight: 100,
  });

  const currentLevel = levels.find((l) => l.id === selectedLevelId);
  const modules = [...(currentLevel?.modules || [])].sort(
    (left, right) => left.orderNumber - right.orderNumber,
  );

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      orderNumber: modules.length + 1,
      weight: 100,
    });
    setEditingModule(null);
    setShowForm(false);
  };

  const handleOpenAddForm = () => {
    setEditingModule(null);
    setFormData({
      title: "",
      description: "",
      orderNumber: modules.length + 1,
      weight: 100,
    });
    setShowForm(true);
    setSuccessMessage(null);
  };

  const handleOpenEditForm = (module: Module) => {
    setEditingModule(module);
    setFormData({
      title: module.title,
      description: module.description,
      orderNumber: module.orderNumber,
      weight: module.weight,
    });
    setShowForm(true);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !selectedLevelId) return;

    setIsSubmitting(true);

    try {
      if (editingModule) {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/learning-modules/${editingModule.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: formData.title,
              description: formData.description,
              orderNumber: formData.orderNumber,
              weight: formData.weight,
            }),
          },
        );
        showSuccess("Modul berhasil diperbarui!");
      } else {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/learning-modules`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            levelId: selectedLevelId,
            title: formData.title,
            description: formData.description,
            orderNumber: formData.orderNumber,
            weight: formData.weight,
          }),
        });
        showSuccess("Modul baru berhasil ditambahkan!");
      }

      await refreshData();
      resetForm();
    } catch (error) {
      alert(editingModule ? "Gagal memperbarui modul" : "Gagal membuat modul");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 2200);
  };

  return (
    <div className="space-y-4 relative">
      {/* Success Toast Animation */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[999] bg-emerald-600 text-white px-6 py-2.5 rounded-full flex items-center gap-2 text-sm font-bold shadow-xl"
          >
            <Check size={17} className="text-white" /> {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black text-[#6B705C] uppercase tracking-wider block">
            Daftar Modul Belajar ({currentLevel?.name || "Pilih Level"})
          </span>
          <span className="text-xs text-[#4A5043] font-semibold">
            Total: {modules.length} Modul
          </span>
        </div>
        <button
          onClick={handleOpenAddForm}
          className="bg-[#8DAA7B] hover:bg-[#7a9969] text-white font-bold text-xs py-1.5 px-3 rounded-full flex items-center gap-1 cursor-pointer transition-all shadow-sm"
        >
          <Plus size={14} /> Tambah Modul
        </button>
      </div>

      {/* Form Tambah / Edit dengan Animasi */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -15 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -15 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="bg-white rounded-2xl p-4 border-2 border-[#E1EAD8] shadow-md overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-black text-sm text-[#4A5043]">
                {editingModule ? "Edit Modul" : "Tambah Modul Baru"}
              </h4>
              <button onClick={resetForm} className="text-[#6B705C]">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-black text-[#6B705C] uppercase block mb-1">
                  Judul Modul
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full bg-[#F5F7F2] border border-[#DDE2D8] rounded-xl py-2 px-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#8DAA7B]"
                  placeholder="Contoh: Mengenal Warna"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-[#6B705C] uppercase block mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full bg-[#F5F7F2] border border-[#DDE2D8] rounded-xl py-2 px-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#8DAA7B] min-h-[60px]"
                  placeholder="Deskripsi singkat modul..."
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-[#6B705C] uppercase block mb-1">
                    Urutan
                  </label>
                  <input
                    type="number"
                    value={formData.orderNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        orderNumber: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full bg-[#F5F7F2] border border-[#DDE2D8] rounded-xl py-2 px-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#8DAA7B]"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#6B705C] uppercase block mb-1">
                    Bobot
                  </label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        weight: parseInt(e.target.value) || 100,
                      })
                    }
                    className="w-full bg-[#F5F7F2] border border-[#DDE2D8] rounded-xl py-2 px-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#8DAA7B]"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className="flex-1 py-2 bg-gray-200 text-[#4A5043] rounded-xl font-bold text-xs disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 bg-[#8DAA7B] hover:bg-[#7a9969] text-white rounded-xl font-bold text-xs disabled:opacity-70 flex items-center justify-center gap-2 transition-all"
                >
                  {isSubmitting
                    ? "Menyimpan..."
                    : editingModule
                      ? "Simpan Perubahan"
                      : "Buat Modul"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daftar Modul dengan Animasi Masuk */}
      <div className="space-y-2.5">
        {modules.length === 0 && (
          <div className="bg-white rounded-2xl p-6 text-center border border-[#E1EAD8]">
            <p className="text-sm text-[#6B705C]">
              Belum ada modul di level ini.
            </p>
          </div>
        )}

        <AnimatePresence>
          {modules.map((m, index) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{
                duration: 0.25,
                delay: Math.min(index * 0.04, 0.3),
              }}
              className="bg-white p-3.5 rounded-2xl border border-[#DDE2D8] shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-sm text-[#2D332D] block">
                    {m.title}
                  </span>
                  <p className="text-[10px] text-[#6B705C] font-medium mt-0.5 line-clamp-2">
                    {m.description}
                  </p>
                  <p className="text-[9px] text-[#8DAA7B] font-bold mt-1">
                    Urutan {m.orderNumber} · Bobot {m.weight} ·{" "}
                    {m.questions?.length || 0} Soal
                  </p>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => onManageQuestions(m.id)}
                    className="px-2.5 py-1 bg-[#8DAA7B]/10 text-[#4A5043] rounded-lg text-[9px] font-bold flex items-center gap-1 hover:bg-[#8DAA7B]/20"
                  >
                    <ClipboardList size={11} /> Soal
                  </button>

                  <button
                    onClick={() => handleOpenEditForm(m)}
                    className="p-1.5 text-[#6B705C] hover:bg-[#E1EAD8] rounded-lg"
                  >
                    <Edit2 size={14} />
                  </button>

                  <button
                    onClick={() => onDeleteModule(m.id, m.title)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}