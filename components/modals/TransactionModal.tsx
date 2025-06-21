import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  Switch,
  Platform,
  TextInput
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Transaction, TransactionType, TransactionFrequency } from '@/types/finance';
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING } from '@/constants/theme';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useFinanceStore } from '@/hooks/useFinanceStore';
import { X, Euro, Calendar, Tag } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface TransactionModalProps {
  visible: boolean;
  onClose: () => void;
  transaction?: Transaction;
  type?: TransactionType;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  visible,
  onClose,
  transaction,
  type = 'expense',
}) => {
  const { theme } = useTheme();
  const { categories, addTransaction, updateTransaction } = useFinanceStore();
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [date, setDate] = useState(new Date());
  const [transactionType, setTransactionType] = useState<TransactionType>(type);
  const [isFixed, setIsFixed] = useState(false);
  const [frequency, setFrequency] = useState<TransactionFrequency>('monthly');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  
  const [errors, setErrors] = useState({
    amount: '',
    description: '',
    category: '',
  });

  // Filter categories by transaction type and search term
  const filteredCategories = categories.filter(cat => 
    cat.type === transactionType && 
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount.toString());
      setDescription(transaction.description);
      setSelectedCategory(transaction.category);
      setDate(new Date(transaction.date));
      setTransactionType(transaction.type);
      setIsFixed(transaction.isFixed);
      setFrequency(transaction.frequency);
    } else {
      resetForm();
      setTransactionType(type);
    }
  }, [transaction, type, visible]);

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setSelectedCategory('');
    setDate(new Date());
    setIsFixed(false);
    setFrequency('monthly');
    setCategorySearch('');
    setErrors({
      amount: '',
      description: '',
      category: '',
    });
  };

  const validateForm = (): boolean => {
    const newErrors = {
      amount: '',
      description: '',
      category: '',
    };
    
    let isValid = true;
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = 'Bitte geben Sie einen gültigen Betrag ein';
      isValid = false;
    }
    
    if (!description.trim()) {
      newErrors.description = 'Bitte geben Sie eine Beschreibung ein';
      isValid = false;
    }
    
    if (!selectedCategory) {
      newErrors.category = 'Bitte wählen Sie eine Kategorie';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    
    const transactionData = {
      amount: Number(amount),
      description,
      category: selectedCategory,
      date: date.toISOString(),
      type: transactionType,
      frequency,
      isFixed,
    };
    
    if (transaction) {
      updateTransaction(transaction.id, transactionData);
    } else {
      addTransaction(transactionData);
    }
    
    resetForm();
    onClose();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCategorySearch('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>
              {transaction ? 'Transaktion bearbeiten' : 'Neue Transaktion'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scrollView}>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  transactionType === 'income' && styles.activeTypeButton,
                  transactionType === 'income' && { backgroundColor: theme.income },
                ]}
                onPress={() => setTransactionType('income')}
              >
                <Text 
                  style={[
                    styles.typeButtonText,
                    transactionType === 'income' && styles.activeTypeButtonText,
                  ]}
                >
                  Einnahme
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  transactionType === 'expense' && styles.activeTypeButton,
                  transactionType === 'expense' && { backgroundColor: theme.expense },
                ]}
                onPress={() => setTransactionType('expense')}
              >
                <Text 
                  style={[
                    styles.typeButtonText,
                    transactionType === 'expense' && styles.activeTypeButtonText,
                  ]}
                >
                  Ausgabe
                </Text>
              </TouchableOpacity>
            </View>
            
            <Input
              label="Betrag"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0.00"
              error={errors.amount}
              leftIcon={<Euro size={20} color={theme.subtext} />}
            />
            
            <Input
              label="Beschreibung"
              value={description}
              onChangeText={setDescription}
              placeholder="z.B. Einkauf bei Aldi"
              error={errors.description}
            />
            
            <Text style={[styles.label, { color: theme.text }]}>Kategorie</Text>
            <View style={styles.categorySearchContainer}>
              <TextInput
                style={[
                  styles.categorySearchInput,
                  { borderColor: errors.category ? theme.danger : theme.border, color: theme.text, backgroundColor: theme.card }
                ]}
                value={categorySearch}
                onChangeText={setCategorySearch}
                placeholder="Kategorie suchen..."
                placeholderTextColor={theme.subtext}
              />
              {selectedCategory ? (
                <TouchableOpacity 
                  style={styles.selectedCategory}
                  onPress={() => setSelectedCategory('')}
                >
                  <Text style={[styles.selectedCategoryText, { color: theme.text }]}>
                    {selectedCategory}
                  </Text>
                  <X size={16} color={theme.text} />
                </TouchableOpacity>
              ) : null}
              <ScrollView style={styles.categoryList} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
                {filteredCategories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryItem,
                      selectedCategory === category.name && styles.selectedCategoryItem,
                    ]}
                    onPress={() => handleCategorySelect(category.name)}
                  >
                    <View 
                      style={[
                        styles.categoryColor, 
                        { backgroundColor: category.color }
                      ]} 
                    />
                    <Text style={[styles.categoryText, { color: theme.text }]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            {errors.category ? (
              <Text style={[styles.errorText, { color: theme.danger }]}>
                {errors.category}
              </Text>
            ) : null}
            
            <TouchableOpacity 
              style={[styles.dateButton, { borderColor: theme.border }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={20} color={theme.subtext} />
              <Text style={[styles.dateText, { color: theme.text }]}>
                {date.toLocaleDateString('de-DE')}
              </Text>
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
            
            <View style={styles.switchContainer}>
              <Text style={[styles.switchLabel, { color: theme.text }]}>
                Feste {transactionType === 'income' ? 'Einnahme' : 'Ausgabe'}
              </Text>
              <Switch
                value={isFixed}
                onValueChange={setIsFixed}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={isFixed ? theme.primary : '#f4f3f4'}
              />
            </View>
            
            {isFixed && (
              <View style={styles.frequencyContainer}>
                <Text style={[styles.label, { color: theme.text }]}>Häufigkeit</Text>
                <View style={styles.frequencyButtons}>
                  <TouchableOpacity
                    style={[
                      styles.frequencyButton,
                      frequency === 'monthly' && styles.selectedFrequencyButton,
                      frequency === 'monthly' && { backgroundColor: theme.primary },
                    ]}
                    onPress={() => setFrequency('monthly')}
                  >
                    <Text 
                      style={[
                        styles.frequencyButtonText,
                        frequency === 'monthly' && styles.selectedFrequencyButtonText,
                      ]}
                    >
                      Monatlich
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.frequencyButton,
                      frequency === 'yearly' && styles.selectedFrequencyButton,
                      frequency === 'yearly' && { backgroundColor: theme.primary },
                    ]}
                    onPress={() => setFrequency('yearly')}
                  >
                    <Text 
                      style={[
                        styles.frequencyButtonText,
                        frequency === 'yearly' && styles.selectedFrequencyButtonText,
                      ]}
                    >
                      Jährlich
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
          
          <View style={styles.footer}>
            <Button
              title="Abbrechen"
              variant="outline"
              onPress={onClose}
              style={{ flex: 1, marginRight: SPACING.sm }}
            />
            <Button
              title="Speichern"
              onPress={handleSave}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: Platform.OS === 'ios' ? SPACING.xl : SPACING.lg,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: SPACING.xs,
  },
  scrollView: {
    marginBottom: SPACING.lg,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  typeButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: '#F0F0F0',
    marginHorizontal: SPACING.xs,
  },
  activeTypeButton: {
    backgroundColor: '#4361EE',
  },
  typeButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
  },
  activeTypeButtonText: {
    color: '#FFFFFF',
  },
  label: {
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.xs,
  },
  categorySearchContainer: {
    marginBottom: SPACING.sm,
  },
  categorySearchInput: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    fontSize: FONT_SIZE.md,
    marginBottom: SPACING.sm,
  },
  selectedCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginBottom: SPACING.sm,
  },
  selectedCategoryText: {
    fontSize: FONT_SIZE.md,
  },
  categoryList: {
    maxHeight: 150,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.xs,
  },
  selectedCategoryItem: {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  categoryText: {
    fontSize: FONT_SIZE.md,
  },
  errorText: {
    fontSize: FONT_SIZE.xs,
    marginBottom: SPACING.sm,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  dateText: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZE.md,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  switchLabel: {
    fontSize: FONT_SIZE.md,
  },
  frequencyContainer: {
    marginBottom: SPACING.md,
  },
  frequencyButtons: {
    flexDirection: 'row',
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: '#F0F0F0',
    marginRight: SPACING.sm,
  },
  selectedFrequencyButton: {
    backgroundColor: '#4361EE',
  },
  frequencyButtonText: {
    fontSize: FONT_SIZE.md,
  },
  selectedFrequencyButtonText: {
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});