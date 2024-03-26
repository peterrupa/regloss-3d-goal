/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                hostname: 'yt3.googleusercontent.com',
            },
        ],
    },
};

export default nextConfig;
