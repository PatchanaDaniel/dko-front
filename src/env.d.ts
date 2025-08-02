/// <reference types="vite/client" />

// Types pour les variables d'environnement Vite
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_NODE_ENV: 'development' | 'production' | 'test'
  readonly VITE_PORT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
