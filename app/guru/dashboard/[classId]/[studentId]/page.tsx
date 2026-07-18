"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Award,
  TrendingUp,
  CheckCircle,
  PlayCircle,
  AlertCircle,
} from "lucide-react";

// ==================== TYPES ====================
interface DetailedItem {
  classLevelId: string;
  classLevelName: string;
  moduleId: string;
  moduleTitle: string;
  questionId: string;
  questionTitle: string;
  itemId: string;
  itemName: string;
  orderNumber: number;
  type: string;
  image: string | null;
  price: number;
  quantity: number;
  weight: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  isCorrect: boolean;
  score: number;
  ssim: number;
  mse: number;
  uploadedImage: string | null;
  answerCount: number;
  startedAt: string | null;
  completedAt: string | null;
  timeTakenMinutes: number;
  timeTakenLabel: string;
  teacherNotes: string | null;
  answerLogs: any[];
}

interface TimelineItem {
  itemId: string;
  itemName: string;
  questionTitle: string;
  moduleTitle: string;
  startedAt: string | null;
  completedAt: string | null;
  timeTakenMinutes: number;
  status: string;
}

interface StudentDeepDiveResponse {
  class: {
    id: string;
    name: string;
    period: string;
  };
  studentId: string;
  studentName: string;
  summary: {
    finalScore: number;
    totalScore: number;
    totalItems: number;
    completedItems: number;
    status: string;
    totalTimeMinutes: number;
    totalTimeLabel: string;
    completionDate: string | null;
    classAverageVelocityMinutes: number;
    relativeVelocityDelta: number;
    relativeVelocityLabel: string;
  };
  detailedItems: DetailedItem[];
  timeline: TimelineItem[];
}

