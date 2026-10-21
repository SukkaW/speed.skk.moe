'use client';

import { useRef } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { THEME_COLOR, THEME_STORAGE_KEY } from '@/lib/theme';

/**
  ((document, key, darkColor, lightColor) => {
    try {
      const mode = localStorage[key];
      if (mode === 'light' || mode === 'dark') document.documentElement.classList.add(mode);
      const color = mode
        ? (mode === 'dark' ? darkColor : lightColor)
        : (matchMedia('(prefers-color-scheme: dark)').matches ? darkColor : lightColor);
      document.querySelectorAll('meta[name="theme-color"]').forEach(el => el.setAttribute('content', color));
    } catch {}
  })(document, key, darkColor, lightColor)
 */
const themeScript = `((e,t,o,a)=>{try{let r=localStorage[t];("light"===r||"dark"===r)&&e.documentElement.classList.add(r);let c=r?"dark"===r?o:a:matchMedia("(prefers-color-scheme: dark)").matches?o:a;e.querySelectorAll('meta[name="theme-color"]').forEach(e=>e.setAttribute("content",c))}catch{}})(document,${JSON.stringify(THEME_STORAGE_KEY)},${JSON.stringify(THEME_COLOR.dark)},${JSON.stringify(THEME_COLOR.light)});`;

/**
 * Blocking inline script so the saved appearance applies before first paint. The theme-color
 * meta travels with it: the script rewrites its content before React hydrates, and React would
 * otherwise see a mismatched hoisted meta and insert a second one.
 */
export function ThemeScript() {
  const insertedRef = useRef(false);

  useServerInsertedHTML(() => {
    if (insertedRef.current) return null;
    insertedRef.current = true;

    return (
      <>
        <meta name="theme-color" content={THEME_COLOR.light} />
        {/* eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml -- trusted script */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </>
    );
  });

  return null;
}
