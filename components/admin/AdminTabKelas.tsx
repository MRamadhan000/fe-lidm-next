"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Plus,
  Trash2,
  X,
  Loader2,
  Users,
  Trophy,
  Lock,
  Unlock,
} from "lucide-react";
import { Class } from "@/types/class";

interface AdminTabKelasSLBProps {
  onPushSystemLog: (
    user: string,
    action: string,
    badge: string,
    badgeColor: string,
  ) => void;
}

export default function AdminTabKelasSLB({
  onPushSystemLog,
}: AdminTabKelasSLBProps) {
  const [classrooms, setClassrooms] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddClass, setShowAddClass] = useState(false);

  // Modal Siswa
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);

  // Modal Level
  const [selectedClassForLevel, setSelectedClassForLevel] =
    useState<Class | null>(null);
  const [showLevelModal, setShowLevelModal] = useState(false);

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
      setClassrooms(classrooms.filter((c) => c.id !== id));
      onPushSystemLog(
        "Administrator",
        `Menghapus kelas: ${name}`,
        "Penghapusan",
        "bg-rose-100 text-rose-800",
      );
    } catch (error) {
      alert("Gagal menghapus data");
    }
  };

  const openStudentDetail = (classroom: Class) => {
    setSelectedClass(classroom);
    setShowStudentModal(true);
  };

  const openLevelDetail = (classroom: Class) => {
    setSelectedClassForLevel(classroom);
    setShowLevelModal(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 font-sans text-[#2D332D]"
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black text-[#6B705C] uppercase tracking-wider block">
            Ruang & Kelas SLB Grahita
          </span>
          <span className="text-xs text-[#4A5043] font-semibold">
            Total: {classrooms.length} Kelas Aktif
          </span>
        </div>
        <button
          onClick={() => setShowAddClass(!showAddClass)}
          className="bg-[#8DAA7B] hover:bg-[#7a9969] text-white font-bold text-xs py-1.5 px-3 rounded-full flex items-center gap-1 cursor-pointer transition-all shadow-sm"
        >
          {showAddClass ? <X size={14} /> : <Plus size={14} />}{" "}
          {showAddClass ? "Batal" : "Tambah Kelas"}
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="animate-spin text-[#8DAA7B]" />
        </div>
      ) : (
        <div className="space-y-2.5">
          {classrooms.map((c) => (
            <div
              key={c.id}
              className="bg-white p-4 rounded-2xl border border-[#DDE2D8] shadow-sm flex items-center justify-between"
            >
              <div className="flex items-start gap-3">
                <span className="hidden sm:block text-3xl bg-[#F5F7F2] p-2 rounded-full border border-[#DDE2D8]">
                  🏫
                </span>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-[#2D332D]">
                      {c.name}
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase bg-amber-50 text-amber-800">
                      {c.period}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B705C] mt-1">
                    Wali:{" "}
                    <strong>{c.teacher?.fullName || "Belum diatur"}</strong>
                  </p>
                  <p className="text-[10px] text-[#8DAA7B] font-bold mt-0.5">
                    👥 {c.students?.length || 0} Siswa • 📊{" "}
                    {c.classLevels?.length || 0} Level
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openStudentDetail(c)}
                  className="p-3 text-[#8DAA7B] hover:bg-[#F5F7F2] rounded-xl transition-all active:scale-95"
                  title="Daftar Siswa"
                >
                  <Users size={18} />
                </button>
                <button
                  onClick={() => openLevelDetail(c)}
                  className="p-3 text-amber-600 hover:bg-amber-50 rounded-xl transition-all active:scale-95"
                  title="Detail Level"
                >
                  <Trophy size={18} />
                </button>
                <button
                  onClick={() => handleDeleteClass(c.id, c.name)}
                  className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-95"
                  title="Hapus"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= MODAL DAFTAR SISWA (SCROLL OPTIMIZED) ================= */}
      {showStudentModal && selectedClass && (
        <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b bg-[#F5F7F2] flex justify-between items-center sticky top-0 z-10">
              <div>
                <h3 className="font-bold text-lg">{selectedClass.name}</h3>
                <p className="text-sm text-[#6B705C]">
                  Daftar Siswa • {selectedClass.students?.length || 0} orang
                </p>
              </div>
              <button
                onClick={() => setShowStudentModal(false)}
                className="p-2 hover:bg-white rounded-full transition-all"
              >
                <X size={26} />
              </button>
            </div>

            {/* Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {(selectedClass.students?.length ?? 0) > 0 ? (
                selectedClass.students!.map((enr) => (
                  <div
                    key={enr.id}
                    className="flex gap-3 bg-[#F8FAF5] p-4 rounded-2xl border border-[#E5E9E0]"
                  >
                    <div className="w-11 h-11 bg-[#8DAA7B] text-white rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                      👨‍🎓
                    </div>
                    <div className="pt-1">
                      <p className="font-semibold text-[#2D332D]">
                        {enr.student?.fullName}
                      </p>
                      <p className="text-sm text-[#6B705C]">
                        @{enr.student?.username}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-12 text-[#6B705C]">
                  Belum ada siswa di kelas ini.
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t text-center">
              <button
                onClick={() => setShowStudentModal(false)}
                className="text-sm font-semibold text-[#6B705C] hover:text-[#2D332D]"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ================= MODAL DETAIL LEVEL ================= */}
      {showLevelModal && selectedClassForLevel && (
        <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
          >
            <div className="p-5 border-b bg-[#F5F7F2] flex justify-between items-center sticky top-0 z-10">
              <div>
                <h3 className="font-bold text-lg">
                  {selectedClassForLevel.name}
                </h3>
                <p className="text-sm text-[#6B705C]">Detail Level Kelas</p>
              </div>
              <button onClick={() => setShowLevelModal(false)} className="p-2">
                <X size={26} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {(selectedClassForLevel.classLevels?.length ?? 0) > 0 ? (
                selectedClassForLevel.classLevels!.map((cl) => (
                  <div
                    key={cl.id}
                    className={`p-5 rounded-3xl border ${cl.isLocked ? "border-gray-200 bg-gray-50" : "border-[#8DAA7B]/30 bg-white shadow-sm"}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#8DAA7B] text-white font-bold text-2xl flex items-center justify-center flex-shrink-0">
                        {cl.level.orderNumber}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-base">
                          {cl.level.name}
                        </div>
                        <p className="text-sm text-[#6B705C] mt-1">
                          {cl.level.description}
                        </p>
                      </div>
                      {cl.isLocked ? (
                        <Lock className="text-gray-400 mt-1" />
                      ) : (
                        <Unlock className="text-emerald-600 mt-1" />
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t flex justify-between items-center">
                      <div className="text-sm">
                        Bobot:{" "}
                        <span className="font-semibold">{cl.level.weight}</span>
                      </div>
                      <div
                        className={`px-4 py-1 text-xs font-medium rounded-full ${cl.isLocked ? "bg-gray-100 text-gray-500" : "bg-emerald-100 text-emerald-700"}`}
                      >
                        {cl.isLocked ? "🔒 Terkunci" : "✅ Terbuka"}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-12 text-[#6B705C]">
                  Belum ada level untuk kelas ini.
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
