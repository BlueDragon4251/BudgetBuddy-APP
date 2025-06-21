import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FinanceData, Transaction, Category, MonthSummary } from '@/types/finance';
import { generateId, getCurrentMonth, getMonthDifference } from '@/utils/helpers';

interface FinanceState extends FinanceData {
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  updateMonthlySummaries: () => void;
  clearAllData: () => void;
  lastCheckedMonth: string | null;
  checkRecurringTransactions: () => void;
  resetCurrentMonthTransactions: () => void;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Gehalt', type: 'income', color: '#38B000' },
  { id: 'cat-2', name: 'Bonus', type: 'income', color: '#4CAF50' },
  { id: 'cat-3', name: 'Investitionen', type: 'income', color: '#8BC34A' },
  { id: 'cat-4', name: 'Geschenke', type: 'income', color: '#CDDC39' },
  { id: 'cat-5', name: 'Sonstige Einnahmen', type: 'income', color: '#FFEB3B' },
  { id: 'cat-18', name: 'Nebenjob', type: 'income', color: '#9E7D0A' },
  { id: 'cat-19', name: 'Rückerstattungen', type: 'income', color: '#A2CFFE' },
  { id: 'cat-6', name: 'Miete', type: 'expense', color: '#E63946' },
  { id: 'cat-7', name: 'Lebensmittel', type: 'expense', color: '#FB8500' },
  { id: 'cat-8', name: 'Transport', type: 'expense', color: '#4361EE' },
  { id: 'cat-9', name: 'Freizeit', type: 'expense', color: '#7209B7' },
  { id: 'cat-10', name: 'Gesundheit', type: 'expense', color: '#F72585' },
  { id: 'cat-11', name: 'Versicherungen', type: 'expense', color: '#FF9FF3' },
  { id: 'cat-12', name: 'Abonnements', type: 'expense', color: '#560BAD' },
  { id: 'cat-13', name: 'Bildung', type: 'expense', color: '#480CA8' },
  { id: 'cat-14', name: 'Haushalt', type: 'expense', color: '#3A0CA3' },
  { id: 'cat-15', name: 'Kleidung', type: 'expense', color: '#2C0735' },
  { id: 'cat-16', name: 'Reisen', type: 'expense', color: '#720E07' },
  { id: 'cat-17', name: 'Sonstiges', type: 'expense', color: '#6C757D' },
  { id: 'cat-20', name: 'Essen gehen', type: 'expense', color: '#FF5722' },
  { id: 'cat-21', name: 'Technik', type: 'expense', color: '#607D8B' },
  { id: 'cat-22', name: 'Auto', type: 'expense', color: '#795548' },
  { id: 'cat-23', name: 'Wohnung', type: 'expense', color: '#9C27B0' },
];

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      transactions: [],
      categories: [],
      monthlySummaries: [],
      lastCheckedMonth: null,

      addTransaction: (transaction) => {
        const newTransaction = {
          ...transaction,
          id: generateId(),
        };
        set((state) => ({
          transactions: [...state.transactions, newTransaction],
        }));
        get().updateMonthlySummaries();
      },

      updateTransaction: (id, transaction) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...transaction } : t
          ),
        }));
        get().updateMonthlySummaries();
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
        get().updateMonthlySummaries();
      },

      addCategory: (category) => {
        const newCategory = {
          ...category,
          id: generateId(),
        };
        set((state) => ({
          categories: [...state.categories, newCategory],
        }));
      },

      updateCategory: (id, category) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...category } : c
          ),
        }));
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }));
      },

      updateMonthlySummaries: () => {
        const { transactions } = get();
        const summaryMap = new Map<string, MonthSummary>();

        // Group transactions by month
        transactions.forEach((transaction) => {
          const date = new Date(transaction.date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (!summaryMap.has(monthKey)) {
            summaryMap.set(monthKey, {
              month: monthKey,
              income: 0,
              expense: 0,
              balance: 0,
            });
          }

          const summary = summaryMap.get(monthKey)!;
          
          if (transaction.type === 'income') {
            summary.income += transaction.amount;
          } else {
            summary.expense += transaction.amount;
          }
          
          summary.balance = summary.income - summary.expense;
        });

        // Convert map to array and sort by month (newest first)
        const summaries = Array.from(summaryMap.values()).sort(
          (a, b) => new Date(b.month).getTime() - new Date(a.month).getTime()
        );

        set({ monthlySummaries: summaries });
      },

      checkRecurringTransactions: () => {
        const { transactions, lastCheckedMonth } = get();
        const currentMonth = getCurrentMonth();
        
        // If this is the first check or a new month has started
        if (!lastCheckedMonth || lastCheckedMonth !== currentMonth) {
          console.log("Checking recurring transactions for new month:", currentMonth);
          
          // Reset current month transactions if it's a new month
          if (lastCheckedMonth && lastCheckedMonth !== currentMonth) {
            get().resetCurrentMonthTransactions();
          }
          
          // Find all recurring transactions
          const recurringTransactions = transactions.filter(t => t.isFixed);
          
          // Create new transactions for the current month if they don't already exist
          const newTransactions: Transaction[] = [];
          
          recurringTransactions.forEach(transaction => {
            const transactionDate = new Date(transaction.date);
            const currentDate = new Date();
            
            // For monthly recurring transactions
            if (transaction.frequency === 'monthly') {
              // Check if we already have this transaction for the current month
              const existsForCurrentMonth = transactions.some(t => 
                t.description === transaction.description &&
                t.category === transaction.category &&
                t.type === transaction.type &&
                new Date(t.date).getMonth() === currentDate.getMonth() &&
                new Date(t.date).getFullYear() === currentDate.getFullYear()
              );
              
              if (!existsForCurrentMonth) {
                // Create a new transaction for the current month
                const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), transactionDate.getDate());
                
                // If the day doesn't exist in the current month (e.g., Feb 30), use the last day
                if (newDate.getMonth() !== currentDate.getMonth()) {
                  newDate.setDate(0); // Last day of previous month
                }
                
                newTransactions.push({
                  id: generateId(),
                  description: transaction.description,
                  category: transaction.category,
                  amount: transaction.amount, // Use the original amount
                  type: transaction.type,
                  date: newDate.toISOString(),
                  frequency: transaction.frequency,
                  isFixed: transaction.isFixed
                });
              }
            }
            
            // For yearly recurring transactions
            else if (transaction.frequency === 'yearly') {
              // Only create if the month and day match
              if (transactionDate.getMonth() === currentDate.getMonth()) {
                // Check if we already have this transaction for the current year
                const existsForCurrentYear = transactions.some(t => 
                  t.description === transaction.description &&
                  t.category === transaction.category &&
                  t.type === transaction.type &&
                  new Date(t.date).getMonth() === currentDate.getMonth() &&
                  new Date(t.date).getFullYear() === currentDate.getFullYear()
                );
                
                if (!existsForCurrentYear) {
                  // Create a new transaction for the current year
                  const newDate = new Date(currentDate.getFullYear(), transactionDate.getMonth(), transactionDate.getDate());
                  
                  newTransactions.push({
                    id: generateId(),
                    description: transaction.description,
                    category: transaction.category,
                    amount: transaction.amount, // Use the original amount
                    type: transaction.type,
                    date: newDate.toISOString(),
                    frequency: transaction.frequency,
                    isFixed: transaction.isFixed
                  });
                }
              }
            }
          });
          
          // Add the new transactions
          if (newTransactions.length > 0) {
            console.log(`Adding ${newTransactions.length} recurring transactions for ${currentMonth}`);
            set(state => ({
              transactions: [...state.transactions, ...newTransactions],
              lastCheckedMonth: currentMonth
            }));
            
            // Update monthly summaries to include the new transactions
            setTimeout(() => {
              get().updateMonthlySummaries();
            }, 100);
          } else {
            // Just update the last checked month
            set({ lastCheckedMonth: currentMonth });
          }
        }
      },

      resetCurrentMonthTransactions: () => {
        const { transactions } = get();
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        
        // Keep all transactions except non-recurring ones from the current month
        const filteredTransactions = transactions.filter(transaction => {
          const transactionDate = new Date(transaction.date);
          const isCurrentMonth = 
            transactionDate.getFullYear() === currentYear && 
            transactionDate.getMonth() === currentMonth;
          
          // Keep if it's not current month OR it's a fixed/recurring transaction
          return !isCurrentMonth || transaction.isFixed;
        });
        
        set({ transactions: filteredTransactions });
        console.log("Reset current month non-recurring transactions");
      },

      clearAllData: () => {
        set({
          transactions: [],
          categories: DEFAULT_CATEGORIES,
          monthlySummaries: [],
          lastCheckedMonth: null
        });
      },
    }),
    {
      name: 'budgetbuddy-finances',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log("Rehydrating finance store, initial categories count:", state.categories.length);
          
          if (state.categories.length === 0) {
            console.log("No categories found, initializing with default categories");
            state.categories = DEFAULT_CATEGORIES;
          } else {
            // Remove duplicates by name
            const uniqueCategories = state.categories.filter(
              (category, index, self) =>
                index === self.findIndex((c) => c.name === category.name)
            );
            console.log("After removing duplicates, categories count:", uniqueCategories.length);
            state.categories = uniqueCategories;
            
            // Ensure all default categories are present
            DEFAULT_CATEGORIES.forEach(defaultCat => {
              if (!state.categories.some(cat => cat.name === defaultCat.name)) {
                console.log("Adding missing default category:", defaultCat.name);
                state.categories.push(defaultCat);
              }
            });
            console.log("Final categories count after adding missing defaults:", state.categories.length);
          }
        }
      }
    }
  )
);