import { useEffect, useRef, useState } from "react";
import FeedCard from "../../components/card/FeedCard";
import ClubCalendar from "../../components/card/ClubCalendar";
import SafeImage from "../../components/common/SafeImage";
import { useQuery } from "@tanstack/react-query";
import { getMyClubs, getClubMembers, getClubPosts } from "../../services/clubService";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  DEFAULT_FEED_IMAGE,
  getContentImageUrl,
  getProfileImageUrl,
} from "../../utils/imageUtils";
import { useAuth } from "../../context/AuthContext";

const VALID_TABS = ["feeds", "members", "calendar"];

export default function ClubMainPage() {
  const [currentFeedPage, setCurrentFeedPage] = useState(1); // 피드 페이지 번호
  const [currentMemberPage, setCurrentMemberPage] = useState(1); // 멤버 페이지 번호
  const [isClubMenuOpen, setIsClubMenuOpen] = useState(false);
  const clubMenuRef = useRef(null);
  const navigate = useNavigate();
  const { clubId } = useParams();
  const { user: authUser, loading: authLoading } = useAuth();
  const accessToken = localStorage.getItem("accessToken");
  const isAuthenticated = !!authUser && !!accessToken;
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab = VALID_TABS.includes(tabParam) ? tabParam : "feeds";

  const getImageUrl = (url) => {
    return getContentImageUrl(url, DEFAULT_FEED_IMAGE);
  };

  const getMemberProfileImage = (member) => {
    return getProfileImageUrl(
      {
        coffeeChatProfileImageUrl: member.coffeeChatProfileImageUrl,
        profileImage: member.profileImage,
      },
      ""
    );
  };

  const getWriterProfileImage = (feed) => {
    return getProfileImageUrl(
      {
        coffeeChatProfileImageUrl:
          feed.writerCoffeeChatProfileImageUrl ??
          feed.writer?.coffeeChatProfileImageUrl,
        googleProfileImageUrl:
          feed.writerGoogleProfileImageUrl ?? feed.writer?.googleProfileImageUrl,
        profileImageUrl:
          feed.writerProfileImageUrl ??
          feed.profileImageUrl ??
          feed.writer?.profileImageUrl,
        profileImage:
          feed.writerProfileImage ?? feed.profileImage ?? feed.writer?.profileImage,
      },
      ""
    );
  };

  const getMemberInitial = (name = "") => name.trim().slice(0, 1) || "?";

  const getFeedWriterId = (feed) =>
    [
      feed.writerId,
      feed.writerUserId,
      feed.userId,
      feed.writer?.userId,
      feed.writer?.id,
    ].find((id) => id !== undefined && id !== null && String(id).trim() !== "");

  const {
    data: clubs = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["myClubs"],
    queryFn: getMyClubs,
    enabled: isAuthenticated,
  });

  const hasClub = clubs.length > 0;
  const routeClubId = Number(clubId);
  const hasRouteClubId = Number.isInteger(routeClubId) && routeClubId > 0;

  const selectedClub = hasRouteClubId
    ? clubs.find((club) => Number(club.clubId) === routeClubId)
    : clubs[0];

  const selectedClubId = selectedClub?.clubId;
  const loginUser = authUser ?? parseStoredUser();

  useEffect(() => {
    if (isLoading || !hasClub) return;

    if (!hasRouteClubId) {
      navigate(`/club/main/${clubs[0].clubId}?tab=${activeTab}`, { replace: true });
      return;
    }

  }, [activeTab, clubs, hasClub, hasRouteClubId, isLoading, navigate]);

  useEffect(() => {
    if (tabParam && !VALID_TABS.includes(tabParam)) {
      setSearchParams({ tab: "feeds" }, { replace: true });
    }
  }, [setSearchParams, tabParam]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (clubMenuRef.current && !clubMenuRef.current.contains(event.target)) {
        setIsClubMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const {
    data: members = [],
    isLoading: isMembersLoading,
    isError: isMembersError,
  } = useQuery({
    queryKey: ["clubMembers", selectedClubId],
    queryFn: () => getClubMembers(selectedClubId),
    enabled: isAuthenticated && !!selectedClubId,
  });

  const roleMap = {
    PRESIDENT: "대표",
    STAFF: "운영진",
    MEMBER: "부원",
  };

  const loginUserId = Number(loginUser?.userId ?? loginUser?.id);
  const myRole = members
    .find((member) => Number(member.userId ?? member.id) === loginUserId)
    ?.role?.trim()
    .toUpperCase();

  const isRoleResolved = !isMembersLoading && !isMembersError;
  const isPresident = isRoleResolved && myRole === "PRESIDENT";
  const canManageClub = isRoleResolved && ["PRESIDENT", "STAFF"].includes(myRole);

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
    enabled: isAuthenticated && !!selectedClubId,
  });

  const feeds = Array.isArray(postsData)
    ? postsData
    : Array.isArray(postsData?.content)
      ? postsData.content
      : postsData
        ? [postsData]
        : [];

  const membersById = Object.fromEntries(
    members
      .map((member) => [member.userId ?? member.id, member])
      .filter(([id]) => id !== undefined && id !== null)
      .map(([id, member]) => [String(id), member])
  );
  const membersByName = Object.fromEntries(
    members.map((member) => [member.name, member])
  );

  const totalFeedPages = postsData?.totalPages ?? 0;
  const clubListErrorStatus = error?.response?.status;
  const isAuthError =
    clubListErrorStatus === 401 || clubListErrorStatus === 403;

  if (authLoading || isLoading) {
    return <p>동아리 정보를 불러오는 중입니다...</p>;
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-12">
        <section className="flex max-w-xl flex-col items-center gap-8 rounded-2xl bg-white px-12 py-14 text-center shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)]">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              로그인이 필요합니다.
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-900/60">
              내 동아리 정보를 확인하려면 먼저 로그인해주세요.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="h-12 rounded-xl bg-sky-700 px-5 text-sm font-semibold text-white hover:bg-sky-800"
          >
            로그인하기
          </button>
        </section>
      </main>
    );
  }

  if (isError) {
    if (isAuthError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-12">
          <section className="flex max-w-xl flex-col items-center gap-8 rounded-2xl bg-white px-12 py-14 text-center shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)]">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                로그인이 만료되었습니다.
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-900/60">
                다시 로그인한 뒤 내 동아리 정보를 확인해주세요.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="h-12 rounded-xl bg-sky-700 px-5 text-sm font-semibold text-white hover:bg-sky-800"
            >
              로그인하기
            </button>
          </section>
        </main>
      );
    }

    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-12">
        <section className="flex max-w-xl flex-col items-center gap-6 rounded-2xl bg-white px-12 py-14 text-center shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)]">
          <h1 className="text-3xl font-bold text-gray-900">
            동아리 정보를 불러오지 못했습니다.
          </h1>
          <p className="text-base leading-7 text-slate-900/60">
            잠시 후 다시 시도해주세요.
          </p>
        </section>
      </main>
    );
  }

  if (!hasClub) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-12">
        <section className="flex flex-col items-center gap-10">
          <h1 className="text-center text-4xl font-bold text-black">
            소속된 동아리가 없습니다. 동아리에 참여하거나 만들어보세요!
          </h1>
          <div className="flex items-center gap-8">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="h-18 w-62.5 rounded-[20px] bg-zinc-400 text-2xl font-bold text-white"
            >
              메인으로 돌아가기
            </button>
            <button
              type="button"
              onClick={() => navigate("/club/create")}
              className="h-18 w-62.5 rounded-[20px] bg-blue-600 text-2xl font-bold text-white"
            >
              동아리 생성하기
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (!selectedClub) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-12">
        <section className="flex max-w-xl flex-col items-center gap-8 rounded-2xl bg-white px-12 py-14 text-center shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)]">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              접근할 수 없는 동아리입니다.
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-900/60">
              존재하지 않는 동아리이거나, 현재 계정으로 가입되어 있지 않은
              동아리입니다.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/club/main/${clubs[0].clubId}`, { replace: true })}
              className="h-12 rounded-xl bg-sky-700 px-5 text-sm font-semibold text-white hover:bg-sky-800"
            >
              내 동아리로 이동
            </button>
            <button
              type="button"
              onClick={() => navigate("/club/apply")}
              className="h-12 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              동아리 신청하기
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
  const safeTotalMemberPages = Math.max(totalMemberPages, 1);
  const safeCurrentMemberPage = Math.min(
    Math.max(currentMemberPage, 1),
    safeTotalMemberPages
  );

  const currentMembers = members.slice(
    (safeCurrentMemberPage - 1) * memberPerPage,
    safeCurrentMemberPage * memberPerPage,
  );

  // 현재 탭 기준으로 페이지 정보 결정 (피드랑 멤버)
  const safeTotalFeedPages = Math.max(totalFeedPages, 1);
  const safeCurrentFeedPage = Math.min(
    Math.max(currentFeedPage, 1),
    safeTotalFeedPages
  );
  const currentPage =
    activeTab === "feeds" ? safeCurrentFeedPage : safeCurrentMemberPage;
  const totalPages =
    activeTab === "feeds" ? safeTotalFeedPages : safeTotalMemberPages;

  const handlePrevPage = () => {
    if (activeTab === "feeds") {
      setCurrentFeedPage((prev) => Math.max(prev - 1, 1));
    } else {
      setCurrentMemberPage((prev) => Math.max(prev - 1, 1));
    }
  };

  const handleNextPage = () => {
    if (activeTab === "feeds") {
      setCurrentFeedPage((prev) => Math.min(prev + 1, safeTotalFeedPages));
    } else {
      setCurrentMemberPage((prev) => Math.min(prev + 1, safeTotalMemberPages));
    }
  };

  const handleSelectClub = (nextClubId) => {
    setIsClubMenuOpen(false);
    setCurrentFeedPage(1);
    setCurrentMemberPage(1);
    navigate(`/club/main/${nextClubId}?tab=${activeTab}`);
  };

  const handlePresidentManageClick = () => {
    if (!isPresident) {
      alert("대표만 접근할 수 있습니다.");
      return;
    }

    navigate(`/club/president/${selectedClubId}`);
  };

  const handlePostCreateClick = () => {
    if (!canManageClub) {
      alert("대표 또는 운영진만 게시물을 작성할 수 있습니다.");
      return;
    }

    navigate(`/clubs/${selectedClubId}/posts/create`);
  };

  const handleTabChange = (nextTab) => {
    setSearchParams({ tab: nextTab });
  };

  return (
    <main className="min-h-screen bg-slate-50 px-12 py-12">
      <section className="mx-auto flex w-full max-w-330 flex-col">
        <header className="flex flex-col gap-7 border-b border-slate-300 pb-4">
          <div className="flex w-full items-center justify-between">
            <div className="relative" ref={clubMenuRef}>
              <button
                type="button"
                onClick={() => setIsClubMenuOpen((prev) => !prev)}
                className="flex w-fit items-center gap-1 rounded-xl py-1 pr-2 hover:bg-slate-100"
                aria-expanded={isClubMenuOpen}
                aria-haspopup="menu"
              >
                <h1 className="text-4xl font-bold leading-10 text-gray-900">
                  {selectedClub.clubName}
                </h1>
                <span
                  className={`text-gray-900 transition-transform ${isClubMenuOpen ? "rotate-180" : ""}`}
                >
                  ▾
                </span>
              </button>

              {isClubMenuOpen && (
                <div
                  className="absolute left-0 top-full z-40 mt-3 max-h-80 w-72 overflow-y-auto rounded-xl border border-slate-200 bg-white py-2 shadow-lg"
                  role="menu"
                >
                  {clubs.map((club) => {
                    const isSelected = Number(club.clubId) === Number(selectedClubId);

                    return (
                      <button
                        key={club.clubId}
                        type="button"
                        role="menuitem"
                        onClick={() => handleSelectClub(club.clubId)}
                        className={`flex w-full flex-col px-4 py-3 text-left hover:bg-slate-50 ${
                          isSelected ? "bg-sky-50" : ""
                        }`}
                      >
                        <span
                          className={`text-sm font-bold ${
                            isSelected ? "text-sky-700" : "text-gray-900"
                          }`}
                        >
                          {club.clubName}
                        </span>
                        {club.category && (
                          <span className="mt-1 text-xs text-slate-900/50">
                            {club.category}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {isPresident && (
                <button
                  onClick={handlePresidentManageClick}
                  className="h-12 rounded-xl border border-sky-700/30 bg-white px-5 text-sm font-semibold text-sky-700 hover:border-sky-700 hover:bg-sky-50"
                >
                  대표 관리
                </button>
              )}

              {canManageClub && (
                <button
                  onClick={handlePostCreateClick}
                  className="h-12 rounded-xl bg-sky-700 px-5 text-sm font-semibold text-white hover:bg-sky-800"
                >
                  게시물 작성
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center">
              {previewMembers.map((member, index) => {
                const profileImage = getMemberProfileImage(member);

                return (
                  <SafeImage
                    key={member.userId}
                    src={profileImage}
                    alt="멤버 프로필"
                    className={`h-8 w-8 rounded-full border-2 border-slate-50 object-cover ${
                      index !== 0 ? "-ml-2" : ""
                    }`}
                    referrerPolicy="no-referrer"
                    fallback={
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-50 bg-slate-300 text-xs font-bold text-slate-600 ${
                          index !== 0 ? "-ml-2" : ""
                        }`}
                      >
                        {getMemberInitial(member.name)}
                      </div>
                    }
                  />
                );
              })}
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
              onClick={() => handleTabChange("feeds")}
              className={`px-7 py-3 text-base font-medium ${
                activeTab === "feeds"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-slate-900/60"
              }`}
            >
              Feeds
            </button>

            <button
              onClick={() => handleTabChange("members")}
              className={`px-7 py-3 text-base font-medium ${
                activeTab === "members"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-slate-900/60"
              }`}
            >
              Members
            </button>

            <button
              onClick={() => handleTabChange("calendar")}
              className={`px-7 py-3 text-base font-medium ${
                activeTab === "calendar"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-slate-900/60"
              }`}
            >
              Calendar
            </button>
          </nav>
        </header>

        {/* 조건부로 렌더링 -> 피드 or 멤버 or 캘린더 */}
        {activeTab === "feeds" ? (
          <section className="grid grid-cols-2 gap-10 py-7">
            {isPostsLoading ? (
              <p>게시글을 불러오는 중입니다...</p>
            ) : isPostsError ? (
              <p>게시글을 불러오지 못했습니다.</p>
            ) : feeds.length === 0 ? (
              <div className="col-span-2 flex min-h-80 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-base font-medium text-slate-900/50">
                아직 작성된 게시글이 없습니다.
              </div>
            ) : (
              feeds.map((feed) => {
                const writerId = getFeedWriterId(feed);
                const matchedMember =
                  writerId !== undefined && writerId !== null
                    ? membersById[String(writerId)]
                    : membersByName[feed.writerName];

                return (
                  <FeedCard
                    key={feed.postId}
                    id={feed.postId}
                    clubId={selectedClubId}
                    author={feed.writerName}
                    date={feed.createdAt}
                    profileImage={
                      getWriterProfileImage(feed) ??
                      getMemberProfileImage(matchedMember ?? {})
                    }
                    image={getImageUrl(feed.imageUrls?.[0])}
                    content={feed.content}
                  />
                );
              })
            )}
          </section>
        ) : activeTab === "members" ? (
          <section className="py-7">
            {isMembersLoading ? (
              <p>멤버 정보를 불러오는 중입니다...</p>
            ) : isMembersError ? (
              <p>멤버 정보를 불러오지 못했습니다.</p>
            ) : members.length === 0 ? (
              <div className="flex min-h-80 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-base font-medium text-slate-900/50">
                아직 표시할 멤버가 없습니다.
              </div>
            ) : (
              currentMembers.map((member) => {
                const profileImage = getMemberProfileImage(member);

                return (
                  <div
                    key={member.userId}
                    className="flex h-14 items-center gap-3 border-b border-slate-300"
                  >
                    <SafeImage
                      src={profileImage}
                      alt={`${member.name} 프로필`}
                      className="h-10 w-10 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                      fallback={
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-300 text-sm font-bold text-slate-600">
                          {getMemberInitial(member.name)}
                        </div>
                      }
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
                );
              })
            )}
          </section>
        ) : (
          <ClubCalendar clubId={selectedClubId} canManage={canManageClub} />
        )}

        {/* 페이지 이동 섹션 */}
        {activeTab !== "calendar" && totalPages > 1 && (
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
        )}
      </section>
    </main>
  );
}

const parseStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};
