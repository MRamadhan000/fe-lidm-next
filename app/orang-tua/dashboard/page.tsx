"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Baloo_2, Plus_Jakarta_Sans } from "next/font/google";
import {
  CheckCircle2,
  Clock,
  CircleDashed,
  PlayCircle,
  Sparkles,
  ImageIcon,
  Lock,
  Feather,
} from "lucide-react";

/* ======================
   Fonts — a rounded, hand-friendly display face for the
   "report book" voice, paired with a clean, legible body face.
====================== */
const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-baloo",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

const displayFont = "font-[family-name:var(--font-baloo)]";

/* ======================
   Types
====================== */
interface AnswerLog {
  id: string;
  uploadedImage: string;
  ssim: number;
  mse: number;
  isCorrect: boolean;
  score: number;
  answeredAt: string;
}

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
  image: string;
  price: number;
  quantity: number;
  weight: number;
  status: "COMPLETED" | "IN_PROGRESS" | "NOT_STARTED";
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
  answerLogs: AnswerLog[];
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

interface StudentDeepDive {
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

/* ======================
   Status meta — one source of truth for color + copy
====================== */
const STATUS_META: Record<
  string,
  { label: string; bg: string; text: string; border: string; Icon: typeof CheckCircle2 }
> = {
  COMPLETED: {
    label: "Selesai",
    bg: "bg-[#EAF6EF]",
    text: "text-[#1F8351]",
    border: "border-[#CBEBD8]",
    Icon: CheckCircle2,
  },
  IN_PROGRESS: {
    label: "Sedang Dikerjakan",
    bg: "bg-[#FDEDEE]",
    text: "text-[#D93F52]",
    border: "border-[#F6D3D7]",
    Icon: PlayCircle,
  },
  NOT_STARTED: {
    label: "Belum Dikerjakan",
    bg: "bg-[#F1F3F8]",
    text: "text-[#64748B]",
    border: "border-[#E2E8F0]",
    Icon: CircleDashed,
  },
};

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? STATUS_META.NOT_STARTED;
  const { Icon } = meta;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${meta.bg} ${meta.text} border ${meta.border}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {meta.label}
    </span>
  );
}

/* ======================
   Signature element — the Achievement Ring.
   A hand-graded "report card" gauge: the outer ring reads
   completion, the center reads the score, like a grading
   stamp circled around a number.
====================== */
function AchievementRing({
  percent,
  score,
  totalScore,
}: {
  percent: number;
  score: number;
  totalScore: number;
}) {
  const size = 152;
  const stroke = 13;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          stroke="#E6E2FA"
          fill="transparent"
          strokeWidth={stroke}
          r={r}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke="#E7A33E"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.22,1,.36,1)" }}
          r={r}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl leading-none text-[#1B2559] ${displayFont}`}>
          {score}
        </span>
        <span className="text-[11px] text-[#7A7594] mt-1">dari {totalScore} poin</span>
      </div>
    </div>
  );
}

