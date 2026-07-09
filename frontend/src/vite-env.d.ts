/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  /** Set to false on production servers without ml_services (default true when unset). */
  readonly VITE_ML_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
