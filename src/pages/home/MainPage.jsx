import CoffeeChatCard from "../../components/card/CoffeeChatCard";
import CollaboCard from "../../components/card/CollaboCard";
import FeedCard from "../../components/card/FeedCard";
import { useQuery } from "@tanstack/react-query";
import { getMain } from "../../services/mainService";

export default function MainPage() {

  const { data } = useQuery({
    queryKey: ["main"],
    queryFn: getMain,
  });

  const coffeeChats = data?.recommendedCoffeeChats ?? [];
  const collaborations = data?.clubCollaborations ?? [];
  const feeds = data?.clubFeeds ?? [];

  console.log(data);

  return (
    <main className="min-h-screen bg-slate-50 px-14 pt-14 pb-7">
      <div className="mx-auto flex w-full max-w-332 flex-col gap-12">
        <section className="flex flex-col gap-6">
          <h1 className="text-4xl font-bold leading-10 text-gray-900">
            추천 커피챗
          </h1>

          <div className="grid grid-cols-3 gap-12">
            {coffeeChats.map((coffeeChat) => (
              <CoffeeChatCard
                key={coffeeChat.coffeeChatProfileId}
                id={coffeeChat.coffeeChatProfileId}
                name={coffeeChat.name}
                profileImage={coffeeChat.profileImage} // 프로필을 안 받아옴
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
            {collaborations.map((collabo) => (
              <CollaboCard
                key={collabo.collabId}
                id={collabo.collabId}
                title={collabo.title}
                author={collabo.clubName}
                content={collabo.content}
                dDay={collabo.ddayText}
              />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3.5">
          <h2 className="text-2xl font-bold leading-6 text-black">
            Club Feeds
          </h2>

          <div className="grid grid-cols-2 gap-10">
            {feeds.map((feed) => (
              <FeedCard
                key={feed.postId}
                writer={{
                  userName: feed.writerName,
                  profileImage: "",
                }}
                createdAt={feed.createdAt}
                imageUrl={feed.imageUrls?.[0]}
                content={feed.content}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
