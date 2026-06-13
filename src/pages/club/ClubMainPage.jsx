import { useState } from "react";
import FeedCard from "../../components/card/FeedCard";
import { useQuery } from "@tanstack/react-query";
import { getMyClubs, getClubMembers, getClubPosts } from "../../services/clubService";
import { useNavigate } from "react-router-dom";

export default function ClubMainPage() {
  const [activeTab, setActiveTab] = useState("feeds"); // 탭 상태
  const [currentFeedPage, setCurrentFeedPage] = useState(1); // 피드 페이지 번호
  const [currentMemberPage, setCurrentMemberPage] = useState(1); // 멤버 페이지 번호
  const navigate = useNavigate();

  const getImageUrl = (url) => {
    if (!url) return "https://placehold.co/600x250";
    if (url.startsWith("http")) return url;
    const fixedUrl = url.startsWith("/uploads")
      ? url
      : `/uploads${url}`;
    return `${import.meta.env.VITE_API_BASE_URL}${fixedUrl}`;
  };

  const {
    data: clubs = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["myClubs"],
    queryFn: getMyClubs,
  });

  // 동아리 존재 여부
  const hasClub = clubs.length > 0;

  // 첫 번째로 속한 동아리를 메인으로
  const selectedClub = clubs[0];

  const selectedClubId = selectedClub?.clubId;
  const loginUser = JSON.parse(localStorage.getItem("user"));

  console.log("selectedClub", selectedClub);
  console.log("selectedClubId", selectedClubId);

  const {
    data: members = [],
    isLoading: isMembersLoading,
    isError: isMembersError,
  } = useQuery({
    queryKey: ["clubMembers", selectedClubId],
    queryFn: () => getClubMembers(selectedClubId),
    enabled: !!selectedClubId,
  });

  const roleMap = {
    PRESIDENT: "대표",
    MANAGER: "운영진",
    MEMBER: "부원",
  };

  const myRole = members.find(
    (member) => member.userId === loginUser?.userId
  )?.role;

  const canCreatePost = myRole === "PRESIDENT" || myRole === "MANAGER";

  const {
    data: postsData,
    isLoading: isPostsLoading,
    isError: isPostsError,
  } = useQuery({
    queryKey: ["clubPosts", selectedClubId, currentFeedPage],
    queryFn: () =>
      getClubPosts({
        clubId: selectedClubId,
        page: currentFeedPage - 1,
        size: 4,
      }),
    enabled: !!selectedClubId,
  });

  const feeds = postsData?.content ?? [];

  console.log(feeds);

  const totalFeedPages = postsData?.totalPages ?? 0;

  if (isLoading) {
    return <p>동아리 정보를 불러오는 중입니다...</p>;
  }

  if (isError) {
    return <p>동아리 정보를 불러오지 못했습니다</p>;
  }

  if (!hasClub) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-12">
        <section className="flex flex-col items-center gap-10">
          <h1 className="text-center text-4xl font-bold text-black">
            소속된 동아리가 없습니다. 동아리에 참여하거나 만들어보세요!
          </h1>
          <div className="flex items-center gap-8">
            <button className="h-18 w-62.5 rounded-[20px] bg-zinc-400 text-2xl font-bold text-white">
              메인으로 돌아가기
            </button>
            <button className="h-18 w-62.5 rounded-[20px] bg-blue-600 text-2xl font-bold text-white">
              동아리 생성하기
            </button>
          </div>
        </section>
      </main>
    );
  }

  // 한 페이지의 최대 요소 개수
  const memberPerPage = 10;

  // 위에 있는 멤버 프리뷰
  const previewMembers = members.slice(0, 4);
  const hiddenMemberCount = members.length - previewMembers.length;

  // 전체 페이지 수 계산한 거
  const totalMemberPages = Math.ceil(members.length / memberPerPage);

  const currentMembers = members.slice(
    (currentMemberPage - 1) * memberPerPage,
    currentMemberPage * memberPerPage,
  );

  // 현재 탭 기준으로 페이지 정보 결정 (피드랑 멤버)
  const currentPage =
    activeTab === "feeds" ? currentFeedPage : currentMemberPage;
  const totalPages = activeTab === "feeds" ? totalFeedPages : totalMemberPages;

  const handlePrevPage = () => {
    if (activeTab === "feeds") {
      setCurrentFeedPage((prev) => Math.max(prev - 1, 1));
    } else {
      setCurrentMemberPage((prev) => Math.max(prev - 1, 1));
    }
  };

  const handleNextPage = () => {
    if (activeTab === "feeds") {
      setCurrentFeedPage((prev) => Math.min(prev + 1, totalFeedPages));
    } else {
      setCurrentMemberPage((prev) => Math.min(prev + 1, totalMemberPages));
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-12 py-12">
      <section className="mx-auto flex w-full max-w-330 flex-col">
        <header className="flex flex-col gap-7 border-b border-slate-300 pb-4">
          <div className="flex w-full items-center justify-between">
            <button className="flex w-fit items-center gap-1">
              <h1 className="text-4xl font-bold leading-10 text-gray-900">
                {selectedClub.clubName}
              </h1>
              <span className="text-gray-900">▾</span>
            </button>

            {canCreatePost && (
              <button
                onClick={() => navigate(`/clubs/${selectedClubId}/posts/create`)}
                className="w-35 rounded-xl bg-sky-700 px-5 py-3 font-medium text-white hover:bg-sky-800"
              >
                게시물 작성
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center">
              {previewMembers.map((member, index) => (
                <img
                  key={member.userId}
                  src={member.profileImage || "https://placehold.co/48x48"}
                  alt="멤버 프로필"
                  className={`h-8 w-8 rounded-full border-2 border-slate-50 object-cover ${
                    index !== 0 ? "-ml-2" : ""
                  }`}
                />
              ))}
            </div>

            <p className="text-base text-slate-900/60">
              {members[0]?.name}
              {members[1]?.name && `, ${members[1].name}`}{" "}
              {hiddenMemberCount > 0 && (
                <span>+{hiddenMemberCount} others</span>
              )}
            </p>
          </div>

          <nav className="flex">
            <button
              onClick={() => setActiveTab("feeds")}
              className={`px-7 py-3 text-base font-medium ${
                activeTab === "feeds"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-slate-900/60"
              }`}
            >
              Feeds
            </button>

            <button
              onClick={() => setActiveTab("members")}
              className={`px-7 py-3 text-base font-medium ${
                activeTab === "members"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-slate-900/60"
              }`}
            >
              Members
            </button>
          </nav>
        </header>

        {/* 조건부로 렌더링 -> 피드 or 멤버 */}
        {activeTab === "feeds" ? (
          <section className="grid grid-cols-2 gap-10 py-7">
            {isPostsLoading ? (
              <p>게시글을 불러오는 중입니다...</p>
            ) : isPostsError ? (
              <p>게시글을 불러오지 못했습니다.</p>
            ) : (
              feeds.map((feed) => (
                <FeedCard
                  key={feed.postId}
                  id={feed.postId}
                  author={feed.writerName}
                  date={feed.createdAt}
                  profileImage="https://placehold.co/48x48"
                  image={getImageUrl(feed.imageUrls?.[0])}
                  content={feed.content}
                />
              ))
            )}
          </section>
        ) : (
          <section className="py-7">
            {isMembersLoading ? (
              <p>멤버 정보를 불러오는 중입니다...</p>
            ) : isMembersError ? (
              <p>멤버 정보를 불러오지 못했습니다.</p>
            ) : (
              currentMembers.map((member) => (
                <div
                  key={member.userId}
                  className="flex h-14 items-center gap-3 border-b border-slate-300"
                >
                  <img
                    src={member.profileImage || "https://placehold.co/48x48"}
                    alt={`${member.name} 프로필`}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900">
                      {member.name}
                    </span>
                    <span className="text-sm text-slate-900/60">
                      {roleMap[member.role] ?? member.role}
                    </span>
                  </div>
                </div>
              ))
            )}
          </section>
        )}

        {/* 페이지 이동 섹션 */}
        <div className="flex justify-center pb-7">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="flex h-10 w-10 items-center justify-center rounded-2xl text-neutral-800 hover:bg-slate-200 disabled:cursor-not-allowed
              disabled:text-gray-300 disabled:hover:bg-transparent"
            >
              ‹
            </button>

            {Array.from({ length: totalPages }, (_, index) => {
              const page = index + 1;

              return (
                <button
                  key={page}
                  onClick={() =>
                    activeTab === "feeds"
                      ? setCurrentFeedPage(page)
                      : setCurrentMemberPage(page)
                  }
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl text-base font-medium 
                    ${currentPage === page ? "bg-sky-700 text-slate-50" : "text-gray-900/60 hover:bg-slate-200"}`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="flex h-10 w-10 items-center justify-center rounded-2xl text-neutral-800 hover:bg-slate-200 disabled:cursor-not-allowed
              disabled:text-gray-300 disabled:hover:bg-transparent"
            >
              ›
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
