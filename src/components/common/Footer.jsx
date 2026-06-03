import { GitFork, Mail, Code2, Server } from "lucide-react";

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
    <footer className="w-full" style={{ backgroundColor: "#C5C4C4" }}>
      {/* 상단 구분선 */}
      <div className="w-full h-px" style={{ backgroundColor: "#21212130" }} />

      <div className="max-w-[2000px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-8 items-start">
          {/* 왼쪽: 로고 + 슬로건 */}
          <div className="flex flex-col gap-3 min-w-[140px]">
            <div
              className="w-20 h-8 rounded-lg flex items-center justify-center"
              style={{ border: "2px dashed #21212150" }}
              title="로고 추가 예정"
            >
              <span
                className="text-xs font-medium tracking-wide select-none"
                style={{ color: "#21212160" }}
              >
                LOGO
              </span>
            </div>
            <p
              className="text-xs leading-relaxed max-w-[160px]"
              style={{ color: "#21212199" }}
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
                style={{ color: "#21212180" }}
              >
                Navigation
              </p>
              {NAV_ITEMS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="text-sm transition-colors duration-150 hover:opacity-100"
                  style={{ color: "#212121CC" }}
                  onMouseEnter={(e) => (e.target.style.color = "#212121")}
                  onMouseLeave={(e) => (e.target.style.color = "#212121CC")}
                >
                  {label}
                </a>
              ))}
            </div>

            {/* 팀 */}
            <div className="flex flex-col gap-2">
              <p
                className="text-[11px] font-semibold uppercase tracking-widest mb-1"
                style={{ color: "#21212180" }}
              >
                Team
              </p>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <Server
                    size={13}
                    className="shrink-0"
                    style={{ color: "#21212199" }}
                  />
                  <span className="text-xs" style={{ color: "#21212180" }}>
                    Backend
                  </span>
                  <span className="text-xs" style={{ color: "#212121CC" }}>
                    {TEAM.backend.join(", ")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Code2
                    size={13}
                    className="shrink-0"
                    style={{ color: "#21212199" }}
                  />
                  <span className="text-xs" style={{ color: "#21212180" }}>
                    Frontend
                  </span>
                  <span className="text-xs" style={{ color: "#212121CC" }}>
                    {TEAM.frontend.join(", ")}
                  </span>
                </div>
              </div>
            </div>

            {/* 링크 */}
            <div className="flex flex-col gap-2">
              <p
                className="text-[11px] font-semibold uppercase tracking-widest mb-1"
                style={{ color: "#21212180" }}
              >
                Contact
              </p>
              <a
                href="https://github.com/skhu-capstone"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm transition-colors duration-150"
                style={{ color: "#212121CC" }}
                onMouseEnter={(e) => (e.target.style.color = "#212121")}
                onMouseLeave={(e) => (e.target.style.color = "#212121CC")}
              >
                <GitFork size={14} className="shrink-0" />
                GitHub
              </a>
              <a
                href="mailto:hyun136000@gmail.com"
                className="flex items-center gap-2 text-sm transition-colors duration-150"
                style={{ color: "#212121CC" }}
                onMouseEnter={(e) => (e.target.style.color = "#212121")}
                onMouseLeave={(e) => (e.target.style.color = "#212121CC")}
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
              style={{ color: "#21212180" }}
            >
              Legal
            </p>
            <a
              href="/terms"
              className="text-ls transition-colors duration-150"
              style={{ color: "#212121AA" }}
              onMouseEnter={(e) => (e.target.style.color = "#212121")}
              onMouseLeave={(e) => (e.target.style.color = "#212121AA")}
            >
              이용약관
            </a>
            <a
              href="/privacy"
              className="text-ls transition-colors duration-150"
              style={{ color: "#212121AA" }}
              onMouseEnter={(e) => (e.target.style.color = "#212121")}
              onMouseLeave={(e) => (e.target.style.color = "#212121AA")}
            >
              개인정보처리방침
            </a>
          </div>
        </div>

        {/* 하단 카피라이트 바 */}
        <div
          className="mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2"
          style={{ borderTop: "1px solid #21212125" }}
        >
          <p className="text-ls" style={{ color: "#21212180" }}>
            © 2026 SKHU Capstone. All rights reserved.
          </p>
          <p className="text-ls" style={{ color: "#21212160" }}>
            성공회대학교 캡스톤디자인 프로젝트
          </p>
        </div>
      </div>
    </footer>
  );
}
