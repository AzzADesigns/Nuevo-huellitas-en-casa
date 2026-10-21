/** @type {import('next').NextConfig} */
const supabaseHostname = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).hostname : null;
const nextConfig = {
  images: {
    remotePatterns: supabaseHostname ? [{ protocol: "https", hostname: supabaseHostname, pathname: "/storage/v1/object/public/**" }] : [],
  },
};
export default nextConfig;
