//<reference types="vite/client" />

interface ImportMetaEnv {
    VITE_APP_AWS_SECRET_ACCESS_KEY: string | undefined
    VITE_APP_AWS_ACCESS_KEY_ID: any
    VITE_APP_AWS_BUCKET_NAME: string
    readonly VITE_APP_TITLE: string
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }



/// <reference types="vite/types/importMeta.d.ts" />
