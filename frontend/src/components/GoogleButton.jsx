import React, { useEffect, useRef, useState } from 'react';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

/**
 * Renders the official Google Identity Services button and hands the returned
 * ID token to `onCredential`. GIS only lets us set a pixel width (200–400) and
 * a shape, so we measure the slot and render the widest allowed rectangular
 * button, then let CSS stretch its wrapper to match the form.
 */
export default function GoogleButton({ onCredential, text = 'continue_with' }) {
  const wrapRef = useRef(null);
  const btnRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;
    let tries = 0;

    const render = () => {
      const gis = window.google?.accounts?.id;
      if (!gis || !btnRef.current || !wrapRef.current) return false;
      const slot = Math.round(wrapRef.current.getBoundingClientRect().width) || 400;
      const width = Math.max(200, Math.min(400, slot));
      try {
        gis.initialize({
          client_id: CLIENT_ID,
          callback: (res) => res?.credential && onCredential(res.credential),
        });
        btnRef.current.innerHTML = '';
        gis.renderButton(btnRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          shape: 'rectangular',
          text,
          logo_alignment: 'left',
          width,
        });
      } catch {
        setFailed(true);
      }
      return true;
    };

    const tick = () => {
      if (cancelled) return;
      if (render()) return;
      if (++tries > 100) { setFailed(true); return; }
      setTimeout(tick, 100);
    };
    tick();

    // re-render on resize so the width tracks the form
    let raf;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(render);
    });
    if (wrapRef.current) ro.observe(wrapRef.current);

    return () => { cancelled = true; ro.disconnect(); cancelAnimationFrame(raf); };
  }, [onCredential, text]);

  if (!CLIENT_ID || failed) return null;
  return (
    <div className="google-btn-wrap" ref={wrapRef}>
      <div ref={btnRef} />
    </div>
  );
}

export const GOOGLE_ENABLED = !!CLIENT_ID;
