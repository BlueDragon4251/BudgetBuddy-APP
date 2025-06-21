export type TransactionType = 'income' | 'expense';

export type TransactionFrequency = 'once' | 'monthly' | 'yearly';

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string; // ISO date string
  type: TransactionType;
  frequency: TransactionFrequency;
  isFixed: boolean;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
}

export interface MonthSummary {
  month: string; // Format: YYYY-MM
  income: number;
  expense: number;
  balance: number;
}

export interface FinanceData {
  transactions: Transaction[];
  categories: Category[];
  monthlySummaries: MonthSummary[];
}

export interface BackupData {
  finances: FinanceData;
  settings: AppSettings;
  lastBackupDate: string; // ISO date string
}

export interface AppSettings {
  currency: string;
  language: string;
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
}

export interface AppVersion {
  latestVersion: string;
  minVersion: string;
  currentVersion: string;
  forceUpdate: boolean;
  message: string;
  changelog: string[];
  downloadUrl: string;
}