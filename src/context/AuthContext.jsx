import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const validateLoginUserData = (userData) => {
  if (!userData || typeof userData !== "object") return false;

  const hasUserId = userData.userId !== undefined || userData.id !== undefined;
  const hasVerifiedStatus = typeof userData.isVerified === "boolean";

  return Boolean(
    hasUserId &&
      hasVerifiedStatus &&
      userData.accessToken &&
      userData.refreshToken
  );
};

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
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        localStorage.removeItem("user");
      }
    }
    return null;
  });
  const loading = false;

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
      const res = await fetch(`${BASE_URL}/api/auth/google/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ googleAccessToken }),
      });

      const json = await res.json();

      if (json.success && json.data) {
        if (!validateLoginUserData(json.data)) {
          return {
            success: false,
            code: "INVALID_LOGIN_RESPONSE",
            message: "로그인 응답 데이터가 올바르지 않습니다.",
          };
        }

        setAuthenticatedUser(json.data);
        return {
          success: true,
          code: json.code,
          message: json.message,
          data: json.data,
        };
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

  const setAuthenticatedUser = (userData) => {
    setUser(userData);
    localStorage.setItem("accessToken", userData.accessToken);
    localStorage.setItem("refreshToken", userData.refreshToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, googleLogin, setAuthenticatedUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
