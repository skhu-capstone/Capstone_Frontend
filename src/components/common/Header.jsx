import { useState, useRef, useEffect } from "react";
import { Home, Users, Globe, Coffee, User, Plus, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { label: "홈", icon: Home, href: "/" },
  { label: "동아리", icon: Users, href: "/club" },
  { label: "협업/모집", icon: Globe, href: "/cooperation" },
  { label: "커피챗", icon: Coffee, href: "/coffee-chat" },
  { label: "마이페이지", icon: User, href: "/my-page" },
];

const DUMMY_EMAIL = "hyun136000@gmail.com";

export default function Header() {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddAccount = () => {
    setProfileOpen(false);
    navigate("/login");
  };

  const handleLogout = () => {
    setProfileOpen(false);
    navigate("/login");
  };

  return (
    <header
      className="flex items-center justify-between px-6 h-20"
      style={{ backgroundColor: "#6B8DD6" }}
    >
      {/* 로고 영역 - 추후 img 태그로 교체 */}
      <div className="flex items-center justify-center">
        <img src="" alt="logo" className="h-8 w-auto hidden" />
        <div className="text-[#1a2a6c] font-bold text-base tracking-wide select-none">
          LOGO
        </div>
      </div>

      {/* 네비게이션 래퍼 */}
      <div className="bg-white rounded-full px-2 py-1.5">
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
            const isActive = location.pathname === href;
            return (
              <button
                key={label}
                onClick={() => navigate(href)}
                style={{ color: isActive ? "#432DD7" : "#4A5565" }}
                className={[
                  "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors duration-150",
                  isActive ? "font-medium" : "font-normal hover:bg-gray-100",
                ].join(" ")}
              >
                <Icon
                  size={35}
                  strokeWidth={2}
                  className="opacity-90 shrink-0"
                />
                {label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 프로필 버튼 + 드롭다운 */}
      <div className="relative" ref={profileRef}>
        <button
          onClick={() => setProfileOpen((prev) => !prev)}
          className="w-[34px] h-[34px] rounded-full flex items-center justify-center border border-white/50 bg-white/20 hover:bg-white/35 transition-colors duration-150"
          aria-label="프로필"
        >
          <User size={17} strokeWidth={2} color="white" />
        </button>

        {/* 드롭다운 메뉴 */}
        {profileOpen && (
          <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-50">
            {/* 현재 계정 */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-800">{DUMMY_EMAIL}</p>
            </div>

            {/* 다른 계정으로 로그인 */}
            <button
              onClick={handleAddAccount}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100"
            >
              <span className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center shrink-0">
                <Plus size={12} strokeWidth={2.5} className="text-gray-500" />
              </span>
              다른 계정으로 로그인
            </button>

            {/* 로그아웃 */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm transition-colors duration-150 hover:bg-gray-50"
              style={{ color: "#432DD7" }}
            >
              <LogOut size={15} strokeWidth={2} />
              로그아웃
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
