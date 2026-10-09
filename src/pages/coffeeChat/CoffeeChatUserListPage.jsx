import { useEffect, useRef, useState } from "react";
import CoffeeChatListCard from "../../components/card/CoffeeChatListCard";
import { useQuery } from "@tanstack/react-query";
import { getCoffeeChatUserList } from "../../services/coffeeChatProfileService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LoaderCircle, RefreshCw, Search, Users, X } from "lucide-react";

export default function CoffeeChatUserListPage() {
  const [page, setPage] = useState(1); // 페이지
  const [keyword, setKeyword] = useState(""); // 검색
  const [inputKeyword, setInputKeyword] = useState(""); // 입력창
  const navigate = useNavigate(); // 라우터
  const { user: authUser, loading: authLoading } = useAuth();
  const accessToken = localStorage.getItem("accessToken");
  const isAuthenticated = !!authUser && !!accessToken;
  const currentUserId = Number(authUser?.userId ?? authUser?.id);
  const listTopRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleSearch = () => {
    setKeyword(inputKeyword);
    setPage(1);
  };

  const handleResetSearch = () => {
    setInputKeyword("");
    setKeyword("");
    setPage(1);
  };

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    window.requestAnimationFrame(() => {
      listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleProfileClick = (userId) => {
    const targetUserId = Number(userId);

    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
      return;
    }

    navigate(`/coffee-chat/profile/${targetUserId}`);
  };

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["coffeeChatProfiles", keyword, page],
    queryFn: () => getCoffeeChatUserList({
      keyword,
      page: page - 1,
      size: 10,
    }),
    enabled: isAuthenticated,
  })

  const users = (data?.content ?? []).filter(
    (user) => Number(user.userId) !== currentUserId,
  );
  const totalPage = data?.totalPages ?? 0;
  const pageNumbers = Array.from({ length: totalPage }, (_, index) => index + 1)
    .filter(
      (pageNumber) =>
        pageNumber === 1 ||
        pageNumber === totalPage ||
        Math.abs(pageNumber - page) <= 1,
    );

  return (
    <main className="bg-[#F8FAFC] px-3 pt-6 pb-8 dark:bg-theme-page sm:px-6 sm:pt-10 sm:pb-12 lg:px-10 lg:pt-14">
      <section className="mx-auto max-w-7xl">
        <div ref={listTopRef} className="scroll-mt-24 mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-theme-text sm:text-3xl lg:text-4xl">
            Coffee Chat User List
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-theme-muted sm:text-base">
            관심사가 맞는 학우를 찾아 커피챗을 시작해보세요.
          </p>
          </div>

          <form
            className="flex w-full min-w-0 gap-2 lg:w-auto"
            onSubmit={(event) => {
              event.preventDefault();
              handleSearch();
            }}
          >
            <div className="relative min-w-0 flex-1 lg:w-80 lg:flex-none">
              <input
                type="text"
                value={inputKeyword}
                onChange={(e) => setInputKeyword(e.target.value)}
                aria-label="이름, 관심 분야 검색"
                placeholder="이름, 관심 분야 검색"
                className="h-12 w-full min-w-0 appearance-none rounded-xl border border-slate-300 bg-white px-3 pr-11 text-sm outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-500/15 dark:border-theme-border-strong dark:bg-theme-surface dark:text-theme-text dark:focus:border-theme-focus dark:focus:ring-theme-focus/20 sm:px-4 sm:pr-11 sm:text-base"
              />
              {(inputKeyword || keyword) && (
                <button
                  type="button"
                  onClick={handleResetSearch}
                  aria-label="검색 초기화"
                  title="검색 초기화"
                  className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-blue-600 dark:text-theme-muted dark:hover:bg-theme-hover dark:hover:text-theme-text dark:focus-visible:outline-theme-focus"
                >
                  <X aria-hidden="true" className="h-4 w-4" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isFetching}
              className="flex h-12 shrink-0 touch-manipulation items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-theme-primary dark:hover:bg-theme-primary-hover sm:min-w-24"
            >
              {isFetching ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Search aria-hidden="true" className="h-4 w-4" />}
              <span className="hidden min-[360px]:inline">검색</span>
            </button>
          </form>
        </div>

        {(authLoading || isLoading) && (
          <div className="flex min-h-72 flex-col items-center justify-center text-center" role="status" aria-live="polite">
            <LoaderCircle aria-hidden="true" className="h-8 w-8 animate-spin text-blue-600 dark:text-theme-link" />
            <p className="mt-3 text-sm text-gray-500 dark:text-theme-muted">커피챗 사용자를 불러오는 중입니다...</p>
          </div>
        )}

        {isError && (
          <div className="flex min-h-72 flex-col items-center justify-center text-center" role="alert">
            <p className="font-semibold text-slate-800 dark:text-theme-text">목록을 불러오지 못했습니다.</p>
            <button type="button" onClick={() => refetch()} className="mt-4 flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600 dark:border-theme-border-strong dark:bg-theme-surface dark:text-theme-text dark:hover:bg-theme-hover dark:focus-visible:outline-theme-focus">
              <RefreshCw aria-hidden="true" className="h-4 w-4" />
              다시 시도
            </button>
          </div>
        )}

        {!isLoading && !isError && users.length === 0 && (
          <div className="flex min-h-72 flex-col items-center justify-center text-center">
            <Users aria-hidden="true" className="h-10 w-10 text-slate-300 dark:text-theme-muted" />
            <p className="mt-3 font-semibold text-slate-700 dark:text-theme-text">검색 결과가 없습니다.</p>
            {keyword && (
              <button type="button" onClick={handleResetSearch} className="mt-4 min-h-11 rounded-xl px-4 text-sm font-semibold text-blue-600 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-600 dark:text-theme-link dark:hover:bg-theme-hover dark:focus-visible:outline-theme-focus">
                검색 초기화
              </button>
            )}
          </div>
        )}

        {!isLoading && !isError && users.length > 0 && (
          <div className={`grid grid-cols-1 gap-3 transition-opacity sm:gap-5 lg:grid-cols-2 lg:gap-6 ${isFetching ? "opacity-60" : "opacity-100"}`} aria-busy={isFetching}>
            {users.map((user) => (
              <CoffeeChatListCard
                key={user.coffeeChatProfileId}
                name={user.name}
                headline={user.headline}
                interest={user.interestTopics}
                clubs={user.clubs}
                image={user}
                disabled={!Number.isInteger(Number(user.userId)) || Number(user.userId) <= 0}
                onClick={() => handleProfileClick(user.userId)}
              />
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {!isLoading && !isError && totalPage > 0 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(Math.max(page - 1, 1))}
              disabled={page === 1 || isFetching}
              aria-label="이전 페이지"
              className="flex h-11 w-11 shrink-0 items-center justify-center text-2xl text-gray-600 dark:text-theme-secondary disabled:text-gray-300 dark:disabled:text-theme-disabled"
            >
              ‹
            </button>
            <span className="text-sm text-gray-600 dark:text-theme-secondary sm:hidden" aria-live="polite">
              {page} / {totalPage}
            </span>
            <div className="hidden items-center gap-2 sm:flex">
            {pageNumbers.map((pageNumber, index) => (
              <div key={pageNumber} className="flex items-center gap-2">
                {index > 0 && pageNumber - pageNumbers[index - 1] > 1 && (
                  <span className="text-sm text-gray-400 dark:text-theme-muted">...</span>
                )}
                <button
                  onClick={() => handlePageChange(pageNumber)}
                  disabled={isFetching}
                  aria-label={`${pageNumber}페이지`}
                  aria-current={page === pageNumber ? "page" : undefined}
                  className={`h-9 w-9 rounded-full text-sm ${
                    page === pageNumber
                      ? "bg-blue-600 dark:bg-theme-primary text-white"
                      : "text-gray-500 dark:text-theme-muted"
                  }`}
                >
                  {pageNumber}
                </button>
              </div>
            ))}
            </div>

            <button
              onClick={() => handlePageChange(Math.min(page + 1, totalPage))}
              disabled={page === totalPage || isFetching}
              aria-label="다음 페이지"
              className="flex h-11 w-11 shrink-0 items-center justify-center text-2xl text-gray-600 dark:text-theme-secondary disabled:text-gray-300 dark:disabled:text-theme-disabled"
            >
              ›
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