// ==================== MAIN COMPONENT ====================
export default function StudentDeepDivePage() {
  const params = useParams();
  const router = useRouter();

  const classId = params.classId as string;
  const studentId = params.studentId as string;

  const [data, setData] = useState<StudentDeepDiveResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!classId || !studentId) return;

      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/student-assessments/classes/${classId}/students/${studentId}/deep-dive`,
        );

        if (!res.ok) {
          throw new Error("Gagal memuat data performa siswa");
        }

        const responseData: StudentDeepDiveResponse = await res.json();
        setData(responseData);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Terjadi kesalahan saat memuat data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [classId, studentId]);

  // Status badge helper
  const getStatusBadge = (status: string) => {
    if (status === "COMPLETED") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
          <CheckCircle size={11} /> Selesai
        </span>
      );
    }
    if (status === "IN_PROGRESS") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
          <PlayCircle size={11} /> Sedang Dikerjakan
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
        <AlertCircle size={11} /> Belum Mulai
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7F2] flex items-center justify-center">
        <div className="text-center">
          <div className="w-11 h-11 border-4 border-[#8DAA7B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#6B705C] font-bold text-sm">
            Memuat data performa siswa...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F5F7F2] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-sm text-center shadow-sm border border-[#E1EAD8]">
          <AlertCircle className="mx-auto text-rose-500 mb-3" size={42} />
          <h3 className="font-black text-lg text-[#4A5043] mb-2">
            Gagal Memuat Data
          </h3>
          <p className="text-[#6B705C] text-sm mb-5">
            {error || "Data tidak ditemukan"}
          </p>
          <button
            onClick={() => router.back()}
            className="bg-[#8DAA7B] text-white font-bold px-5 py-2.5 rounded-xl text-sm"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7F2] pb-10">
      {/* Header - Lebih compact di mobile */}
      <div className="bg-[#8DAA7B] px-4 py-4 text-white">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm font-bold mb-2 text-white/90 hover:text-white"
          >
            <ArrowLeft size={17} /> Kembali
          </button>

          <div>
            <h1 className="text-2xl font-black leading-tight">
              {data.studentName}
            </h1>
            <p className="text-[#E1EAD8] text-xs mt-0.5">
              {data.class.name} • {data.class.period}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-5">
        {/* Summary Section */}
        <div className="mb-7">
          <h2 className="font-black text-lg text-[#4A5043] mb-3">
            Ringkasan Performa
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {/* Final Score */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E1EAD8]">
              <div className="flex items-center gap-2 text-[#8DAA7B] mb-1">
                <Award size={16} />
                <span className="text-[10px] font-bold">NILAI AKHIR</span>
              </div>
              <div className="text-3xl font-black text-[#4A5043] mt-0.5">
                {data.summary.finalScore}
              </div>
              <div className="text-[10px] text-[#6B705C]">
                dari {data.summary.totalScore} poin
              </div>
            </div>

            {/* Status */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E1EAD8]">
              <div className="text-[10px] font-bold text-[#6B705C] mb-1.5">
                STATUS
              </div>
              <div>{getStatusBadge(data.summary.status)}</div>
              <div className="text-[10px] text-[#6B705C] mt-1.5">
                {data.summary.completedItems} / {data.summary.totalItems}{" "}
                selesai
              </div>
            </div>

            {/* Time Spent */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E1EAD8]">
              <div className="flex items-center gap-2 text-[#8DAA7B] mb-1">
                <Clock size={16} />
                <span className="text-[10px] font-bold">WAKTU</span>
              </div>
              <div className="text-2xl font-black text-[#4A5043] mt-0.5">
                {data.summary.totalTimeLabel}
              </div>
              <div className="text-[10px] text-[#6B705C]">
                Total waktu aktif
              </div>
            </div>

            {/* Velocity */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E1EAD8]">
              <div className="flex items-center gap-2 text-[#8DAA7B] mb-1">
                <TrendingUp size={16} />
                <span className="text-[10px] font-bold">KECEPATAN</span>
              </div>
              <div className="text-xl font-black text-[#4A5043] mt-0.5">
                {data.summary.relativeVelocityLabel}
              </div>
              <div className="text-[10px] text-[#6B705C]">
                vs rata-rata kelas
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Items */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 px-0.5">
            <h2 className="font-black text-lg text-[#4A5043]">
              Detail Pengerjaan
            </h2>
            <span className="text-xs text-[#6B705C]">
              {data.detailedItems.length} item
            </span>
          </div>

          <div className="space-y-3">
            {data.detailedItems.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-4 shadow-sm border border-[#E1EAD8]"
              >
                <div className="flex flex-col gap-4">
                  {/* Top Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-[#E1EAD8] text-[#6B705C] rounded">
                        {item.classLevelName}
                      </span>
                      <span className="text-[10px] text-[#6B705C]">
                        • {item.moduleTitle}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-[#4A5043] leading-tight">
                      {item.itemName}
                    </h3>
                    <p className="text-xs text-[#6B705C] mt-0.5">
                      {item.questionTitle}
                    </p>

                    {/* Image */}
                    {item.image && (
                      <div className="mt-3">
                        <img
                          src={item.image}
                          alt={item.itemName}
                          className="w-16 h-16 object-cover rounded-xl border border-[#E1EAD8]"
                        />
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-3 text-[10px] text-[#6B705C]">
                      <span>Harga: Rp{item.price.toLocaleString("id-ID")}</span>
                      <span>Jumlah: {item.quantity}</span>
                      <span>Bobot: {item.weight}</span>
                    </div>
                  </div>

                  {/* Bottom Section - Status & Score */}
                  <div className="flex items-end justify-between pt-3 border-t md:border-t-0 md:pt-0">
                    <div>
                      {getStatusBadge(item.status)}
                      {item.timeTakenMinutes > 0 && (
                        <div className="text-[10px] text-[#6B705C] mt-1.5">
                          {item.timeTakenLabel}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-black text-[#4A5043] leading-none">
                        {item.score}
                      </div>
                      <div className="text-[10px] text-[#6B705C]">Skor</div>
                    </div>
                  </div>
                </div>

                {/* Teacher Notes */}
                {item.teacherNotes && (
                  <div className="mt-4 pt-4 border-t text-xs">
                    <span className="font-bold text-[#4A5043]">
                      Catatan Guru:
                    </span>
                    <p className="text-[#6B705C] mt-1 leading-snug">
                      {item.teacherNotes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        {data.timeline.length > 0 && (
          <div>
            <h2 className="font-black text-lg text-[#4A5043] mb-3">
              Timeline Aktivitas
            </h2>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E1EAD8]">
              <div className="space-y-4">
                {data.timeline.map((log, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-[#8DAA7B] flex-shrink-0" />
                    <div className="flex-1 text-sm">
                      <div className="font-bold text-[#4A5043] text-sm">
                        {log.itemName}
                      </div>
                      <div className="text-xs text-[#6B705C]">
                        {log.moduleTitle} • {log.questionTitle}
                      </div>
                      <div className="text-[10px] text-[#6B705C] mt-0.5">
                        {log.startedAt &&
                          new Date(log.startedAt).toLocaleString("id-ID")}
                        {log.status === "IN_PROGRESS" && " (Sedang dikerjakan)"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
