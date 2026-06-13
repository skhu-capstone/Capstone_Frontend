import { useState, useRef, useEffect } from "react";
import {
  Home,
  Users,
  Globe,
  Coffee,
  User,
  Plus,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

const NAV_ITEMS = [
  { label: "홈", icon: Home, href: "/" },
  { label: "동아리", icon: Users, href: "/club/main" },
  { label: "협업/모집", icon: Globe, href: "/cooperation" },
  { label: "커피챗", icon: Coffee, href: "/coffee-chat" },
  { label: "마이페이지", icon: User, href: "/my-page" },
];

export default function Header() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // 로그인된 유저 정보 (email, name, profileImage, isVerified 등)
  const { user, logout } = useAuth();

  const queryClient = useQueryClient();

  // 외부 클릭 시 프로필 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 라우트 변경 시 모바일 메뉴 닫기
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleAddAccount = () => {
    setProfileOpen(false);
    navigate("/login");
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    queryClient.clear();

    alert("로그아웃 완료");
    window.location.href = "/";
  };

  const handleNavClick = (href) => {
    setMobileMenuOpen(false);
    navigate(href);
  };

  return (
    <header className="w-full" style={{ backgroundColor: "#6B8DD6" }}>
      <div className="max-w-500 mx-auto grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 h-16">
        {/* 로고 */}
        <div className="flex items-center">
          <img src="" alt="logo" className="h-8 w-auto hidden" />
          <div className="text-[#1a2a6c] font-bold text-base tracking-wide select-none">
            LOGO
          </div>
        </div>

        {/* 데스크탑 네비 (md 이상에서만 표시) */}
        <div className="hidden md:flex justify-end pr-2">
          <div className="bg-white rounded-2xl px-2 py-1.5">
            <nav className="flex items-center gap-1">
              {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
                const isActive = location.pathname === href;
                return (
                  <button
                    key={label}
                    onClick={() => navigate(href)}
                    style={{ color: isActive ? "#432DD7" : "#4A5565" }}
                    className={[
                      "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors duration-150 cursor-pointer",
                      isActive
                        ? "font-medium"
                        : "font-normal hover:bg-gray-100",
                    ].join(" ")}
                  >
                    <Icon
                      size={18}
                      strokeWidth={2}
                      className="opacity-90 shrink-0"
                    />
                    {label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* 오른쪽 영역: 모바일 햄버거 + 프로필 */}
        <div className="flex items-center gap-2">
          {/* 햄버거 버튼 (md 미만에서만 표시) */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden w-10 h-10 rounded-full flex items-center justify-center border border-white/50 bg-white/20 hover:bg-white/35 transition-colors duration-150 cursor-pointer"
            aria-label="메뉴"
          >
            {mobileMenuOpen ? (
              <X size={20} strokeWidth={2} color="white" />
            ) : (
              <Menu size={20} strokeWidth={2} color="white" />
            )}
          </button>

          {/* 프로필 버튼 */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-white/50 bg-white/20 hover:bg-white/35 transition-colors duration-150 cursor-pointer"
              aria-label="프로필"
            >
              {/* 구글 프로필 사진이 있으면 표시, 없으면 기본 아이콘 */}
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="프로필"
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User size={20} strokeWidth={2} color="white" />
              )}
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  {/* 로그인된 경우 이름 + 이메일, 아닌 경우 안내 문구 */}
                  {user ? (
                    <>
                      {user.name && (
                        <p className="text-xs text-gray-500 mb-0.5">
                          {user.name}
                        </p>
                      )}
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {user.email}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400">로그인 정보 없음</p>
                  )}
                </div>

                <button
                  onClick={handleAddAccount}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 cursor-pointer"
                >
                  <span className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center shrink-0">
                    <Plus
                      size={12}
                      strokeWidth={2.5}
                      className="text-gray-500"
                    />
                  </span>
                  다른 계정으로 로그인
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm transition-colors duration-150 hover:bg-gray-50 cursor-pointer"
                  style={{ color: "#432DD7" }}
                >
                  <LogOut size={15} strokeWidth={2} />
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 모바일 드롭다운 메뉴 (md 미만에서만 표시) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/20 bg-white/10 backdrop-blur-sm">
          <nav className="flex flex-col px-4 py-2">
            {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
              const isActive = location.pathname === href;
              return (
                <button
                  key={label}
                  onClick={() => handleNavClick(href)}
                  className={[
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors duration-150 text-left cursor-pointer",
                    isActive
                      ? "bg-white/30 font-semibold text-white"
                      : "text-white/90 hover:bg-white/20 font-normal",
                  ].join(" ")}
                >
                  <Icon size={18} strokeWidth={2} className="shrink-0" />
                  {label}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
