import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useFinanceStore } from '@/hooks/useFinanceStore';
import { useSettingsStore } from '@/hooks/useSettingsStore';
import { FONT_SIZE, FONT_WEIGHT, SPACING } from '@/constants/theme';
import { formatCurrency, getCurrentMonth } from '@/utils/helpers';
import { TransactionCard } from '@/components/ui/TransactionCard';
import { MonthSummaryCard } from '@/components/ui/MonthSummaryCard';
import { Card } from '@/components/ui/Card';
import { TransactionModal } from '@/components/modals/TransactionModal';
import { ArrowDownCircle, ArrowUpCircle, Plus } from 'lucide-react-native';

export default function HomeScreen() {
  const { theme } = useTheme();
  const { transactions, monthlySummaries, updateMonthlySummaries, checkRecurringTransactions, resetCurrentMonthTransactions } = useFinanceStore();
  const { currency } = useSettingsStore();
  
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [refreshing, setRefreshing] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  
  // Get current month summary
  const currentMonthSummary = monthlySummaries.find(summary => summary.month === currentMonth);
  
  // Get previous month summary
  const previousMonthSummary = monthlySummaries[monthlySummaries.findIndex(summary => summary.month === currentMonth) + 1];
  
  // Get recent transactions (last 5) for the current month only
  const currentMonthTransactions = transactions
    .filter(t => {
      const transactionDate = new Date(t.date);
      const [year, month] = currentMonth.split('-');
      return transactionDate.getFullYear() === parseInt(year) && 
             transactionDate.getMonth() + 1 === parseInt(month);
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const recentTransactions = currentMonthTransactions.slice(0, 5);
  
  useEffect(() => {
    // Check for recurring transactions when the component mounts
    checkRecurringTransactions();
    updateMonthlySummaries();
  }, []);
  
  // Check if the month has changed
  useEffect(() => {
    const checkMonth = () => {
      const newCurrentMonth = getCurrentMonth();
      if (newCurrentMonth !== currentMonth) {
        setCurrentMonth(newCurrentMonth);
        resetCurrentMonthTransactions(); // Reset non-recurring transactions
        checkRecurringTransactions(); // Add recurring transactions for the new month
        updateMonthlySummaries();
      }
    };
    
    // Check immediately
    checkMonth();
    
    // Set up an interval to check periodically (every hour)
    const intervalId = setInterval(checkMonth, 3600000);
    
    return () => clearInterval(intervalId);
  }, [currentMonth]);
  
  const onRefresh = () => {
    setRefreshing(true);
    checkRecurringTransactions();
    updateMonthlySummaries();
    setRefreshing(false);
  };
  
  const handleAddTransaction = (type: 'income' | 'expense') => {
    setTransactionType(type);
    setSelectedTransaction(null);
    setShowTransactionModal(true);
  };
  
  const handleTransactionPress = (id: string) => {
    setSelectedTransaction(id);
    setShowTransactionModal(true);
  };
  
  const selectedTransactionData = selectedTransaction 
    ? transactions.find(t => t.id === selectedTransaction) 
    : undefined;

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          BudgetBuddy
        </Text>
      </View>
      
      {/* Balance Card */}
      <Card style={styles.balanceCard} variant="elevated">
        <Text style={[styles.balanceTitle, { color: theme.text }]}>
          Aktueller Monat
        </Text>
        <Text style={[styles.balanceAmount, { color: theme.text }]}>
          {formatCurrency(currentMonthSummary?.balance || 0, currency)}
        </Text>
        
        <View style={styles.balanceDetails}>
          <View style={styles.balanceItem}>
            <View style={styles.balanceItemHeader}>
              <ArrowUpCircle size={16} color={theme.income} />
              <Text style={[styles.balanceItemLabel, { color: theme.text }]}>
                Einnahmen
              </Text>
            </View>
            <Text style={[styles.balanceItemValue, { color: theme.income }]}>
              {formatCurrency(currentMonthSummary?.income || 0, currency)}
            </Text>
          </View>
          
          <View style={styles.balanceItem}>
            <View style={styles.balanceItemHeader}>
              <ArrowDownCircle size={16} color={theme.expense} />
              <Text style={[styles.balanceItemLabel, { color: theme.text }]}>
                Ausgaben
              </Text>
            </View>
            <Text style={[styles.balanceItemValue, { color: theme.expense }]}>
              {formatCurrency(currentMonthSummary?.expense || 0, currency)}
            </Text>
          </View>
        </View>
        
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: theme.income }]}
            onPress={() => handleAddTransaction('income')}
          >
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.quickActionText}>Einnahme</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: theme.expense }]}
            onPress={() => handleAddTransaction('expense')}
          >
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.quickActionText}>Ausgabe</Text>
          </TouchableOpacity>
        </View>
      </Card>
      
      {/* Monthly Summary */}
      {currentMonthSummary && (
        <MonthSummaryCard 
          summary={currentMonthSummary} 
          previousSummary={previousMonthSummary}
        />
      )}
      
      {/* Recent Transactions */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Letzte Transaktionen
        </Text>
      </View>
      
      {recentTransactions.length > 0 ? (
        recentTransactions.map(transaction => (
          <TransactionCard 
            key={transaction.id} 
            transaction={transaction}
            onPress={() => handleTransactionPress(transaction.id)}
          />
        ))
      ) : (
        <Card style={styles.emptyCard}>
          <Text style={[styles.emptyText, { color: theme.subtext }]}>
            Keine Transaktionen vorhanden
          </Text>
        </Card>
      )}
      
      {/* Transaction Modal */}
      <TransactionModal
        visible={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        transaction={selectedTransactionData}
        type={transactionType}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
  },
  balanceCard: {
    marginBottom: SPACING.lg,
  },
  balanceTitle: {
    fontSize: FONT_SIZE.md,
    marginBottom: SPACING.xs,
  },
  balanceAmount: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  balanceDetails: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  balanceItem: {
    flex: 1,
  },
  balanceItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    gap: SPACING.xs,
  },
  balanceItemLabel: {
    fontSize: FONT_SIZE.sm,
  },
  balanceItemValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    gap: SPACING.xs,
  },
  quickActionText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
  },
});