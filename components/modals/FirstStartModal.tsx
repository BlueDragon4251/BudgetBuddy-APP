import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  Platform,
  Image
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useBackupStore } from '@/hooks/useBackupStore';

interface FirstStartModalProps {
  visible: boolean;
  onClose: () => void;
}

export const FirstStartModal: React.FC<FirstStartModalProps> = ({
  visible,
  onClose,
}) => {
  const { theme } = useTheme();
  const { restoreFromBackup } = useBackupStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    if (Platform.OS === 'web') {
      setError('Import auf Web nicht verfügbar');
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
        setError('Keine Datei ausgewählt');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      // Read file content to validate JSON
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      
      try {
        JSON.parse(fileContent); // Validate JSON
        
        const success = await restoreFromBackup(fileUri);
        
        if (success) {
          onClose();
        } else {
          setError('Daten konnten nicht importiert werden');
        }
      } catch (error) {
        setError('Ungültige Backup-Datei');
      }
    } catch (error) {
      setError('Fehler beim Importieren der Daten');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
    >
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80' }}
            style={styles.image}
            resizeMode="cover"
          />
          
          <Text style={[styles.title, { color: theme.text }]}>
            Willkommen bei BudgetBuddy
          </Text>
          
          <Text style={[styles.description, { color: theme.subtext }]}>
            Haben Sie bereits BudgetBuddy-Daten, die Sie importieren möchten?
          </Text>
          
          {error && (
            <View style={[styles.errorContainer, { backgroundColor: 'rgba(230, 57, 70, 0.1)' }]}>
              <Text style={[styles.errorText, { color: theme.danger }]}>
                {error}
              </Text>
            </View>
          )}
          
          <View style={styles.buttonContainer}>
            <Button
              title="Daten importieren"
              onPress={handleImport}
              loading={loading}
              style={styles.button}
            />
            
            <Button
              title="Neu starten"
              variant="outline"
              onPress={handleSkip}
              style={[styles.button, styles.skipButton]}
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    width: '100%',
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    maxWidth: 400,
  },
  image: {
    width: '100%',
    height: 200,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  description: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  errorContainer: {
    marginHorizontal: SPACING.lg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
  },
  buttonContainer: {
    padding: SPACING.lg,
  },
  button: {
    marginBottom: SPACING.md,
  },
  skipButton: {
    marginBottom: SPACING.lg,
  },
});