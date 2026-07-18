'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowLeft, Loader2, PlayCircle, Target, Trophy, User } from 'lucide-react';

interface StudentAnswer {
  id: string;
  uploadedImage: string;
  ssim: number;
  mse: number;
  isCorrect: boolean;
  score: number;
  answeredAt: string;
}

interface DetailItem {
  id: string;
  name: string;
  type: string;
  orderNumber: number;
  image: string;
  price: number;
  quantity: number;
  weight: number;
  answerCount: number;
  status: string;
  latestAnswer: StudentAnswer | null;
  answers: StudentAnswer[];
}

interface DetailQuestion {
  id: string;
  title: string;
  instruction: string;
  orderNumber: number;
  weight: number;
  answeredItems: number;
  completedItems: number;
  inProgressItems: number;
  notStartedItems: number;
  totalSubmissions: number;
  remainingItems: number;
  status: string;
  startedAt: string | null;
  items: DetailItem[];
}

interface SummaryNumbers {
  totalLevels: number;
  totalModules: number;
  completedModules: number;
  inProgressModules: number;
  notStartedModules: number;
  totalQuestions: number;
  completedQuestions: number;
  inProgressQuestions: number;
  notStartedQuestions: number;
  totalItems: number;
  answeredItems: number;
  completedItems: number;
  inProgressItems: number;
  notStartedItems: number;
  totalSubmissions: number;
  remainingItems: number;
}

interface LevelSummary extends Omit<SummaryNumbers, 'totalLevels'> {
  status: string;
}

interface ModuleSummary {
  totalQuestions: number;
  completedQuestions: number;
  inProgressQuestions: number;
  notStartedQuestions: number;
  totalItems: number;
  answeredItems: number;
  completedItems: number;
  inProgressItems: number;
  notStartedItems: number;
  totalSubmissions: number;
  remainingItems: number;
  status: string;
}

interface DetailModule {
  id: string;
  title: string;
  description: string;
  orderNumber: number;
  weight: number;
  summary: ModuleSummary;
  questions: DetailQuestion[];
}

interface DetailLevel {
  classLevelId: string;
  isLocked: boolean;
  unlockedAt: string | null;
  level: {
    id: string;
    name: string;
    description: string;
    orderNumber: number;
    weight: number;
  };
  summary: LevelSummary;
  modules: DetailModule[];
  questions: DetailQuestion[];
}

interface StudentDashboardDetailResponse {
  class: {
    id: string;
    name: string;
    period: string;
  };
  student: {
    id: string;
    username: string;
    email: string;
    fullName: string;
    role: string;
  };
  summary: SummaryNumbers;
  levels: DetailLevel[];
}

