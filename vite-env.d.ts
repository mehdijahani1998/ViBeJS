/// <reference types="vite/client" />

// Extend ImportMeta to include env typed for Vite.
interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_API_KEY?: string;
  // add other VITE_ vars here as needed
  readonly [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
