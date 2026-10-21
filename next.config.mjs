/** @type {import('next').NextConfig} */
function getSupabaseHostname() {
  const raw = (process.env.SUPABASE_URL || "").trim().replace(/^["']|["']$/g, "");
  if (!raw) return null;
  try {
    return new URL(raw.startsWith("http") ? raw : `https://${raw}`).hostname;
  } catch {
    console.warn(`[next.config] SUPABASE_URL no es una URL válida; se ignora para images.remotePatterns.`);
    return null;
  }
}

const supabaseHostname = getSupabaseHostname();
const nextConfig = {
  images: {
    remotePatterns: supabaseHostname ? [{ protocol: "https", hostname: supabaseHostname, pathname: "/storage/v1/object/public/**" }] : [],
  },
};
export default nextConfig;
