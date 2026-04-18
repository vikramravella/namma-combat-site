'use client';
import { useEffect } from 'react';

export default function Schedule() {
  useEffect(() => {
    window.location.replace('/#schedule');
  }, []);
  return null;
}
