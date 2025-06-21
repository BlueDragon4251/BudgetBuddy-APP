import { useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import { AppVersion } from '@/types/finance';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';

// Get the current version from app.json
const CURRENT_VERSION = Constants.expoConfig?.version || '1.0.0';

// Updated URL to a more reliable endpoint without authentication issues
const VERSION_CHECK_URL = 'https://raw.githubusercontent.com/BlueDragon4251/app-versions/main/budgetbuddy-version.json';

export const useVersionCheck = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [versionInfo, setVersionInfo] = useState<AppVersion | null>(null);

  const checkVersion = async () => {
    if (Platform.OS === 'web') {
      return null; // Skip version check on web
    }

    setLoading(true);
    setError(null);

    try {
      // Add timestamp to URL to prevent caching
      const timestamp = new Date().getTime();
      const urlWithTimestamp = `${VERSION_CHECK_URL}?t=${timestamp}`;
      
      const headers: HeadersInit = {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      };
      
      console.log("Checking for updates...");
      console.log("Current version:", CURRENT_VERSION);
      console.log("Fetching from:", urlWithTimestamp);
      
      const response = await fetch(urlWithTimestamp, { 
        headers,
        method: 'GET',
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch version info: ${response.status}`);
      }
      
      const data: AppVersion = await response.json();
      console.log("Fetched version data:", data);
      
      setVersionInfo(data);
      
      // Compare versions
      const isUpdateAvailable = compareVersions(data.latestVersion, CURRENT_VERSION) > 0;
      const needsForceUpdate = compareVersions(data.minVersion, CURRENT_VERSION) > 0;
      
      console.log("Latest version:", data.latestVersion);
      console.log("Min version:", data.minVersion);
      console.log("Update available:", isUpdateAvailable);
      console.log("Force update:", needsForceUpdate || data.forceUpdate);
      
      setUpdateAvailable(isUpdateAvailable);
      setForceUpdate(needsForceUpdate || data.forceUpdate);
      
      return {
        updateAvailable: isUpdateAvailable,
        forceUpdate: needsForceUpdate || data.forceUpdate,
        versionInfo: data
      };
    } catch (err) {
      console.error('Version check failed:', err);
      setError(`Fehler beim Prüfen auf Updates: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const openDownloadLink = async (url?: string) => {
    const downloadUrl = url || versionInfo?.downloadUrl;
    if (downloadUrl) {
      console.log("Opening download URL:", downloadUrl);
      try {
        await WebBrowser.openBrowserAsync(downloadUrl);
        console.log("Browser opened successfully for URL:", downloadUrl);
      } catch (error) {
        console.error("Failed to open browser:", error);
        // Fallback: Show the URL to the user so they can manually open it in their default browser
        Alert.alert(
          "Browser konnte nicht geöffnet werden",
          `Bitte öffnen Sie den folgenden Link manuell in Ihrem Browser, um das Update herunterzuladen:

${downloadUrl}`,
          [{ text: "OK" }]
        );
      }
    } else {
      console.error("No download URL available");
      Alert.alert("Fehler", "Kein Download-Link verfügbar. Bitte versuchen Sie es später erneut.");
    }
  };

  // Compare version strings (returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal)
  const compareVersions = (v1: string, v2: string): number => {
    if (!v1 || !v2) return 0;
    
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;
      
      if (part1 > part2) return 1;
      if (part1 < part2) return -1;
    }
    
    return 0;
  };

  return {
    loading,
    error,
    updateAvailable,
    forceUpdate,
    versionInfo,
    checkVersion,
    openDownloadLink: () => openDownloadLink(),
  };
};