import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Switch,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useSettingsStore } from '@/hooks/useSettingsStore';
import { useFinanceStore } from '@/hooks/useFinanceStore';
import { FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { BackupRestoreModal } from '@/components/modals/BackupRestoreModal';
import { CategoryManagementModal } from '@/components/modals/CategoryManagementModal';
import { 
  Moon, 
  Sun, 
  Smartphone, 
  Bell, 
  Database, 
  Trash2, 
  Euro, 
  Languages, 
  Info,
  Tag
} from 'lucide-react-native';
import Constants from 'expo-constants';

export default function SettingsScreen() {
  const { theme, isDarkMode, forceUpdate } = useTheme();
  const { 
    theme: themePreference, 
    setTheme,
    currency,
    setCurrency,
    language,
    setLanguage,
    notificationsEnabled,
    toggleNotifications
  } = useSettingsStore();
  const { clearAllData } = useFinanceStore();
  
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Force re-render when theme changes
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [isDarkMode, forceUpdate]);
  
  const handleThemeChange = (value: 'light' | 'dark' | 'system') => {
    console.log("Changing theme to:", value);
    setTheme(value);
    
    // Force UI update
    setTimeout(() => {
      setRefreshKey(prev => prev + 1);
    }, 100);
  };
  
  const handleCurrencyChange = (value: string) => {
    setCurrency(value);
  };
  
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
  };
  
  const handleClearData = () => {
    Alert.alert(
      'Daten löschen',
      'Möchten Sie wirklich alle Daten löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
      [
        {
          text: 'Abbrechen',
          style: 'cancel',
        },
        {
          text: 'Löschen',
          onPress: () => {
            clearAllData();
            Alert.alert('Daten gelöscht', 'Alle Daten wurden erfolgreich gelöscht.');
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Get app version from app.json
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  return (
    <ScrollView 
      key={`settings-screen-${refreshKey}`}
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          Einstellungen
        </Text>
      </View>
      
      {/* Appearance */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Erscheinungsbild
        </Text>
        
        <Card style={styles.card}>
          <Text style={[styles.settingTitle, { color: theme.text }]}>
            Theme
          </Text>
          
          <View style={styles.themeSelector}>
            <TouchableOpacity
              style={[
                styles.themeOption,
                themePreference === 'light' && styles.selectedThemeOption,
                themePreference === 'light' && { borderColor: theme.primary },
                { backgroundColor: isDarkMode ? theme.card : '#F8F9FA' }
              ]}
              onPress={() => handleThemeChange('light')}
            >
              <Sun size={24} color={theme.text} />
              <Text style={[styles.themeText, { color: theme.text }]}>
                Hell
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.themeOption,
                themePreference === 'dark' && styles.selectedThemeOption,
                themePreference === 'dark' && { borderColor: theme.primary },
                { backgroundColor: isDarkMode ? theme.card : '#F8F9FA' }
              ]}
              onPress={() => handleThemeChange('dark')}
            >
              <Moon size={24} color={theme.text} />
              <Text style={[styles.themeText, { color: theme.text }]}>
                Dunkel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.themeOption,
                themePreference === 'system' && styles.selectedThemeOption,
                themePreference === 'system' && { borderColor: theme.primary },
                { backgroundColor: isDarkMode ? theme.card : '#F8F9FA' }
              ]}
              onPress={() => handleThemeChange('system')}
            >
              <Smartphone size={24} color={theme.text} />
              <Text style={[styles.themeText, { color: theme.text }]}>
                System
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      </View>
      
      {/* Preferences */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Präferenzen
        </Text>
        
        <Card style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Euro size={20} color={theme.text} />
              <Text style={[styles.settingTitle, { color: theme.text }]}>
                Währung
              </Text>
            </View>
            
            <View style={styles.currencySelector}>
              <TouchableOpacity
                style={[
                  styles.currencyOption,
                  currency === '€' && styles.selectedCurrencyOption,
                  currency === '€' && { backgroundColor: theme.primary },
                  { backgroundColor: currency !== '€' ? (isDarkMode ? theme.card : '#F8F9FA') : undefined }
                ]}
                onPress={() => handleCurrencyChange('€')}
              >
                <Text 
                  style={[
                    styles.currencyText,
                    currency === '€' && { color: '#FFFFFF' },
                    currency !== '€' && { color: theme.text }
                  ]}
                >
                  €
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.currencyOption,
                  currency === '$' && styles.selectedCurrencyOption,
                  currency === '$' && { backgroundColor: theme.primary },
                  { backgroundColor: currency !== '$' ? (isDarkMode ? theme.card : '#F8F9FA') : undefined }
                ]}
                onPress={() => handleCurrencyChange('$')}
              >
                <Text 
                  style={[
                    styles.currencyText,
                    currency === '$' && { color: '#FFFFFF' },
                    currency !== '$' && { color: theme.text }
                  ]}
                >
                  $
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.currencyOption,
                  currency === '£' && styles.selectedCurrencyOption,
                  currency === '£' && { backgroundColor: theme.primary },
                  { backgroundColor: currency !== '£' ? (isDarkMode ? theme.card : '#F8F9FA') : undefined }
                ]}
                onPress={() => handleCurrencyChange('£')}
              >
                <Text 
                  style={[
                    styles.currencyText,
                    currency === '£' && { color: '#FFFFFF' },
                    currency !== '£' && { color: theme.text }
                  ]}
                >
                  £
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={[styles.divider, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Languages size={20} color={theme.text} />
              <Text style={[styles.settingTitle, { color: theme.text }]}>
                Sprache
              </Text>
            </View>
            
            <View style={styles.languageSelector}>
              <TouchableOpacity
                style={[
                  styles.languageOption,
                  language === 'de' && styles.selectedLanguageOption,
                  language === 'de' && { backgroundColor: theme.primary },
                  { backgroundColor: language !== 'de' ? (isDarkMode ? theme.card : '#F8F9FA') : undefined }
                ]}
                onPress={() => handleLanguageChange('de')}
              >
                <Text 
                  style={[
                    styles.languageText,
                    language === 'de' && { color: '#FFFFFF' },
                    language !== 'de' && { color: theme.text }
                  ]}
                >
                  DE
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.languageOption,
                  language === 'en' && styles.selectedLanguageOption,
                  language === 'en' && { backgroundColor: theme.primary },
                  { backgroundColor: language !== 'en' ? (isDarkMode ? theme.card : '#F8F9FA') : undefined }
                ]}
                onPress={() => handleLanguageChange('en')}
              >
                <Text 
                  style={[
                    styles.languageText,
                    language === 'en' && { color: '#FFFFFF' },
                    language !== 'en' && { color: theme.text }
                  ]}
                >
                  EN
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={[styles.divider, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Bell size={20} color={theme.text} />
              <Text style={[styles.settingTitle, { color: theme.text }]}>
                Benachrichtigungen
              </Text>
            </View>
            
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={notificationsEnabled ? theme.primary : Platform.OS === 'ios' ? '#FFFFFF' : '#f4f3f4'}
              ios_backgroundColor={theme.border}
            />
          </View>
        </Card>
      </View>
      
      {/* Data Management */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Datenverwaltung
        </Text>
        
        <Card style={styles.card}>
          <TouchableOpacity 
            style={styles.settingButton}
            onPress={() => setShowBackupModal(true)}
          >
            <Database size={20} color={theme.text} />
            <Text style={[styles.settingTitle, { color: theme.text }]}>
              Backup & Wiederherstellung
            </Text>
          </TouchableOpacity>
          
          <View style={[styles.divider, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />
          
          <TouchableOpacity 
            style={styles.settingButton}
            onPress={() => setShowCategoryModal(true)}
          >
            <Tag size={20} color={theme.text} />
            <Text style={[styles.settingTitle, { color: theme.text }]}>
              Kategorien verwalten
            </Text>
          </TouchableOpacity>
          
          <View style={[styles.divider, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />
          
          <TouchableOpacity 
            style={styles.settingButton}
            onPress={handleClearData}
          >
            <Trash2 size={20} color={theme.danger} />
            <Text style={[styles.settingTitle, { color: theme.danger }]}>
              Alle Daten löschen
            </Text>
          </TouchableOpacity>
        </Card>
      </View>
      
      {/* About */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Über
        </Text>
        
        <Card style={styles.card}>
          <View style={styles.aboutContent}>
            <Info size={24} color={theme.primary} />
            <Text style={[styles.appName, { color: theme.text }]}>
              BudgetBuddy
            </Text>
            <Text style={[styles.appVersion, { color: theme.subtext }]}>
              Version {appVersion}
            </Text>
            <Text style={[styles.appDescription, { color: theme.text }]}>
              Ihre persönliche Finanz-App für einfaches Haushaltsmanagement.
            </Text>
          </View>
        </Card>
      </View>
      
      {/* Backup Modal */}
      <BackupRestoreModal
        visible={showBackupModal}
        onClose={() => setShowBackupModal(false)}
      />
      
      {/* Category Management Modal */}
      <CategoryManagementModal
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
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
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  settingTitle: {
    fontSize: FONT_SIZE.md,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  themeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  themeOption: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: SPACING.xs,
  },
  selectedThemeOption: {
    borderColor: '#4361EE',
  },
  themeText: {
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.xs,
  },
  currencySelector: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  currencyOption: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
  },
  selectedCurrencyOption: {
    backgroundColor: '#4361EE',
  },
  currencyText: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
  },
  languageSelector: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  languageOption: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
  },
  selectedLanguageOption: {
    backgroundColor: '#4361EE',
  },
  languageText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: 'bold',
  },
  aboutContent: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  appName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    marginTop: SPACING.sm,
  },
  appVersion: {
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.md,
  },
  appDescription: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
  },
});