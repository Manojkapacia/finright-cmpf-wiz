// src/types/clarity.d.ts
export {};

declare global {
  interface Window {
    clarity?: (...args: any[]) => void;
  }
}
