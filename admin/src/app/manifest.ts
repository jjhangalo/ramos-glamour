import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ramos Glamour Admin",
    short_name: "RG Admin",
    description: "Painel de Administração Ramos Glamour",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0c0c0c",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
