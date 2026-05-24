import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

const PORT = 8083;

export default defineConfig(({ mode }) => ({
    plugins: [
        react(),
        svgr({ svgrOptions: { exportType: 'default' }, include: '**/*.svg' }),
        VitePWA({
            registerType: 'prompt',
            includeAssets: ['favicon.ico'],
            manifest: {
                name: 'Tuktuk SCG scrapper',
                short_name: 'Tuktuk',
                description: 'The starcitygames.com shop price scrapper.',
                lang: 'en-GB',
                start_url: '/',
                display: 'standalone',
                theme_color: '#5a9117',
                background_color: '#FFFFFF',
                icons: [
                    { src: '/icons/android-icon-192x192.png', sizes: '192x192', type: 'image/png' },
                    { src: '/icons/apple-icon-1024x1024.png', sizes: '1024x1024', type: 'image/png' },
                    { src: '/icons/ms-icon-310x310.png', sizes: '310x310', type: 'image/png' },
                ],
            },
        }),
    ],
    publicDir: path.resolve(__dirname, 'src/icons'),
    define: {
        __dev__: JSON.stringify(mode !== 'production'),
    },
    build: {
        outDir: path.resolve(__dirname, '../../dist'),
        emptyOutDir: true,
        sourcemap: mode === 'production' ? 'hidden' : true,
    },
    server: {
        port: PORT,
        host: true,
    },
    preview: {
        port: PORT,
    },
}));
