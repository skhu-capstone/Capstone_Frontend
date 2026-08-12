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
    <main className="min-h-screen bg-[#F8FAFC] px-12 py-14">
      <section className="mx-auto max-w-360">
        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Coffee Chat User List
          </h1>

          <div className="flex gap-2">
            <input
              type="text"
              value={inputKeyword}
              onChange={(e) => setInputKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="이름, 관심 분야 검색"
              className="h-12 w-80 rounded-lg border border-blue-400 bg-white px-4 outline-none"
            />

            <button
              onClick={handleSearch}
              className="h-12 rounded-lg bg-blue-600 px-4 text-white hover:cursor-pointer"
            >
              검색
            </button>
          </div>
        </div>

        {(authLoading || isLoading) && <p className="text-gray-500">로딩중...</p>}

        {isError && (<p className="text-red-500">목록을 불러오지 못했습니다.</p>)}

        {!isLoading && !isError && users.length === 0 && (<p className="text-gray-500">검색 결과가 없습니다.</p>)}

        {!isLoading && !isError && users.length > 0 && (
          <div className="grid grid-cols-2 gap-x-10 gap-y-10">
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
              className="mr-2 text-2xl text-gray-600 disabled:text-gray-300"
            >
              ‹
            </button>
            {pageNumbers.map((pageNumber, index) => (
              <div key={pageNumber} className="flex items-center gap-2">
                {index > 0 && pageNumber - pageNumbers[index - 1] > 1 && (
                  <span className="text-sm text-gray-400">...</span>
                )}
                <button
                  onClick={() => setPage(pageNumber)}
                  className={`h-9 w-9 rounded-full text-sm ${
                    page === pageNumber
                      ? "bg-blue-600 text-white"
                      : "text-gray-500"
                  }`}
                >
                  {pageNumber}
                </button>
              </div>
            ))}

            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPage))}
              disabled={page === totalPage}
              className="ml-2 text-2xl text-gray-600 disabled:text-gray-300"
            >
              ›
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
