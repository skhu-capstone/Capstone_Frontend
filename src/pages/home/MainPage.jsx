import CoffeeChatCard from "../../components/card/CoffeeChatCard";
import CollaboCard from "../../components/card/CollaboCard";
import FeedCard from "../../components/card/FeedCard";

export default function MainPage() {
  const coffeeChats = [
    {
      coffeeChatProfileId: 1,
      name: "윤현승",
      profileImage: "https://placehold.co/206x206",
      interestTopics: ["프론트엔드"],
      meetingType: "OFFLINE",
    },
    {
      coffeeChatProfileId: 2,
      name: "윤현승",
      profileImage: "https://placehold.co/206x206",
      interestTopics: ["프론트엔드"],
      meetingType: "OFFLINE",
    },
    {
      coffeeChatProfileId: 3,
      name: "윤현승",
      profileImage: "https://placehold.co/206x206",
      interestTopics: ["프론트엔드"],
      meetingType: "OFFLINE",
    },
  ];

  const collaborations = Array.from({ length: 6 }, (_, index) => ({
    collabId: index + 1,
    title: "제목입니당",
    writerName: "작성자",
    createdAt: "2026-04-21T14:00:00",
    content: "내용입니당 내용입니당 내용입니당 내용입니당 내용입니당 내용입니당 내용입니당 내용입니당 내용입니당",
    dDay: "D-DAY",
  }));

  const feeds = [
    {
      postId: 1,
      writer: {
        userName: "윤현승",
        profileImage: "https://placehold.co/48x48",
      },
      createdAt: "2026년 04월 10일",
      imageUrl: "https://placehold.co/600x250",
      content: "피드에서 본문 내용을 작성하면 여기에 띄우는 걸로 하려고 하는데 어떤가요? 괜찮은가요?? 이 정도면 좋다고 생각합니다...ㅎ 일단 최대 3줄 정도만 작성할 수 있도록 하려고 합니다 만약 다른 의견 있으시면 피드백 부탁드립니다",
    },
    {
      postId: 2,
      writer: {
        userName: "윤현승",
        profileImage: "https://placehold.co/48x48",
      },
      createdAt: "2026년 04월 10일",
      imageUrl: "https://placehold.co/600x250",
      content: "피드에서 본문 내용을 작성하면 여기에 띄우는 걸로 하려고 하는데 어떤가요? 괜찮은가요?? 이 정도면 좋다고 생각합니다...ㅎ 일단 최대 3줄 정도만 작성할 수 있도록 하려고 합니다 만약 다른 의견 있으시면 피드백 부탁드립니다",
    },
  ];

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
                name={coffeeChat.name}
                profileImage={coffeeChat.profileImage}
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
                title={collabo.title}
                writerName={collabo.writerName}
                createdAt={collabo.createdAt}
                content={collabo.content}
                dDay={collabo.dDay}
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
                writer={feed.writer}
                createdAt={feed.createdAt}
                imageUrl={feed.imageUrl}
                content={feed.content}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
