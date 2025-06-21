import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { X, Save, Upload, Download } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useBackupStore } from '@/hooks/useBackupStore';
import { exportData } from '@/utils/helpers';

interface BackupRestoreModalProps {
  visible: boolean;
  onClose: () => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  visible,
  onClose,
}) => {
  const { theme } = useTheme();
  const { createBackup, restoreFromBackup, lastBackupDate, isRestoring } = useBackupStore();
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleBackup = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      const success = await createBackup();
      
      if (success) {
        setMessage({
          text: 'Backup erfolgreich erstellt',
          type: 'success',
        });
      } else {
        setMessage({
          text: 'Backup konnte nicht erstellt werden',
          type: 'error',
        });
      }
    } catch (error) {
      setMessage({
        text: 'Fehler beim Erstellen des Backups',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      const success = await exportData();
      
      if (success) {
        setMessage({
          text: 'Daten erfolgreich exportiert',
          type: 'success',
        });
      } else {
        setMessage({
          text: 'Daten konnten nicht exportiert werden',
          type: 'error',
        });
      }
    } catch (error) {
      setMessage({
        text: 'Fehler beim Exportieren der Daten',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (Platform.OS === 'web') {
      setMessage({
        text: 'Wiederherstellung auf Web nicht verfügbar',
        type: 'error',
      });
      return;
    }
    
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) {
        return;
      }
      
      const fileUri = result.assets?.[0]?.uri;
      if (!fileUri) {
        setMessage({
          text: 'Keine Datei ausgewählt',
          type: 'error',
        });
        return;
      }
      
      setLoading(true);
      setMessage(null);
      
      // Read file content to validate JSON
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      
      try {
        JSON.parse(fileContent); // Validate JSON
        
        const success = await restoreFromBackup(fileUri);
        
        if (success) {
          setMessage({
            text: 'Daten erfolgreich wiederhergestellt',
            type: 'success',
          });
        } else {
          setMessage({
            text: 'Daten konnten nicht wiederhergestellt werden',
            type: 'error',
          });
        }
      } catch (error) {
        setMessage({
          text: 'Ungültige Backup-Datei',
          type: 'error',
        });
      }
    } catch (error) {
      setMessage({
        text: 'Fehler beim Wiederherstellen der Daten',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatBackupDate = (dateString: string | null) => {
    if (!dateString) return 'Noch kein Backup erstellt';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
              Backup & Wiederherstellung
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          
          {message && (
            <View 
              style={[
                styles.messageContainer, 
                { 
                  backgroundColor: message.type === 'success' 
                    ? 'rgba(56, 176, 0, 0.1)' 
                    : 'rgba(230, 57, 70, 0.1)' 
                }
              ]}
            >
              <Text 
                style={[
                  styles.messageText, 
                  { 
                    color: message.type === 'success' 
                      ? theme.success 
                      : theme.danger 
                  }
                ]}
              >
                {message.text}
              </Text>
            </View>
          )}
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Automatisches Backup
            </Text>
            <Text style={[styles.sectionDescription, { color: theme.subtext }]}>
              Letztes Backup: {formatBackupDate(lastBackupDate)}
            </Text>
            <Button
              title="Backup erstellen"
              leftIcon={<Save size={18} color="#FFFFFF" />}
              onPress={handleBackup}
              loading={loading}
              style={styles.button}
            />
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Daten exportieren
            </Text>
            <Text style={[styles.sectionDescription, { color: theme.subtext }]}>
              Exportieren Sie Ihre Daten als JSON-Datei
            </Text>
            <Button
              title="Daten exportieren"
              variant="secondary"
              leftIcon={<Download size={18} color="#FFFFFF" />}
              onPress={handleExport}
              loading={loading}
              style={styles.button}
            />
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Daten wiederherstellen
            </Text>
            <Text style={[styles.sectionDescription, { color: theme.subtext }]}>
              Stellen Sie Ihre Daten aus einer Backup-Datei wieder her
            </Text>
            {isRestoring ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.text }]}>
                  Wiederherstellung läuft...
                </Text>
              </View>
            ) : (
              <Button
                title="Daten wiederherstellen"
                variant="outline"
                leftIcon={<Upload size={18} color={theme.primary} />}
                onPress={handleRestore}
                loading={loading}
                style={styles.button}
              />
            )}
          </View>
          
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
  messageContainer: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.md,
  },
  messageText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  sectionDescription: {
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.md,
  },
  button: {
    width: '100%',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});