import CoffeeChatCard from "../../components/card/CoffeeChatCard";
import CollaboCard from "../../components/card/CollaboCard";
import FeedCard from "../../components/card/FeedCard";
import { useQuery } from "@tanstack/react-query";
import { getMain } from "../../services/mainService";
import { useMemo } from "react";

export default function MainPage() {

  const { data } = useQuery({
    queryKey: ["main"],
    queryFn: getMain,
  });

  const coffeeChats = data?.recommendedCoffeeChats ?? [];
  const collaborations = data?.clubCollaborations ?? [];
  const feeds = data?.clubFeeds ?? [];

  const randomCoffeeChats = useMemo(() => {
    return [...coffeeChats]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
  }, [coffeeChats]);

  const randomCollaborations = useMemo(() => {
    return [...collaborations]
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);
  }, [collaborations]);

  const randomFeeds = useMemo(() => {
    return [...feeds]
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
  }, [feeds]);
  console.log(randomCoffeeChats);

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

  return (
    <main className="min-h-screen bg-slate-50 px-14 pt-14 pb-7">
      <div className="mx-auto flex w-full max-w-332 flex-col gap-12">
        <section className="flex flex-col gap-6">
          <h1 className="text-4xl font-bold leading-10 text-gray-900">
            추천 커피챗
          </h1>

          <div className="grid grid-cols-3 gap-12">
            {randomCoffeeChats.map((coffeeChat) => (
              <CoffeeChatCard
                key={coffeeChat.coffeeChatProfileId}
                id={coffeeChat.userId}
                name={coffeeChat.name}
                profileImage={coffeeChat}
                interestTopics={coffeeChat.interestTopics}
                meetingType={coffeeChat.meetingType}
              />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3.5">
          <h2 className="text-2xl font-bold leading-6 text-black">
            Find Collaboration
          </h2>

          <div className="grid grid-cols-3 gap-x-12 gap-y-6">
            {randomCollaborations.map((collabo) => {
              // 각 카드가 /cooperation/club/:id 또는 /cooperation/project/:id로 이동하도록 타입/id를 계산
              const type = getCollaborationType(collabo);
              const id = getCollaborationId(collabo);

              return (
                <CollaboCard
                  key={`${type}-${id}`}
                  id={id}
                  type={type}
                  title={collabo.title}
                  author={collabo.clubName ?? collabo.writerName}
                  content={collabo.content}
                  dDay={collabo.ddayText ?? collabo.dDayText ?? collabo.dDay}
                />
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-3.5">
          <h2 className="text-2xl font-bold leading-6 text-black">
            Club Feeds
          </h2>

          <div className="grid grid-cols-2 gap-10">
            {randomFeeds.map((feed) => (
              <FeedCard
                key={feed.postId}
                id={feed.postId}
                author={feed.writerName}
                date={feed.createdAt}
                profileImage={getWriterProfileImage(feed)}
                image={feed.imageUrls?.[0]}
                content={feed.content}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
