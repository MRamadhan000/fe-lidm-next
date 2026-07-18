'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { Level } from '@/types/learning';
import TabAdminModulBelajarLevel from './ModulBelajar/TabAdminModulBelajarLevel';
import TabAdminModulBelajarModul from './ModulBelajar/TabAdminModulBelajarModul';
import TabAdminModulBelajarSoal from './ModulBelajar/TabAdminModulBelajarSoal';

interface AdminTabModulBelajarProps {
  onPushSystemLog: (user: string, action: string, badge: string, badgeColor: string) => void;
}

export default function AdminTabModulBelajar({ onPushSystemLog }: AdminTabModulBelajarProps) {
  const [levels, setLevels] = useState<Level[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:3000/levels');
      const data = await res.json();
      const normalizedLevels = Array.isArray(data)
        ? [...data].sort((left, right) => left.orderNumber - right.orderNumber)
        : [];

      setLevels(normalizedLevels);
      setSelectedLevelId((current) => {
        if (current && normalizedLevels.some((level) => level.id === current)) {
          return current;
        }

        return normalizedLevels[0]?.id ?? null;
      });
    } catch (error) {
      console.error('Gagal mengambil data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      await fetchData();
    };

    void initialize();
  }, [fetchData]);

  // Handler Delete Modul
  const handleDeleteModule = async (moduleId: string, title: string) => {
    await fetchData();
    onPushSystemLog('Administrator', `Menghapus modul: ${title}`, 'Penghapusan', 'bg-rose-100 text-rose-800');
  };

  // Handler Delete Soal
  const handleDeleteQuestion = async (questionId: string, title: string) => {
    // Tambahkan fetch DELETE ke endpoint question Anda
    await fetchData();
    onPushSystemLog('Administrator', `Menghapus soal: ${title}`, 'Penghapusan', 'bg-rose-100 text-rose-800');
  };

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[#8DAA7B]" /></div>;

  // Mencari modul aktif
  const activeModule = levels
    .flatMap(l => l.modules || [])
    .find(m => m.id === activeModuleId);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 font-sans text-[#2D332D]">
      <TabAdminModulBelajarLevel
        selectedLevelId={selectedLevelId}
        levels={levels}
        onSelectLevel={(id) => { setSelectedLevelId(id); setActiveModuleId(null); }}
      />

      {!activeModuleId ? (
        <TabAdminModulBelajarModul
          levels={levels}
          selectedLevelId={selectedLevelId}
          onDeleteModule={handleDeleteModule}
          onManageQuestions={(moduleId) => setActiveModuleId(moduleId)}
          refreshData={fetchData}
        />
      ) : activeModule ? (
        <TabAdminModulBelajarSoal
          module={activeModule}
          onBackToModules={() => setActiveModuleId(null)}
          refreshData={fetchData}
          onDeleteQuestion={handleDeleteQuestion}
        />
      ) : null}
    </motion.div>
  );
}