/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

declare module '*.module.scss' {
  const classes: Record<string, string>;
  export default classes;
}
