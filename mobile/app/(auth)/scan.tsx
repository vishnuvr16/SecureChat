import { Ionicons } from '@expo/vector-icons';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import * as api from "../../lib/api";
import { startTokenRefreshTimer } from "../../lib/auth";
import * as storage from "../../lib/storage";

const { width, height } = Dimensions.get('window');

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scanLineAnim] = useState(new Animated.Value(0));

  // Request camera permission if not already granted
  useEffect(() => {
    if (permission?.granted === false) {
      requestPermission();
    }
  }, [permission]);

  // Start scan line animation
  useEffect(() => {
    if (permission?.granted && !scanned && !isLoading) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [permission?.granted, scanned, isLoading]);

  async function handleBarCodeScanned(scanningResult: BarcodeScanningResult) {
    if (scanned || isLoading) return;
    
    setScanned(true);
    setIsLoading(true);

    try {
      const data = scanningResult.data;
      console.log("Scanned QR data:", data);
      let token: string | null = null;
      let masterBase64: string | null = null;

      // Try to parse as URL with query params
      try {
        const url = new URL(data);
        console.log("Parsed URL:", url);
        token = url.searchParams.get("token");
        masterBase64 = url.searchParams.get("master");
      } catch {
        // If not a valid URL, try parsing as JSON
        try {
          const parsed = JSON.parse(data);
          token = parsed.token;
          masterBase64 = parsed.master || parsed.mk;
        } catch {
          // If not JSON, treat the whole string as token
          token = data;
        }
      }

      if (!token || !masterBase64) {
        Alert.alert("Invalid QR", "QR did not contain a token or master key. Ask the web app to generate QR again.");
        setScanned(false);
        setIsLoading(false);
        return;
      }

      console.log("Scanned token:", token);
      // Call server QR login to obtain tokens + user
      const resp = await api.qrLogin(token, masterBase64);

      // Save tokens & user data
      await storage.saveAccessToken(resp.accessToken);
      await storage.saveRefreshToken(resp.refreshToken);
      await storage.saveUser(resp.user);

      // Import master key
      // if (masterBase64) {
      //   try {
      //     const keyBuffer = await crypto.importMasterKeyFromBase64(masterBase64);
      //     storage.setMasterKey(keyBuffer);
      //   } catch (err) {
      //     console.warn("Failed to import master key from QR:", err);
      //   }
      // }
      storage.setMasterKey(masterBase64)

      // start auto-refresh timer
      startTokenRefreshTimer();

      // set last sync to a safe past time
      await storage.setLastSync(new Date(0));

      router.replace("/(tabs)/chat" as any);
    } catch (err) {
      console.error("QR login error:", err);
      Alert.alert("Login failed", (err as Error).message || "Unknown error");
      setScanned(false);
      setIsLoading(false);
    }
  }

  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#111827', '#1f2937']}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading Camera...</Text>
        </LinearGradient>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <LinearGradient
        colors={['#111827', '#1f2937']}
        style={styles.permissionContainer}
      >
        <View style={styles.permissionContent}>
          <View style={styles.cameraIconContainer}>
            <Ionicons name="camera-outline" size={80} color="#3b82f6" />
            <View style={styles.cameraIconGlow} />
          </View>
          
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            To scan QR codes for secure login, we need access to your camera.
          </Text>
          
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <LinearGradient
              colors={['#3b82f6', '#8b5cf6']}
              style={styles.permissionButtonGradient}
            >
              <Ionicons name="camera" size={24} color="white" />
              <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#9ca3af" />
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.8)', 'transparent', 'transparent', 'rgba(0, 0, 0, 0.8)']}
          style={styles.overlay}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButtonFloating}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Scan QR Code</Text>
            <View style={styles.headerPlaceholder} />
          </View>

          {/* Scanner frame */}
          <View style={styles.scannerContainer}>
            <View style={styles.scannerFrame}>
              {/* Corners */}
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />
              
              {/* Animated scan line */}
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [{
                      translateY: scanLineAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 240]
                      })
                    }]
                  }
                ]}
              />
            </View>
            
            {/* Instructions */}
            <View style={styles.instructions}>
              <Text style={styles.instructionText}>
                Position QR code within the frame
              </Text>
              <Text style={styles.instructionSubtext}>
                Ensure good lighting for best results
              </Text>
            </View>
          </View>

          {/* Loading overlay */}
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <LinearGradient
                colors={['rgba(17, 24, 39, 0.95)', 'rgba(31, 41, 55, 0.95)']}
                style={styles.loadingModal}
              >
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingModalText}>Logging in securely...</Text>
                <Text style={styles.loadingSubtext}>
                  Setting up end-to-end encryption
                </Text>
              </LinearGradient>
            </View>
          )}
        </LinearGradient>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  backButtonFloating: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  headerPlaceholder: {
    width: 44,
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 280,
    height: 280,
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#3b82f6',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  scanLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  instructions: {
    marginTop: 40,
    alignItems: 'center',
  },
  instructionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  instructionSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingModal: {
    width: '80%',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  loadingModalText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  loadingSubtext: {
    color: '#9ca3af',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 20,
  },
  permissionContainer: {
    flex: 1,
  },
  permissionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  cameraIconContainer: {
    position: 'relative',
    marginBottom: 30,
  },
  cameraIconGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 60,
  },
  permissionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  permissionButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  permissionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    color: '#9ca3af',
    fontSize: 16,
  },
});