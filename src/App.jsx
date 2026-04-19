import CollaboCard from "./components/common/CollaboCard";
import CoffeeChatCard from "./components/common/CoffeeChatCard";
import FeedCard from "./components/common/FeedCard";
import { elapsedText } from "./utils/elapsedText";

function App() {
  const collabo = {
    collabId: 1,
    title: "동아리 협업 모집",
    writerName: "윤현승",
    createdAt: "2026-04-17T02:00:00", // 확인하고 싶으면 여기서 수정
    content: "디자인 파트와 협업할 프론트엔드 팀원을 모집합니다.",
    dDay: "D-03",
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-blue-500">Tailwind 작동 확인!</h1>
      <CollaboCard
        id={collabo.collabId}
        title={collabo.title}
        author={collabo.writerName}
        time={elapsedText(collabo.createdAt)}
        content={collabo.content}
        dDay={collabo.dDay}
      />
      <CoffeeChatCard
        id={1}
        name="윤현승"
        interest="프론트엔드"
        meetingType="오프라인"
        image="https://placehold.co/206x206"
        onMoreClick={() => alert("잘 눌러지나 테스트")}
      />
      <FeedCard
        id={1}
        author="윤현승"
        date="2026년 04월 21일"
        image="https://placehold.co/600x250"
        content="대충 아무 내용 적기 대충 아무 내용 적기 대충 아무 내용 적기 대충 아무 내용 적기 
        대충 아무 내용 적기 대충 아무 내용 적기 대충 아무 내용 적기 대충 아무 내용 적기 대충 아무 내용 적기 
        대충 아무 내용 적기 대충 아무 내용 적기 대충 아무 내용 적기 대충 아무 내용 적기 대충 아무 내용 적기 
        대충 아무 내용 적기 대충 아무 내용 적기 대충 아무 내용 적기 대충 아무 내용 적기 대충 아무 내용 적기 "
        profileImage="https://placehold.co/100x100"
      />
    </>
  );
}
export default App;
