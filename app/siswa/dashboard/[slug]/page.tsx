'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';

interface DetailQuestion {
  id: string;
  title: string;
  status: string;
}

interface DetailLevel {
  classLevelId: string;
  isLocked: boolean;
  level?: {
    name?: string;
    description?: string;
  };
  summary?: {
    status?: string;
  };
  questions?: DetailQuestion[];
}

interface StudentDashboardDetailResponse {
  class?: {
    id: string;
    name: string;
    period: string;
  };
  summary?: {
    totalQuestions: number;
    completedQuestions: number;
    inProgressQuestions: number;
    notStartedQuestions: number;
  };
  levels?: DetailLevel[];
}

export default function DetailKelasSiswaPage() {
  const params = useParams<{ slug: string | string[] }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const router = useRouter();
  const [data, setData] = useState<StudentDashboardDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const session = localStorage.getItem('user_session');
    if (!session) { router.push('/login'); return; }
    
    const { id: userId } = JSON.parse(session);

    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:3000/student-assessments/history?userId=${userId}&classId=${slug}`);
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error("Gagal load history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [slug, router]);

  if (!slug) return <div className="text-center p-10">ID kelas tidak valid.</div>;
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#8DAA7B]" /></div>;
  if (!data?.class) return <div className="text-center p-10">Data kelas tidak ditemukan.</div>;

  const summary = data.summary ?? {
    totalQuestions: 0,
    completedQuestions: 0,
    inProgressQuestions: 0,
    notStartedQuestions: 0,
  };
  const levels = data.levels ?? [];

  return (
    <main className="min-h-screen bg-[#F5F7F2] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Title */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-xs font-bold text-[#6B705C] hover:text-[#2D332D]">
          <ArrowLeft size={16} /> Kembali
        </button>

        <div className="bg-white p-6 rounded-3xl border-2 border-[#DDE2D8] shadow-sm">
          <h1 className="text-2xl font-black text-[#2D332D]">{data.class.name}</h1>
          <p className="text-[#8DAA7B] font-bold text-sm">Periode {data.class.period}</p>
        </div>

        {/* Summary Card */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Soal', value: summary.totalQuestions, color: 'text-slate-600' },
            { label: 'Selesai', value: summary.completedQuestions, color: 'text-emerald-600' },
            { label: 'Proses', value: summary.inProgressQuestions, color: 'text-amber-600' },
            { label: 'Belum', value: summary.notStartedQuestions, color: 'text-rose-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-[#DDE2D8] text-center">
              <p className="text-[10px] font-bold text-[#6B705C] uppercase">{stat.label}</p>
              <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Levels List */}
        <div className="space-y-4">
          <h2 className="font-bold text-[#2D332D]">Daftar Level</h2>
          {levels.map((lvl) => (
            <div key={lvl.classLevelId} className={`bg-white p-5 rounded-3xl border-2 ${lvl.isLocked ? 'opacity-60 grayscale' : 'border-[#DDE2D8]'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-black text-[#2D332D]">{lvl.level?.name ?? 'Level tanpa nama'}</h3>
                  <p className="text-xs text-[#6B705C]">{lvl.level?.description ?? '-'}</p>
                </div>
                <StatusBadge status={lvl.summary?.status ?? 'NOT_STARTED'} />
              </div>

              <div className="space-y-2">
                {(lvl.questions ?? []).map((q) => (
                  <div key={q.id} className="bg-[#F5F7F2] p-3 rounded-xl flex items-center justify-between text-xs font-bold">
                    <span>{q.title}</span>
                    <span className={q.status === 'COMPLETED' ? 'text-emerald-600' : 'text-amber-600'}>
                      {q.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {levels.length === 0 ? (
            <div className="bg-white p-5 rounded-3xl border border-[#DDE2D8] text-sm text-[#6B705C]">
              Belum ada level tersedia untuk kelas ini.
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

// Sub-component untuk badge status
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'COMPLETED': 'bg-emerald-100 text-emerald-700',
    'IN_PROGRESS': 'bg-amber-100 text-amber-700',
    'NOT_STARTED': 'bg-slate-100 text-slate-600'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${styles[status] || styles.NOT_STARTED}`}>
      {status.replace('_', ' ')}
    </span>
  );
}