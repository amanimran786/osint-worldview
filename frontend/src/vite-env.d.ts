/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_VARIANT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
