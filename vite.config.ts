import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Only manually group vendors that are ALREADY loaded eagerly (used by the
        // landing/Index tree) so they cache well across routes. Heavy, optional libs
        // (mapbox, pdf, recharts, react-big-calendar, …) are deliberately NOT grouped:
        // they're reached only via dynamic import()/React.lazy, so Vite splits them into
        // genuine dynamic chunks that load on demand — never on first paint.
        // (Forcing a lazy-only lib into a named chunk can pull it back into the eager
        // graph if any sibling module in that chunk is statically imported — e.g. date-fns.)
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("@tanstack")) return "query";
          if (id.includes("@radix-ui")) return "radix";
          if (id.includes("framer-motion")) return "motion";
          if (
            id.includes("/react-router") ||
            id.includes("/react-dom/") ||
            id.includes("/scheduler/") ||
            /\/react\//.test(id)
          )
            return "react-vendor";
        },
      },
    },
  },
}));
