import react from "@vitejs/plugin-react";
import InjectPreload from "unplugin-inject-preload";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
    base: "/ld60/",
    plugins: [
        react(),
        InjectPreload.vite({
            files: [
                {
                    entryMatch: /\.(png|jpe?g|webp|svg|mp3|wav?)$/,
                    attributes: {
                        rel: "preload",
                    },
                },
            ],
        }),
    ],
    build: {
        sourcemap: true,
    },
});
