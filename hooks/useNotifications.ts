// hooks/useNotifications.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { OneSignal } from 'react-native-onesignal';

import useUserInfo from '@/hooks/useUserInfo';
import { useRegisterUserDeviceToNotification } from '@/services/userServices';

const NOTIFICATION_REQUESTED_KEY = 'notification_permission_requested';
const DEVICE_REGISTERED_KEY = 'device_registered_for_notifications';

export const useNotifications = () => {
  const [hasRequestedPermission, setHasRequestedPermission] = useState(false);
  const [isDeviceRegistered, setIsDeviceRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  
  const userInfo = useUserInfo();
  const registerUserDeviceToNotification = useRegisterUserDeviceToNotification();

  useEffect(() => {
    // Check if we've already requested permission and registered device
    const checkStatus = async () => {
      try {
        const hasRequested = await AsyncStorage.getItem(NOTIFICATION_REQUESTED_KEY);
        const deviceRegistered = await AsyncStorage.getItem(DEVICE_REGISTERED_KEY);
        
        console.log('Notification permission requested status:', hasRequested);
        console.log('Device registration status:', deviceRegistered);
        
        setHasRequestedPermission(hasRequested === 'true');
        setIsDeviceRegistered(deviceRegistered === 'true');
      } catch (error) {
        console.error('Error checking notification status:', error);
      }
    };

    checkStatus();
  }, []);

  // Effect to handle device registration when conditions are met
  useEffect(() => {
    const registerWhenReady = async () => {
      // Only proceed if:
      // 1. User has granted permission
      // 2. User info is available
      // 3. Device is not already registered
      // 4. Not currently registering
      if (
        hasRequestedPermission && 
        userInfo?.id && 
        userInfo?.role && 
        !isDeviceRegistered && 
        !isRegistering
      ) {
        // Double-check that permission is actually granted
        const permissionGranted = await OneSignal.Notifications.getPermissionAsync();
        
        if (permissionGranted) {
          console.log('All conditions met, waiting for push token...');
          
          // Wait longer for OneSignal to generate push token
          let attempts = 0;
          const maxAttempts = 10;
          
          while (attempts < maxAttempts) {
            try {
              
              const pushToken = await OneSignal.User.pushSubscription.getIdAsync();

              console.log('Current push token:', pushToken);
              
              if (pushToken) {
                console.log('Push token found, registering device...');
                await registerDevice(userInfo.id, userInfo.role);
                break;
              } else {
                console.log(`Push token not ready yet, waiting... (${attempts + 1}/${maxAttempts})`);
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
                attempts++;
              }
            } catch (error) {
              console.error('Error checking push token:', error);
              await new Promise(resolve => setTimeout(resolve, 2000));
              attempts++;
            }
          }
          
          if (attempts >= maxAttempts) {
            console.error('Failed to get push token after maximum attempts');
            setRegistrationError('Failed to get push token - OneSignal may not be fully initialized');
          }
        }
      }
    };

    // Add a small initial delay to ensure OneSignal is fully initialized
    const timer = setTimeout(registerWhenReady, 3000); // Wait 3 seconds initially
    return () => clearTimeout(timer);
  }, [hasRequestedPermission, userInfo, isDeviceRegistered, isRegistering]);

  const registerDevice = async (userId: string, role: string, retryCount = 0) => {
    try {
      setIsRegistering(true);
      setRegistrationError(null);
      
      console.log(`Attempting device registration (attempt ${retryCount + 1})...`);
      
      // Get the OneSignal push token with retry logic
      let pushToken: string | null = null;
      let pushSubscriptionId: string | null = null;
      
      try {
        pushSubscriptionId = await OneSignal.User.pushSubscription.getIdAsync();
        pushToken = await OneSignal.User.pushSubscription.getTokenAsync();
        
        console.log('Push Subscription ID:', pushSubscriptionId);
        console.log('Push Token:', pushToken);
      } catch (tokenError) {
        console.error('Error getting push token:', tokenError);
      }

      // If no token and we haven't retried too many times, retry
      if (!pushSubscriptionId && retryCount < 3) {
        console.log(`No push token available, retrying in 2 seconds... (${retryCount + 1}/3)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return registerDevice(userId, role, retryCount + 1);
      }

      if (!pushSubscriptionId) {
        throw new Error('Push token not available after retries');
      }

      console.log('Registering device with token:', pushToken);
      
      const response = await registerUserDeviceToNotification({
        UserId: userId,
        Role: role,
        DevicePushToken: pushSubscriptionId,
      });

      if (response.success) {
        console.log('Device registered successfully:', response.data);
        await AsyncStorage.setItem(DEVICE_REGISTERED_KEY, 'true');
        setIsDeviceRegistered(true);
        return true;
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error registering device:', errorMessage);
      setRegistrationError(errorMessage);
      return false;
    } finally {
      setIsRegistering(false);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      console.log('Requesting notification permission...');
      
      // Request permission first
      const granted = await OneSignal.Notifications.requestPermission(true);
      
      if (granted) {
        console.log('Notification permission granted');
        
        // Mark that we've requested permission
        await AsyncStorage.setItem(NOTIFICATION_REQUESTED_KEY, 'true');
        setHasRequestedPermission(true);
        
        // Setup notification handlers
        setupNotificationHandlers();
        
        // DON'T register device immediately - let the useEffect handle it
        // after OneSignal has time to generate the push token
        console.log('Permission granted, waiting for push token before registration...');
      } else {
        console.log('Notification permission denied');
        // Still mark as requested to avoid asking again
        await AsyncStorage.setItem(NOTIFICATION_REQUESTED_KEY, 'true');
        setHasRequestedPermission(true);
      }

      return granted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const setupNotificationHandlers = () => {
    // Handle notification received while app is in foreground
    OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {
      console.log('Notification received in foreground');
      event.getNotification().display();
    });

    // Handle notification clicks
    OneSignal.Notifications.addEventListener('click', (event) => {
      console.log('Notification clicked:', event);
      // Handle notification click actions here
      const notificationData = event.notification.additionalData;
      console.log('Notification data:', notificationData);
    });
  };

  // Function to manually register device (if permission was granted but registration failed)
  const retryDeviceRegistration = async () => {
    if (userInfo?.id && userInfo?.role && !isDeviceRegistered && !isRegistering) {
      console.log('Manually retrying device registration...');
      return await registerDevice(userInfo.id, userInfo.role);
    }
    console.log('Cannot retry registration - conditions not met');
    return false;
  };

  // Function to reset registration status (useful for testing or re-registration)
  const resetRegistrationStatus = async () => {
    try {
      await AsyncStorage.removeItem(DEVICE_REGISTERED_KEY);
      await AsyncStorage.removeItem(NOTIFICATION_REQUESTED_KEY);
      setIsDeviceRegistered(false);
      setHasRequestedPermission(false);
      setRegistrationError(null);
      console.log('Registration status reset');
    } catch (error) {
      console.error('Error resetting registration status:', error);
    }
  };

  // Function to check current permission status
  const checkPermissionStatus = async () => {
    try {
      const permission = await OneSignal.Notifications.getPermissionAsync();
      console.log('Current permission status:', permission);
      return permission;
    } catch (error) {
      console.error('Error checking permission status:', error);
      return false;
    }
  };

  return {
    hasRequestedPermission,
    isDeviceRegistered,
    isRegistering,
    registrationError,
    requestNotificationPermission,
    retryDeviceRegistration,
    resetRegistrationStatus,
    checkPermissionStatus,
  };
};