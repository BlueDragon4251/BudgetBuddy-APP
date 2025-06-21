import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { useTheme } from '@/hooks/useTheme';
import { MonthSummary } from '@/types/finance';
import { formatCurrency, formatMonth } from '@/utils/helpers';
import { useSettingsStore } from '@/hooks/useSettingsStore';
import { FONT_SIZE, FONT_WEIGHT, SPACING } from '@/constants/theme';
import { ArrowDownCircle, ArrowUpCircle, TrendingDown, TrendingUp } from 'lucide-react-native';

interface MonthSummaryCardProps {
  summary: MonthSummary;
  previousSummary?: MonthSummary;
}

export const MonthSummaryCard: React.FC<MonthSummaryCardProps> = ({ 
  summary,
  previousSummary
}) => {
  const { theme } = useTheme();
  const { currency } = useSettingsStore();
  
  const { month, income, expense, balance } = summary;
  
  // Calculate change from previous month
  const calculateChange = (current: number, previous?: number): number => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };
  
  const incomeChange = previousSummary ? calculateChange(income, previousSummary.income) : 0;
  const expenseChange = previousSummary ? calculateChange(expense, previousSummary.expense) : 0;
  const balanceChange = previousSummary ? calculateChange(balance, previousSummary.balance) : 0;
  
  // Format percentage
  const formatPercentage = (value: number): string => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  return (
    <Card style={styles.card} variant="elevated">
      <Text style={[styles.month, { color: theme.text }]}>
        {formatMonth(month)}
      </Text>
      
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <View style={styles.summaryHeader}>
            <ArrowUpCircle size={18} color={theme.income} />
            <Text style={[styles.summaryLabel, { color: theme.text }]}>
              Einnahmen
            </Text>
          </View>
          
          <Text style={[styles.summaryValue, { color: theme.income }]}>
            {formatCurrency(income, currency)}
          </Text>
          
          {previousSummary && (
            <View style={styles.changeContainer}>
              {incomeChange > 0 ? (
                <TrendingUp size={14} color={theme.income} />
              ) : incomeChange < 0 ? (
                <TrendingDown size={14} color={theme.expense} />
              ) : null}
              
              <Text 
                style={[
                  styles.changeText, 
                  { 
                    color: incomeChange > 0 
                      ? theme.income 
                      : incomeChange < 0 
                        ? theme.expense 
                        : theme.subtext 
                  }
                ]}
              >
                {formatPercentage(incomeChange)}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.summaryItem}>
          <View style={styles.summaryHeader}>
            <ArrowDownCircle size={18} color={theme.expense} />
            <Text style={[styles.summaryLabel, { color: theme.text }]}>
              Ausgaben
            </Text>
          </View>
          
          <Text style={[styles.summaryValue, { color: theme.expense }]}>
            {formatCurrency(expense, currency)}
          </Text>
          
          {previousSummary && (
            <View style={styles.changeContainer}>
              {expenseChange > 0 ? (
                <TrendingUp size={14} color={theme.expense} />
              ) : expenseChange < 0 ? (
                <TrendingDown size={14} color={theme.income} />
              ) : null}
              
              <Text 
                style={[
                  styles.changeText, 
                  { 
                    color: expenseChange > 0 
                      ? theme.expense 
                      : expenseChange < 0 
                        ? theme.income 
                        : theme.subtext 
                  }
                ]}
              >
                {formatPercentage(expenseChange)}
              </Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.balanceContainer}>
        <Text style={[styles.balanceLabel, { color: theme.text }]}>
          Bilanz
        </Text>
        
        <View style={styles.balanceRow}>
          <Text 
            style={[
              styles.balanceValue, 
              { 
                color: balance >= 0 ? theme.income : theme.expense 
              }
            ]}
          >
            {formatCurrency(balance, currency)}
          </Text>
          
          {previousSummary && (
            <View style={styles.changeContainer}>
              {balanceChange > 0 ? (
                <TrendingUp size={14} color={theme.income} />
              ) : balanceChange < 0 ? (
                <TrendingDown size={14} color={theme.expense} />
              ) : null}
              
              <Text 
                style={[
                  styles.changeText, 
                  { 
                    color: balanceChange > 0 
                      ? theme.income 
                      : balanceChange < 0 
                        ? theme.expense 
                        : theme.subtext 
                  }
                ]}
              >
                {formatPercentage(balanceChange)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.md,
  },
  month: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  summaryItem: {
    flex: 1,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    gap: SPACING.xs,
  },
  summaryLabel: {
    fontSize: FONT_SIZE.sm,
  },
  summaryValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  changeText: {
    fontSize: FONT_SIZE.xs,
  },
  balanceContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: SPACING.md,
  },
  balanceLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
  },
});