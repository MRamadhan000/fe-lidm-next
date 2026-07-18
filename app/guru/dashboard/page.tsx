"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  BookOpen,
  TrendingUp,
  Award,
  Clock,
  AlertTriangle,
  BarChart3,
  Target,
  LogOut,
  ChevronLeft,
  RefreshCw,
  X,
  Eye,
} from "lucide-react";

// ==================== TYPES ====================
interface StudentInClass {
  id: string;
  student: {
    id: string;
    fullName: string;
    username: string;
  };
}

interface ClassLevel {
  id: string;
  level: {
    id: string;
    name: string;
    description?: string;
    orderNumber: number;
  };
  isLocked: boolean;
}

interface ClassItem {
  id: string;
  teacher_id: string;
  name: string;
  period: string;
  created_at: string;
  updated_at: string;
  teacher?: any;
  students?: StudentInClass[];
  classLevels?: ClassLevel[];
}

interface BottleneckItem {
  itemId: string;
  name: string;
  moduleTitle: string;
  classLevelName: string;
  avgScore: number;
  avgTimeSpentMinutes: number;
  attempts: number;
}

interface PerformanceTrendItem {
  classLevelId: string;
  classLevelName: string;
  orderNumber: number;
  averageScore: number;
  completedItems: number;
}

interface GeneralStatsResponse {
  class: {
    id: string;
    name: string;
    period: string;
  };
  generalStats: {
    totalStudents: number;
    completionRate: number;
    completionRateLabel: string;
    classMastery: {
      masteryCount: number;
      developingCount: number;
      needsImprovementCount: number;
      masteryPercentage: number;
      developingPercentage: number;
      needsImprovementPercentage: number;
      averageScore: number;
    };
    averageVelocityMinutes: number;
    averageVelocityLabel: string;
    engagementFunnel: {
      notStarted: number;
      inProgress: number;
      completed: number;
    };
    topBottleneckItems: BottleneckItem[];
  };
  performanceTrend: PerformanceTrendItem[];
}

interface Teacher {
  id: string;
  fullName: string;
  username: string;
  email?: string;
}

