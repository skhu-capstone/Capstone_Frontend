import CoffeeChatCard from "../../components/card/CoffeeChatCard";
import CollaboCard from "../../components/card/CollaboCard";
import FeedCard from "../../components/card/FeedCard";
import { useQuery } from "@tanstack/react-query";
import { getMain } from "../../services/mainService";
import { useAuth } from "../../context/AuthContext";
import { useMemo } from "react";

const getRandomSortValue = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return String(Date.now());
};

const isOpenCollaboration = (collabo) => {
  const dDayText = String(
    collabo.ddayText ?? collabo.dDayText ?? collabo.dDay ?? collabo.dday ?? ""
  ).trim();

  if (dDayText.includes("마감")) return false;
  if (/D\s*\+\s*\d+/i.test(dDayText)) return false;

  const deadline = collabo.deadline ?? collabo.endDate ?? collabo.endAt;
  if (!deadline) return true;

  const deadlineDate = new Date(deadline);
  if (Number.isNaN(deadlineDate.getTime())) return true;

  deadlineDate.setHours(23, 59, 59, 999);
  return deadlineDate >= new Date();
};

const getFeedClubId = (feed) => {
  return [
    feed.clubId,
    feed.clubID,
    feed.club_id,
    feed.club?.clubId,
    feed.club?.clubID,
    feed.club?.club_id,
    feed.club?.id,
    feed.clubInfo?.clubId,
    feed.clubInfo?.id,
  ].find((id) => id !== undefined && id !== null && String(id).trim() !== "");
};

