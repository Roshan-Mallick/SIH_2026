'use client';
import { useEffect } from 'react';

export default function ThemeInit() {
  useEffect(() => {
    const isLightMode = localStorage.getItem('aegis-theme') === 'light';
    if (isLightMode) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, []);
  
  return null;
}
