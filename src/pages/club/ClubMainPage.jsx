import { useState } from "react";
import FeedCard from "../../components/card/FeedCard";

export default function ClubMainPage() {
  const [activeTab, setActiveTab] = useState("feeds"); // 탭 상태
  const [currentFeedPage, setCurrentFeedPage] = useState(1); // 피드 페이지 번호
  const [currentMemberPage, setCurrentMemberPage] = useState(1); // 멤버 페이지 번호

  // 소속된 동아리 여부
  const hasClub = true;

  const members = [
    { id: 1, name: "윤현승", role: "대표", image: "https://placehold.co/48x48" },
    { id: 2, name: "윤현승", role: "운영진", image: "https://placehold.co/48x48" },
    { id: 3, name: "윤현승", role: "부원", image: "https://placehold.co/48x48" },
    { id: 4, name: "윤현승", role: "#Frontend", image: "https://placehold.co/48x48" },
    { id: 5, name: "윤현승", role: "#Frontend", image: "https://placehold.co/48x48" },
    { id: 6, name: "윤현승", role: "#Frontend", image: "https://placehold.co/48x48" },
    { id: 7, name: "윤현승", role: "#Frontend", image: "https://placehold.co/48x48" },
    { id: 8, name: "윤현승", role: "#Frontend", image: "https://placehold.co/48x48" },
    { id: 9, name: "윤현승", role: "#Frontend", image: "https://placehold.co/48x48" },
    { id: 10, name: "윤현승", role: "#Frontend", image: "https://placehold.co/48x48" },
    { id: 11, name: "윤현승", role: "#Frontend", image: "https://placehold.co/48x48" },
  ];

  const feeds = [
    {
      id: 1,
      writerName: "윤현승",
      createdAt: "2026년 04월 10일",
      profileImage: "https://placehold.co/48x48",
      feedImage: "https://placehold.co/600x250",
      content:
        "피드에서 본문 내용을 작성하면 여기에 띄우는 걸로 하려고 하는데 어떤가요? 괜찮은가요?? 이 정도면 좋다고 생각합니다...ㅎ 일단 최대 3줄 정도만 작성할 수 있도록 하려고 합니당 만약 다른 의견 있으시면 피드백 부탁드립니다",
    },
    {
      id: 2,
      writerName: "윤현승",
      createdAt: "2026년 04월 10일",
      profileImage: "https://placehold.co/48x48",
      feedImage: "https://placehold.co/600x250",
      content:
        "피드에서 본문 내용을 작성하면 여기에 띄우는 걸로 하려고 하는데 어떤가요? 괜찮은가요?? 이 정도면 좋다고 생각합니다...ㅎ 일단 최대 3줄 정도만 작성할 수 있도록 하려고 합니당 만약 다른 의견 있으시면 피드백 부탁드립니다",
    },
    {
      id: 3,
      writerName: "윤현승",
      createdAt: "2026년 04월 10일",
      profileImage: "https://placehold.co/48x48",
      feedImage: "https://placehold.co/600x250",
      content:
        "피드에서 본문 내용을 작성하면 여기에 띄우는 걸로 하려고 하는데 어떤가요? 괜찮은가요?? 이 정도면 좋다고 생각합니다...ㅎ 일단 최대 3줄 정도만 작성할 수 있도록 하려고 합니당 만약 다른 의견 있으시면 피드백 부탁드립니다",
    },
    {
      id: 4,
      writerName: "윤현승",
      createdAt: "2026년 04월 10일",
      profileImage: "https://placehold.co/48x48",
      feedImage: "https://placehold.co/600x250",
      content:
        "피드에서 본문 내용을 작성하면 여기에 띄우는 걸로 하려고 하는데 어떤가요? 괜찮은가요?? 이 정도면 좋다고 생각합니다...ㅎ 일단 최대 3줄 정도만 작성할 수 있도록 하려고 합니당 만약 다른 의견 있으시면 피드백 부탁드립니다",
    },
    {
      id: 5,
      writerName: "윤현승",
      createdAt: "2026년 04월 10일",
      profileImage: "https://placehold.co/48x48",
      feedImage: "https://placehold.co/600x250",
      content:
        "피드에서 본문 내용을 작성하면 여기에 띄우는 걸로 하려고 하는데 어떤가요? 괜찮은가요?? 이 정도면 좋다고 생각합니다...ㅎ 일단 최대 3줄 정도만 작성할 수 있도록 하려고 합니당 만약 다른 의견 있으시면 피드백 부탁드립니다",
    },
  ];

  // 소속된 동아리 없으면 나오는 페이지
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
  const feedPerPage = 4;
  const memberPerPage = 10;

  // 위에 있는 멤버 프리뷰
  const previewMembers = members.slice(0, 4);
  const hiddenMemberCount = members.length - previewMembers.length;

  // 전체 페이지 수 계산한 거
  const totalFeedPages = Math.ceil(feeds.length / feedPerPage);
  const totalMemberPages = Math.ceil(members.length / memberPerPage);

  // 현재 페이지 데이터만 잘라내기
  const currentFeeds = feeds.slice(
    (currentFeedPage - 1) * feedPerPage,
    currentFeedPage * feedPerPage
  );

  const currentMembers = members.slice(
    (currentMemberPage - 1) * memberPerPage,
    currentMemberPage * memberPerPage
  );

  // 현재 탭 기준으로 페이지 정보 결정 (피드랑 멤버)
  const currentPage = activeTab === "feeds" ? currentFeedPage : currentMemberPage;
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
          <button className="flex w-fit items-center gap-1">
            <h1 className="text-4xl font-bold leading-10 text-gray-900">
              멋쟁이사자처럼
            </h1>
            <span className="text-gray-900">▾</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex items-center">
              {previewMembers.map((member, index) => (
                <img
                  key={member.id}
                  src={member.image}
                  alt="멤버 프로필"
                  className={`h-8 w-8 rounded-full border-2 border-slate-50 object-cover ${
                    index !== 0 ? "-ml-2" : ""
                  }`}
                />
              ))}
            </div>

            <p className="text-base text-slate-900/60">
              윤현승, 최진원{" "}
              {hiddenMemberCount > 0 && <span>+{hiddenMemberCount} others</span>}
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
            {currentFeeds.map((feed) => (
              <FeedCard
                key={feed.id}
                writerName={feed.writerName}
                createdAt={feed.createdAt}
                profileImage={feed.profileImage}
                feedImage={feed.feedImage}
                content={feed.content}
              />
            ))}
          </section>
        ) : (
          <section className="py-7">
            {currentMembers.map((member) => (
              <div
                key={member.id}
                className="flex h-14 items-center gap-3 border-b border-slate-300"
              >
                <img
                  src={member.image}
                  alt={`${member.name} 프로필`}
                  className="h-10 w-10 rounded-full object-cover"
                />

                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">
                    {member.name}
                  </span>
                  <span className="text-sm text-slate-900/60">
                    {member.role}
                  </span>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* 페이지네이션 섹션 */}
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
                    activeTab === "feeds" ? setCurrentFeedPage(page) : setCurrentMemberPage(page)
                  }
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl text-base font-medium 
                    ${currentPage === page ? "bg-sky-700 text-slate-50" : "text-gray-900/60 hover:bg-slate-200"}`
                  }
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