import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useFinanceStore } from '@/hooks/useFinanceStore';
import { useSettingsStore } from '@/hooks/useSettingsStore';
import { FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS } from '@/constants/theme';
import { formatCurrency, formatMonth } from '@/utils/helpers';
import { Card } from '@/components/ui/Card';
import { MonthSummaryCard } from '@/components/ui/MonthSummaryCard';
import { BarChart2, PieChart } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function StatisticsScreen() {
  const { theme } = useTheme();
  const { transactions, monthlySummaries, categories } = useFinanceStore();
  const { currency } = useSettingsStore();
  
  const [activeTab, setActiveTab] = useState<'monthly' | 'categories'>('monthly');
  
  // Calculate category totals for expenses only
  const calculateCategoryTotals = () => {
    const categoryTotals: Record<string, { total: number, color: string }> = {};
    
    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        if (!categoryTotals[transaction.category]) {
          const category = categories.find(c => c.name === transaction.category);
          categoryTotals[transaction.category] = {
            total: 0,
            color: category?.color || '#CCCCCC',
          };
        }
        categoryTotals[transaction.category].total += transaction.amount;
      }
    });
    
    return Object.entries(categoryTotals)
      .map(([name, { total, color }]) => ({ name, total, color }))
      .sort((a, b) => b.total - a.total);
  };
  
  const categoryTotals = calculateCategoryTotals();
  
  // Calculate total expenses
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Simple bar chart for monthly summaries
  const renderMonthlyChart = () => {
    const maxExpense = Math.max(...monthlySummaries.map(s => s.expense));
    const maxIncome = Math.max(...monthlySummaries.map(s => s.income));
    const maxValue = Math.max(maxExpense, maxIncome);
    
    return (
      <View style={styles.chartContainer}>
        {monthlySummaries.slice(0, 6).map((summary, index) => (
          <View key={index} style={styles.chartBar}>
            <Text style={[styles.chartLabel, { color: theme.subtext }]}>
              {formatMonth(summary.month).split(' ')[0]}
            </Text>
            
            <View style={styles.barContainer}>
              <View 
                style={[
                  styles.bar, 
                  { 
                    backgroundColor: theme.income,
                    height: (summary.income / maxValue) * 150,
                  }
                ]} 
              />
              <View 
                style={[
                  styles.bar, 
                  { 
                    backgroundColor: theme.expense,
                    height: (summary.expense / maxValue) * 150,
                    marginLeft: SPACING.xs,
                  }
                ]} 
              />
            </View>
          </View>
        ))}
      </View>
    );
  };
  
  // Custom pie chart for expense distribution by category
  const renderCategoryChart = () => {
    // Calculate percentages for pie chart
    const categoryPercentages = categoryTotals.map(category => {
      const percentage = totalExpenses > 0 ? (category.total / totalExpenses) * 100 : 0;
      return {
        ...category,
        percentage,
      };
    });
    
    // If no expenses, show empty state
    if (totalExpenses === 0) {
      return (
        <View style={styles.pieChartContainer}>
          <View style={styles.pieChart}>
            <View style={styles.emptyPieChart}>
              <Text style={[styles.emptyChartText, { color: theme.subtext }]}>
                Keine Ausgaben vorhanden
              </Text>
            </View>
          </View>
        </View>
      );
    }
    
    return (
      <View style={styles.pieChartContainer}>
        <View style={styles.pieChart}>
          {/* Pie chart segments using View with width based on percentage */}
          <View style={styles.pieChartInner}>
            {categoryPercentages.map((category, index) => {
              // Only render if percentage is significant to avoid rendering issues
              if (category.percentage < 0.5) return null;
              
              return (
                <View
                  key={index}
                  style={[
                    styles.pieSegment,
                    { 
                      backgroundColor: category.color,
                      width: `${category.percentage}%`,
                    }
                  ]}
                />
              );
            })}
          </View>
        </View>
        
        <View style={styles.legendContainer}>
          {categoryPercentages.slice(0, 5).map((category, index) => (
            <View key={index} style={styles.legendItem}>
              <View 
                style={[
                  styles.legendColor, 
                  { backgroundColor: category.color }
                ]} 
              />
              <Text style={[styles.legendText, { color: theme.text }]}>
                {category.name}
              </Text>
              <Text style={[styles.legendPercentage, { color: theme.subtext }]}>
                {category.percentage.toFixed(1)}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          Statistiken
        </Text>
      </View>
      
      {/* Tab Selector */}
      <View style={[styles.tabContainer, { backgroundColor: theme.card }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'monthly' && styles.activeTab,
            activeTab === 'monthly' && { backgroundColor: theme.primary },
          ]}
          onPress={() => setActiveTab('monthly')}
        >
          <BarChart2 
            size={18} 
            color={activeTab === 'monthly' ? '#FFFFFF' : theme.text} 
          />
          <Text 
            style={[
              styles.tabText,
              { color: activeTab === 'monthly' ? '#FFFFFF' : theme.text },
            ]}
          >
            Monatlich
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'categories' && styles.activeTab,
            activeTab === 'categories' && { backgroundColor: theme.primary },
          ]}
          onPress={() => setActiveTab('categories')}
        >
          <PieChart 
            size={18} 
            color={activeTab === 'categories' ? '#FFFFFF' : theme.text} 
          />
          <Text 
            style={[
              styles.tabText,
              { color: activeTab === 'categories' ? '#FFFFFF' : theme.text },
            ]}
          >
            Kategorien
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Monthly Statistics */}
      {activeTab === 'monthly' && (
        <>
          <Card style={styles.chartCard} variant="elevated">
            <Text style={[styles.chartTitle, { color: theme.text }]}>
              Einnahmen vs. Ausgaben
            </Text>
            {renderMonthlyChart()}
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View 
                  style={[
                    styles.legendColor, 
                    { backgroundColor: theme.income }
                  ]} 
                />
                <Text style={[styles.legendText, { color: theme.text }]}>
                  Einnahmen
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View 
                  style={[
                    styles.legendColor, 
                    { backgroundColor: theme.expense }
                  ]} 
                />
                <Text style={[styles.legendText, { color: theme.text }]}>
                  Ausgaben
                </Text>
              </View>
            </View>
          </Card>
          
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Monatliche Übersicht
            </Text>
          </View>
          
          {monthlySummaries.slice(0, 3).map((summary, index) => (
            <MonthSummaryCard 
              key={index} 
              summary={summary}
              previousSummary={monthlySummaries[index + 1]}
            />
          ))}
        </>
      )}
      
      {/* Category Statistics */}
      {activeTab === 'categories' && (
        <>
          <Card style={styles.chartCard} variant="elevated">
            <Text style={[styles.chartTitle, { color: theme.text }]}>
              Ausgabenverteilung nach Kategorien
            </Text>
            {renderCategoryChart()}
          </Card>
          
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Top Ausgaben-Kategorien
            </Text>
          </View>
          
          {categoryTotals.slice(0, 5).map((category, index) => (
            <Card key={index} style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <View 
                  style={[
                    styles.categoryColor, 
                    { backgroundColor: category.color }
                  ]} 
                />
                <Text style={[styles.categoryName, { color: theme.text }]}>
                  {category.name}
                </Text>
              </View>
              
              <Text style={[styles.categoryTotal, { color: theme.expense }]}>
                {formatCurrency(category.total, currency)}
              </Text>
              
              <View 
                style={[
                  styles.categoryBar, 
                  { backgroundColor: theme.border }
                ]}
              >
                <View 
                  style={[
                    styles.categoryBarFill, 
                    { 
                      backgroundColor: category.color,
                      width: `${(category.total / totalExpenses) * 100}%`,
                    }
                  ]} 
                />
              </View>
              
              <Text style={[styles.categoryPercentage, { color: theme.subtext }]}>
                {totalExpenses > 0 ? ((category.total / totalExpenses) * 100).toFixed(1) : 0}% der Gesamtausgaben
              </Text>
            </Card>
          ))}
        </>
      )}
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
  tabContainer: {
    flexDirection: 'row',
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    padding: SPACING.xs,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.xs,
  },
  activeTab: {
    backgroundColor: '#4361EE',
  },
  tabText: {
    fontWeight: '500',
  },
  chartCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  chartTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
    marginBottom: SPACING.md,
  },
  chartBar: {
    alignItems: 'center',
    width: (width - SPACING.lg * 2 - SPACING.lg * 2) / 6,
  },
  chartLabel: {
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xs,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  bar: {
    width: 10,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: FONT_SIZE.sm,
  },
  legendPercentage: {
    fontSize: FONT_SIZE.sm,
    marginLeft: 'auto',
  },
  sectionHeader: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
  },
  pieChartContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  pieChart: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    position: 'relative',
  },
  pieChartInner: {
    flexDirection: 'row',
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
  },
  pieSegment: {
    height: 200,
  },
  emptyPieChart: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChartText: {
    fontSize: FONT_SIZE.md,
  },
  legendContainer: {
    width: '100%',
  },
  categoryCard: {
    marginBottom: SPACING.md,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    gap: SPACING.xs,
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
  },
  categoryTotal: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  categoryBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.xs,
  },
  categoryBarFill: {
    height: 8,
    borderRadius: 4,
  },
  categoryPercentage: {
    fontSize: FONT_SIZE.xs,
  },
});