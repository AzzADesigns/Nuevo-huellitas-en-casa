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
const storagePath = "/storage/v1/object/public/**";
const remotePatterns = [{ protocol: "https", hostname: "**.supabase.co", pathname: storagePath }];
if (supabaseHostname && !supabaseHostname.endsWith(".supabase.co")) {
  remotePatterns.push({ protocol: "https", hostname: supabaseHostname, pathname: storagePath });
}

const nextConfig = {
  images: {
    formats: ["image/webp"],
    deviceSizes: [640, 828, 1080, 1440, 1920],
    imageSizes: [96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns,
  },
};
export default nextConfig;
