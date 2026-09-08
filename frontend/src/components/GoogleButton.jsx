import React, { useEffect, useRef, useState } from 'react';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

/**
 * Renders the official Google Identity Services button and hands the returned
 * ID token to `onCredential`. Renders nothing when no VITE_GOOGLE_CLIENT_ID is
 * configured (local dev without a client id). GIS injects its own iframe button
 * — we only control the options Google exposes.
 */
export default function GoogleButton({ onCredential, text = 'continue_with' }) {
  const ref = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;
    let tries = 0;

    const tick = () => {
      if (cancelled) return;
      const gis = window.google?.accounts?.id;
      if (gis && ref.current) {
        try {
          gis.initialize({
            client_id: CLIENT_ID,
            callback: (res) => res?.credential && onCredential(res.credential),
          });
          ref.current.innerHTML = '';
          gis.renderButton(ref.current, {
            theme: 'outline',
            size: 'large',
            width: 320,
            text,
            shape: 'pill',
            logo_alignment: 'center',
          });
        } catch {
          setFailed(true);
        }
        return;
      }
      if (++tries > 100) { setFailed(true); return; } // ~10s
      setTimeout(tick, 100);
    };
    tick();
    return () => { cancelled = true; };
  }, [onCredential, text]);

  if (!CLIENT_ID || failed) return null;
  return (
    <div className="google-btn-wrap">
      <div ref={ref} />
    </div>
  );
}

export const GOOGLE_ENABLED = !!CLIENT_ID;
