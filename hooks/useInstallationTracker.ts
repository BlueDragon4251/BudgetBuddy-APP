import { useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '@/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

export const useInstallationTracker = () => {
  useEffect(() => {
    const reportInstall = async () => {
      if (Platform.OS === 'web') {
        console.log('Installation tracking not supported on web');
        return;
      }

      try {
        const done = await AsyncStorage.getItem('install_reported');
        if (!done) {
          console.log('Reporting new installation...');
          const ref = doc(db, 'app', 'installCount');
          await updateDoc(ref, {
            count: increment(1)
          });
          await AsyncStorage.setItem('install_reported', 'true');
          console.log('Installation reported successfully');
        } else {
          console.log('Installation already reported for this device');
        }
      } catch (err) {
        console.error('Failed to report installation:', err);
      }
    };

    reportInstall();
  }, []);
};