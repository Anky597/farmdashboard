/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_THINGSPEAK_API_KEY: process.env.NEXT_PUBLIC_THINGSPEAK_API_KEY,
    NEXT_PUBLIC_THINGSPEAK_CHANNEL_ID: process.env.NEXT_PUBLIC_THINGSPEAK_CHANNEL_ID,
  },
}

module.exports = nextConfig

