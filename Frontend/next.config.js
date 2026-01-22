/** @type {import('next').NextConfig} */
const nextConfig = {
    // Allow Server Actions from GitHub Codespaces proxy
    experimental: {
        serverActions: {
            allowedOrigins: [
                'localhost:3000',
                '*.app.github.dev',
                'expert-space-garbanzo-7v764xjxw764h4-3000.app.github.dev',
            ],
        },
    },
};

module.exports = nextConfig;
