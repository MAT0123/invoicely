import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Invoicely PWA',
        short_name: 'Invoicely',
        description: 'A invoice tracker',
        start_url: '/',
        display: 'standalone',
        background_color: '#eaeaeaff',
        theme_color: '#e2e2e2ff',
        icons: [
            // {
            //     src: '/icon-192x192.png',
            //     sizes: '192x192',
            //     type: 'image/png',
            // },
            // {
            //     src: '/icon-512x512.png',
            //     sizes: '512x512',
            //     type: 'image/png',
            // },
        ],
    }
}