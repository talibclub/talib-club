import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  getPushSubscriptionState,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications
} from '../utils/pushNotifications.js';

export function usePWA(user = null, isStaff = false) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(
    window.matchMedia('(display-mode: standalone)').matches || navigator.standalone || false
  );
  
  const [pushState, setPushState] = useState({
    supported: false,
    permission: 'default',
    subscribed: false
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      toast.success('ติดตั้งแอป Talib Club เรียบร้อยแล้ว!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Initial check for push subscription status
    updatePushState();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Update subscription state when user changes (e.g. login/logout)
  useEffect(() => {
    updatePushState();
  }, [user, isStaff]);

  const updatePushState = async () => {
    const state = await getPushSubscriptionState();
    setPushState(state);
  };

  const installApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  const togglePushSubscription = async () => {
    try {
      if (pushState.subscribed) {
        await unsubscribeFromPushNotifications();
        toast.success('ยกเลิกการรับแจ้งเตือนแบบพุชเรียบร้อยแล้ว');
      } else {
        const userId = user?.uid || user?.id || null;
        await subscribeToPushNotifications(userId, isStaff);
        toast.success('เปิดรับการแจ้งเตือนแบบพุชสำเร็จ!');
      }
      await updatePushState();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'เกิดข้อผิดพลาดในการเปลี่ยนการแจ้งเตือน');
    }
  };

  return {
    isInstallable,
    isInstalled,
    installApp,
    pushState,
    togglePushSubscription,
    updatePushState
  };
}
