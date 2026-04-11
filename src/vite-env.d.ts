/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_WS_API_URL?: string;
  readonly VITE_HARD_LOCAL_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