/* ======================
   Polaroid-style before/after pair — grounded in what the
   product actually does: comparing a reference image against
   the child's uploaded answer. A grading "stamp" replaces a
   generic score chip.
====================== */
function AnswerPolaroid({ item, index }: { item: DetailedItem; index: number }) {
  const tilt = index % 2 === 0 ? "-rotate-1" : "rotate-1";
  return (
    <div
      className={`group relative bg-white rounded-[22px] border border-[#ECE9F7] shadow-[0_10px_30px_-18px_rgba(27,37,89,0.35)] p-5 transition-transform duration-300 ${tilt} hover:rotate-0 hover:-translate-y-1`}
    >
      {item.isCorrect && (
        <div className="absolute -top-3 -right-3 z-10 flex items-center justify-center w-16 h-16 rounded-full border-2 border-dashed border-[#D93F52] rotate-[-14deg] bg-white/90">
          <span
            className={`text-[10px] leading-tight text-center text-[#D93F52] tracking-wide ${displayFont}`}
          >
            BENAR
          </span>
        </div>
      )}

      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-[#3D4FE0] bg-[#EEF0FD] px-2 py-0.5 rounded-md">
              {item.moduleTitle}
            </span>
            <span className="text-[11px] text-[#9691AE]">{item.questionTitle}</span>
          </div>
          <h3 className={`text-lg text-[#1B2559] ${displayFont}`}>{item.itemName}</h3>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-[11px] text-[#9691AE] mb-1.5 font-semibold uppercase tracking-wide">
            Contoh
          </p>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#F6F5FB] border border-[#ECE9F7]">
            {item.image ? (
              <Image src={item.image} alt={item.itemName} fill className="object-cover" unoptimized />
            ) : (
              <div className="flex items-center justify-center h-full">
                <ImageIcon className="w-8 h-8 text-[#C7C3DE]" />
              </div>
            )}
          </div>
        </div>
        <div>
          <p className="text-[11px] text-[#9691AE] mb-1.5 font-semibold uppercase tracking-wide">
            Jawaban Anak
          </p>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#F6F5FB] border border-[#ECE9F7]">
            {item.uploadedImage ? (
              <Image
                src={item.uploadedImage}
                alt={`Jawaban ${item.itemName}`}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <ImageIcon className="w-8 h-8 text-[#C7C3DE]" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm pt-3 border-t border-dashed border-[#ECE9F7]">
        <span className="flex items-center gap-1.5 text-[#7A7594]">
          <Clock className="w-3.5 h-3.5" />
          {item.timeTakenLabel}
        </span>
        <span className="flex items-center gap-1 text-[#E7A33E] font-bold">
          +{item.score} poin
        </span>
      </div>
    </div>
  );
}

/* ======================
   Main Page
====================== */
export default function StudentDeepDivePage() {
  const [data, setData] = useState<StudentDeepDive | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(
          "https://v1rpzn50-3000.asse.devtunnels.ms/student-assessments/classes/f90da848-1910-4f53-a2b6-5d6bc2e583f6/students/ec04a989-3a9c-44f7-b215-92b20da9ee17/deep-dive",
        );

        if (!res.ok) {
          throw new Error("Gagal mengambil data nilai anak");
        }

        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const shellFont = `${baloo.variable} ${jakarta.variable} font-[family-name:var(--font-jakarta)]`;

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-[#F3F6FB] ${shellFont}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-[3px] border-[#E6E2FA]" />
            <div className="absolute inset-0 rounded-full border-[3px] border-[#3D4FE0] border-t-transparent animate-spin" />
            <Feather className="absolute inset-0 m-auto w-5 h-5 text-[#3D4FE0]" />
          </div>
          <p className="text-[#7A7594] text-sm">Menyiapkan buku hasil belajar...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-[#F3F6FB] ${shellFont}`}>
        <div className="text-center max-w-sm px-6">
          <div className="w-16 h-16 bg-[#FDEDEE] rounded-full flex items-center justify-center mx-auto mb-4">
            <CircleDashed className="w-8 h-8 text-[#D93F52]" />
          </div>
          <h2 className={`text-lg text-[#1B2559] mb-1 ${displayFont}`}>Halaman ini belum bisa dibuka</h2>
          <p className="text-[#7A7594] text-sm">
            {error || "Silakan coba beberapa saat lagi."}
          </p>
        </div>
      </div>
    );
  }

  const { class: classInfo, studentName, summary, detailedItems, timeline } = data;

  const progressPercent = Math.round((summary.completedItems / summary.totalItems) * 100) || 0;

  const completedItems = detailedItems.filter((i) => i.status === "COMPLETED");
  const inProgressItems = detailedItems.filter((i) => i.status === "IN_PROGRESS");
  const notStartedItems = detailedItems.filter((i) => i.status === "NOT_STARTED");

  return (
    <div className={`min-h-screen bg-[#F3F6FB] ${shellFont}`}>
      <style>{`
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .rise-in { animation: riseIn 0.5s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .rise-in { animation: none; }
        }
      `}</style>

      {/* Header / cover of the "report book" */}
      <div
        className="relative overflow-hidden border-b border-[#E6E2FA]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #E1DBFA 1.4px, transparent 0)",
          backgroundSize: "22px 22px",
          backgroundColor: "#FBFAFF",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div>
              <p className="text-sm text-[#3D4FE0] font-semibold mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                {classInfo.name} &middot; Tahun Ajaran {classInfo.period}
              </p>
              <h1 className={`text-3xl sm:text-4xl text-[#1B2559] ${displayFont}`}>
                Buku Hasil Belajar {studentName}
              </h1>
              <p className="text-[#7A7594] mt-2 text-sm max-w-md">
                Setiap halaman berikut merangkum apa yang sudah, sedang, dan akan
                dikerjakan {studentName.split(" ")[0]}.
              </p>
              <div className="mt-4">
                <StatusBadge status={summary.status} />
              </div>
            </div>

            <div className="flex items-center gap-6 bg-white rounded-[26px] border border-[#ECE9F7] px-6 py-5 shadow-[0_16px_40px_-24px_rgba(27,37,89,0.4)]">
              <AchievementRing
                percent={progressPercent}
                score={summary.finalScore}
                totalScore={summary.totalScore}
              />
              <div className="flex flex-col gap-3 min-w-[130px]">
                <div>
                  <p className={`text-2xl text-[#1B2559] ${displayFont}`}>
                    {summary.completedItems}
                    <span className="text-sm text-[#9691AE] font-normal">
                      {" "}
                      / {summary.totalItems}
                    </span>
                  </p>
                  <p className="text-[11px] text-[#9691AE] uppercase tracking-wide font-semibold">
                    Item selesai
                  </p>
                </div>
                <div>
                  <p className={`text-2xl text-[#1B2559] ${displayFont}`}>
                    {summary.totalTimeLabel}
                  </p>
                  <p className="text-[11px] text-[#9691AE] uppercase tracking-wide font-semibold">
                    Waktu belajar
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        {/* Completed */}
        {completedItems.length > 0 && (
          <section className="rise-in">
            <h2 className={`text-xl text-[#1B2559] mb-5 flex items-center gap-2 ${displayFont}`}>
              <CheckCircle2 className="w-5 h-5 text-[#1F8351]" />
              Sudah Diselesaikan
              <span className="text-sm font-normal text-[#9691AE]">
                ({completedItems.length})
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {completedItems.map((item, index) => (
                <AnswerPolaroid key={item.itemId} item={item} index={index} />
              ))}
            </div>
          </section>
        )}

        {/* In progress */}
        {inProgressItems.length > 0 && (
          <section className="rise-in">
            <h2 className={`text-xl text-[#1B2559] mb-5 flex items-center gap-2 ${displayFont}`}>
              <PlayCircle className="w-5 h-5 text-[#D93F52]" />
              Sedang Dikerjakan
              <span className="text-sm font-normal text-[#9691AE]">
                ({inProgressItems.length})
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {inProgressItems.map((item) => (
                <div
                  key={item.itemId}
                  className="relative bg-white rounded-[22px] border-l-[6px] border-l-[#D93F52] border-y border-r border-[#ECE9F7] overflow-hidden shadow-[0_10px_28px_-20px_rgba(27,37,89,0.35)]"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <span className="text-[11px] font-semibold text-[#3D4FE0] bg-[#EEF0FD] px-2 py-0.5 rounded-md">
                          {item.moduleTitle}
                        </span>
                        <h3 className={`mt-1.5 text-lg text-[#1B2559] ${displayFont}`}>
                          {item.itemName}
                        </h3>
                        <p className="text-sm text-[#7A7594] mt-0.5">{item.questionTitle}</p>
                      </div>
                      <span className="relative flex h-2.5 w-2.5 mt-1 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D93F52] opacity-60" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D93F52]" />
                      </span>
                    </div>

                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#F6F5FB] border border-[#ECE9F7]">
                      {item.image ? (
                        <Image src={item.image} alt={item.itemName} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ImageIcon className="w-10 h-10 text-[#C7C3DE]" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Not started — blank workbook pages */}
        {notStartedItems.length > 0 && (
          <section className="rise-in">
            <h2 className={`text-xl text-[#1B2559] mb-5 flex items-center gap-2 ${displayFont}`}>
              <CircleDashed className="w-5 h-5 text-[#9691AE]" />
              Belum Dikerjakan
              <span className="text-sm font-normal text-[#9691AE]">
                ({notStartedItems.length})
              </span>
            </h2>

            <div className="bg-white rounded-[26px] border border-dashed border-[#D9D5EE] p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {notStartedItems.map((item) => (
                  <div key={item.itemId} className="text-center">
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#F6F5FB] border border-dashed border-[#D9D5EE] mb-2">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.itemName}
                          fill
                          className="object-cover grayscale opacity-50"
                          unoptimized
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ImageIcon className="w-8 h-8 text-[#C7C3DE]" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-white/30">
                        <Lock className="w-5 h-5 text-[#9691AE]" />
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-[#4B4768] truncate">
                      {item.itemName}
                    </p>
                    <p className="text-[11px] text-[#9691AE] mt-0.5">{item.moduleTitle}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Timeline — a diary strip of activity */}
        {timeline.length > 0 && (
          <section className="rise-in">
            <h2 className={`text-xl text-[#1B2559] mb-5 flex items-center gap-2 ${displayFont}`}>
              <Clock className="w-5 h-5 text-[#4B4768]" />
              Riwayat Aktivitas
            </h2>

            <div className="bg-white rounded-[26px] border border-[#ECE9F7] p-6 sm:p-8">
              <div className="space-y-0">
                {timeline.map((event, index) => {
                  const meta = STATUS_META[event.status] ?? STATUS_META.NOT_STARTED;
                  const { Icon } = meta;
                  return (
                    <div key={event.itemId} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${meta.bg} ${meta.text}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        {index < timeline.length - 1 && (
                          <div className="w-0.5 flex-1 bg-[#ECE9F7] my-1" />
                        )}
                      </div>

                      <div className="pb-6">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <span className={`text-[#1B2559] ${displayFont}`}>
                            {event.itemName}
                          </span>
                          <StatusBadge status={event.status} />
                        </div>
                        <p className="text-sm text-[#7A7594]">
                          {event.moduleTitle} &middot; {event.questionTitle}
                        </p>
                        {event.completedAt && (
                          <p className="text-xs text-[#9691AE] mt-1">
                            Selesai pada{" "}
                            {new Date(event.completedAt).toLocaleString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                        {event.status === "IN_PROGRESS" && event.startedAt && (
                          <p className="text-xs text-[#9691AE] mt-1">
                            Dimulai pada{" "}
                            {new Date(event.startedAt).toLocaleString("id-ID", {
                              day: "numeric",
                              month: "long",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}