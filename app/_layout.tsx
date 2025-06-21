import { RorkErrorBoundary } from "../.rorkai/rork-error-boundary";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { useColorScheme, StatusBar, Platform } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { useVersionCheck } from "@/hooks/useVersionCheck";
import { UpdateModal } from "@/components/modals/UpdateModal";
import { FirstStartModal } from "@/components/modals/FirstStartModal";
import { useBackupStore } from "@/hooks/useBackupStore";
import { useInstallationTracker } from "@/hooks/useInstallationTracker";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  const { theme, isDarkMode } = useTheme();
  const { 
    checkVersion, 
    updateAvailable, 
    forceUpdate, 
    versionInfo, 
    openDownloadLink,
    error: versionError
  } = useVersionCheck();
  const { createBackup, restoreFromBackup } = useBackupStore();
  
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showFirstStartModal, setShowFirstStartModal] = useState(false);
  const [isFirstStart, setIsFirstStart] = useState(false);

  // Track installations
  useInstallationTracker();

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      // Check if it's the first start
      checkFirstStart();
      
      // Check for updates
      performVersionCheck();
      
      // Create automatic backup
      createBackup();
      
      // Try to restore from backup if exists
      restoreFromBackup();
      
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  const performVersionCheck = async () => {
    console.log("Performing version check...");
    try {
      const result = await checkVersion();
      if (result && (result.updateAvailable || result.forceUpdate)) {
        console.log("Update available, showing modal");
        setShowUpdateModal(true);
      } else {
        console.log("No update available or check failed");
        if (versionError) {
          console.error("Version check error:", versionError);
        }
      }
    } catch (error) {
      console.error("Error checking version:", error);
    }
  };

  const checkFirstStart = async () => {
    try {
      const hasStartedBefore = await AsyncStorage.getItem('hasStartedBefore');
      
      if (!hasStartedBefore) {
        setIsFirstStart(true);
        setShowFirstStartModal(true);
        await AsyncStorage.setItem('hasStartedBefore', 'true');
      }
    } catch (error) {
      console.error('Error checking first start:', error);
    }
  };

  const handleCloseUpdateModal = () => {
    if (!forceUpdate) {
      setShowUpdateModal(false);
    }
  };

  const handleUpdate = () => {
    openDownloadLink();
    if (!forceUpdate) {
      setShowUpdateModal(false);
    }
  };

  const handleCloseFirstStartModal = () => {
    setShowFirstStartModal(false);
  };

  if (!loaded) {
    return null;
  }

  return (
    <>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor={theme.background}
      />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerTintColor: theme.text,
          headerBackTitle: "Zurück",
          contentStyle: {
            backgroundColor: theme.background,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      
      <UpdateModal
        visible={showUpdateModal}
        onClose={handleCloseUpdateModal}
        versionInfo={versionInfo}
        onUpdate={handleUpdate}
        forceUpdate={forceUpdate}
      />
      
      <FirstStartModal
        visible={showFirstStartModal && isFirstStart}
        onClose={handleCloseFirstStartModal}
      />
    </>
  );
}