export default function MainPage() {
  const { user } = useAuth();
  const currentUserId = user?.userId ?? user?.id;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["main"],
    queryFn: getMain,
  });

  const collaborations = useMemo(() => {
    const clubCollaborations = data?.clubCollaborations ?? [];
    const projectRecruitments = data?.projectRecruitments ?? [];

    const openCollaborations = [
      ...clubCollaborations.map((collabo) => ({ ...collabo, type: "club" })),
      ...projectRecruitments.map((project) => ({
        ...project,
        type: "project",
      })),
    ].filter(isOpenCollaboration);

    return openCollaborations
      .map((collabo) => ({
        ...collabo,
        sortValue: getRandomSortValue(),
      }))
      .sort((a, b) => a.sortValue.localeCompare(b.sortValue));
  }, [data?.clubCollaborations, data?.projectRecruitments]);

  const coffeeChats = useMemo(
    () =>
      (data?.recommendedCoffeeChats ?? [])
        .filter((coffeeChat) => String(coffeeChat.userId) !== String(currentUserId))
        .slice(0, 3),
    [data?.recommendedCoffeeChats, currentUserId]
  );

  const visibleCollaborations = useMemo(
    () => collaborations.slice(0, 6),
    [collaborations]
  );

  const feeds = useMemo(
    () => (data?.clubFeeds ?? []).slice(0, 4),
    [data?.clubFeeds]
  );

  const getWriterProfileImage = (feed) => {
    return [
      feed.writerCoffeeChatProfileImageUrl,
      feed.writerGoogleProfileImageUrl,
      feed.writerProfileImageUrl,
      feed.writerProfileImage,
      feed.profileImageUrl,
      feed.profileImage,
      feed.writer?.coffeeChatProfileImageUrl,
      feed.writer?.googleProfileImageUrl,
      feed.writer?.profileImageUrl,
      feed.writer?.profileImage,
    ].find((url) => typeof url === "string" && url.trim().length > 0);
  };

  // 메인 협업 목록에는 동아리 협업 글과 프로젝트 모집 글이 섞여 들어올 수 있음
  const getCollaborationType = (collabo) => {
    if (collabo.type === "project" || collabo.type === "PROJECT") return "project";
    if (collabo.type === "club" || collabo.type === "CLUB") return "club";
    return collabo.projectRecruitmentId ? "project" : "club";
  };

  // 글 타입에 따라 사용하는 상세 조회 id가 다름
  const getCollaborationId = (collabo) => (
    collabo.projectRecruitmentId ?? collabo.collabId
  );

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-8 md:px-8 lg:px-14 lg:pt-14 lg:pb-7">
        <div className="mx-auto flex w-full max-w-332 flex-col gap-12">
          <div className="h-9 w-48 animate-pulse rounded-lg bg-slate-200 md:h-10 md:w-56" />
          <div className="flex gap-5 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:pb-0 lg:grid-cols-3 lg:gap-12">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-96 min-w-72 flex-1 animate-pulse rounded-2xl bg-white shadow-[0px_8px_24px_rgba(0,0,0,0.08)] md:h-125.75 md:min-w-0"
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="rounded-2xl bg-white px-8 py-7 text-center shadow-[0px_8px_24px_rgba(0,0,0,0.08)]">
          <h1 className="text-2xl font-bold text-gray-900">
            메인 정보를 불러오지 못했습니다.
          </h1>
          <p className="mt-3 text-base text-gray-500">
            잠시 후 다시 시도해주세요.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 md:px-8 lg:px-14 lg:pt-14 lg:pb-7">
      <div className="mx-auto flex w-full max-w-332 flex-col gap-10 lg:gap-12">
        <section className="flex flex-col gap-5 md:gap-6">
          <h1 className="text-3xl font-bold leading-9 text-gray-900 md:text-4xl md:leading-10">
            추천 커피챗
          </h1>

          {coffeeChats.length > 0 ? (
            <div className="flex gap-5 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:pb-0 lg:grid-cols-3 lg:gap-12">
              {coffeeChats.map((coffeeChat) => (
                <div key={coffeeChat.coffeeChatProfileId} className="min-w-72 flex-1 md:min-w-0">
                  <CoffeeChatCard
                    id={coffeeChat.userId}
                    name={coffeeChat.name}
                    profileImage={coffeeChat}
                    interestTopics={coffeeChat.interestTopics}
                    meetingType={coffeeChat.meetingType}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl bg-white px-6 py-8 text-center text-gray-500 shadow-[0px_4px_12px_rgba(0,0,0,0.06)]">
              추천 커피챗이 없습니다.
            </p>
          )}
        </section>

        <section className="flex flex-col gap-3.5">
          <h2 className="text-xl font-bold leading-6 text-black md:text-2xl">
            Find Collaboration
          </h2>

          {visibleCollaborations.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:pb-0 lg:grid-cols-3 lg:gap-x-12 lg:gap-y-6">
              {visibleCollaborations.map((collabo) => {
                // 각 카드가 /cooperation/club/:id 또는 /cooperation/project/:id로 이동하도록 타입/id를 계산
                const type = getCollaborationType(collabo);
                const id = getCollaborationId(collabo);

                return (
                  <div key={`${type}-${id}`} className="min-w-72 flex-1 md:min-w-0">
                    <CollaboCard
                      id={id}
                      type={type}
                      title={collabo.title}
                      author={collabo.clubName ?? collabo.writerName ?? "프로젝트 모집"}
                      content={collabo.content}
                      dDay={collabo.ddayText ?? collabo.dDayText ?? collabo.dDay ?? collabo.dday}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="rounded-2xl bg-white px-6 py-8 text-center text-gray-500 shadow-[0px_4px_12px_rgba(0,0,0,0.06)]">
              표시할 협업/모집 글이 없습니다.
            </p>
          )}
        </section>

        <section className="flex flex-col gap-3.5">
          <h2 className="text-xl font-bold leading-6 text-black md:text-2xl">
            Club Feeds
          </h2>

          {feeds.length > 0 ? (
            <div className="flex gap-5 overflow-x-auto pb-2 xl:grid xl:grid-cols-2 xl:gap-10 xl:overflow-visible xl:pb-0">
              {feeds.map((feed) => (
                <div key={feed.postId} className="min-w-80 flex-1 xl:min-w-0">
                  <FeedCard
                    id={feed.postId}
                    clubId={getFeedClubId(feed)}
                    author={feed.writerName}
                    date={feed.createdAt}
                    profileImage={getWriterProfileImage(feed)}
                    image={feed.imageUrls?.[0]}
                    content={feed.content}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl bg-white px-6 py-8 text-center text-gray-500 shadow-[0px_4px_12px_rgba(0,0,0,0.06)]">
              표시할 동아리 피드가 없습니다.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
