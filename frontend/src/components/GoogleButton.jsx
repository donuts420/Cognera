import React, { useEffect, useRef, useState } from 'react';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

/**
 * Renders the official Google Identity Services button and hands the returned
 * ID token to `onCredential`. GIS only lets us set a pixel width (200–400) and
 * a shape, so we measure the slot once and render the widest allowed rectangular
 * button, then let CSS stretch its wrapper to match the form.
 *
 * We deliberately do NOT use a ResizeObserver on the wrapper: rendering the GIS
 * button injects an iframe that nudges the wrapper's size, which would retrigger
 * the observer and put us in an infinite re-render loop (the visible flicker,
 * plus a storm of cancelled `button?type=standard…` requests). Instead we render
 * once and only re-render on an actual window resize that changes the clamped
 * width.
 */
export default function GoogleButton({ onCredential, text = 'continue_with' }) {
  const wrapRef = useRef(null);
  const btnRef = useRef(null);
  const lastWidthRef = useRef(0);
  const onCredentialRef = useRef(onCredential);
  const [failed, setFailed] = useState(false);

  useEffect(() => { onCredentialRef.current = onCredential; }, [onCredential]);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;
    let tries = 0;
    let resizeTimer;

    const clampedWidth = () => {
      const slot = Math.round(wrapRef.current?.getBoundingClientRect().width || 0) || 400;
      return Math.max(200, Math.min(400, slot));
    };

    const render = () => {
      const gis = window.google?.accounts?.id;
      if (!gis || !btnRef.current || !wrapRef.current) return false;
      const width = clampedWidth();
      lastWidthRef.current = width;
      try {
        gis.initialize({
          client_id: CLIENT_ID,
          callback: (res) => res?.credential && onCredentialRef.current?.(res.credential),
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

    // Re-render only when a genuine window resize changes the clamped width.
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (cancelled) return;
        if (clampedWidth() !== lastWidthRef.current) render();
      }, 250);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelled = true;
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
    };
  }, [text]);

  if (!CLIENT_ID || failed) return null;
  return (
    <div className="google-btn-wrap" ref={wrapRef}>
      <div ref={btnRef} />
    </div>
  );
}

export const GOOGLE_ENABLED = !!CLIENT_ID;
