import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// 백엔드 서버 주소 — 실제 주소로 변경하세요
const BACKEND_URL = "http://localhost:8080";

export default defineConfig({
  define: {
    global: "globalThis", // ← 이것만 추가
  },
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // /api 로 시작하는 모든 요청을 백엔드로 프록시
      "/api": {
        target: BACKEND_URL,
        changeOrigin: true, // CORS 우회
        secure: false, // HTTPS 인증서 검증 비활성화 (개발용)
      },
    },
  },
});
