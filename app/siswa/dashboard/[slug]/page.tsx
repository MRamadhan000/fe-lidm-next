'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
} from 'lucide-react';

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

// Target aktif: item + level yang sedang dikerjakan lewat modal kamera
interface ActiveTarget {
  lvl: DetailLevel;
  item: DetailItem;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function DetailKelasSiswaPageCompact() {
  const params = useParams<{ slug: string | string[] }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const router = useRouter();

  const [data, setData] = useState<StudentDashboardDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startedQuestionIds, setStartedQuestionIds] = useState<string[]>([]);
  const [studentId, setStudentId] = useState<string | null>(null);

  // key = questionItemId (item.id) -> progress state item tersebut
  const [itemProgress, setItemProgress] = useState<Record<string, ItemProgressState>>({});

  // item yang sedang dibuka lewat modal "cari & foto barang"
  const [activeTarget, setActiveTarget] = useState<ActiveTarget | null>(null);

  useEffect(() => {
    if (!slug) return;

    const session = localStorage.getItem('user_session');
    if (!session) {
      router.push('/login');
      return;
    }

    const { id: userId } = JSON.parse(session) as { id: string };
    setStudentId(userId);

    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE}/student-assessments/history?userId=${userId}&classId=${slug}`);
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

  const getItemProgress = (itemId: string): ItemProgressState => {
    return itemProgress[itemId] ?? { studentQuestionItemId: null, lastResult: null };
  };

  // === Panggil API /student-assessments/start, kembalikan studentQuestionItemId ===
  const ensureStarted = async (lvl: DetailLevel, item: DetailItem): Promise<string> => {
    const existing = getItemProgress(item.id).studentQuestionItemId;
    if (existing) return existing;
    if (!studentId) throw new Error('Sesi siswa tidak ditemukan.');

    const res = await fetch(`${API_BASE}/student-assessments/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId,
        classLevelId: lvl.classLevelId,
        questionItemId: item.id,
      }),
    });
    if (!res.ok) throw new Error('Gagal memulai pengerjaan item');

    const result = (await res.json()) as StartAnswerResponse;

    setItemProgress((prev) => ({
      ...prev,
      [item.id]: { ...getItemProgress(item.id), studentQuestionItemId: result.id },
    }));

    return result.id;
  };

  // === Panggil API submit foto jawaban ===
  const submitPhoto = async (item: DetailItem, studentQuestionItemId: string, blob: Blob): Promise<SubmitAnswerResponse> => {
    const formData = new FormData();
    formData.append('file', blob, 'jawaban.jpg');

    const res = await fetch(
      `${API_BASE}/student-assessments/${studentQuestionItemId}/item/${item.id}/submit`,
      { method: 'POST', body: formData },
    );
    if (!res.ok) throw new Error('Gagal mengirim jawaban');

    const result = (await res.json()) as SubmitAnswerResponse;

    setItemProgress((prev) => ({
      ...prev,
      [item.id]: { ...getItemProgress(item.id), lastResult: result },
    }));

    return result;
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

                            {/* Items List */}
                            {q.items.length > 0 && (
                              <div className="space-y-2 pt-1">
                                {q.items.map((item) => (
                                  <ItemRow
                                    key={item.id}
                                    item={item}
                                    progress={getItemProgress(item.id)}
                                    locked={lvl.isLocked}
                                    onOpen={() => setActiveTarget({ lvl, item })}
                                  />
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

      {/* Modal cari & foto barang */}
      {activeTarget && (
        <FindAndCaptureModal
          item={activeTarget.item}
          onClose={() => setActiveTarget(null)}
          onEnsureStarted={() => ensureStarted(activeTarget.lvl, activeTarget.item)}
          onSubmitPhoto={(studentQuestionItemId, blob) => submitPhoto(activeTarget.item, studentQuestionItemId, blob)}
        />
      )}
    </main>
  );
}

// ==== Baris ringkas tiap barang di dalam daftar soal ====
function ItemRow({
  item,
  progress,
  locked,
  onOpen,
}: {
  item: DetailItem;
  progress: ItemProgressState;
  locked: boolean;
  onOpen: () => void;
}) {
  const result = progress.lastResult;
  const isCorrectNow = result ? result.isCorrect : item.status === 'COMPLETED' && item.latestAnswer?.isCorrect;
  const hasResultThisSession = result !== null;

  return (
    <div className="flex gap-3 bg-[#F9FBF7] border border-[#ECF1E8] rounded-xl p-2.5 items-center">
      <div
        className="w-11 h-11 rounded-lg bg-cover bg-center border border-[#DDE2D8] shrink-0"
        style={item.image ? { backgroundImage: `url(${item.image})` } : {}}
      />
      <div className="min-w-0 flex-1 text-xs">
        <p className="font-bold text-[#2D332D] truncate">{item.name}</p>
        <p className="text-[#6B705C] mt-0.5">
          Rp{item.price} · Qty {item.quantity} · Bobot {item.weight}
        </p>
        {isCorrectNow ? (
          <p className="text-emerald-600 font-bold mt-0.5 flex items-center gap-1">
            <CheckCircle2 size={12} /> Benar{hasResultThisSession && result ? ` · Skor ${result.score}` : ''}
          </p>
        ) : hasResultThisSession && result ? (
          <p className="text-red-600 font-bold mt-0.5 flex items-center gap-1">
            <XCircle size={12} /> Belum tepat, coba lagi
          </p>
        ) : (
          <p className="text-[#8DAA7B] font-bold mt-0.5">
            {item.status} · {item.answerCount} jawaban
          </p>
        )}
      </div>

      {!isCorrectNow && (
        <button
          onClick={onOpen}
          disabled={locked}
          className="shrink-0 flex items-center gap-1.5 text-xs bg-[#8DAA7B] text-white px-3 py-2 rounded-xl font-bold active:bg-[#6f8a63] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Camera size={15} />
          {hasResultThisSession ? 'Foto Lagi' : 'Mulai'}
        </button>
      )}
    </div>
  );
}

// ============================================================
// Modal: cari barang -> izinkan kamera -> foto -> kirim jawaban
// Dirancang sederhana & ramah untuk anak tunagrahita:
// - satu langkah jelas per layar
// - teks pendek, kalimat sederhana
// - tombol besar dengan ikon + tulisan (bukan ikon saja)
// - warna & ikon dipakai bersamaan sebagai penanda benar/salah
// ============================================================

type ModalStage = 'intro' | 'preparing' | 'camera' | 'camera-error' | 'captured' | 'submitting' | 'result';

function FindAndCaptureModal({
  item,
  onClose,
  onEnsureStarted,
  onSubmitPhoto,
}: {
  item: DetailItem;
  onClose: () => void;
  onEnsureStarted: () => Promise<string>;
  onSubmitPhoto: (studentQuestionItemId: string, blob: Blob) => Promise<SubmitAnswerResponse>;
}) {
  const [stage, setStage] = useState<ModalStage>('intro');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [capturedPreviewUrl, setCapturedPreviewUrl] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [result, setResult] = useState<SubmitAnswerResponse | null>(null);
  const [studentQuestionItemId, setStudentQuestionItemId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Selalu matikan kamera saat modal ditutup / komponen dilepas
  useEffect(() => {
    return () => {
      stopCamera();
      if (capturedPreviewUrl) URL.revokeObjectURL(capturedPreviewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  // Langkah 1: siswa klik "Ayo, Mulai!" di layar intro
  const handleBeginSearch = async () => {
    setErrorMessage(null);
    setStage('preparing');

    try {
      const id = await onEnsureStarted();
      setStudentQuestionItemId(id);
      await openCamera();
    } catch (error) {
      console.error(error);
      setErrorMessage('Belum bisa memulai soal ini. Coba lagi ya.');
      setStage('intro');
    }
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      setStage('camera');

      // videoRef baru terpasang setelah render, tunggu sebentar lalu attach stream
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });
    } catch (error) {
      console.error('Gagal akses kamera:', error);
      setStage('camera-error');
    }
  };

  // Langkah 2: siswa tekan tombol bulat besar untuk memotret
  const handleTakePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        stopCamera();
        setCapturedBlob(blob);
        setCapturedPreviewUrl(URL.createObjectURL(blob));
        setStage('captured');
      },
      'image/jpeg',
      0.9,
    );
  };

  // Ambil ulang foto: buka kamera lagi
  const handleRetakePhoto = async () => {
    if (capturedPreviewUrl) URL.revokeObjectURL(capturedPreviewUrl);
    setCapturedPreviewUrl(null);
    setCapturedBlob(null);
    setStage('preparing');
    await openCamera();
  };

  // Langkah 3: kirim jawaban
  const handleSendAnswer = async () => {
    if (!studentQuestionItemId || !capturedBlob) return;
    setErrorMessage(null);
    setStage('submitting');

    try {
      const res = await onSubmitPhoto(studentQuestionItemId, capturedBlob);
      setResult(res);
      setStage('result');
    } catch (error) {
      console.error(error);
      setErrorMessage('Jawaban gagal dikirim. Coba kirim lagi ya.');
      setStage('captured');
    }
  };

  // Coba lagi setelah jawaban salah: langsung buka kamera lagi
  const handleTryAgainAfterWrong = async () => {
    setResult(null);
    if (capturedPreviewUrl) URL.revokeObjectURL(capturedPreviewUrl);
    setCapturedPreviewUrl(null);
    setCapturedBlob(null);
    setStage('preparing');
    await openCamera();
  };

  const handleCloseModal = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3">
      <div className="bg-[#FDFBF7] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative max-h-[92vh] flex flex-col">

        {/* Tombol tutup - selalu ada, besar & jelas */}
        {stage !== 'camera' && (
          <button
            onClick={handleCloseModal}
            aria-label="Tutup"
            className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-white text-[#2D332D] rounded-full p-2 shadow-md"
          >
            <X size={20} />
          </button>
        )}

        {/* ===== Layar 1: Perkenalan barang yang harus dicari ===== */}
        {stage === 'intro' && (
          <div className="p-6 flex flex-col items-center text-center gap-4">
            <div className="flex items-center gap-2 text-[#8DAA7B] font-black text-sm">
              <Search size={18} /> Ayo Cari Barang Ini!
            </div>

            <div
              className="w-48 h-48 rounded-3xl bg-cover bg-center border-4 border-[#8DAA7B]/30 shadow-inner"
              style={item.image ? { backgroundImage: `url(${item.image})` } : { backgroundColor: '#E8ECE4' }}
            />

            <p className="text-2xl font-black text-[#2D332D]">{item.name}</p>
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
              className="w-full flex items-center justify-center gap-2 text-lg bg-[#8DAA7B] text-white px-5 py-4 rounded-2xl font-black active:bg-[#6f8a63] shadow-lg"
            >
              <PlayCircle size={22} /> Ayo, Mulai!
            </button>
          </div>
        )}

        {/* ===== Layar: menyiapkan (start soal / buka kamera) ===== */}
        {stage === 'preparing' && (
          <div className="p-10 flex flex-col items-center text-center gap-3">
            <Loader2 size={36} className="animate-spin text-[#8DAA7B]" />
            <p className="text-base font-black text-[#2D332D]">Tunggu sebentar ya...</p>
            <p className="text-xs text-[#6B705C]">Kamera sedang disiapkan.</p>
          </div>
        )}

        {/* ===== Layar: kamera gagal dibuka / izin ditolak ===== */}
        {stage === 'camera-error' && (
          <div className="p-6 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle size={30} className="text-amber-500" />
            </div>
            <p className="text-lg font-black text-[#2D332D]">Kamera Belum Bisa Dibuka</p>
            <p className="text-sm text-[#6B705C] leading-relaxed">
              Tolong minta bantuan guru atau orang tua untuk mengizinkan kamera di browser ya.
            </p>
            <button
              onClick={handleBeginSearch}
              className="w-full flex items-center justify-center gap-2 text-base bg-[#8DAA7B] text-white px-5 py-3.5 rounded-2xl font-black active:bg-[#6f8a63] shadow-lg"
            >
              <RotateCcw size={18} /> Coba Lagi
            </button>
          </div>
        )}

        {/* ===== Layar: overlay kamera fullscreen dalam modal ===== */}
        {stage === 'camera' && (
          <div className="relative bg-black flex-1 min-h-[70vh] flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Pengingat barang target, mengambang di atas kamera */}
            <div className="absolute top-3 left-3 right-3 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-2xl px-3 py-2">
              <div
                className="w-9 h-9 rounded-lg bg-cover bg-center border border-white/40 shrink-0"
                style={item.image ? { backgroundImage: `url(${item.image})` } : {}}
              />
              <p className="text-white text-sm font-black truncate">Carilah: {item.name}</p>
            </div>

            <button
              onClick={handleCloseModal}
              aria-label="Tutup kamera"
              className="absolute top-3 right-3 bg-white/90 hover:bg-white text-[#2D332D] rounded-full p-2 shadow-md ml-2"
              style={{ marginTop: '3.25rem' }}
            >
              <X size={18} />
            </button>

            {/* Tombol jepret besar di bawah, seperti aplikasi kamera pada umumnya */}
            <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-2">
              <button
                onClick={handleTakePhoto}
                aria-label="Ambil foto"
                className="w-20 h-20 rounded-full bg-white border-4 border-[#8DAA7B] shadow-xl active:scale-95 flex items-center justify-center"
              >
                <Camera size={30} className="text-[#8DAA7B]" />
              </button>
              <p className="text-white text-xs font-black bg-black/40 rounded-full px-3 py-1">Tekan untuk Foto</p>
            </div>
          </div>
        )}

        {/* ===== Layar: hasil foto, pilih kirim atau ulangi ===== */}
        {stage === 'captured' && capturedPreviewUrl && (
          <div className="p-5 flex flex-col items-center text-center gap-3">
            <p className="text-base font-black text-[#2D332D]">Foto Sudah Bagus?</p>
            <div
              className="w-full aspect-square rounded-2xl bg-cover bg-center border-2 border-[#DDE2D8]"
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
        {stage === 'submitting' && (
          <div className="p-10 flex flex-col items-center text-center gap-3">
            <Loader2 size={36} className="animate-spin text-[#8DAA7B]" />
            <p className="text-base font-black text-[#2D332D]">Sedang Mengirim...</p>
            <p className="text-xs text-[#6B705C]">Sabar sebentar ya.</p>
          </div>
        )}

        {/* ===== Layar: hasil jawaban ===== */}
        {stage === 'result' && result && (
          <div className="p-6 flex flex-col items-center text-center gap-4">
            {result.isCorrect ? (
              <>
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 size={44} className="text-emerald-500" />
                </div>
                <p className="text-2xl font-black text-emerald-600">Hebat, Benar!</p>
                <p className="text-sm text-[#6B705C]">Kamu berhasil menemukan {item.name}. Skor kamu: {result.score}.</p>
                <button
                  onClick={handleCloseModal}
                  className="w-full flex items-center justify-center gap-2 text-lg bg-emerald-500 text-white px-5 py-4 rounded-2xl font-black active:bg-emerald-600 shadow-lg"
                >
                  <CheckCircle2 size={20} /> Selesai
                </button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
                  <XCircle size={44} className="text-amber-500" />
                </div>
                <p className="text-2xl font-black text-amber-600">Belum Tepat</p>
                <p className="text-sm text-[#6B705C]">
                  Sepertinya itu bukan {item.name}. Tidak apa-apa, coba foto lagi ya, kamu pasti bisa!
                </p>
                <button
                  onClick={handleTryAgainAfterWrong}
                  className="w-full flex items-center justify-center gap-2 text-lg bg-[#8DAA7B] text-white px-5 py-4 rounded-2xl font-black active:bg-[#6f8a63] shadow-lg"
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