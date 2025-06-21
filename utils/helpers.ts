import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { BackupData } from '@/types/finance';
import { useFinanceStore } from '@/hooks/useFinanceStore';
import { useSettingsStore } from '@/hooks/useSettingsStore';

// Generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Format currency
export const formatCurrency = (amount: number, currency: string = '€'): string => {
  return `${amount.toFixed(2).replace('.', ',')} ${currency}`;
};

// Format date to German format
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Format month for display
export const formatMonth = (monthString: string): string => {
  const [year, month] = monthString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  
  return date.toLocaleDateString('de-DE', {
    month: 'long',
    year: 'numeric',
  });
};

// Get current month in YYYY-MM format
export const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// Export data to a file
export const exportData = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    console.log('Export not supported on web');
    return false;
  }

  try {
    const finances = useFinanceStore.getState();
    const settings = useSettingsStore.getState();
    
    const exportData: BackupData = {
      finances: {
        transactions: finances.transactions,
        categories: finances.categories,
        monthlySummaries: finances.monthlySummaries,
      },
      settings: {
        currency: settings.currency,
        language: settings.language,
        theme: settings.theme,
        notificationsEnabled: settings.notificationsEnabled,
      },
      lastBackupDate: new Date().toISOString(),
    };

    const fileName = `budgetbuddy_export_${new Date().toISOString().split('T')[0]}.json`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
    await FileSystem.writeAsStringAsync(
      fileUri,
      JSON.stringify(exportData, null, 2)
    );

    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Export failed:', error);
    return false;
  }
};

// Calculate monthly savings
export const calculateMonthlySavings = (income: number, expenses: number): number => {
  return income - expenses;
};

// Get month difference between two dates
export const getMonthDifference = (date1: Date, date2: Date): number => {
  const months1 = date1.getFullYear() * 12 + date1.getMonth();
  const months2 = date2.getFullYear() * 12 + date2.getMonth();
  return months1 - months2;
};

// Check if a date is in the current month
export const isCurrentMonth = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  
  return date.getMonth() === now.getMonth() && 
         date.getFullYear() === now.getFullYear();
};

// Check if a date is in a specific month (YYYY-MM format)
export const isInMonth = (dateString: string, monthString: string): boolean => {
  const date = new Date(dateString);
  const [year, month] = monthString.split('-');
  
  return date.getMonth() + 1 === parseInt(month) && 
         date.getFullYear() === parseInt(year);
};

// Get the first day of the current month
export const getFirstDayOfMonth = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

// Get the last day of the current month
export const getLastDayOfMonth = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0);
};