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

// === TAB LIST (biar simpel & mudah di-maintain) ===
const tabList: {
  id: AdminTab;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: "dashboard", label: "Utama", icon: <BarChart3 size={14} /> },
  { id: "modules", label: "Modul Belajar", icon: <BookOpen size={14} /> },
  { id: "teachers", label: "Akun Guru", icon: <UserCheck size={14} /> },
  { id: "students", label: "Akun Siswa", icon: <GraduationCap size={14} /> },
  { id: "classes", label: "Kelas SLB", icon: <Layers size={14} /> },
  { id: "logs", label: "Log Audit", icon: <ClipboardList size={14} /> },
];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  // Dummy data lokal
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

  return (
    <div className="flex-1 bg-[#F5F7F2] flex flex-col h-full select-none font-sans overflow-hidden">
      {/* Top Admin Banner */}
      <div className="bg-[#8DAA7B] p-4 pb-5 rounded-b-[32px] text-white shadow-md shrink-0 border-b-4 border-[#4A5043]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl bg-white/20 p-1.5 rounded-2xl shadow-inner">
              🛡️
            </span>
            <div>
              <h2 className="font-display font-black text-sm tracking-tight leading-none">
                ADMIN PORTAL UTAMA
              </h2>
              <span className="text-[10px] text-[#E1EAD8] font-bold block mt-1">
                Sistem Pusat EduGrahita (Natural Tones)
              </span>
            </div>
          </div>
          <button
            onClick={() => alert("Logout berhasil! (mode demo)")}
            className="text-[10px] font-black uppercase tracking-wider bg-[#4A5043] hover:bg-[#3d4237] px-3.5 py-1.5 rounded-full border border-white/10 shadow-sm transition-all cursor-pointer text-white"
          >
            Logout
          </button>
        </div>
      </div>

      {/* HORIZONTALLY SCROLLABLE TABS - SEKARANG DILOOP BIAR SIMPEL */}
      <div className="bg-white border-b border-[#DDE2D8] py-2 flex gap-1 overflow-x-auto scrollbar-none shrink-0 px-3 select-none">
        {tabList.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? "bg-[#8DAA7B] text-white shadow-sm"
                : "text-[#6B705C] hover:bg-[#E1EAD8]/30"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-4 pb-12 bg-[#F5F7F2]/40">
        {/* TAB: DASHBOARD / UTAMA */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-[#4A5043] mb-1">
                Selamat Datang, Admin!
              </h1>
              <p className="text-[#6B705C] text-sm">
                Ringkasan aktivitas EduGrahita hari ini
              </p>
            </div>

            {/* Stat Cards - juga di-loop biar rapi */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { icon: <Users size={20} />, label: "Total Siswa", value: totalStudents },
                { icon: <UserCheck size={20} />, label: "Total Guru", value: totalTeachers },
                { icon: <BookOpen size={20} />, label: "Modul Aktif", value: totalModules },
                { icon: <Layers size={20} />, label: "Kelas SLB", value: totalClasses },
                { icon: <Award size={20} />, label: "Rata-rata Poin", value: averagePoints },
                { icon: <TrendingUp size={20} />, label: "Game Selesai", value: totalGamesCompleted },
              ].map((stat, index) => (
                <div key={index} className="bg-white rounded-2xl p-4 shadow-sm border border-[#E1EAD8]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#E1EAD8] rounded-xl text-[#8DAA7B]">
                      {stat.icon}
                    </div>
                    <div>
                      <div className="text-2xl font-black text-[#4A5043]">{stat.value}</div>
                      <div className="text-xs text-[#6B705C]">{stat.label}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E1EAD8]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#4A5043]">Aktivitas Terbaru</h3>
                <button
                  onClick={() => setActiveTab("logs")}
                  className="text-xs text-[#8DAA7B] hover:underline font-bold"
                >
                  Lihat Semua Log →
                </button>
              </div>
              <div className="space-y-3">
                {dummyLogs.map((log, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-[#F5F7F2] rounded-xl">
                    <div className="text-xs text-[#6B705C] w-12 shrink-0 pt-0.5">{log.time}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-[#4A5043]">{log.user}</div>
                      <div className="text-sm text-[#6B705C]">{log.action}</div>
                    </div>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${log.badgeColor}`}>
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
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E1EAD8]">
            <div className="flex items-center gap-3 mb-5">
              <ClipboardList className="text-[#8DAA7B]" size={22} />
              <h3 className="font-black text-xl text-[#4A5043]">Log Audit Sistem</h3>
            </div>

            <div className="space-y-3">
              {dummyLogs.map((log, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-[#F5F7F2] rounded-2xl">
                  <div className="text-xs font-mono text-[#6B705C] w-14 pt-1">{log.time}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-[#4A5043]">{log.user}</div>
                    <div className="text-[#6B705C] text-sm mt-0.5">{log.action}</div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${log.badgeColor}`}>
                    {log.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
