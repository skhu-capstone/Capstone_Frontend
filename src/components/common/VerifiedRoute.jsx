import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { isUsableAccessToken } from "../../utils/authUtils";

export default function VerifiedRoute({ allowGuest = false }) {
  const location = useLocation();
  const { user, loading } = useAuth();
  const accessToken = localStorage.getItem("accessToken");
  const isLoggedIn = !!user && isUsableAccessToken(accessToken);
  const returnPath = `${location.pathname}${location.search}${location.hash}`;

  if (loading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center bg-slate-50 px-4 py-12 dark:bg-theme-page">
        <div className="text-center" role="status" aria-live="polite">
          <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-3 border-blue-600/25 border-t-blue-600 dark:border-theme-primary/25 dark:border-t-theme-primary" />
          <p className="mt-4 text-sm font-medium text-slate-600 dark:text-theme-muted">
            인증 정보를 확인하는 중입니다...
          </p>
        </div>
      </main>
    );
  }

  if (!isLoggedIn) {
    return allowGuest ? <Outlet /> : <Navigate to="/login" replace state={{ from: returnPath }} />;
  }

  if (user.isVerified !== true) {
    return <Navigate to="/email-verify" replace state={{ from: returnPath }} />;
  }

  return <Outlet />;
}
