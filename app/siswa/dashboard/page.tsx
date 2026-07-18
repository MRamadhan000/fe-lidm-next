"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Loader2,
  GraduationCap,
  LogOut,
  BookOpenText,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface StudentClassItem {
  id: string;
  class: {
    id: string;
    name: string;
    period: string;
  };
}

export default function DashboardSiswaPage() {
  const [classes, setClasses] = useState<StudentClassItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studentName, setStudentName] = useState("Teman");
  const router = useRouter();

  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (!session) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(session);
    setStudentName(userData.username);

    const fetchClasses = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/classes/student/${userData.id}`,
        );
        const data = await res.json();
        setClasses(data);
      } catch (error) {
        console.error("Gagal mengambil data kelas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user_session");
    router.push("/login");
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#8DAA7B] w-8 h-8" />
      </div>
    );
  return (
    <main className="min-h-screen bg-[#FDFBF7] p-4 sm:p-6 lg:p-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-8 sm:space-y-12">
        {/* Header Dashboard */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-2xl sm:text-3xl font-black text-[#2D332D]">
              Halo, {studentName}! 👋
            </h1>
            <p className="text-xs sm:text-sm font-bold text-[#8DAA7B] mt-1 flex items-center gap-2">
              <Sparkles size={16} /> Siap untuk petualangan belajar hari ini?
            </p>
          </motion.div>

          <button
            onClick={handleLogout}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white rounded-full border-2 border-[#DDE2D8] text-[#6B705C] hover:text-rose-500 hover:border-rose-200 transition-all font-bold"
          >
            <LogOut size={16} /> Keluar
          </button>
        </div>

        {/* List Kelas - Menggunakan Grid Responsif */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {classes.length > 0 ? (
            classes.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }} // Sedikit dikurangi agar tidak terlalu agresif di layar kecil
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(`/siswa/dashboard/${item.class.id}`)}
                className="bg-white p-5 sm:p-6 rounded-[2rem] border-4 border-[#F0F2ED] flex items-center gap-4 sm:gap-5 text-left hover:border-[#A3C49B] transition-all shadow-[0_6px_0_0_#EBEFDD] group"
              >
                <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-[#F5F7F2] flex items-center justify-center group-hover:bg-[#8DAA7B] transition-colors">
                  <BookOpenText className="text-[#8DAA7B] group-hover:text-white transition-colors w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div className="min-w-0">
                  {" "}
                  {/* Mencegah teks meluap */}
                  <h3 className="font-black text-base sm:text-lg text-[#2D332D] group-hover:text-[#8DAA7B] truncate">
                    {item.class.name}
                  </h3>
                  <span className="text-[10px] sm:text-[11px] font-black text-[#A5A58D] bg-[#F5F7F2] px-3 py-1 rounded-full uppercase tracking-wider inline-block mt-1">
                    Periode {item.class.period}
                  </span>
                </div>
              </motion.button>
            ))
          ) : (
            <div className="col-span-full text-center py-16 sm:py-20 bg-white rounded-[2rem] border-2 border-dashed border-[#DDE2D8] px-4">
              <p className="text-[#6B705C] font-bold text-sm sm:text-base">
                Belum ada kelas yang terdaftar, tetap semangat ya! 🌟
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
