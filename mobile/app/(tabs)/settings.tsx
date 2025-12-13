import { getMessages, saveMessages } from '@/lib/storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import {
  Check,
  ChevronDown,
  Database,
  Download,
  Eye,
  Lock,
  Shield,
  Sparkles,
  Upload,
  X,
  Zap
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

type AccordionItem = {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string;
  color: string;
};

export default function SettingsScreen() {
  const router = useRouter();
  const [showBackupInfo, setShowBackupInfo] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>('export');

  const accordionItems: AccordionItem[] = [
    {
      id: 'export',
      title: 'What Gets Exported',
      icon: <Database size={22} color="#3b82f6" />,
      color: '#3b82f6',
      content: `Your SecureChat backup includes:

• All encrypted message content (ciphertext + IV)
• Message timestamps and metadata
• Conversation history
• Message sync status

Format: JSON file with encrypted messages
Security: Messages remain encrypted - only your device can decrypt`
    },
    {
      id: 'import',
      title: 'Import Requirements',
      icon: <Upload size={22} color="#10b981" />,
      color: '#10b981',
      content: `To import a SecureChat backup:

Requirements:
• Must be a valid SecureChat backup file (.json)
• Uses same encryption key as original backup
• Internet connection for database sync

Process:
1. Select backup file from your device
2. Import encrypted messages to local storage
3. Messages automatically sync to cloud
4. Access from any device`
    },
    {
      id: 'security',
      title: 'Backup Security',
      icon: <Shield size={22} color="#8b5cf6" />,
      color: '#8b5cf6',
      content: `How we protect your backups:

Encryption:
• Messages exported in encrypted form
• Plaintext never included in backups
• AES-256 encryption throughout
• Your master key required for decryption

Storage:
• Backups stored on your device
• You control where to save/share
• We never store backups on servers
• You manage all backup copies`
    },
  ];

  const exportBackup = async () => {
    setExporting(true);
    try {
      const messages = await getMessages();
      
      // Export encrypted messages (ciphertext + IV)
      const backup = {
        exportedAt: new Date().toISOString(),
        messages: messages.map(m => ({
          id: m.id,
          ciphertext: m.ciphertext,
          iv: m.iv,
          sentAt: new Date(m.sentAt).toISOString(),
          deviceId: m.deviceId,
          synced: m.synced,
          // Note: 'text' field is intentionally omitted for security
        })),
        metadata: {
          messageCount: messages.length,
          encryptionType: "AES-256-GCM",
          note: "This backup contains encrypted messages only. Decryption requires your master key."
        }
      };

      const json = JSON.stringify(backup, null, 2);
      const fileName = `securechat-backup-${Date.now()}.json`;
      const fileUri = (FileSystem as any).documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, json, {
        encoding: "utf8",
      });

      if (Platform.OS === 'ios') {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export SecureChat Backup',
        });
      } else {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
        });
      }

      Alert.alert(
        '✓ Backup Exported',
        `${messages.length} encrypted messages exported successfully.`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Export failed:', error);
      Alert.alert('Export Failed', error.message || 'Failed to export backup.');
    } finally {
      setExporting(false);
    }
  };

  const importBackup = async () => {
    setImporting(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
      });

      if (result.canceled) {
        setImporting(false);
        return;
      }

      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri);

      const backup = JSON.parse(fileContent);
      
      // Validate backup structure
      if (!backup.messages || !Array.isArray(backup.messages)) {
        throw new Error('Invalid backup file format');
      }

      Alert.alert(
        'Import Backup',
        `Ready to import ${backup.messages.length} encrypted messages. Continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Import',
            onPress: async () => {
              await processImport(backup);
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Import failed:', error);
      Alert.alert(
        'Import Failed',
        error.message || 'Invalid backup file format.'
      );
      setImporting(false);
    }
  };

  const processImport = async (backup: any) => {
    try {
      const currentMessages = await getMessages();
      const messageMap = new Map<string, any>();
      
      // Add current messages to map
      currentMessages.forEach(msg => {
        messageMap.set(msg.id, msg);
      });
      
      let importedCount = 0;
      let duplicateCount = 0;
      
      // Process each message from backup
      backup.messages.forEach((m: any) => {
        // Check for duplicates by ID
        if (messageMap.has(m.id)) {
          duplicateCount++;
          return;
        }
        
        // Check for duplicates by ciphertext + iv
        const existingByCrypto = Array.from(messageMap.values()).find(
          msg => msg.ciphertext === m.ciphertext && msg.iv === m.iv
        );
        
        if (existingByCrypto) {
          duplicateCount++;
          return;
        }
        
        // Add to map
        messageMap.set(m.id, {
          id: m.id,
          text: "", // Will be decrypted on display
          ciphertext: m.ciphertext,
          iv: m.iv,
          sentAt: new Date(m.sentAt),
          deviceId: m.deviceId || "imported",
          synced: false, // Mark unsynced to sync with DB
        });
        
        importedCount++;
      });
      
      // Save all messages
      const allMessages = Array.from(messageMap.values());
      saveMessages(allMessages);
      
      Alert.alert(
        '✓ Import Successful',
        `Imported ${importedCount} new messages${duplicateCount > 0 ? `, skipped ${duplicateCount} duplicates` : ''}.`,
        [{ text: 'OK' }]
      );
      
      // Note: Messages will sync to database automatically via your sync logic
      
    } catch (error: any) {
      console.error('Process import failed:', error);
      Alert.alert('Import Error', 'Failed to process backup file.');
    } finally {
      setImporting(false);
    }
  };

  const PremiumCard = ({ children, style }: any) => (
    <View style={[styles.premiumCard, style]}>
      <LinearGradient
        colors={['rgba(99, 102, 241, 0.1)', 'rgba(139, 92, 246, 0.05)']}
        style={styles.cardGradient}
      />
      <View style={styles.cardContent}>
        {children}
      </View>
    </View>
  );

  const Accordion = ({ item }: { item: AccordionItem }) => {
    const isExpanded = expandedAccordion === item.id;

    return (
      <View style={styles.accordionContainer}>
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={() => setExpandedAccordion(isExpanded ? null : item.id)}
          activeOpacity={0.7}
        >
          <View style={[styles.accordionIcon, { backgroundColor: `${item.color}15` }]}>
            {item.icon}
          </View>
          <Text style={styles.accordionTitle}>{item.title}</Text>
          <ChevronDown 
            size={20} 
            color="#94a3b8" 
            style={[styles.accordionArrow, isExpanded && styles.accordionArrowExpanded]} 
          />
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.accordionContent}>
            <Text style={styles.accordionText}>
              {item.content}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#0f172a', '#1e293b']}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={['rgba(99, 102, 241, 0.2)', 'transparent']}
            style={styles.headerGradient}
          />
          
          <View style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#6366f1', '#8b5cf6']}
                style={styles.avatar}
              >
                <Database size={32} color="white" />
              </LinearGradient>
            </View>
            
            <Text style={styles.headerTitle}>Backup & Restore</Text>
            <Text style={styles.headerSubtitle}>
              Export/import encrypted chat history
            </Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Lock size={16} color="#10b981" />
                <Text style={styles.statText}>Encrypted</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Shield size={16} color="#8b5cf6" />
                <Text style={styles.statText}>Secure</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Zap size={16} color="#f59e0b" />
                <Text style={styles.statText}>Quick</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Backup Actions Card */}
        <PremiumCard style={styles.backupSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Database size={24} color="#6366f1" />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Secure Backup</Text>
              <Text style={styles.sectionSubtitle}>
                End-to-end encrypted backup of your chats
              </Text>
            </View>
            <Sparkles size={20} color="#f59e0b" style={styles.sparkleIcon} />
          </View>
          
          <View style={styles.backupActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.exportButton]}
              onPress={exportBackup}
              disabled={exporting}
            >
              <LinearGradient
                colors={['#6366f1', '#8b5cf6']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Download size={20} color="white" />
                <Text style={styles.actionButtonText}>
                  {exporting ? 'Exporting...' : 'Export Backup'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.importButton]}
              onPress={importBackup}
              disabled={importing}
            >
              <Upload size={20} color="#6366f1" />
              <Text style={[styles.actionButtonText, styles.importText]}>
                {importing ? 'Importing...' : 'Import Backup'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.infoLink}
            onPress={() => setShowBackupInfo(true)}
          >
            <Eye size={16} color="#94a3b8" />
            <Text style={styles.infoLinkText}>How secure backups work</Text>
          </TouchableOpacity>
        </PremiumCard>

        {/* Information Accordion */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BACKUP INFORMATION</Text>
          <View style={styles.accordionSection}>
            {accordionItems.map((item) => (
              <Accordion key={item.id} item={item} />
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>SecureChat Backup System</Text>
          <Text style={styles.footerText}>
            End-to-end encrypted • Your data never leaves your control
          </Text>
          <Text style={styles.footerVersion}>AES-256 Encrypted Backups</Text>
        </View>
      </ScrollView>

      {/* Backup Info Modal */}
      <Modal
        visible={showBackupInfo}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowBackupInfo(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#1e293b', '#0f172a']}
              style={styles.modalCard}
            >
              <View style={styles.modalHeader}>
                <View style={styles.modalIcon}>
                  <Shield size={28} color="#6366f1" />
                </View>
                <Text style={styles.modalTitle}>Secure Backups</Text>
                <TouchableOpacity
                  style={styles.modalClose}
                  onPress={() => setShowBackupInfo(false)}
                >
                  <X size={24} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              <ScrollView 
                style={styles.modalContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.featureList}>
                  <View style={styles.featureItem}>
                    <View style={styles.featureIcon}>
                      <Check size={18} color="#10b981" />
                    </View>
                    <Text style={styles.featureText}>
                      Messages exported in encrypted form only
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <View style={styles.featureIcon}>
                      <Check size={18} color="#10b981" />
                    </View>
                    <Text style={styles.featureText}>
                      Plaintext never included in backups
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <View style={styles.featureIcon}>
                      <Check size={18} color="#10b981" />
                    </View>
                    <Text style={styles.featureText}>
                      Your master key required for decryption
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <View style={styles.featureIcon}>
                      <Check size={18} color="#10b981" />
                    </View>
                    <Text style={styles.featureText}>
                      Automatic duplicate detection during import
                    </Text>
                  </View>
                </View>

                <View style={styles.noteBox}>
                  <Text style={styles.noteTitle}>🔐 Your Security</Text>
                  <Text style={styles.noteText}>
                    Backups contain only encrypted messages (ciphertext + IV). 
                    Your master key never leaves your device and is required to read messages.
                  </Text>
                </View>
              </ScrollView>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowBackupInfo(false)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#6366f1', '#8b5cf6']}
                  style={styles.modalButtonGradient}
                >
                  <Text style={styles.modalButtonText}>Understood</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    position: 'relative',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#cbd5e1',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
  },
  premiumCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    overflow: 'hidden',
    position: 'relative',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  cardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardContent: {
    padding: 24,
    position: 'relative',
    zIndex: 1,
  },
  backupSection: {
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
  },
  sparkleIcon: {
    marginLeft: 'auto',
  },
  backupActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  exportButton: {
    // Default styles
  },
  importButton: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  importText: {
    color: '#6366f1',
  },
  infoLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  infoLinkText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  accordionSection: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  accordionContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingVertical: 18,
  },
  accordionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  accordionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  accordionArrow: {
    marginLeft: 8,
    transform: [{ rotate: '0deg' }],
  },
  accordionArrowExpanded: {
    transform: [{ rotate: '180deg' }],
  },
  accordionContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  accordionText: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 22,
  },
  footer: {
    alignItems: 'center',
    padding: 32,
    paddingBottom: 60,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  footerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 1,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
  },
  footerVersion: {
    fontSize: 12,
    color: '#475569',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  modalCard: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 28,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  modalTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  modalClose: {
    padding: 8,
  },
  modalContent: {
    padding: 28,
  },
  featureList: {
    gap: 16,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  featureIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: '#e2e8f0',
    lineHeight: 22,
  },
  noteBox: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
  },
  modalButton: {
    margin: 28,
    marginTop: 0,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});