export default function DetailKelasSiswaPageCompact() {
  const params = useParams<{ slug: string | string[] }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const router = useRouter();

  const [data, setData] = useState<StudentDashboardDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startedQuestionIds, setStartedQuestionIds] = useState<string[]>([]);

  useEffect(() => {
    if (!slug) return;

    const session = localStorage.getItem('user_session');
    if (!session) {
      router.push('/login');
      return;
    }

    const { id: userId } = JSON.parse(session) as { id: string };

    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:3000/student-assessments/history?userId=${userId}&classId=${slug}`);
        if (!res.ok) throw new Error('Gagal mengambil detail kelas siswa');
        const result = (await res.json()) as StudentDashboardDetailResponse;
        setData(result);
      } catch (error) {
        console.error('Gagal load history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, [slug, router]);

  if (!slug) return <div className="text-center p-6 text-sm">ID kelas tidak valid.</div>;
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#8DAA7B] w-6 h-6" />
      </div>
    );
  }
  
  if (!data) return <div className="text-center p-6 text-sm">Data kelas tidak ditemukan.</div>;

  const levels = [...data.levels].sort((left, right) => left.level.orderNumber - right.level.orderNumber);

  const handleStartQuestion = (questionId: string) => {
    setStartedQuestionIds((prev) => (prev.includes(questionId) ? prev : [...prev, questionId]));
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] p-3 sm:p-4 md:p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-5">
        
        {/* Back Button - Lebih Kecil */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-2xl border border-[#DDE2D8] text-[#6B705C] text-sm font-bold hover:bg-[#F5F7F2]"
        >
          <ArrowLeft size={16} /> Kembali
        </button>

        {/* Header - Lebih Compact */}
        <div className="bg-gradient-to-br from-[#A3C49B] to-[#8DAA7B] p-5 sm:p-6 rounded-3xl text-white relative overflow-hidden">
          <h1 className="text-2xl sm:text-3xl font-black">{data.class.name}</h1>
          <p className="text-sm opacity-90 font-bold mt-0.5">Periode: {data.class.period}</p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
            <User size={13} /> {data.student.fullName} ({data.student.username})
          </div>
          <Trophy className="absolute -right-3 -bottom-3 text-white/20 w-24 h-24" />
        </div>

        {/* Summary Stats - Lebih Kecil & Rapat */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {[
            { label: 'Total Level', val: data.summary.totalLevels },
            { label: 'Total Modul', val: data.summary.totalModules },
            { label: 'Total Soal', val: data.summary.totalQuestions },
            { label: 'Soal Selesai', val: data.summary.completedQuestions },
            { label: 'Soal Progress', val: data.summary.inProgressQuestions },
            { label: 'Soal Belum', val: data.summary.notStartedQuestions },
            { label: 'Total Item', val: data.summary.totalItems },
            { label: 'Item Terjawab', val: data.summary.answeredItems },
            { label: 'Item Progress', val: data.summary.inProgressItems },
            { label: 'Item Belum', val: data.summary.notStartedItems },
            { label: 'Total Submit', val: data.summary.totalSubmissions },
            { label: 'Sisa Item', val: data.summary.remainingItems },
          ].map((item, i) => (
            <div key={i} className="bg-white p-3 rounded-2xl border border-[#E8ECE4] flex items-center gap-3">
              <div className="text-[#8DAA7B]">
                <Target size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black text-[#6B705C]">{item.label}</p>
                <p className="text-xl font-black text-[#2D332D] leading-none mt-0.5">{item.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Detail Progres Belajar */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-[#2D332D] px-1">Detail Progres Belajar</h2>

          {levels.map((lvl) => (
            <div
              key={lvl.classLevelId}
              className={`bg-white rounded-3xl border p-4 space-y-4 ${lvl.isLocked ? 'opacity-60 border-[#E8ECE4]' : 'border-[#DDE2D8]'}`}
            >
              {/* Level Header */}
              <div className="flex justify-between items-start gap-3">
                <div>
                  <h3 className="font-black text-lg text-[#2D332D]">{lvl.level.name}</h3>
                  <p className="text-xs text-[#6B705C] mt-0.5">{lvl.level.description}</p>
                  <p className="text-[10px] text-[#8DAA7B] font-bold mt-1">
                    Urutan {lvl.level.orderNumber} · Bobot {lvl.level.weight} · {lvl.summary.totalModules} Modul · {lvl.summary.totalQuestions} Soal
                  </p>
                </div>
                <StatusBadge status={lvl.summary.status} />
              </div>

              {/* Level Stats - Lebih Kecil */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { label: 'Modul Selesai', value: lvl.summary.completedModules },
                  { label: 'Modul Progress', value: lvl.summary.inProgressModules },
                  { label: 'Modul Belum', value: lvl.summary.notStartedModules },
                  { label: 'Soal Selesai', value: lvl.summary.completedQuestions },
                  { label: 'Soal Progress', value: lvl.summary.inProgressQuestions },
                  { label: 'Soal Belum', value: lvl.summary.notStartedQuestions },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-[#F9FBF7] border border-[#E8EEE2] rounded-xl p-2 text-center">
                    <p className="text-[9px] text-[#6B705C] font-black">{stat.label}</p>
                    <p className="text-base font-black text-[#2D332D]">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Modules */}
              <div className="space-y-3">
                {lvl.modules.length === 0 && (
                  <div className="text-xs text-[#6B705C] border border-dashed border-[#DDE2D8] rounded-2xl p-3">
                    Level ini belum memiliki modul.
                  </div>
                )}

                {[...lvl.modules].sort((a, b) => a.orderNumber - b.orderNumber).map((module) => (
                  <div key={module.id} className="border border-[#DDE2D8] rounded-2xl p-3 bg-[#FCFDFB]">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-black text-base text-[#2D332D]">{module.title}</h4>
                        <p className="text-xs text-[#6B705C] mt-0.5">{module.description}</p>
                        <p className="text-[10px] text-[#8DAA7B] font-bold mt-1">
                          Urutan {module.orderNumber} · {module.summary.totalQuestions} Soal · {module.summary.totalItems} Item
                        </p>
                      </div>
                      <StatusBadge status={module.summary.status} />
                    </div>

                    {/* Questions inside Module */}
                    <div className="mt-3 space-y-3">
                      {module.questions.length === 0 && (
                        <div className="text-xs text-[#6B705C] border border-dashed border-[#DDE2D8] rounded-xl p-3">
                          Modul ini belum memiliki soal.
                        </div>
                      )}

                      {[...module.questions].sort((a, b) => a.orderNumber - b.orderNumber).map((q) => {
                        const isNotStarted = q.status === 'NOT_STARTED' && !startedQuestionIds.includes(q.id);
                        const visibleStatus = isNotStarted ? 'NOT_STARTED' : q.status;

                        return (
                          <div key={q.id} className="bg-white border border-[#E4EADF] rounded-2xl p-3 space-y-2.5">
                            <div className="flex justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-bold text-sm text-[#2D332D]">{q.title}</p>
                                <p className="text-[10px] text-[#6B705C] mt-0.5 line-clamp-1">{q.instruction}</p>
                                <p className="text-[10px] text-[#8DAA7B] font-bold mt-1">
                                  {q.items.length} Item · {q.totalSubmissions} Submit · {q.remainingItems} Sisa
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-1.5 shrink-0">
                                <StatusBadge status={visibleStatus} />
                                {isNotStarted && (
                                  <button
                                    onClick={() => handleStartQuestion(q.id)}
                                    className="flex items-center gap-1 text-xs bg-[#8DAA7B] text-white px-2.5 py-1 rounded-lg font-bold active:bg-[#6f8a63]"
                                  >
                                    <PlayCircle size={13} /> Start
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Item Stats */}
                            <div className="grid grid-cols-4 gap-1.5 text-center">
                              <MiniStat label="Answered" value={q.answeredItems} />
                              <MiniStat label="Completed" value={q.completedItems} />
                              <MiniStat label="Progress" value={q.inProgressItems} />
                              <MiniStat label="Belum" value={q.notStartedItems} />
                            </div>

                            {/* Items List - Lebih Compact */}
                            {q.items.length > 0 && (
                              <div className="space-y-2 pt-1">
                                {q.items.map((item) => (
                                  <div key={item.id} className="flex gap-3 bg-[#F9FBF7] border border-[#ECF1E8] rounded-xl p-2.5">
                                    <div 
                                      className="w-11 h-11 rounded-lg bg-cover bg-center border border-[#DDE2D8] shrink-0" 
                                      style={item.image ? { backgroundImage: `url(${item.image})` } : {}}
                                    />
                                    <div className="min-w-0 flex-1 text-xs">
                                      <p className="font-bold text-[#2D332D] truncate">{item.name}</p>
                                      <p className="text-[#6B705C] mt-0.5">
                                        Rp{item.price} · Qty {item.quantity} · Bobot {item.weight}
                                      </p>
                                      <p className="text-[#8DAA7B] font-bold mt-0.5">
                                        {item.status} · {item.answerCount} jawaban
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

// Komponen kecil
function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[#F9FBF7] border border-[#E8EEE2] rounded-lg p-1.5">
      <p className="text-[9px] text-[#6B705C] font-black">{label}</p>
      <p className="text-sm font-black text-[#2D332D]">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    COMPLETED: { bg: 'bg-emerald-500', text: 'Selesai' },
    IN_PROGRESS: { bg: 'bg-amber-500', text: 'Progress' },
    NOT_STARTED: { bg: 'bg-slate-400', text: 'Belum' },
  };
  const c = config[status] ?? config.NOT_STARTED;

  return (
    <span className={`${c.bg} text-white px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider`}>
      {c.text}
    </span>
  );
}
