"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  PlayCircle,
  Target,
  Trophy,
  User,
  Camera,
  X,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Search,
  AlertTriangle,
  Send,
  Volume2,
  SkipForward,
} from "lucide-react";

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

interface LevelSummary extends Omit<SummaryNumbers, "totalLevels"> {
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

// ==== Bentuk response dari endpoint /student-assessments/start ====
interface StartAnswerResponse {
  id: string; // ini yang jadi studentQuestionItemId
  studentClassLevel: {
    id: string;
    isLocked: boolean;
    unlockedAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
  questionItem: {
    id: string;
    type: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    weight: number;
    orderNumber: number;
    moneyNominals: unknown;
    createdAt: string;
    updatedAt: string;
  };
  student: {
    id: string;
    username: string;
    email: string;
    fullName: string;
    role: string;
  };
  status: string;
  score: number;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ==== Bentuk response dari endpoint .../submit ====
interface SubmitAnswerResponse {
  id: string;
  studentQuestionItem: {
    id: string;
    status: string;
    score: number;
    startedAt: string;
    completedAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
  questionItem: {
    id: string;
    type: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    weight: number;
    orderNumber: number;
    moneyNominals: unknown;
    createdAt: string;
    updatedAt: string;
  };
  uploadedImage: string;
  ssim: number;
  mse: number;
  isCorrect: boolean;
  score: number;
  answeredAt: string;
}

// Progress kerja tiap item (bertahan selama halaman ini terbuka)
interface ItemProgressState {
  studentQuestionItemId: string | null;
  lastResult: SubmitAnswerResponse | null;
}

// Satu baris antrian dalam mode "jalan otomatis 1 siklus per level"
interface RunItem {
  lvl: DetailLevel;
  module: DetailModule;
  question: DetailQuestion;
  item: DetailItem;
}

// State mode jalan otomatis
interface RunState {
  queue: RunItem[];
  index: number;
  lastModuleId: string | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Helper: tentukan apakah sebuah item sudah dijawab benar (progress sesi ini > data server)
function isItemCorrect(
  item: DetailItem,
  progress: ItemProgressState | undefined,
): boolean {
  const result = progress?.lastResult;
  if (result) return result.isCorrect;
  return item.status === "COMPLETED" && Boolean(item.latestAnswer?.isCorrect);
}

// Helper: susun antrian item yang belum benar untuk satu level, urut modul -> soal -> item
function buildRunQueue(
  lvl: DetailLevel,
  itemProgress: Record<string, ItemProgressState>,
): RunItem[] {
  const queue: RunItem[] = [];
  const sortedModules = [...lvl.modules].sort(
    (a, b) => a.orderNumber - b.orderNumber,
  );

  for (const module of sortedModules) {
    const sortedQuestions = [...module.questions].sort(
      (a, b) => a.orderNumber - b.orderNumber,
    );
    for (const question of sortedQuestions) {
      const sortedItems = [...question.items].sort(
        (a, b) => a.orderNumber - b.orderNumber,
      );
      for (const item of sortedItems) {
        if (!isItemCorrect(item, itemProgress[item.id])) {
          queue.push({ lvl, module, question, item });
        }
      }
    }
  }

  return queue;
}

export default function DetailKelasSiswaPageCompact() {
  const params = useParams<{ slug: string | string[] }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const router = useRouter();

  const [data, setData] = useState<StudentDashboardDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [studentId, setStudentId] = useState<string | null>(null);

  // key = questionItemId (item.id) -> progress state item tersebut
  const [itemProgress, setItemProgress] = useState<
    Record<string, ItemProgressState>
  >({});

  // mode "jalan otomatis 1 siklus per level"
  const [runState, setRunState] = useState<RunState | null>(null);

  useEffect(() => {
    if (!slug) return;

    const session = localStorage.getItem("user_session");
    if (!session) {
      router.push("/login");
      return;
    }

    const { id: userId } = JSON.parse(session) as { id: string };
    setStudentId(userId);

    const fetchData = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/student-assessments/history?userId=${userId}&classId=${slug}`,
        );
        if (!res.ok) throw new Error("Gagal mengambil detail kelas siswa");
        const result = (await res.json()) as StudentDashboardDetailResponse;
        setData(result);
      } catch (error) {
        console.error("Gagal load history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, [slug, router]);

  // Ambil ulang data secara diam-diam (tanpa memicu spinner full-page), dipakai setelah mode jalan otomatis berhenti
  const reloadData = async () => {
    if (!studentId || !slug) return;
    try {
      const res = await fetch(
        `${API_BASE}/student-assessments/history?userId=${studentId}&classId=${slug}`,
      );
      if (!res.ok) return;
      const result = (await res.json()) as StudentDashboardDetailResponse;
      setData(result);
    } catch (error) {
      console.error("Gagal refresh data:", error);
    }
  };

  if (!slug)
    return <div className="text-center p-6 text-sm">ID kelas tidak valid.</div>;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#8DAA7B] w-6 h-6" />
      </div>
    );
  }

  if (!data)
    return (
      <div className="text-center p-6 text-sm">Data kelas tidak ditemukan.</div>
    );

  const levels = [...data.levels].sort(
    (left, right) => left.level.orderNumber - right.level.orderNumber,
  );

  const getItemProgress = (itemId: string): ItemProgressState => {
    return (
      itemProgress[itemId] ?? { studentQuestionItemId: null, lastResult: null }
    );
  };

  // === Panggil API /student-assessments/start, kembalikan studentQuestionItemId ===
  const ensureStarted = async (
    lvl: DetailLevel,
    item: DetailItem,
  ): Promise<string> => {
    const existing = getItemProgress(item.id).studentQuestionItemId;
    if (existing) return existing;
    if (!studentId) throw new Error("Sesi siswa tidak ditemukan.");

    const res = await fetch(`${API_BASE}/student-assessments/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        classLevelId: lvl.classLevelId,
        questionItemId: item.id,
      }),
    });
    if (!res.ok) throw new Error("Gagal memulai pengerjaan item");

    const result = (await res.json()) as StartAnswerResponse;

    setItemProgress((prev) => ({
      ...prev,
      [item.id]: {
        ...getItemProgress(item.id),
        studentQuestionItemId: result.id,
      },
    }));

    return result.id;
  };

  // === Panggil API submit foto jawaban ===
  const submitPhoto = async (
    item: DetailItem,
    studentQuestionItemId: string,
    blob: Blob,
  ): Promise<SubmitAnswerResponse> => {
    const formData = new FormData();
    formData.append("file", blob, "jawaban.jpg");

    const res = await fetch(
      `${API_BASE}/student-assessments/${studentQuestionItemId}/item/${item.id}/submit`,
      { method: "POST", body: formData },
    );
    if (!res.ok) throw new Error("Gagal mengirim jawaban");

    const result = (await res.json()) as SubmitAnswerResponse;

    setItemProgress((prev) => ({
      ...prev,
      [item.id]: { ...getItemProgress(item.id), lastResult: result },
    }));

    return result;
  };

  // === Mode jalan otomatis: mulai 1 siklus penuh untuk sebuah level ===
  const handleStartLevelRun = (lvl: DetailLevel) => {
    if (lvl.isLocked) return;
    const queue = buildRunQueue(lvl, itemProgress);
    if (queue.length === 0) return;
    setRunState({ queue, index: 0, lastModuleId: null });
  };

  // Lanjut ke item berikutnya dalam antrian (dipanggil setelah jawaban benar)
  const handleRunAdvance = (finishedModuleId: string) => {
    setRunState((prev) => {
      if (!prev) return prev;
      return { ...prev, index: prev.index + 1, lastModuleId: finishedModuleId };
    });
  };

  // Keluar dari mode jalan otomatis (baik selesai maupun dihentikan siswa/guru)
  const handleRunClose = () => {
    setRunState(null);
    void reloadData();
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] p-3 sm:p-4 md:p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-5">
        {/* Back Button - Lebih Kecil */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-2xl border border-[#DDE2D8] text-[#6B705C] text-sm font-bold hover:bg-[#F5F7F2] active:bg-[#F5F7F2]"
        >
          <ArrowLeft size={16} /> Kembali
        </button>

        {/* Header - Lebih Compact */}
        <div className="bg-gradient-to-br from-[#A3C49B] to-[#8DAA7B] p-4 sm:p-6 rounded-3xl text-white relative overflow-hidden">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black pr-16 sm:pr-0">
            {data.class.name}
          </h1>
          <p className="text-xs sm:text-sm opacity-90 font-bold mt-0.5">
            Periode: {data.class.period}
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] sm:text-xs font-bold max-w-full">
            <User size={13} className="shrink-0" />{" "}
            <span className="truncate">
              {data.student.fullName} ({data.student.username})
            </span>
          </div>
          <Trophy className="absolute -right-3 -bottom-3 text-white/20 w-16 h-16 sm:w-24 sm:h-24" />
        </div>

        {/* Summary Stats - Lebih Kecil & Rapat */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-2.5">
          {[
            { label: "Total Level", val: data.summary.totalLevels },
            { label: "Total Modul", val: data.summary.totalModules },
            { label: "Total Soal", val: data.summary.totalQuestions },
            { label: "Soal Selesai", val: data.summary.completedQuestions },
            { label: "Soal Progress", val: data.summary.inProgressQuestions },
            { label: "Soal Belum", val: data.summary.notStartedQuestions },
            { label: "Total Item", val: data.summary.totalItems },
            { label: "Item Terjawab", val: data.summary.answeredItems },
            { label: "Item Progress", val: data.summary.inProgressItems },
            { label: "Item Belum", val: data.summary.notStartedItems },
            { label: "Total Submit", val: data.summary.totalSubmissions },
            { label: "Sisa Item", val: data.summary.remainingItems },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white p-2.5 sm:p-3 rounded-2xl border border-[#E8ECE4] flex items-center gap-2 sm:gap-3 min-w-0"
            >
              <div className="text-[#8DAA7B] shrink-0">
                <Target size={16} className="sm:w-[18px] sm:h-[18px]" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] font-black text-[#6B705C] truncate">
                  {item.label}
                </p>
                <p className="text-lg sm:text-xl font-black text-[#2D332D] leading-none mt-0.5">
                  {item.val}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Detail Progres Belajar */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-base sm:text-lg font-black text-[#2D332D] px-1">
            Detail Progres Belajar
          </h2>

          {levels.map((lvl) => (
            <div
              key={lvl.classLevelId}
              className={`bg-white rounded-3xl border p-3 sm:p-4 space-y-3 sm:space-y-4 ${lvl.isLocked ? "opacity-60 border-[#E8ECE4]" : "border-[#DDE2D8]"}`}
            >
              {/* Level Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                <div className="min-w-0">
                  <h3 className="font-black text-base sm:text-lg text-[#2D332D]">
                    {lvl.level.name}
                  </h3>
                  <p className="text-xs text-[#6B705C] mt-0.5">
                    {lvl.level.description}
                  </p>
                  <p className="text-[10px] text-[#8DAA7B] font-bold mt-1">
                    Urutan {lvl.level.orderNumber} · Bobot {lvl.level.weight} ·{" "}
                    {lvl.summary.totalModules} Modul ·{" "}
                    {lvl.summary.totalQuestions} Soal
                  </p>
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-1.5 shrink-0 w-full sm:w-auto justify-between sm:justify-start">
                  <StatusBadge status={lvl.summary.status} />
                  {!lvl.isLocked && lvl.summary.remainingItems > 0 && (
                    <button
                      onClick={() => handleStartLevelRun(lvl)}
                      className="flex items-center gap-1 text-xs bg-[#8DAA7B] text-white px-2.5 py-1.5 rounded-lg font-bold active:bg-[#6f8a63] shadow whitespace-nowrap"
                    >
                      <PlayCircle size={13} /> Mulai Level
                    </button>
                  )}
                </div>
              </div>

              {/* Level Stats - Lebih Kecil */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2">
                {[
                  {
                    label: "Modul Selesai",
                    value: lvl.summary.completedModules,
                  },
                  {
                    label: "Modul Progress",
                    value: lvl.summary.inProgressModules,
                  },
                  {
                    label: "Modul Belum",
                    value: lvl.summary.notStartedModules,
                  },
                  {
                    label: "Soal Selesai",
                    value: lvl.summary.completedQuestions,
                  },
                  {
                    label: "Soal Progress",
                    value: lvl.summary.inProgressQuestions,
                  },
                  {
                    label: "Soal Belum",
                    value: lvl.summary.notStartedQuestions,
                  },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="bg-[#F9FBF7] border border-[#E8EEE2] rounded-xl p-1.5 sm:p-2 text-center"
                  >
                    <p className="text-[8px] sm:text-[9px] text-[#6B705C] font-black leading-tight">
                      {stat.label}
                    </p>
                    <p className="text-sm sm:text-base font-black text-[#2D332D]">
                      {stat.value}
                    </p>
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

                {[...lvl.modules]
                  .sort((a, b) => a.orderNumber - b.orderNumber)
                  .map((module) => (
                    <div
                      key={module.id}
                      className="border border-[#DDE2D8] rounded-2xl p-2.5 sm:p-3 bg-[#FCFDFB]"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <h4 className="font-black text-sm sm:text-base text-[#2D332D]">
                            {module.title}
                          </h4>
                          <p className="text-xs text-[#6B705C] mt-0.5">
                            {module.description}
                          </p>
                          <p className="text-[10px] text-[#8DAA7B] font-bold mt-1">
                            Urutan {module.orderNumber} ·{" "}
                            {module.summary.totalQuestions} Soal ·{" "}
                            {module.summary.totalItems} Item
                          </p>
                        </div>
                        <div className="shrink-0">
                          <StatusBadge status={module.summary.status} />
                        </div>
                      </div>

                      {/* Questions inside Module */}
                      <div className="mt-3 space-y-3">
                        {module.questions.length === 0 && (
                          <div className="text-xs text-[#6B705C] border border-dashed border-[#DDE2D8] rounded-xl p-3">
                            Modul ini belum memiliki soal.
                          </div>
                        )}

                        {[...module.questions]
                          .sort((a, b) => a.orderNumber - b.orderNumber)
                          .map((q) => (
                            <div
                              key={q.id}
                              className="bg-white border border-[#E4EADF] rounded-2xl p-2.5 sm:p-3 space-y-2.5"
                            >
                              <div className="flex justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="font-bold text-sm text-[#2D332D]">
                                    {q.title}
                                  </p>
                                  <p className="text-[10px] text-[#6B705C] mt-0.5 line-clamp-1">
                                    {q.instruction}
                                  </p>
                                  <p className="text-[10px] text-[#8DAA7B] font-bold mt-1">
                                    {q.items.length} Item · {q.totalSubmissions}{" "}
                                    Submit · {q.remainingItems} Sisa
                                  </p>
                                </div>
                                <div className="shrink-0">
                                  <StatusBadge status={q.status} />
                                </div>
                              </div>

                              {/* Item Stats */}
                              <div className="grid grid-cols-2 xs:grid-cols-4 sm:grid-cols-4 gap-1.5 text-center">
                                <MiniStat
                                  label="Answered"
                                  value={q.answeredItems}
                                />
                                <MiniStat
                                  label="Completed"
                                  value={q.completedItems}
                                />
                                <MiniStat
                                  label="Progress"
                                  value={q.inProgressItems}
                                />
                                <MiniStat
                                  label="Belum"
                                  value={q.notStartedItems}
                                />
                              </div>

                              {/* Items List */}
                              {q.items.length > 0 && (
                                <div className="space-y-2 pt-1">
                                  {q.items.map((item) => (
                                    <ItemRow
                                      key={item.id}
                                      item={item}
                                      progress={getItemProgress(item.id)}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mode jalan otomatis 1 siklus per level */}
      {runState && runState.index < runState.queue.length && (
        <LevelRunModal
          key={runState.queue[runState.index].item.id}
          runItem={runState.queue[runState.index]}
          position={runState.index + 1}
          total={runState.queue.length}
          moduleChanged={
            runState.lastModuleId !== runState.queue[runState.index].module.id
          }
          onClose={handleRunClose}
          onEnsureStarted={() =>
            ensureStarted(
              runState.queue[runState.index].lvl,
              runState.queue[runState.index].item,
            )
          }
          onSubmitPhoto={(studentQuestionItemId, blob) =>
            submitPhoto(
              runState.queue[runState.index].item,
              studentQuestionItemId,
              blob,
            )
          }
          onAdvance={() =>
            handleRunAdvance(runState.queue[runState.index].module.id)
          }
        />
      )}

      {runState && runState.index >= runState.queue.length && (
        <LevelRunFinishedModal
          totalCompleted={runState.queue.length}
          onClose={handleRunClose}
        />
      )}
    </main>
  );
}

// ==== Baris ringkas tiap barang di dalam daftar soal (tampilan status saja) ====
// Pengerjaan sekarang dijalankan lewat mode "Mulai Level" (LevelRunModal),
// jadi baris ini murni menampilkan status, tanpa tombol aksi per item.
function ItemRow({
  item,
  progress,
}: {
  item: DetailItem;
  progress: ItemProgressState;
}) {
  const result = progress.lastResult;
  const isCorrectNow = result
    ? result.isCorrect
    : item.status === "COMPLETED" && item.latestAnswer?.isCorrect;
  const hasResultThisSession = result !== null;

  return (
    <div className="flex gap-2.5 sm:gap-3 bg-[#F9FBF7] border border-[#ECF1E8] rounded-xl p-2 sm:p-2.5 items-center">
      <div
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-cover bg-center border border-[#DDE2D8] shrink-0"
        style={item.image ? { backgroundImage: `url(${item.image})` } : {}}
      />
      <div className="min-w-0 flex-1 text-xs">
        <p className="font-bold text-[#2D332D] truncate">{item.name}</p>
        <p className="text-[#6B705C] mt-0.5 truncate">
          Rp{item.price} · Qty {item.quantity} · Bobot {item.weight}
        </p>
        {isCorrectNow ? (
          <p className="text-emerald-600 font-bold mt-0.5 flex items-center gap-1">
            <CheckCircle2 size={12} className="shrink-0" /> Benar
            {hasResultThisSession && result ? ` · Skor ${result.score}` : ""}
          </p>
        ) : hasResultThisSession && result ? (
          <p className="text-red-600 font-bold mt-0.5 flex items-center gap-1">
            <XCircle size={12} className="shrink-0" /> Belum tepat, coba lagi
            lewat Mulai Level
          </p>
        ) : (
          <p className="text-[#8DAA7B] font-bold mt-0.5 truncate">
            {item.status} · {item.answerCount} jawaban
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// LevelRunModal: mode "jalan otomatis 1 siklus per level"
// - Siswa klik "Mulai Level" sekali di daftar level.
// - Tiap kali pindah ke modul yang berbeda dari modul sebelumnya,
//   siswa harus klik "Mulai Modul Ini" dulu (layar module-intro),
//   supaya siswa sadar sedang masuk bagian baru.
// - Di dalam modul yang sama, setelah jawaban benar, aplikasi akan
//   otomatis lanjut ke barang berikutnya (dengan hitung mundur singkat
//   + tombol "Lanjut Sekarang" supaya siswa tetap punya kendali).
// - Komponen ini di-remount (lewat `key={item.id}` di parent) setiap
//   kali pindah barang, jadi semua state lokal otomatis reset bersih.
//
// === PERBAIKAN KAMERA (blank/hitam di foto ke-2 dst) ===
// Root cause: kamera di-stop() lalu langsung getUserMedia() lagi tiap
// retake / coba-lagi, dan tidak ada video.play() eksplisit. Di banyak
// HP Android, ini bikin stream baru "hidup" tapi framenya kosong/hitam.
//
// Perbaikan:
// 1. Saat retake / coba-lagi SETELAH salah, kita PAKAI ULANG stream
//    yang sama (tidak stop+reopen), selama stream itu masih hidup.
// 2. video.play() dipanggil eksplisit tiap kali srcObject dipasang.
// 3. Sebelum ambil foto, kita cek video.videoWidth > 0 (frame nyata).
//    Kalau 0 (blank), kita anggap kamera gagal → WAJIB re-request
//    akses kamera lagi (stop stream lama, getUserMedia baru).
// 4. Kalau reopen kamera gagal / getUserMedia() throw, tampilkan layar
//    camera-error dengan tombol "Coba Lagi" yang juga wajib re-request
//    kamera (bukan cuma retry pasif).
// ============================================================

type RunModalStage =
  | "module-intro"
  | "intro"
  | "preparing"
  | "camera"
  | "camera-error"
  | "captured"
  | "submitting"
  | "result";

const RUN_AUTO_ADVANCE_MS = 3000;
// Berapa lama kita tunggu video benar-benar mengeluarkan frame (videoWidth > 0)
// sebelum kita anggap kamera gagal / blank dan wajib re-request akses kamera.
const CAMERA_READY_TIMEOUT_MS = 4000;

function LevelRunModal({
  runItem,
  position,
  total,
  moduleChanged,
  onClose,
  onEnsureStarted,
  onSubmitPhoto,
  onAdvance,
}: {
  runItem: RunItem;
  position: number;
  total: number;
  moduleChanged: boolean;
  onClose: () => void;
  onEnsureStarted: () => Promise<string>;
  onSubmitPhoto: (
    studentQuestionItemId: string,
    blob: Blob,
  ) => Promise<SubmitAnswerResponse>;
  onAdvance: () => void;
}) {
  const { module, question, item } = runItem;

  const [stage, setStage] = useState<RunModalStage>(
    moduleChanged ? "module-intro" : "intro",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [capturedPreviewUrl, setCapturedPreviewUrl] = useState<string | null>(
    null,
  );
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [result, setResult] = useState<SubmitAnswerResponse | null>(null);
  const [studentQuestionItemId, setStudentQuestionItemId] = useState<
    string | null
  >(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cameraReadyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  // Menghindari race condition: token unik tiap kali kita mulai buka kamera.
  // Kalau ada permintaan buka kamera yang lebih baru, hasil dari permintaan
  // lama yang telat resolve akan diabaikan.
  const openAttemptRef = useRef(0);

  const speak = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const speakModuleIntro = () => speak(`Modul baru, ${module.title}`);
  const speakItemName = () => speak(`Carilah benda ini, ${item.name}`);

  const clearCameraReadyTimeout = () => {
    if (cameraReadyTimeoutRef.current) {
      clearTimeout(cameraReadyTimeoutRef.current);
      cameraReadyTimeoutRef.current = null;
    }
  };

  // Bersihkan kamera, suara, dan timer otomatis saat item berganti / modal ditutup
  useEffect(() => {
    return () => {
      openAttemptRef.current += 1; // batalkan attempt yang sedang berjalan
      stopCamera();
      clearCameraReadyTimeout();
      if (capturedPreviewUrl) URL.revokeObjectURL(capturedPreviewUrl);
      window.speechSynthesis?.cancel();
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ucapkan otomatis sesuai layar yang sedang tampil
  useEffect(() => {
    if (stage === "module-intro") speakModuleIntro();
    if (stage === "intro") speakItemName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Cek apakah stream yang sedang dipegang masih benar-benar hidup
  const isStreamLive = () => {
    const stream = streamRef.current;
    if (!stream) return false;
    return stream.getVideoTracks().some((t) => t.readyState === "live");
  };

  // Dari layar module-intro -> tampilkan barang pertama di modul ini
  const handleBeginModule = () => {
    setStage("intro");
  };

  // Layar intro barang -> mulai soal + buka kamera (paksa minta akses kamera baru)
  const handleBeginSearch = async () => {
    setErrorMessage(null);
    setStage("preparing");

    try {
      const id = await onEnsureStarted();
      setStudentQuestionItemId(id);
      await openCamera({ forceNew: true });
    } catch (error) {
      console.error(error);
      setErrorMessage("Belum bisa memulai soal ini. Coba lagi ya.");
      setStage("intro");
    }
  };

  // Pasang stream ke elemen <video> dan pastikan benar-benar diputar (play()).
  // Kalau dalam CAMERA_READY_TIMEOUT_MS video tidak pernah keluar frame
  // (videoWidth tetap 0), kamera dianggap gagal/blank -> wajib buka ulang.
  const attachStreamAndWaitReady = (
    stream: MediaStream,
    attemptId: number,
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const video = videoRef.current;
      if (!video) {
        reject(new Error("Video element belum siap"));
        return;
      }

      video.srcObject = stream;
      video.play().catch((err) => console.error("video.play() gagal:", err));

      const checkReady = () => {
        if (openAttemptRef.current !== attemptId) return; // sudah dibatalkan
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          clearCameraReadyTimeout();
          resolve();
        }
      };

      video.onloadedmetadata = checkReady;
      video.onplaying = checkReady;

      // Cek sekali lagi kalau-kalau event sudah lewat sebelum listener terpasang
      checkReady();

      cameraReadyTimeoutRef.current = setTimeout(() => {
        if (openAttemptRef.current !== attemptId) return;
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          resolve();
        } else {
          reject(new Error("Kamera tidak mengeluarkan gambar (blank)"));
        }
      }, CAMERA_READY_TIMEOUT_MS);
    });
  };

  // Buka kamera. forceNew = true akan selalu stop stream lama (jika ada)
  // dan meminta getUserMedia() baru — ini yang dipakai saat kamera
  // terdeteksi gagal/blank, sesuai permintaan: wajib re-request akses kamera.
  const openCamera = async ({ forceNew }: { forceNew: boolean }) => {
    const attemptId = ++openAttemptRef.current;
    setErrorMessage(null);

    try {
      if (forceNew || !isStreamLive()) {
        stopCamera();
        // beri sedikit jeda supaya hardware kamera sempat "lepas"
        // dari sesi sebelumnya sebelum diminta lagi
        await new Promise((r) => setTimeout(r, 200));

        if (openAttemptRef.current !== attemptId) return; // dibatalkan

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });

        if (openAttemptRef.current !== attemptId) {
          // ada permintaan buka kamera baru yang menyusul, buang stream ini
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
      }

      setStage("camera");

      // Tunggu frame video render dulu sebelum lanjut
      await new Promise((r) => requestAnimationFrame(r));
      if (openAttemptRef.current !== attemptId) return;

      const stream = streamRef.current;
      if (!stream) throw new Error("Stream kamera tidak tersedia");

      await attachStreamAndWaitReady(stream, attemptId);
    } catch (error) {
      if (openAttemptRef.current !== attemptId) return; // dibatalkan, abaikan
      console.error("Gagal akses/menampilkan kamera:", error);
      stopCamera();
      setStage("camera-error");
    }
  };

  // Tombol "Coba Lagi" di layar camera-error -> WAJIB minta akses kamera lagi
  const handleRetryCameraAccess = async () => {
    await openCamera({ forceNew: true });
  };

  const handleTakePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    // Jaga-jaga: kalau video ternyata blank (belum ada frame nyata),
    // jangan ambil foto hitam — paksa buka ulang akses kamera dulu.
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setErrorMessage(
        "Kamera tidak menampilkan gambar. Membuka ulang kamera...",
      );
      void openCamera({ forceNew: true });
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        // Stream TIDAK di-stop di sini supaya retake bisa pakai ulang
        // stream yang sama tanpa perlu buka kamera dari nol.
        setCapturedBlob(blob);
        setCapturedPreviewUrl(URL.createObjectURL(blob));
        setStage("captured");
      },
      "image/jpeg",
      0.9,
    );
  };

  // Retake: coba pakai ulang stream yang sama dulu (cepat, tidak blank).
  // Kalau stream ternyata sudah mati / videoWidth tetap 0, otomatis
  // fallback ke re-request akses kamera penuh lewat openCamera({forceNew:true}).
  const handleRetakePhoto = async () => {
    if (capturedPreviewUrl) URL.revokeObjectURL(capturedPreviewUrl);
    setCapturedPreviewUrl(null);
    setCapturedBlob(null);
    setErrorMessage(null);

    if (isStreamLive() && videoRef.current) {
      const attemptId = ++openAttemptRef.current;
      setStage("camera");
      try {
        const stream = streamRef.current!;
        await new Promise((r) => requestAnimationFrame(r));
        if (openAttemptRef.current !== attemptId) return;
        await attachStreamAndWaitReady(stream, attemptId);
        return;
      } catch (error) {
        if (openAttemptRef.current !== attemptId) return;
        console.warn(
          "Stream lama gagal dipakai ulang, buka ulang kamera:",
          error,
        );
      }
    }

    // Fallback wajib: minta akses kamera baru
    await openCamera({ forceNew: true });
  };

  const handleSendAnswer = async () => {
    if (!studentQuestionItemId || !capturedBlob) return;
    setErrorMessage(null);
    setStage("submitting");

    try {
      const res = await onSubmitPhoto(studentQuestionItemId, capturedBlob);
      setResult(res);
      setStage("result");

      if (res.isCorrect) {
        // Otomatis lanjut ke barang berikutnya setelah beberapa detik,
        // tapi siswa tetap bisa menekan "Lanjut Sekarang" kapan saja.
        advanceTimeoutRef.current = setTimeout(() => {
          onAdvance();
        }, RUN_AUTO_ADVANCE_MS);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Jawaban gagal dikirim. Coba kirim lagi ya.");
      setStage("captured");
    }
  };

  // Coba lagi setelah jawaban salah: sama seperti retake, coba pakai ulang
  // stream dulu, fallback wajib re-request kamera kalau gagal/blank.
  const handleTryAgainAfterWrong = async () => {
    setResult(null);
    if (capturedPreviewUrl) URL.revokeObjectURL(capturedPreviewUrl);
    setCapturedPreviewUrl(null);
    setCapturedBlob(null);
    setErrorMessage(null);

    if (isStreamLive() && videoRef.current) {
      const attemptId = ++openAttemptRef.current;
      setStage("camera");
      try {
        const stream = streamRef.current!;
        await new Promise((r) => requestAnimationFrame(r));
        if (openAttemptRef.current !== attemptId) return;
        await attachStreamAndWaitReady(stream, attemptId);
        return;
      } catch (error) {
        if (openAttemptRef.current !== attemptId) return;
        console.warn(
          "Stream lama gagal dipakai ulang, buka ulang kamera:",
          error,
        );
      }
    }

    await openCamera({ forceNew: true });
  };

  const handleAdvanceNow = () => {
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    onAdvance();
  };

  const handleExitRun = () => {
    openAttemptRef.current += 1;
    stopCamera();
    clearCameraReadyTimeout();
    window.speechSynthesis?.cancel();
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-0 sm:p-3">
      <div className="bg-[#FDFBF7] w-full h-full sm:h-auto sm:max-w-md rounded-none sm:rounded-3xl overflow-hidden shadow-2xl relative max-h-screen sm:max-h-[92vh] flex flex-col">
        {/* Indikator progres "Soal X dari Y" */}
        {stage !== "camera" && (
          <div className="absolute top-3 left-3 z-10 bg-[#2D332D]/85 text-white text-[10px] font-black px-2.5 py-1 rounded-full">
            Soal {position} / {total}
          </div>
        )}

        {/* Tombol keluar dari mode jalan otomatis - selalu ada kecuali saat kamera aktif */}
        {stage !== "camera" && (
          <button
            onClick={handleExitRun}
            aria-label="Keluar dari mode berjalan"
            className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-white text-[#2D332D] rounded-full p-2 shadow-md"
          >
            <X size={20} />
          </button>
        )}

        {/* ===== Layar: perkenalan modul baru (hanya muncul saat pindah modul) ===== */}
        {stage === "module-intro" && (
          <div className="p-5 sm:p-6 pt-14 flex-1 sm:flex-initial flex flex-col items-center justify-center text-center gap-4 overflow-y-auto">
            <div className="flex items-center gap-2 text-[#8DAA7B] font-black text-sm">
              <Target size={18} /> Modul Baru
            </div>
            <p className="text-xl sm:text-2xl font-black text-[#2D332D]">
              {module.title}
            </p>
            {module.description && (
              <p className="text-sm text-[#6B705C] leading-relaxed">
                {module.description}
              </p>
            )}

            <button
              onClick={speakModuleIntro}
              aria-label="Dengarkan nama modul"
              className="flex items-center gap-1.5 text-xs bg-[#8DAA7B]/10 text-[#6f8a63] px-3 py-1.5 rounded-full font-bold active:bg-[#8DAA7B]/20"
            >
              <Volume2 size={14} /> Dengar Lagi
            </button>

            <button
              onClick={handleBeginModule}
              className="w-full flex items-center justify-center gap-2 text-base sm:text-lg bg-[#8DAA7B] text-white px-5 py-3.5 sm:py-4 rounded-2xl font-black active:bg-[#6f8a63] shadow-lg"
            >
              <PlayCircle size={22} /> Mulai Modul Ini
            </button>
          </div>
        )}

        {/* ===== Layar: perkenalan barang yang harus dicari ===== */}
        {stage === "intro" && (
          <div className="p-5 sm:p-6 pt-14 flex-1 sm:flex-initial flex flex-col items-center justify-center text-center gap-3 sm:gap-4 overflow-y-auto">
            <div className="flex items-center gap-2 text-[#8DAA7B] font-black text-sm">
              <Search size={18} /> Ayo Cari Barang Ini!
            </div>

            <div
              className="w-36 h-36 sm:w-48 sm:h-48 rounded-3xl bg-cover bg-center border-4 border-[#8DAA7B]/30 shadow-inner shrink-0"
              style={
                item.image
                  ? { backgroundImage: `url(${item.image})` }
                  : { backgroundColor: "#E8ECE4" }
              }
            />

            <p className="text-xl sm:text-2xl font-black text-[#2D332D]">
              {item.name}
            </p>
            <p className="text-[10px] text-[#8DAA7B] font-bold uppercase tracking-wide">
              {question.title}
            </p>

            <button
              onClick={speakItemName}
              aria-label="Dengarkan nama barang"
              className="flex items-center gap-1.5 text-xs bg-[#8DAA7B]/10 text-[#6f8a63] px-3 py-1.5 rounded-full font-bold active:bg-[#8DAA7B]/20"
            >
              <Volume2 size={14} /> Dengar Lagi
            </button>

            <p className="text-sm text-[#6B705C] leading-relaxed">
              Carilah barang ini di sekitarmu.
              <br />
              Kalau sudah ketemu, foto barangnya ya!
            </p>

            {errorMessage && (
              <p className="text-xs text-red-600 font-bold bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                {errorMessage}
              </p>
            )}

            <button
              onClick={handleBeginSearch}
              className="w-full flex items-center justify-center gap-2 text-base sm:text-lg bg-[#8DAA7B] text-white px-5 py-3.5 sm:py-4 rounded-2xl font-black active:bg-[#6f8a63] shadow-lg"
            >
              <PlayCircle size={22} /> Ayo, Mulai!
            </button>
          </div>
        )}

        {/* ===== Layar: menyiapkan (start soal / buka kamera) ===== */}
        {stage === "preparing" && (
          <div className="p-10 pt-14 flex-1 sm:flex-initial flex flex-col items-center justify-center text-center gap-3">
            <Loader2 size={36} className="animate-spin text-[#8DAA7B]" />
            <p className="text-base font-black text-[#2D332D]">
              Tunggu sebentar ya...
            </p>
            <p className="text-xs text-[#6B705C]">Kamera sedang disiapkan.</p>
          </div>
        )}

        {/* ===== Layar: kamera gagal dibuka / izin ditolak / blank ===== */}
        {stage === "camera-error" && (
          <div className="p-5 sm:p-6 pt-14 flex-1 sm:flex-initial flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle size={30} className="text-amber-500" />
            </div>
            <p className="text-lg font-black text-[#2D332D]">
              Kamera Belum Bisa Dibuka
            </p>
            <p className="text-sm text-[#6B705C] leading-relaxed">
              Tolong minta bantuan guru atau orang tua untuk mengizinkan kamera
              di browser ya. Kita akan minta akses kamera lagi.
            </p>
            {errorMessage && (
              <p className="text-xs text-red-600 font-bold bg-red-50 border border-red-200 rounded-xl px-3 py-2 w-full">
                {errorMessage}
              </p>
            )}
            <button
              onClick={handleRetryCameraAccess}
              className="w-full flex items-center justify-center gap-2 text-base bg-[#8DAA7B] text-white px-5 py-3.5 rounded-2xl font-black active:bg-[#6f8a63] shadow-lg"
            >
              <RotateCcw size={18} /> Minta Akses Kamera Lagi
            </button>
          </div>
        )}

        {/* ===== Layar: overlay kamera fullscreen dalam modal ===== */}
        {stage === "camera" && (
          <div className="relative bg-black flex-1 min-h-[60vh] sm:min-h-[70vh] flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />

            <div className="absolute top-3 left-3 right-3 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-2xl px-3 py-2">
              <div
                className="w-9 h-9 rounded-lg bg-cover bg-center border border-white/40 shrink-0"
                style={
                  item.image ? { backgroundImage: `url(${item.image})` } : {}
                }
              />
              <p className="text-white text-xs sm:text-sm font-black truncate">
                Carilah: {item.name} ({position}/{total})
              </p>
              <button
                onClick={speakItemName}
                aria-label="Dengarkan nama barang"
                className="ml-auto shrink-0 bg-white/20 hover:bg-white/30 text-white rounded-full p-1.5"
              >
                <Volume2 size={14} />
              </button>
            </div>

            <button
              onClick={handleExitRun}
              aria-label="Keluar dari mode berjalan"
              className="absolute top-3 right-3 bg-white/90 hover:bg-white text-[#2D332D] rounded-full p-2 shadow-md ml-2"
              style={{ marginTop: "3.25rem" }}
            >
              <X size={18} />
            </button>

            {errorMessage && (
              <p className="absolute top-20 left-3 right-3 text-xs text-white font-bold bg-red-500/90 rounded-xl px-3 py-2 text-center">
                {errorMessage}
              </p>
            )}

            <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-2">
              <button
                onClick={handleTakePhoto}
                aria-label="Ambil foto"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white border-4 border-[#8DAA7B] shadow-xl active:scale-95 flex items-center justify-center"
              >
                <Camera
                  size={26}
                  className="sm:w-[30px] sm:h-[30px] text-[#8DAA7B]"
                />
              </button>
              <p className="text-white text-xs font-black bg-black/40 rounded-full px-3 py-1">
                Tekan untuk Foto
              </p>
            </div>
          </div>
        )}

        {/* ===== Layar: hasil foto, pilih kirim atau ulangi ===== */}
        {stage === "captured" && capturedPreviewUrl && (
          <div className="p-4 sm:p-5 pt-14 flex-1 sm:flex-initial flex flex-col items-center justify-center text-center gap-3 overflow-y-auto">
            <p className="text-base font-black text-[#2D332D]">
              Foto Sudah Bagus?
            </p>
            <div
              className="w-full max-w-xs sm:max-w-none aspect-square rounded-2xl bg-cover bg-center border-2 border-[#DDE2D8]"
              style={{ backgroundImage: `url(${capturedPreviewUrl})` }}
            />

            {errorMessage && (
              <p className="text-xs text-red-600 font-bold bg-red-50 border border-red-200 rounded-xl px-3 py-2 w-full">
                {errorMessage}
              </p>
            )}

            <div className="w-full grid grid-cols-2 gap-2.5">
              <button
                onClick={handleRetakePhoto}
                className="flex items-center justify-center gap-1.5 text-sm bg-white border-2 border-[#DDE2D8] text-[#6B705C] px-3 py-3.5 rounded-2xl font-black active:bg-[#F5F7F2]"
              >
                <RotateCcw size={17} /> Foto Ulang
              </button>
              <button
                onClick={handleSendAnswer}
                className="flex items-center justify-center gap-1.5 text-sm bg-[#8DAA7B] text-white px-3 py-3.5 rounded-2xl font-black active:bg-[#6f8a63] shadow-lg"
              >
                <Send size={17} /> Kirim
              </button>
            </div>
          </div>
        )}

        {/* ===== Layar: mengirim jawaban ===== */}
        {stage === "submitting" && (
          <div className="p-10 pt-14 flex-1 sm:flex-initial flex flex-col items-center justify-center text-center gap-3">
            <Loader2 size={36} className="animate-spin text-[#8DAA7B]" />
            <p className="text-base font-black text-[#2D332D]">
              Sedang Mengirim...
            </p>
            <p className="text-xs text-[#6B705C]">Sabar sebentar ya.</p>
          </div>
        )}

        {/* ===== Layar: hasil jawaban ===== */}
        {stage === "result" && result && (
          <div className="p-5 sm:p-6 pt-14 flex-1 sm:flex-initial flex flex-col items-center justify-center text-center gap-4 overflow-y-auto">
            {result.isCorrect ? (
              <>
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2
                    size={38}
                    className="sm:w-11 sm:h-11 text-emerald-500"
                  />
                </div>
                <p className="text-xl sm:text-2xl font-black text-emerald-600">
                  Hebat, Benar!
                </p>
                <p className="text-sm text-[#6B705C]">
                  Kamu berhasil menemukan {item.name}. Skor kamu: {result.score}
                  .
                </p>
                {position < total ? (
                  <>
                    <p className="text-xs text-[#8DAA7B] font-bold">
                      Lanjut otomatis ke soal berikutnya...
                    </p>
                    <button
                      onClick={handleAdvanceNow}
                      className="w-full flex items-center justify-center gap-2 text-base sm:text-lg bg-emerald-500 text-white px-5 py-3.5 sm:py-4 rounded-2xl font-black active:bg-emerald-600 shadow-lg"
                    >
                      <SkipForward size={20} /> Lanjut Sekarang
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleAdvanceNow}
                    className="w-full flex items-center justify-center gap-2 text-base sm:text-lg bg-emerald-500 text-white px-5 py-3.5 sm:py-4 rounded-2xl font-black active:bg-emerald-600 shadow-lg"
                  >
                    <Trophy size={20} /> Selesaikan Level
                  </button>
                )}
              </>
            ) : (
              <>
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-100 flex items-center justify-center">
                  <XCircle
                    size={38}
                    className="sm:w-11 sm:h-11 text-amber-500"
                  />
                </div>
                <p className="text-xl sm:text-2xl font-black text-amber-600">
                  Belum Tepat
                </p>
                <p className="text-sm text-[#6B705C]">
                  Sepertinya itu bukan {item.name}. Tidak apa-apa, coba foto
                  lagi ya, kamu pasti bisa!
                </p>
                <button
                  onClick={handleTryAgainAfterWrong}
                  className="w-full flex items-center justify-center gap-2 text-base sm:text-lg bg-[#8DAA7B] text-white px-5 py-3.5 sm:py-4 rounded-2xl font-black active:bg-[#6f8a63] shadow-lg"
                >
                  <RotateCcw size={20} /> Coba Lagi
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ==== Layar penutup: muncul saat semua barang di antrian mode jalan otomatis selesai ====
function LevelRunFinishedModal({
  totalCompleted,
  onClose,
}: {
  totalCompleted: number;
  onClose: () => void;
}) {
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        "Hebat! Semua soal di level ini sudah selesai.",
      );
      utterance.lang = "id-ID";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }

    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3">
      <div className="bg-[#FDFBF7] w-full max-w-md rounded-3xl p-5 sm:p-6 flex flex-col items-center text-center gap-4 shadow-2xl">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 flex items-center justify-center">
          <Trophy size={38} className="sm:w-11 sm:h-11 text-emerald-500" />
        </div>
        <p className="text-xl sm:text-2xl font-black text-emerald-600">
          Hebat, Level Selesai!
        </p>
        <p className="text-sm text-[#6B705C]">
          Kamu sudah menyelesaikan {totalCompleted} soal di level ini.
        </p>
        <button
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 text-base sm:text-lg bg-emerald-500 text-white px-5 py-3.5 sm:py-4 rounded-2xl font-black active:bg-emerald-600 shadow-lg"
        >
          <CheckCircle2 size={20} /> Selesai
        </button>
      </div>
    </div>
  );
}

// Komponen kecil
function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[#F9FBF7] border border-[#E8EEE2] rounded-lg p-1.5">
      <p className="text-[8px] sm:text-[9px] text-[#6B705C] font-black leading-tight">
        {label}
      </p>
      <p className="text-sm font-black text-[#2D332D]">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    COMPLETED: { bg: "bg-emerald-500", text: "Selesai" },
    IN_PROGRESS: { bg: "bg-amber-500", text: "Progress" },
    NOT_STARTED: { bg: "bg-slate-400", text: "Belum" },
  };
  const c = config[status] ?? config.NOT_STARTED;

  return (
    <span
      className={`${c.bg} text-white px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider whitespace-nowrap`}
    >
      {c.text}
    </span>
  );
}