// ==================== MAIN COMPONENT ====================
export default function TeacherDashboardPage() {
  const router = useRouter();

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [stats, setStats] = useState<GeneralStatsResponse | null>(null);
  const [selectedClassForModal, setSelectedClassForModal] = useState<ClassItem | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==================== FETCH FUNCTIONS ====================
  const fetchClasses = async (teacherId: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/classes/teacher/${teacherId}`
    );
    
    if (!res.ok) throw new Error("Gagal mengambil daftar kelas");
    
    const data: ClassItem[] = await res.json();
    setClasses(data);
  };

  const fetchClassStatistics = async (classId: string) => {
    setIsLoadingStats(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/student-assessments/classes/${classId}/statistics/general`
      );
      
      if (!res.ok) throw new Error("Gagal mengambil statistik kelas");
      
      const data: GeneralStatsResponse = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Error fetch statistics:", err);
      setError("Gagal memuat statistik kelas. Silakan coba lagi.");
    } finally {
      setIsLoadingStats(false);
    }
  };

  // ==================== INITIAL LOAD ====================
  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const sessionStr = localStorage.getItem("teacher_session");

        if (!sessionStr) {
          setError("Sesi tidak ditemukan. Silakan login kembali.");
          setIsLoading(false);
          return;
        }

        const teacherData: Teacher = JSON.parse(sessionStr);
        
        if (!teacherData?.id) {
          setError("Data guru tidak valid. Silakan login kembali.");
          setIsLoading(false);
          return;
        }

        setTeacher(teacherData);
        await fetchClasses(teacherData.id);

      } catch (err: any) {
        console.error(err);
        setError("Terjadi kesalahan saat memuat dashboard.");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      fetchClassStatistics(selectedClassId);
    } else {
      setStats(null);
    }
  }, [selectedClassId]);

  // ==================== HANDLERS ====================
  const handleOpenClassModal = (kelas: ClassItem) => {
    setSelectedClassForModal(kelas);
  };

  const handleCloseModal = () => {
    setSelectedClassForModal(null);
  };

  const handleViewStatistics = (classId: string) => {
    setSelectedClassId(classId);
    handleCloseModal();
    
    setTimeout(() => {
      document.getElementById("stats-section")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 300);
  };

  // Navigate to student detail page with classId and studentId
  const handleStudentDetail = (classId: string, studentId: string) => {
    console.log(`Navigating to student detail for classId: ${classId}, studentId: ${studentId}`);
    handleCloseModal();
    router.push(`/guru/dashboard/${classId}/${studentId}`);
  };

  const handleBackToClasses = () => {
    setSelectedClassId(null);
    setStats(null);
    setError(null);
  };

  const handleRetry = () => window.location.reload();

  const handleLogout = () => {
    localStorage.removeItem("teacher_session");
    alert("Logout berhasil!");
  };

  const getMasteryColor = (type: string) => {
    if (type.includes("mastery")) return "bg-emerald-500";
    if (type.includes("developing")) return "bg-amber-500";
    return "bg-rose-500";
  };

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  // ==================== LOADING STATE ====================
  if (isLoading) {
    return (
      <div className="flex-1 bg-[#F5F7F2] flex flex-col h-full items-center justify-center">
        <div className="text-center">
          <div className="w-11 h-11 border-4 border-[#8DAA7B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#6B705C] font-bold text-sm">Memuat dashboard guru...</p>
        </div>
      </div>
    );
  }

  // ==================== ERROR STATE ====================
  if (error && !teacher) {
    return (
      <div className="flex-1 bg-[#F5F7F2] flex flex-col h-full items-center justify-center p-5">
        <div className="bg-white rounded-2xl p-7 max-w-sm text-center shadow-sm border border-[#E1EAD8]">
          <AlertTriangle className="mx-auto text-rose-500 mb-3" size={42} />
          <h3 className="font-black text-xl text-[#4A5043] mb-2">Sesi Tidak Valid</h3>
          <p className="text-[#6B705C] text-sm mb-5">{error}</p>
          <button
            onClick={handleRetry}
            className="flex items-center justify-center gap-2 mx-auto bg-[#8DAA7B] hover:bg-[#7a9a6b] text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            <RefreshCw size={16} /> Login Ulang
          </button>
        </div>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================
  return (
    <div className="flex-1 bg-[#F5F7F2] flex flex-col h-full select-none font-sans overflow-hidden">
      
      {/* ========== TOP BANNER ========== */}
      <div className="bg-[#8DAA7B] px-4 py-4 rounded-b-3xl text-white shadow-md shrink-0 border-b-4 border-[#4A5043]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl bg-white/20 p-2 rounded-2xl">👩‍🏫</div>
            <div>
              <h2 className="font-black text-lg tracking-tight">DASHBOARD GURU</h2>
              <span className="text-[10px] text-[#E1EAD8] font-bold">EduGrahita • SLB</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {teacher && (
              <div className="hidden md:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-2xl border border-white/20 text-sm">
                <div className="w-7 h-7 bg-white/30 rounded-full flex items-center justify-center text-xs font-bold">
                  {teacher.fullName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <span className="font-bold text-white">{teacher.fullName}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-black bg-[#4A5043] hover:bg-[#3d4237] px-3.5 py-2 rounded-full transition-all"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 md:pb-8 bg-[#F5F7F2]/40">
        
        {/* Greeting */}
        {teacher && (
          <div className="mb-5">
            <h1 className="text-2xl font-black text-[#4A5043]">
              Halo, {teacher.fullName.split(" ")[0]}! 👋
            </h1>
            <p className="text-[#6B705C] text-sm mt-0.5">Pantau perkembangan siswa dan kelas kamu</p>
          </div>
        )}

        {/* ========== QUICK STATS ========== */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E1EAD8]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#E1EAD8] rounded-xl text-[#8DAA7B]">
                <Users size={20} />
              </div>
              <div>
                <div className="text-2xl font-black text-[#4A5043]">{classes.length}</div>
                <div className="text-xs text-[#6B705C]">Kelas yang Diampu</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E1EAD8]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#E1EAD8] rounded-xl text-[#8DAA7B]">
                <BookOpen size={20} />
              </div>
              <div>
                <div className="text-2xl font-black text-[#4A5043]">
                  {classes.length > 0 ? classes.length * 6 : "—"}
                </div>
                <div className="text-xs text-[#6B705C]">Estimasi Modul</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E1EAD8] col-span-2 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#E1EAD8] rounded-xl text-[#8DAA7B]">
                <TrendingUp size={20} />
              </div>
              <div>
                <div className="text-2xl font-black text-[#4A5043]">—</div>
                <div className="text-xs text-[#6B705C]">Rata-rata Penyelesaian</div>
              </div>
            </div>
          </div>
        </div>

        {/* ========== DAFTAR KELAS ========== */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-black text-xl text-[#4A5043]">Kelas Saya</h3>
            <p className="text-sm text-[#6B705C]">Klik kelas untuk melihat siswa & level</p>
          </div>
          {selectedClassId && (
            <button onClick={handleBackToClasses} className="text-sm font-bold text-[#8DAA7B] flex items-center gap-1">
              <ChevronLeft size={16} /> Kembali ke Daftar Kelas
            </button>
          )}
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Class Cards */}
        {classes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-7">
            {classes.map((kelas) => (
              <button
                key={kelas.id}
                onClick={() => handleOpenClassModal(kelas)}
                className="text-left bg-white rounded-2xl p-4 shadow-sm border border-[#E1EAD8] hover:border-[#8DAA7B]/40 transition-all active:scale-[0.985]"
              >
                <div className="font-black text-lg text-[#4A5043] leading-tight">{kelas.name}</div>
                <div className="text-xs text-[#6B705C] mt-0.5">Periode {kelas.period}</div>
                
                <div className="mt-3 flex items-center gap-4 text-xs text-[#6B705C]">
                  <div className="flex items-center gap-1">
                    <Users size={14} /> {kelas.students?.length || 0} siswa
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen size={14} /> {kelas.classLevels?.length || 0} level
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 text-center border border-[#E1EAD8] mb-6">
            <BookOpen className="mx-auto text-[#8DAA7B] mb-2" size={36} />
            <p className="font-bold text-[#4A5043]">Belum Ada Kelas</p>
            <p className="text-sm text-[#6B705C] mt-1">Kamu belum ditugaskan mengajar kelas apapun.</p>
          </div>
        )}

        {/* ========== STATISTIK KELAS DETAIL ========== */}
        {selectedClassId && stats && (
          <div id="stats-section" className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="text-[#8DAA7B]" size={24} />
                <div>
                  <h3 className="font-black text-2xl text-[#4A5043]">Statistik Kelas</h3>
                  <p className="text-sm text-[#6B705C]">{stats.class.name} • {stats.class.period}</p>
                </div>
              </div>
              <button onClick={handleBackToClasses} className="text-sm font-bold px-4 py-2 bg-white border border-[#E1EAD8] rounded-2xl text-[#6B705C]">
                Tutup
              </button>
            </div>

            {isLoadingStats ? (
              <div className="bg-white rounded-2xl p-8 text-center">
                <div className="w-8 h-8 border-4 border-[#8DAA7B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-[#6B705C] text-sm">Memuat statistik kelas...</p>
              </div>
            ) : (
              <>
                {/* Overview Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E1EAD8]">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs text-[#6B705C] font-bold">TOTAL SISWA</div>
                        <div className="text-3xl font-black text-[#4A5043] mt-0.5">{stats.generalStats.totalStudents}</div>
                      </div>
                      <Users className="text-[#8DAA7B]" size={26} />
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E1EAD8]">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs text-[#6B705C] font-bold">COMPLETION RATE</div>
                        <div className="text-3xl font-black text-[#4A5043] mt-0.5">{stats.generalStats.completionRateLabel}</div>
                      </div>
                      <TrendingUp className="text-[#8DAA7B]" size={26} />
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E1EAD8]">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs text-[#6B705C] font-bold">RATA-RATA SKOR</div>
                        <div className="text-3xl font-black text-[#4A5043] mt-0.5">{stats.generalStats.classMastery.averageScore}</div>
                      </div>
                      <Award className="text-[#8DAA7B]" size={26} />
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E1EAD8]">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs text-[#6B705C] font-bold">RATA-RATA WAKTU</div>
                        <div className="text-2xl font-black text-[#4A5043] mt-0.5 leading-none">{stats.generalStats.averageVelocityLabel}</div>
                      </div>
                      <Clock className="text-[#8DAA7B]" size={26} />
                    </div>
                  </div>
                </div>

                {/* MASTERY + ENGAGEMENT */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E1EAD8]">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 className="text-[#8DAA7B]" size={20} />
                      <h4 className="font-black text-lg text-[#4A5043]">Class Mastery</h4>
                    </div>
                    <div className="space-y-3.5">
                      {[
                        { label: "Mastery", value: stats.generalStats.classMastery.masteryPercentage, count: stats.generalStats.classMastery.masteryCount },
                        { label: "Developing", value: stats.generalStats.classMastery.developingPercentage, count: stats.generalStats.classMastery.developingCount },
                        { label: "Needs Improvement", value: stats.generalStats.classMastery.needsImprovementPercentage, count: stats.generalStats.classMastery.needsImprovementCount },
                      ].map((item, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="font-bold text-[#4A5043]">{item.label}</span>
                            <span className="font-mono text-[#6B705C]">{item.value}% ({item.count})</span>
                          </div>
                          <div className="h-2.5 bg-[#E1EAD8] rounded-full overflow-hidden">
                            <div className={`h-2.5 rounded-full ${getMasteryColor(item.label)}`} style={{ width: `${item.value}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E1EAD8]">
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="text-[#8DAA7B]" size={20} />
                      <h4 className="font-black text-lg text-[#4A5043]">Engagement Funnel</h4>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: "Not Started", value: stats.generalStats.engagementFunnel.notStarted, color: "bg-slate-400" },
                        { label: "In Progress", value: stats.generalStats.engagementFunnel.inProgress, color: "bg-amber-500" },
                        { label: "Completed", value: stats.generalStats.engagementFunnel.completed, color: "bg-emerald-500" },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-24 text-sm font-bold text-[#4A5043]">{item.label}</div>
                          <div className="flex-1 h-3 bg-[#E1EAD8] rounded-full overflow-hidden">
                            <div className={`h-3 rounded-full ${item.color}`} style={{ width: `${Math.max(item.value * 18, 8)}%` }} />
                          </div>
                          <div className="w-6 text-right font-mono text-sm font-bold text-[#4A5043]">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* TOP BOTTLENECK */}
                {stats.generalStats.topBottleneckItems.length > 0 && (
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E1EAD8]">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle className="text-rose-500" size={20} />
                      <h4 className="font-black text-lg text-[#4A5043]">Top Bottleneck Items</h4>
                    </div>
                    <div className="space-y-2.5">
                      {stats.generalStats.topBottleneckItems.map((item, index) => (
                        <div key={index} className="bg-[#F5F7F2] rounded-xl p-4 text-sm">
                          <div className="font-bold text-[#4A5043]">{item.name}</div>
                          <div className="text-xs text-[#6B705C] mt-0.5">{item.moduleTitle} • {item.classLevelName}</div>
                          <div className="text-rose-600 text-xs mt-1 font-medium">Skor rata-rata: {item.avgScore} • {item.attempts} percobaan</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* PERFORMANCE TREND */}
                {stats.performanceTrend.length > 0 && (
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E1EAD8]">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="text-[#8DAA7B]" size={20} />
                      <h4 className="font-black text-lg text-[#4A5043]">Performance Trend per Level</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {stats.performanceTrend.map((level, index) => (
                        <div key={index} className="bg-[#F5F7F2] rounded-xl p-4 flex justify-between items-center">
                          <div>
                            <div className="font-bold text-[#4A5043]">{level.classLevelName}</div>
                            <div className="text-xs text-[#6B705C]">Level {level.orderNumber}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-black text-2xl text-[#4A5043]">{level.averageScore}</div>
                            <div className="text-xs text-[#6B705C]">{level.completedItems} selesai</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ========== MODAL: Detail Kelas (Siswa + Level) ========== */}
      {selectedClassForModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl shadow-xl max-h-[85vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="font-black text-xl text-[#4A5043]">{selectedClassForModal.name}</h3>
                <p className="text-sm text-[#6B705C]">Periode {selectedClassForModal.period}</p>
              </div>
              <button onClick={handleCloseModal} className="p-2 text-[#6B705C]">
                <X size={22} />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              
              {/* Daftar Siswa */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="text-[#8DAA7B]" size={20} />
                  <h4 className="font-bold text-lg text-[#4A5043]">Daftar Siswa</h4>
                  <span className="text-xs bg-[#E1EAD8] text-[#6B705C] px-2 py-0.5 rounded-full font-bold">
                    {selectedClassForModal.students?.length || 0}
                  </span>
                </div>
                
                {selectedClassForModal.students && selectedClassForModal.students.length > 0 ? (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {selectedClassForModal.students.map((s, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between bg-[#F5F7F2] rounded-xl p-3 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-[#8DAA7B] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {s.student.fullName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-[#4A5043]">{s.student.fullName}</div>
                            <div className="text-xs text-[#6B705C]">@{s.student.username}</div>
                          </div>
                        </div>

                        {/* Detail Button */}
                        <button
                          onClick={() => handleStudentDetail(selectedClassForModal.id, s.student.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#8DAA7B] hover:bg-white rounded-xl transition-colors"
                        >
                          <Eye size={16} />
                          <span className="hidden sm:inline">Detail</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#6B705C] italic">Belum ada siswa di kelas ini.</p>
                )}
              </div>

              {/* Level yang Di-assign */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="text-[#8DAA7B]" size={20} />
                  <h4 className="font-bold text-lg text-[#4A5043]">Level yang Di-assign</h4>
                  <span className="text-xs bg-[#E1EAD8] text-[#6B705C] px-2 py-0.5 rounded-full font-bold">
                    {selectedClassForModal.classLevels?.length || 0}
                  </span>
                </div>

                {selectedClassForModal.classLevels && selectedClassForModal.classLevels.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedClassForModal.classLevels.map((cl, index) => (
                      <div key={index} className="flex items-center justify-between bg-[#F5F7F2] rounded-xl p-3">
                        <div>
                          <div className="font-bold text-[#4A5043]">{cl.level.name}</div>
                          <div className="text-xs text-[#6B705C]">{cl.level.description || "Level pembelajaran"}</div>
                        </div>
                        <div className={`text-xs px-2.5 py-1 rounded-full font-bold ${cl.isLocked ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                          {cl.isLocked ? "Terkunci" : "Terbuka"}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#6B705C] italic">Belum ada level yang di-assign.</p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-white rounded-b-3xl md:rounded-b-3xl">
              <button
                onClick={() => handleViewStatistics(selectedClassForModal.id)}
                className="w-full bg-[#8DAA7B] hover:bg-[#7a9a6b] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm transition-colors"
              >
                <BarChart3 size={18} /> Lihat Statistik & Performa Kelas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
