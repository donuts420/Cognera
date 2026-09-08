import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api.js';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const arr = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i);
  return arr;
}

export function usePush() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    setSupported(true);
    setPermission(Notification.permission);

    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setSubscribed(!!sub);
    });
  }, []);

  const subscribe = useCallback(async () => {
    if (!supported) return;
    setLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') { setLoading(false); return false; }

      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        const { publicKey } = await api.get('/push/vapid-key');
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }

      const keys = sub.getKey('p256dh');
      const auth = sub.getKey('auth');
      await api.post('/push/subscribe', {
        endpoint: sub.endpoint,
        p256dh: keys ? btoa(String.fromCharCode(...new Uint8Array(keys))) : '',
        auth: auth ? btoa(String.fromCharCode(...new Uint8Array(auth))) : '',
      });

      setSubscribed(true);
      return true;
    } catch (err) {
      console.error('Push subscribe error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [supported]);

  const unsubscribe = useCallback(async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await api.delete('/push/subscribe', { body: JSON.stringify({ endpoint: sub.endpoint }) });
        await sub.unsubscribe();
      }
      setSubscribed(false);
      return true;
    } catch (err) {
      console.error('Push unsubscribe error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendTest = useCallback(async () => {
    try {
      return await api.post('/push/test');
    } catch (err) {
      console.error('Test push error:', err);
      return null;
    }
  }, []);

  return { supported, permission, subscribed, loading, subscribe, unsubscribe, sendTest };
}
