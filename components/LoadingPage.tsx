"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles, Gamepad2, Heart } from "lucide-react";

interface LoadingPageProps {
  onComplete: () => void;
}

export default function LoadingPage({ onComplete }: LoadingPageProps) {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState(
    "Menyiapkan mainan edukasi...",
  );
  const [isLoaded, setIsLoaded] = useState(false);

  const texts = [
    "Menyiapkan mainan edukasi...",
    "Meniup balon warna-warni... 🎈",
    "Mengumpulkan bintang prestasi... ⭐",
    "Merapikan papan angka... 🔢",
    "Menghangatkan senyum ceria... 💛",
  ];

  useEffect(() => {
    let textIndex = 0;
    const textInterval = setInterval(() => {
      textIndex = (textIndex + 1) % texts.length;
      setLoadingText(texts[textIndex]);
    }, 800);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          clearInterval(textInterval);
          setIsLoaded(true);
          return 100;
        }
        const step = Math.floor(Math.random() * 15) + 5;
        return Math.min(prev + step, 100);
      });
    }, 250);

    return () => {
      clearInterval(progressInterval);
      clearInterval(textInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F7F2] flex flex-col justify-between p-6 items-center select-none text-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-10 left-10 w-16 h-16 bg-[#E1EAD8] rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-[#FFD166]/20 rounded-full blur-2xl" />

      {/* Brand Header */}
      <div className="w-full pt-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center items-center gap-2"
        >
          <span className="text-3xl">🧩</span>
          <span className="font-display text-2xl font-bold tracking-tight text-[#2D332D]">
            EduGrahita
          </span>
        </motion.div>
        <p className="text-[#8DAA7B] text-xs font-bold mt-1 tracking-widest uppercase">
          Belajar & Bermain Ceria
        </p>
      </div>

      {/* Mascot Animation */}
      <div className="flex-1 flex flex-col items-center justify-center relative w-full">
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          <div className="w-32 h-32 bg-[#FFD166] rounded-full flex items-center justify-center text-6xl shadow-lg border-4 border-[#4A5043]">
            ☀️
          </div>
          <motion.div
            animate={{ rotate: [-10, 10, -10] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="absolute -bottom-2 -right-2 text-3xl"
          >
            👋
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8"
        >
          <h1 className="font-display text-2xl font-extrabold text-[#2D332D]">
            Halo! Aku Tiko ✨
          </h1>
          <p className="text-[#6B705C] font-bold text-sm mt-2">
            Mari mulai berpetualang!
          </p>
        </motion.div>
      </div>

      {/* Progress Section */}
      <div className="w-full max-w-sm pb-8 flex flex-col items-center">
        {!isLoaded ? (
          <div className="w-full space-y-3">
            <p className="text-[#4A5043] font-bold text-xs h-5">
              {loadingText}
            </p>
            <div className="w-full h-4 bg-[#DDE2D8] rounded-full overflow-hidden p-0.5 shadow-inner">
              <motion.div
                className="h-full bg-[#8DAA7B] rounded-full"
                animate={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[#2D332D] font-black text-[10px]">
              {progress}% Siap!
            </span>
          </div>
        ) : (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={onComplete}
            className="w-full py-4 bg-[#FFD166] hover:bg-[#FFC331] text-[#5F4B1A] rounded-2xl font-display font-extrabold text-lg shadow-md border-b-4 border-amber-600 active:translate-y-1 active:border-b-0 flex items-center justify-center gap-2"
          >
            <Gamepad2 className="w-5 h-5" /> MULAI BERMAIN{" "}
            <Sparkles className="w-5 h-5" />
          </motion.button>
        )}

        <div className="mt-6 flex items-center gap-1.5 text-[#6B705C] text-[10px] font-bold">
          <Heart className="w-3 h-3 fill-[#8DAA7B] text-[#8DAA7B]" /> Ramah
          Sensorik
        </div>
      </div>
    </div>
  );
}
