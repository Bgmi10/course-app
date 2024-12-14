import sharedConfig from "@secx/tailwind-config/tailwind.config";
import type { Config } from "tailwindcss";

const config: Pick<Config, "presets"> = {
  presets: [
    {
      ...sharedConfig,
      content: [
        "./**/*.{js,ts,jsx,tsx}",
        "./ui/**/*.{js,ts,jsx,tsx}",
        "../../packages/ui/src/**/*{.js,.ts,.jsx,.tsx}"
      ]
    },
  ],
};

export default config;