// --- Enum & Helper Types ---
export enum QuestionItemType {
  PRODUCT = 'PRODUCT',
  MONEY = 'MONEY',
}

export interface MoneyNominalMap {
  [nominal: string]: number;
}

// --- Entitas ---

export interface Level {
  id: string;
  name: string;
  description: string;
  orderNumber: number;
  weight: number;
  modules?: LearningModule[];
  createdAt: string;
  updatedAt: string;
}

export interface LearningModule {
  id: string;
  level_id: string; // ID referensi
  level?: Level;
  questions?: Question[];
  title: string;
  description: string;
  orderNumber: number;
  weight: number;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  module_id: string; // ID referensi
  module?: LearningModule;
  items?: QuestionItem[];
  title: string;
  instruction: string;
  orderNumber: number;
  weight: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionItem {
  id: string;
  question_id: string; // ID referensi
  question?: Question;
  type: QuestionItemType;
  name: string;
  image: string;
  price: number;
  quantity: number;
  weight: number;
  orderNumber: number;
  moneyNominals?: MoneyNominalMap | null;
  createdAt: string;
  updatedAt: string;
}