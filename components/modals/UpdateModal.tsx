import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  ScrollView,
  Platform
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { AppVersion } from '@/types/finance';
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Download, Info } from 'lucide-react-native';

interface UpdateModalProps {
  visible: boolean;
  onClose: () => void;
  versionInfo: AppVersion | null;
  onUpdate: () => void;
  forceUpdate: boolean;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  visible,
  onClose,
  versionInfo,
  onUpdate,
  forceUpdate,
}) => {
  const { theme } = useTheme();

  if (!versionInfo) return null;

  console.log("Rendering update modal with version info:", versionInfo);
  console.log("Force update:", forceUpdate);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={forceUpdate ? undefined : onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
          <View style={styles.iconContainer}>
            <View style={[styles.iconCircle, { backgroundColor: theme.primary }]}>
              <Download size={40} color="#FFFFFF" />
            </View>
          </View>
          
          <Text style={[styles.title, { color: theme.text }]}>
            {forceUpdate ? 'Update erforderlich' : 'Update verfügbar'}
          </Text>
          
          <Text style={[styles.version, { color: theme.primary }]}>
            Version {versionInfo.latestVersion}
          </Text>
          
          <Text style={[styles.message, { color: theme.text }]}>
            {versionInfo.message}
          </Text>
          
          <View style={[styles.changelogContainer, { backgroundColor: theme.card }]}>
            <View style={styles.changelogHeader}>
              <Info size={16} color={theme.primary} />
              <Text style={[styles.changelogTitle, { color: theme.text }]}>
                Änderungen
              </Text>
            </View>
            
            <ScrollView style={styles.changelogScroll}>
              {versionInfo.changelog && versionInfo.changelog.map((item, index) => (
                <View key={index} style={styles.changelogItem}>
                  <Text style={[styles.bulletPoint, { color: theme.primary }]}>•</Text>
                  <Text style={[styles.changelogText, { color: theme.text }]}>
                    {item}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
          
          <View style={styles.footer}>
            {!forceUpdate && (
              <Button
                title="Später"
                variant="outline"
                onPress={onClose}
                style={{ flex: 1, marginRight: SPACING.sm }}
              />
            )}
            <Button
              title={forceUpdate ? 'Jetzt aktualisieren' : 'Aktualisieren'}
              onPress={onUpdate}
              style={{ flex: forceUpdate ? 1 : 1 }}
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
    padding: SPACING.lg,
    alignItems: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    marginBottom: SPACING.lg,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  version: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    marginBottom: SPACING.md,
  },
  message: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  changelogContainer: {
    width: '100%',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  changelogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  changelogTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    marginLeft: SPACING.xs,
  },
  changelogScroll: {
    maxHeight: 150,
  },
  changelogItem: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  bulletPoint: {
    fontSize: FONT_SIZE.lg,
    marginRight: SPACING.xs,
    lineHeight: FONT_SIZE.lg,
  },
  changelogText: {
    fontSize: FONT_SIZE.sm,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    width: '100%',
  },
});