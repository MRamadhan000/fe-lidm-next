import { User } from './user'; // Pastikan path ke User type benar

export interface Class {
  id: string;
  teacher_id: string;
  name: string;
  period: string;
  created_at: Date | string;
  updated_at: Date | string;
  
  // Relasi
  teacher?: User;
  students?: ClassStudent[];
  classLevels?: ClassLevel[];
}

export interface ClassStudent {
  id: string;
  class_id: string;
  student_id: string;
  created_at: Date | string;
  
  // Relasi
  class?: Class;
  student?: User;
}

export interface ClassLevel {
  id: string;
  class_id: string; // Opsional: Tambahkan field ini jika kamu juga menaruh FK di entitas
  level_id: string; // Opsional: Tambahkan field ini jika kamu juga menaruh FK di entitas
  
  isLocked: boolean;
  unlockedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  
  // Relasi
  class?: Class;
  level?: any; // Ganti 'any' dengan interface Level dari 'src/learning-module/entities/level.entity'
}