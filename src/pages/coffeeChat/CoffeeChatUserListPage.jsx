import { useEffect, useState } from "react";
import CoffeeChatListCard from "../../components/card/CoffeeChatListCard";
import { useQuery } from "@tanstack/react-query";
import { getCoffeeChatUserList } from "../../services/coffeeChatProfileService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function CoffeeChatUserListPage() {
  const [page, setPage] = useState(1); // 페이지
  const [keyword, setKeyword] = useState(""); // 검색
  const [inputKeyword, setInputKeyword] = useState(""); // 입력창
  const navigate = useNavigate(); // 라우터
  const { user: authUser, loading: authLoading } = useAuth();
  const accessToken = localStorage.getItem("accessToken");
  const isAuthenticated = !!authUser && !!accessToken;
  const currentUserId = Number(authUser?.userId ?? authUser?.id);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleSearch = () => {
    setKeyword(inputKeyword);
    setPage(1);
  };

  const handleProfileClick = (userId) => {
    const targetUserId = Number(userId);

    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
      return;
    }

    navigate(`/coffee-chat/profile/${targetUserId}`);
  };

  const { data, isLoading, isError} = useQuery({
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
    <main className="min-h-screen bg-[#F8FAFC] dark:bg-theme-page px-4 py-8 sm:px-6 sm:py-10 lg:px-12 lg:py-14">
      <section className="mx-auto max-w-360">
        <div className="mb-6 flex flex-col gap-4 sm:mb-10 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-theme-text sm:text-3xl">
            Coffee Chat User List
          </h1>

          <form
            className="flex w-full min-w-0 gap-2 lg:w-auto"
            onSubmit={(event) => {
              event.preventDefault();
              handleSearch();
            }}
          >
            <input
              type="text"
              value={inputKeyword}
              onChange={(e) => setInputKeyword(e.target.value)}
              aria-label="이름, 관심 분야 검색"
              placeholder="이름, 관심 분야 검색"
              className="h-12 min-w-0 flex-1 rounded-lg border border-blue-400 dark:border-theme-focus bg-white dark:bg-theme-surface px-3 outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-theme-focus sm:px-4 lg:w-80"
            />

            <button
              type="submit"
              className="h-12 shrink-0 rounded-lg bg-blue-600 dark:bg-theme-primary px-4 text-white hover:cursor-pointer"
            >
              검색
            </button>
          </form>
        </div>

        {(authLoading || isLoading) && <p className="text-gray-500 dark:text-theme-muted">로딩중...</p>}

        {isError && (<p className="text-red-500 dark:text-theme-danger">목록을 불러오지 못했습니다.</p>)}

        {!isLoading && !isError && users.length === 0 && (<p className="text-gray-500 dark:text-theme-muted">검색 결과가 없습니다.</p>)}

        {!isLoading && !isError && users.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2 xl:gap-10">
            {users.map((user) => (
              <CoffeeChatListCard
                key={user.coffeeChatProfileId}
                name={user.name}
                headline={user.headline}
                interest={user.interestTopics}
                clubName={user.clubs}
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
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
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
                  onClick={() => setPage(pageNumber)}
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
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPage))}
              disabled={page === totalPage}
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
