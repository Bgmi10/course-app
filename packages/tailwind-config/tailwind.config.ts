import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    '../../apps/admin/src/**/*.{js,ts,jsx,tsx,mdx}',  
    '../../apps/web/src/**/*.{js,ts,jsx,tsx,mdx}',    
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',     
  ],
};

export default config;

