import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { BackupData } from '@/types/finance';
import { useFinanceStore } from './useFinanceStore';
import { useSettingsStore } from './useSettingsStore';

interface BackupState {
  lastBackupDate: string | null;
  backupPath: string | null;
  isRestoring: boolean;
  createBackup: () => Promise<boolean>;
  restoreFromBackup: (path?: string) => Promise<boolean>;
  setIsRestoring: (isRestoring: boolean) => void;
}

// Helper to get the backup directory
const getBackupDirectory = async () => {
  if (Platform.OS === 'web') {
    return null;
  }
  
  // For mobile, we'll use the document directory
  const docDir = FileSystem.documentDirectory;
  const backupDir = `${docDir}BudgetBuddy/`;
  
  // Check if directory exists, if not create it
  const dirInfo = await FileSystem.getInfoAsync(backupDir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(backupDir, { intermediates: true });
  }
  
  return backupDir;
};

export const useBackupStore = create<BackupState>()(
  persist(
    (set, get) => ({
      lastBackupDate: null,
      backupPath: null,
      isRestoring: false,

      createBackup: async () => {
        try {
          if (Platform.OS === 'web') {
            console.log('Backup not supported on web');
            return false;
          }

          const backupDir = await getBackupDirectory();
          if (!backupDir) return false;

          const finances = useFinanceStore.getState();
          const settings = useSettingsStore.getState();
          
          const backupData: BackupData = {
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

          const backupPath = `${backupDir}backup.json`;
          await FileSystem.writeAsStringAsync(
            backupPath,
            JSON.stringify(backupData, null, 2)
          );

          set({
            lastBackupDate: backupData.lastBackupDate,
            backupPath,
          });

          console.log('Backup created successfully at:', backupPath);
          return true;
        } catch (error) {
          console.error('Backup failed:', error);
          return false;
        }
      },

      restoreFromBackup: async (path) => {
        try {
          if (Platform.OS === 'web') {
            console.log('Restore not supported on web');
            return false;
          }

          set({ isRestoring: true });

          const backupPath = path || get().backupPath;
          if (!backupPath) {
            console.log('No backup path provided, checking default location');
            // Try to find backup in default location
            const backupDir = await getBackupDirectory();
            if (!backupDir) {
              console.error('Could not get backup directory');
              set({ isRestoring: false });
              return false;
            }
            
            const defaultBackupPath = `${backupDir}backup.json`;
            const backupExists = await FileSystem.getInfoAsync(defaultBackupPath);
            
            if (!backupExists.exists) {
              console.log('No backup file found at default location:', defaultBackupPath);
              set({ isRestoring: false });
              return false;
            }
            
            console.log('Reading backup file from:', defaultBackupPath);
            const backupContent = await FileSystem.readAsStringAsync(defaultBackupPath);
            console.log('Backup content length:', backupContent.length);
            
            let backupData: BackupData;
            try {
              backupData = JSON.parse(backupContent);
              console.log('Backup data parsed successfully');
            } catch (parseError) {
              console.error('Failed to parse backup JSON:', parseError);
              set({ isRestoring: false });
              return false;
            }
            
            // Restore data
            const financeStore = useFinanceStore.getState();
            const settingsStore = useSettingsStore.getState();
            
            // Clear existing data
            financeStore.clearAllData();
            console.log('Cleared existing finance data');
            
            // Restore transactions
            backupData.finances.transactions.forEach(transaction => {
              financeStore.addTransaction({
                amount: transaction.amount,
                description: transaction.description,
                category: transaction.category,
                date: transaction.date,
                type: transaction.type,
                frequency: transaction.frequency,
                isFixed: transaction.isFixed,
              });
            });
            console.log('Restored transactions:', backupData.finances.transactions.length);
            
            // Restore categories (keeping default ones if none in backup)
            if (backupData.finances.categories.length > 0) {
              backupData.finances.categories.forEach(category => {
                financeStore.addCategory({
                  name: category.name,
                  type: category.type,
                  color: category.color,
                });
              });
              console.log('Restored categories:', backupData.finances.categories.length);
            }
            
            // Restore settings
            settingsStore.setCurrency(backupData.settings.currency);
            settingsStore.setLanguage(backupData.settings.language);
            settingsStore.setTheme(backupData.settings.theme);
            settingsStore.toggleNotifications(backupData.settings.notificationsEnabled);
            console.log('Restored settings');
            
            // Update monthly summaries
            financeStore.updateMonthlySummaries();
            console.log('Updated monthly summaries');
            
            set({
              lastBackupDate: backupData.lastBackupDate,
              backupPath: defaultBackupPath,
              isRestoring: false,
            });
            
            console.log('Restore completed successfully');
            return true;
          } else {
            console.log('Using provided backup path:', backupPath);
            const backupExists = await FileSystem.getInfoAsync(backupPath);
            
            if (!backupExists.exists) {
              console.error('Backup file does not exist at path:', backupPath);
              set({ isRestoring: false });
              return false;
            }
            
            console.log('Reading backup file from:', backupPath);
            const backupContent = await FileSystem.readAsStringAsync(backupPath);
            console.log('Backup content length:', backupContent.length);
            
            let backupData: BackupData;
            try {
              backupData = JSON.parse(backupContent);
              console.log('Backup data parsed successfully');
            } catch (parseError) {
              console.error('Failed to parse backup JSON:', parseError);
              set({ isRestoring: false });
              return false;
            }
            
            // Restore data
            const financeStore = useFinanceStore.getState();
            const settingsStore = useSettingsStore.getState();
            
            // Clear existing data
            financeStore.clearAllData();
            console.log('Cleared existing finance data');
            
            // Restore transactions
            backupData.finances.transactions.forEach(transaction => {
              financeStore.addTransaction({
                amount: transaction.amount,
                description: transaction.description,
                category: transaction.category,
                date: transaction.date,
                type: transaction.type,
                frequency: transaction.frequency,
                isFixed: transaction.isFixed,
              });
            });
            console.log('Restored transactions:', backupData.finances.transactions.length);
            
            // Restore categories (keeping default ones if none in backup)
            if (backupData.finances.categories.length > 0) {
              backupData.finances.categories.forEach(category => {
                financeStore.addCategory({
                  name: category.name,
                  type: category.type,
                  color: category.color,
                });
              });
              console.log('Restored categories:', backupData.finances.categories.length);
            }
            
            // Restore settings
            settingsStore.setCurrency(backupData.settings.currency);
            settingsStore.setLanguage(backupData.settings.language);
            settingsStore.setTheme(backupData.settings.theme);
            settingsStore.toggleNotifications(backupData.settings.notificationsEnabled);
            console.log('Restored settings');
            
            // Update monthly summaries
            financeStore.updateMonthlySummaries();
            console.log('Updated monthly summaries');
            
            set({
              lastBackupDate: backupData.lastBackupDate,
              backupPath: backupPath,
              isRestoring: false,
            });
            
            console.log('Restore completed successfully');
            return true;
          }
        } catch (error) {
          console.error('Restore failed:', error);
          set({ isRestoring: false });
          return false;
        }
      },

      setIsRestoring: (isRestoring) => set({ isRestoring }),
    }),
    {
      name: 'budgetbuddy-backup',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);