import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

/**
 * Google 소셜 로그인 후 백엔드 응답을 받아
 * 앱 전역에서 유저 정보를 관리하는 Context입니다.
 *
 * 사용법:
 *   1. main.jsx (또는 App.jsx) 최상단에서 <AuthProvider>로 감싸기
 *   2. 컴포넌트 안에서 const { user, googleLogin, logout } = useAuth();
 *
 * user 객체 구조 (백엔드 응답 data 필드 그대로):
 *   {
 *     userId: number,
 *     email: string,
 *     name: string,
 *     profileImage: string | null,
 *     schoolEmail: string | null,
 *     isVerified: boolean,
 *     accessToken: string,
 *     refreshToken: string,
 *   }
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 앱 시작 시 로컬스토리지에 저장된 유저 정보 복원
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  /**
   * Google OAuth에서 받은 accessToken을 백엔드로 전송해 로그인합니다.
   *
   * @param {string} googleAccessToken - Google OAuth 인증 후 받은 액세스 토큰
   * @returns {{ success: boolean, code: string, message: string }} 결과 객체
   *
   * 호출 예시 (로그인 페이지에서):
   *   const { success, code, message } = await googleLogin(googleAccessToken);
   *   if (success) navigate("/");
   *   else alert(message);
   */
  const googleLogin = async (googleAccessToken) => {
    try {
      const res = await fetch("/api/auth/google/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ googleAccessToken }),
      });

      const json = await res.json();

      if (json.success && json.data) {
        setUser(json.data);
        localStorage.setItem("user", JSON.stringify(json.data));
        return { success: true, code: json.code, message: json.message };
      }

      // 에러 응답 (401 / 403 / 409 등)
      return { success: false, code: json.code, message: json.message };
    } catch (err) {
      console.error("Google login error:", err);
      return {
        success: false,
        code: "NETWORK_ERROR",
        message: "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
