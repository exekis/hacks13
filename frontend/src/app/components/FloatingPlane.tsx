import React from 'react';
import '@/styles/airplane.css';
import airplane from '@/assets/images/airplane.svg';

export default function FloatingPlane() {
  return (
    <img
      src={airplane}
      alt="airplane"
      className="floating-plane"
      aria-hidden="true"
    />
  );
}