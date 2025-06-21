import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Card } from './Card';
import { useTheme } from '@/hooks/useTheme';
import { Transaction } from '@/types/finance';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { useSettingsStore } from '@/hooks/useSettingsStore';
import { useFinanceStore } from '@/hooks/useFinanceStore';
import { FONT_SIZE, FONT_WEIGHT, SPACING } from '@/constants/theme';
import { ArrowDownCircle, ArrowUpCircle, Calendar, Repeat, Trash2 } from 'lucide-react-native';

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: () => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ 
  transaction,
  onPress
}) => {
  const { theme } = useTheme();
  const { currency } = useSettingsStore();
  const { deleteTransaction } = useFinanceStore();
  
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { 
    amount, 
    description, 
    category, 
    date, 
    type, 
    frequency,
    isFixed
  } = transaction;

  const isIncome = type === 'income';
  
  const handleDelete = () => {
    Alert.alert(
      "Transaktion löschen",
      "Möchten Sie diese Transaktion wirklich löschen?",
      [
        { text: "Abbrechen", style: "cancel" },
        { 
          text: "Löschen", 
          onPress: () => {
            setIsDeleting(true);
            deleteTransaction(transaction.id);
          }, 
          style: "destructive" 
        }
      ]
    );
  };

  if (isDeleting) {
    return null;
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            {isIncome ? (
              <ArrowUpCircle 
                size={36} 
                color={theme.income}
              />
            ) : (
              <ArrowDownCircle 
                size={36} 
                color={theme.expense}
              />
            )}
          </View>
          
          <View style={styles.content}>
            <Text style={[styles.description, { color: theme.text }]}>
              {description}
            </Text>
            <Text style={[styles.category, { color: theme.subtext }]}>
              {category}
            </Text>
            
            <View style={styles.metaContainer}>
              <View style={styles.metaItem}>
                <Calendar size={14} color={theme.subtext} />
                <Text style={[styles.metaText, { color: theme.subtext }]}>
                  {formatDate(date)}
                </Text>
              </View>
              
              {isFixed && (
                <View style={styles.metaItem}>
                  <Repeat size={14} color={theme.subtext} />
                  <Text style={[styles.metaText, { color: theme.subtext }]}>
                    {frequency === 'monthly' ? 'Monatlich' : 
                     frequency === 'yearly' ? 'Jährlich' : 'Einmalig'}
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.amountContainer}>
            <Text 
              style={[
                styles.amount, 
                { color: isIncome ? theme.income : theme.expense }
              ]}
            >
              {isIncome ? '+' : '-'} {formatCurrency(amount, currency)}
            </Text>
            <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
              <Trash2 size={16} color={theme.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.sm,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
  },
  description: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    marginBottom: SPACING.xs / 2,
  },
  category: {
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.xs,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  metaText: {
    fontSize: FONT_SIZE.xs,
  },
  amountContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amount: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  deleteButton: {
    padding: SPACING.xs,
  },
});