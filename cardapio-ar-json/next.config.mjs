/** Site 100% estático: gera a pasta "out" com HTML, JS e JSON. Sem servidor e sem banco de dados. */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
