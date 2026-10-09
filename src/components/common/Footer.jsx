import { GitFork, Mail, Code2, Server } from "lucide-react";
import logo from "../../assets/logo.png";

const NAV_ITEMS = [
  { label: "홈", href: "/" },
  { label: "동아리", href: "/club" },
  { label: "협업/모집", href: "/cooperation" },
  { label: "커피챗", href: "/coffee-chat" },
  { label: "마이페이지", href: "/my-page" },
];

const TEAM = {
  backend: ["정다운", "서연진"],
  frontend: ["윤현승", "최진원"],
};

export default function Footer() {
  return (
    <footer className="w-full" style={{ backgroundColor: "var(--theme-footer)" }}>
      {/* 상단 구분선 */}
      <div className="w-full h-px" style={{ backgroundColor: "var(--theme-footer-border)" }} />

      <div className="max-w-[2000px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-8 items-start">
          {/* 왼쪽: 로고 + 슬로건 */}
          <div className="flex flex-col gap-3 min-w-[140px]">
            <a href="/" className="theme-footer-link inline-block">
              <img src={logo} alt="logo" className="theme-logo h-10 w-auto" />
            </a>
            <p
              className="text-xs leading-relaxed max-w-[160px]"
              style={{ color: "var(--theme-footer-secondary)" }}
            >
              대학생을 위한 동아리·협업 커뮤니티 플랫폼
            </p>
          </div>

          {/* 가운데: 네비게이션 + 팀 정보 */}
          <div className="flex flex-wrap gap-8 justify-start md:justify-center">
            {/* 네비게이션 */}
            <div className="flex flex-col gap-2">
              <p
                className="text-[11px] font-semibold uppercase tracking-widest mb-1"
                style={{ color: "var(--theme-footer-muted)" }}
              >
                Navigation
              </p>
              {NAV_ITEMS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="theme-footer-link text-sm transition-colors duration-150 hover:opacity-100"
                >
                  {label}
                </a>
              ))}
            </div>

            {/* 팀 */}
            <div className="flex flex-col gap-2">
              <p
                className="text-[11px] font-semibold uppercase tracking-widest mb-1"
                style={{ color: "var(--theme-footer-muted)" }}
              >
                Team
              </p>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <Server
                    size={13}
                    className="shrink-0"
                    style={{ color: "var(--theme-footer-secondary)" }}
                  />
                  <span className="text-xs" style={{ color: "var(--theme-footer-muted)" }}>
                    Backend
                  </span>
                  <span className="text-xs" style={{ color: "var(--theme-footer-text)" }}>
                    {TEAM.backend.join(", ")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Code2
                    size={13}
                    className="shrink-0"
                    style={{ color: "var(--theme-footer-secondary)" }}
                  />
                  <span className="text-xs" style={{ color: "var(--theme-footer-muted)" }}>
                    Frontend
                  </span>
                  <span className="text-xs" style={{ color: "var(--theme-footer-text)" }}>
                    {TEAM.frontend.join(", ")}
                  </span>
                </div>
              </div>
            </div>

            {/* 링크 */}
            <div className="flex flex-col gap-2">
              <p
                className="text-[11px] font-semibold uppercase tracking-widest mb-1"
                style={{ color: "var(--theme-footer-muted)" }}
              >
                Contact
              </p>
              <a
                href="https://github.com/skhu-capstone"
                target="_blank"
                rel="noopener noreferrer"
                className="theme-footer-link flex items-center gap-2 text-sm transition-colors duration-150"
              >
                <GitFork size={14} className="shrink-0" />
                GitHub
              </a>
              <a
                href="mailto:hyun136000@gmail.com"
                className="theme-footer-link flex items-center gap-2 text-sm transition-colors duration-150"
              >
                <Mail size={14} className="shrink-0" />
                hyun136000@gmail.com
              </a>
            </div>
          </div>

          {/* 오른쪽: 법적 정보 */}
          <div className="flex flex-col gap-2 text-right">
            <p
              className="text-[11px] font-semibold uppercase tracking-widest mb-1"
              style={{ color: "var(--theme-footer-muted)" }}
            >
              Legal
            </p>
            <a
              href="/terms"
              className="theme-footer-link theme-footer-legal text-ls transition-colors duration-150"
            >
              이용약관
            </a>
            <a
              href="/privacy"
              className="theme-footer-link theme-footer-legal text-ls transition-colors duration-150"
            >
              개인정보처리방침
            </a>
          </div>
        </div>

        {/* 하단 카피라이트 바 */}
        <div
          className="mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2"
          style={{ borderTop: "1px solid var(--theme-footer-divider)" }}
        >
          <p className="text-ls" style={{ color: "var(--theme-footer-muted)" }}>
            © 2026 SKHU Capstone. All rights reserved.
          </p>
          <p className="text-ls" style={{ color: "var(--theme-footer-caption)" }}>
            성공회대학교 캡스톤디자인 프로젝트
          </p>
        </div>
      </div>
    </footer>
  );
}
