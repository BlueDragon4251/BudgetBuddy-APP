import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  TextInput,
  Platform
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Category, TransactionType } from '@/types/finance';
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { useFinanceStore } from '@/hooks/useFinanceStore';
import { X, Plus, Edit, Trash2, Palette } from 'lucide-react-native';

interface CategoryManagementModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CategoryManagementModal: React.FC<CategoryManagementModalProps> = ({
  visible,
  onClose,
}) => {
  const { theme } = useTheme();
  const { categories, addCategory, updateCategory, deleteCategory } = useFinanceStore();
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<TransactionType>('expense');
  const [newCategoryColor, setNewCategoryColor] = useState('#CCCCCC');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [error, setError] = useState('');

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      setError('Bitte geben Sie einen Kategorienamen ein');
      return;
    }
    
    if (categories.some(cat => cat.name.toLowerCase() === newCategoryName.toLowerCase())) {
      setError('Eine Kategorie mit diesem Namen existiert bereits');
      return;
    }
    
    addCategory({
      name: newCategoryName,
      type: newCategoryType,
      color: newCategoryColor,
    });
    
    setNewCategoryName('');
    setError('');
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryType(category.type);
    setNewCategoryColor(category.color);
  };

  const handleUpdateCategory = () => {
    if (!editingCategory) return;
    
    if (!newCategoryName.trim()) {
      setError('Bitte geben Sie einen Kategorienamen ein');
      return;
    }
    
    if (categories.some(cat => cat.name.toLowerCase() === newCategoryName.toLowerCase() && cat.id !== editingCategory.id)) {
      setError('Eine Kategorie mit diesem Namen existiert bereits');
      return;
    }
    
    updateCategory(editingCategory.id, {
      name: newCategoryName,
      type: newCategoryType,
      color: newCategoryColor,
    });
    
    setEditingCategory(null);
    setNewCategoryName('');
    setError('');
  };

  const handleDeleteCategory = (id: string) => {
    deleteCategory(id);
    if (editingCategory?.id === id) {
      setEditingCategory(null);
      setNewCategoryName('');
    }
  };

  const colorOptions = [
    '#E63946', '#FB8500', '#4361EE', '#7209B7', '#F72585', 
    '#FF9FF3', '#560BAD', '#480CA8', '#3A0CA3', '#2C0735',
    '#38B000', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B',
    '#FF5722', '#607D8B', '#795548', '#9C27B0', '#6C757D'
  ];

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
              Kategorien verwalten
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scrollView}>
            {/* Add/Edit Category Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {editingCategory ? 'Kategorie bearbeiten' : 'Neue Kategorie hinzufügen'}
              </Text>
              
              {error ? (
                <Text style={[styles.errorText, { color: theme.danger }]}>
                  {error}
                </Text>
              ) : null}
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    { borderColor: theme.border, color: theme.text, backgroundColor: theme.card }
                  ]}
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  placeholder="Kategoriename"
                  placeholderTextColor={theme.subtext}
                />
                
                <View style={styles.typeSelector}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      newCategoryType === 'income' && styles.activeTypeButton,
                      newCategoryType === 'income' && { backgroundColor: theme.income },
                    ]}
                    onPress={() => setNewCategoryType('income')}
                  >
                    <Text 
                      style={[
                        styles.typeButtonText,
                        newCategoryType === 'income' && styles.activeTypeButtonText,
                      ]}
                    >
                      Einnahme
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      newCategoryType === 'expense' && styles.activeTypeButton,
                      newCategoryType === 'expense' && { backgroundColor: theme.expense },
                    ]}
                    onPress={() => setNewCategoryType('expense')}
                  >
                    <Text 
                      style={[
                        styles.typeButtonText,
                        newCategoryType === 'expense' && styles.activeTypeButtonText,
                      ]}
                    >
                      Ausgabe
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={[styles.label, { color: theme.text }]}>Farbe</Text>
                <ScrollView horizontal style={styles.colorPicker}>
                  {colorOptions.map((color, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        newCategoryColor === color && styles.selectedColorOption,
                        newCategoryColor === color && { borderColor: theme.primary }
                      ]}
                      onPress={() => setNewCategoryColor(color)}
                    />
                  ))}
                </ScrollView>
                
                <Button
                  title={editingCategory ? 'Aktualisieren' : 'Hinzufügen'}
                  leftIcon={<Plus size={18} color="#FFFFFF" />}
                  onPress={editingCategory ? handleUpdateCategory : handleAddCategory}
                  style={styles.addButton}
                />
                
                {editingCategory && (
                  <Button
                    title="Abbrechen"
                    variant="outline"
                    onPress={() => {
                      setEditingCategory(null);
                      setNewCategoryName('');
                      setError('');
                    }}
                    style={styles.cancelButton}
                  />
                )}
              </View>
            </View>
            
            {/* Category List */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Ihre Kategorien
              </Text>
              
              <View style={styles.categoryList}>
                {categories.map(category => (
                  <View key={category.id} style={styles.categoryItem}>
                    <View style={styles.categoryInfo}>
                      <View 
                        style={[
                          styles.categoryColor, 
                          { backgroundColor: category.color }
                        ]} 
                      />
                      <Text style={[styles.categoryName, { color: theme.text }]}>
                        {category.name}
                      </Text>
                      <Text style={[styles.categoryType, { color: theme.subtext }]}>
                        {category.type === 'income' ? 'Einnahme' : 'Ausgabe'}
                      </Text>
                    </View>
                    <View style={styles.categoryActions}>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleEditCategory(category)}
                      >
                        <Edit size={16} color={theme.text} />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 size={16} color={theme.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.footer}>
            <Button
              title="Schließen"
              variant="outline"
              onPress={onClose}
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
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZE.xs,
    marginBottom: SPACING.sm,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  input: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    fontSize: FONT_SIZE.md,
    marginBottom: SPACING.md,
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
  colorPicker: {
    marginBottom: SPACING.md,
    maxHeight: 40,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: SPACING.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: '#4361EE',
  },
  addButton: {
    marginBottom: SPACING.sm,
  },
  cancelButton: {
    marginBottom: SPACING.sm,
  },
  categoryList: {
    marginBottom: SPACING.md,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: SPACING.sm,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  categoryName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    marginRight: SPACING.sm,
  },
  categoryType: {
    fontSize: FONT_SIZE.sm,
  },
  categoryActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});