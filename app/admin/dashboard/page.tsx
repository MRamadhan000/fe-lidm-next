"use client";

import React, { useState } from "react";
import {
  BarChart3,
  BookOpen,
  UserCheck,
  GraduationCap,
  Layers,
  ClipboardList,
  Users,
  Award,
  TrendingUp,
  LogOut,
} from "lucide-react";

import AdminTabSiswa from "@/components/admin/AdminTabSiswa";
import AdminTabAkunGuru from "@/components/admin/AdminTabGuru";
import AdminTabKelas from "@/components/admin/AdminTabKelas";
import AdminTabModulBelajar from "@/components/admin/AdminTabModulBelajar";

type AdminTab =
  | "dashboard"
  | "modules"
  | "teachers"
  | "students"
  | "classes"
  | "logs";

// === TAB LIST ===
const tabList: {
  id: AdminTab;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: "dashboard", label: "Utama", icon: <BarChart3 size={14} /> },
  { id: "modules", label: "Modul", icon: <BookOpen size={14} /> },
  { id: "teachers", label: "Guru", icon: <UserCheck size={14} /> },
  { id: "students", label: "Siswa", icon: <GraduationCap size={14} /> },
  { id: "classes", label: "Kelas", icon: <Layers size={14} /> },
  { id: "logs", label: "Log", icon: <ClipboardList size={14} /> },
];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  const [students] = useState([
    { id: "s1", name: "Aurelia Putri", points: 2450, completedGames: 18 },
    { id: "s2", name: "Dika Wijaya", points: 1890, completedGames: 14 },
    { id: "s3", name: "Siti Aisyah", points: 3120, completedGames: 22 },
  ]);

  const totalStudents = students.length;
  const totalTeachers = 2;
  const totalModules = 5;
  const totalClasses = 2;
  const averagePoints =
    totalStudents > 0
      ? Math.round(
          students.reduce((acc, curr) => acc + curr.points, 0) / totalStudents
        )
      : 0;
  const totalGamesCompleted = students.reduce(
    (acc, curr) => acc + curr.completedGames,
    0
  );

  const dummyLogs = [
    {
      id: "1",
      time: "11:24",
      user: "Ibu Ningsih (Guru)",
      action: "Mengubah konfigurasi belajar Aurelia ke Kecepatan Lambat",
      badge: "Konfigurasi",
      badgeColor: "bg-emerald-100 text-emerald-800",
    },
    {
      id: "2",
      time: "11:20",
      user: "Dika Wijaya (Siswa)",
      action: "Menyelesaikan Game Tebak Warna dengan poin sempurna",
      badge: "Permainan",
      badgeColor: "bg-amber-100 text-amber-800",
    },
    {
      id: "3",
      time: "11:15",
      user: "Ibu Ningsih (Guru)",
      action: 'Mengirimkan sticker "Super Bintang" ke Dika Wijaya',
      badge: "Penghargaan",
      badgeColor: "bg-purple-100 text-purple-800",
    },
  ];

  const activeLabel = tabList.find((t) => t.id === activeTab)?.label ?? "Utama";

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#F5F7F2] select-none font-sans overflow-hidden">
      {/* ========== DESKTOP SIDEBAR ========== */}
      <aside className="hidden md:flex md:flex-col md:h-screen md:w-60 lg:w-64 xl:w-72 shrink-0 bg-[#8DAA7B] border-r-4 border-[#4A5043] text-white">
        <div className="p-5 lg:p-6 border-b border-white/15">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl lg:text-3xl bg-white/20 p-1.5 rounded-2xl shadow-inner shrink-0">
              🛡️
            </span>
            <div className="min-w-0">
              <h2 className="font-display font-black text-sm tracking-tight leading-none truncate">
                ADMIN PORTAL UTAMA
              </h2>
              <span className="text-[10px] text-[#E1EAD8] font-bold block mt-1 leading-snug">
                Sistem Pusat EduGrahita (Natural Tones)
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {tabList.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-white text-[#4A5043] shadow-sm"
                  : "text-white/90 hover:bg-white/15"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/15">
          <button
            onClick={() => alert("Logout berhasil! (mode demo)")}
            className="w-full flex items-center justify-center gap-1.5 text-[11px] font-black uppercase tracking-wider bg-[#4A5043] hover:bg-[#3d4237] px-3.5 py-2.5 rounded-full border border-white/10 shadow-sm transition-all cursor-pointer text-white"
          >
            <LogOut size={13} />
            Logout
          </button>
        </div>
      </aside>

      {/* ========== MOBILE TOP BANNER ========== */}
      <div className="md:hidden bg-[#8DAA7B] p-4 pb-5 rounded-b-[32px] text-white shadow-md shrink-0 border-b-4 border-[#4A5043]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-3xl bg-white/20 p-1.5 rounded-2xl shadow-inner shrink-0">
              🛡️
            </span>
            <div className="min-w-0">
              <h2 className="font-display font-black text-sm tracking-tight leading-none truncate">
                ADMIN PORTAL UTAMA
              </h2>
              <span className="text-[10px] text-[#E1EAD8] font-bold block mt-1 truncate">
                Sistem Pusat EduGrahita (Natural Tones)
              </span>
            </div>
          </div>
          <button
            onClick={() => alert("Logout berhasil! (mode demo)")}
            className="text-[10px] font-black uppercase tracking-wider bg-[#4A5043] hover:bg-[#3d4237] px-3.5 py-1.5 rounded-full border border-white/10 shadow-sm transition-all cursor-pointer text-white shrink-0"
          >
            Logout
          </button>
        </div>
      </div>

      {/* ========== RIGHT COLUMN (desktop header + content) ========== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Desktop page header bar */}
        <div className="hidden md:flex items-center justify-between bg-white border-b border-[#DDE2D8] px-5 lg:px-8 py-3.5 shrink-0">
          <div>
            <p className="text-[11px] font-bold text-[#8DAA7B] uppercase tracking-wider">
              EduGrahita
            </p>
            <h1 className="text-lg font-black text-[#4A5043] leading-tight">
              {activeLabel}
            </h1>
          </div>
        </div>

        {/* ========== MAIN CONTENT ========== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 bg-[#F5F7F2]/40">
          <div className="max-w-7xl mx-auto w-full">
            {/* TAB: DASHBOARD */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <div className="md:hidden">
                  <h1 className="text-2xl font-black text-[#4A5043] mb-1">
                    Selamat Datang, Admin!
                  </h1>
                  <p className="text-[#6B705C] text-sm">
                    Ringkasan aktivitas EduGrahita hari ini
                  </p>
                </div>
                <div className="hidden md:block">
                  <p className="text-[#6B705C] text-sm">
                    Ringkasan aktivitas EduGrahita hari ini
                  </p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                  {[
                    { icon: <Users size={20} />, label: "Total Siswa", value: totalStudents },
                    { icon: <UserCheck size={20} />, label: "Total Guru", value: totalTeachers },
                    { icon: <BookOpen size={20} />, label: "Modul Aktif", value: totalModules },
                    { icon: <Layers size={20} />, label: "Kelas SLB", value: totalClasses },
                    { icon: <Award size={20} />, label: "Rata-rata Poin", value: averagePoints },
                    { icon: <TrendingUp size={20} />, label: "Game Selesai", value: totalGamesCompleted },
                  ].map((stat, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border border-[#E1EAD8]"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="p-2 bg-[#E1EAD8] rounded-xl text-[#8DAA7B] shrink-0">
                          {stat.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xl sm:text-2xl font-black text-[#4A5043] truncate">
                            {stat.value}
                          </div>
                          <div className="text-[11px] sm:text-xs text-[#6B705C] truncate">
                            {stat.label}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#E1EAD8]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-[#4A5043]">Aktivitas Terbaru</h3>
                    <button
                      onClick={() => setActiveTab("logs")}
                      className="text-xs text-[#8DAA7B] hover:underline font-bold shrink-0"
                    >
                      Lihat Semua Log →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {dummyLogs.map((log, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-3 bg-[#F5F7F2] rounded-xl"
                      >
                        <div className="flex items-center justify-between sm:contents">
                          <div className="text-xs text-[#6B705C] sm:w-12 shrink-0 sm:pt-0.5">
                            {log.time}
                          </div>
                          <span
                            className={`sm:hidden text-[10px] px-2.5 py-0.5 rounded-full font-bold ${log.badgeColor}`}
                          >
                            {log.badge}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-[#4A5043]">{log.user}</div>
                          <div className="text-sm text-[#6B705C]">{log.action}</div>
                        </div>
                        <span
                          className={`hidden sm:inline-block text-[10px] px-2.5 py-0.5 rounded-full font-bold shrink-0 ${log.badgeColor}`}
                        >
                          {log.badge}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: MODUL BELAJAR */}
            {activeTab === "modules" && (
              <AdminTabModulBelajar
                onPushSystemLog={(user, action, badge, badgeColor) => {
                  console.log("Log modul belajar:", { user, action, badge, badgeColor });
                }}
              />
            )}

            {/* TAB: AKUN GURU */}
            {activeTab === "teachers" && (
              <AdminTabAkunGuru
                onPushSystemLog={(user, action, badge, badgeColor) => {
                  console.log("Log ditambahkan:", { user, action, badge, badgeColor });
                }}
              />
            )}

            {/* TAB: AKUN SISWA */}
            {activeTab === "students" && (
              <div className="h-full">
                <AdminTabSiswa
                  onPushSystemLog={(user, action, badge, badgeColor) => {
                    console.log("Log baru:", { user, action, badge, badgeColor });
                  }}
                />
              </div>
            )}

            {/* TAB: KELAS SLB */}
            {activeTab === "classes" && (
              <div className="h-full">
                <AdminTabKelas
                  onPushSystemLog={(user, action, badge, badgeColor) => {
                    console.log("Log baru:", { user, action, badge, badgeColor });
                  }}
                />
              </div>
            )}

            {/* TAB: LOG AUDIT */}
            {activeTab === "logs" && (
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-[#E1EAD8]">
                <div className="flex items-center gap-3 mb-5">
                  <ClipboardList className="text-[#8DAA7B]" size={22} />
                  <h3 className="font-black text-lg sm:text-xl text-[#4A5043]">
                    Log Audit Sistem
                  </h3>
                </div>
                <div className="space-y-3">
                  {dummyLogs.map((log, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 p-3.5 sm:p-4 bg-[#F5F7F2] rounded-2xl"
                    >
                      <div className="flex items-center justify-between sm:contents">
                        <div className="text-xs font-mono text-[#6B705C] sm:w-14 sm:pt-1">
                          {log.time}
                        </div>
                        <span
                          className={`sm:hidden px-3 py-1 text-xs font-bold rounded-full ${log.badgeColor}`}
                        >
                          {log.badge}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[#4A5043]">{log.user}</div>
                        <div className="text-[#6B705C] text-sm mt-0.5">{log.action}</div>
                      </div>
                      <span
                        className={`hidden sm:inline-block px-3 py-1 text-xs font-bold rounded-full shrink-0 ${log.badgeColor}`}
                      >
                        {log.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========== MOBILE BOTTOM NAVIGATION ========== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#DDE2D8] z-50 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center py-1.5 px-1">
          {tabList.map((tab) => {
            const isActive = activeTab === tab.id;
            const isUtama = tab.id === "dashboard";

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center px-1 py-1 rounded-xl transition-all min-w-[52px] relative ${
                  isActive ? "text-[#8DAA7B]" : "text-[#6B705C]"
                }`}
              >
                {/* Special styling for "Utama" tab - lifted up + more prominent */}
                <div
                  className={`
                    flex items-center justify-center transition-all
                    ${isUtama ? "-mt-2 scale-110" : ""}
                    ${isActive && isUtama ? "drop-shadow-md" : ""}
                  `}
                >
                  <div
                    className={`
                      p-1.5 rounded-full transition-all
                      ${isUtama && isActive ? "bg-[#E1EAD8]" : ""}
                    `}
                  >
                    {React.cloneElement(tab.icon as React.ReactElement, {
                      // size: isUtama ? 20 : 17
                    })}
                  </div>
                </div>

                <span
                  className={`
                    text-[8.5px] font-bold tracking-tight mt-0.5
                    ${isUtama ? "font-black" : ""}
                  `}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}