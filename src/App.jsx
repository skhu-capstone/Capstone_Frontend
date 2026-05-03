import { useState } from "react";

import CollaboCard from "./components/card/CollaboCard";
import CoffeeChatCard from "./components/card/CoffeeChatCard";
import FeedCard from "./components/card/FeedCard";
import { elapsedText } from "./utils/elapsedText";
import CoffeeChatListCard from "./components/card/CoffeeChatListCard";
import MyPageCard from "./components/card/MyPageCard";
import InputLabel from "./components/card/InputLabel";
import EditInputLabel from "./components/card/EditInputLabel";

function App() {
  const collabo = {
    collabId: 1,
    title: "동아리 협업 모집",
    writerName: "윤현승",
    createdAt: "2026-04-17T02:00:00", // 확인하고 싶으면 여기서 수정
    content: "디자인 파트와 협업할 프론트엔드 팀원을 모집합니다.",
    dDay: "D-03",
  }

  const coffeeChatList = [
    {
      coffeeChatProfileId: 1,
      name: "정다운",
      profileImage: "https://placehold.co/168x168",
      clubName: "동아리명",
      headline: "백엔드 개발과 협업에 관심 있습니다.",
      interestTopics: "Spring Boot",
    },
    {
      coffeeChatProfileId: 2,
      name: "김철수",
      profileImage: "https://placehold.co/168x168",
      clubName: null,
      headline: "프론트엔드 개발자입니다.",
      interestTopics: "React",
    },
  ];

  const user = {
    userId: 1,
    name: "정다운",
    email: "daun@gmail.com",
    schoolEmail: "daun@skhu.ac.kr",
    profileImage: "https://placehold.co/250x250",
    clubName: "멋쟁이사자처럼",
    role: "PRESIDENT",
  };

  const coffeeChatProfile = {
    studentId: "202114023",
    interestTopics: "Frontend, Design",
    meetingType: "대면, 비대면",
    contactLink: "https://github.com/example",
    headline: "여기는 한 줄 자기소개입니다",
    introduction: "여기는 한 줄 자기소개가 아니라 긴 자기소개입니다. 여러 줄로 작성되어 있으며 줄바꿈도 포함되어 있습니다. 이렇게 길어졌을 때 InputLabel이 어떻게 보이는지 확인하기 위한 테스트입니다.",
  };

  const [editProfile, setEditProfile] = useState({
    studentId: "202114023",
    interestTopics: "Frontend, Design",
    meetingType: "대면, 비대면",
    contactLink: "https://github.com/example",
    headline: "",
    introduction: "",
  });

  const handleEditChange = (field, value) => {
    setEditProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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
      {/* CoffeeChatListCard 테스트 */}
      <div className="mt-10 flex flex-col gap-4">
        {coffeeChatList.map((item) => (
          <CoffeeChatListCard
            key={item.coffeeChatProfileId}
            id={item.coffeeChatProfileId}
            name={item.name}
            headline={item.headline}
            interest={item.interestTopics}
            clubName={item.clubName}
            image={item.profileImage}
          />
        ))}
      </div>
      <div className="mt-10 flex flex-col gap-6">
        <MyPageCard
          name={user.name}
          email={user.email}
          schoolEmail={user.schoolEmail}
          clubName={user.clubName}
          role={user.role}
          image={user.profileImage}
        />

        <MyPageCard
          name={user.name}
          clubName={user.clubName}
          role={user.role}
          image={user.profileImage}
        />
      </div>

      {/* InputLabel 테스트 */}
      <div className="mt-10 w-full max-w-225">
      <div className="grid grid-cols-2 gap-x-4 gap-y-5">
        <InputLabel label="학번" value={coffeeChatProfile.studentId} />
        <InputLabel label="관심분야" value={coffeeChatProfile.interestTopics} />
        <InputLabel label="선호 진행방식" value={coffeeChatProfile.meetingType} />
        <InputLabel label="연락링크" value={coffeeChatProfile.contactLink} />
        {/* 한 줄 전체 */}
        <InputLabel
          label="한 줄 자기소개"
          value={coffeeChatProfile.headline}
          className="col-span-2"
        />
        <InputLabel
          label="자기소개"
          value={coffeeChatProfile.introduction}
          multiline
          className="col-span-2"
        />
      </div>
    </div>

    {/* EditInputLabel 테스트 */}
    <div className="mt-10 w-full max-w-225">
      <h2 className="mb-5 text-2xl font-bold">Edit Profile</h2>

      <div className="grid grid-cols-2 gap-x-4 gap-y-5">
        <EditInputLabel
          label="학번"
          value={editProfile.studentId}
          onChange={(e) => handleEditChange("studentId", e.target.value)}
        />

        <EditInputLabel
          label="관심분야"
          value={editProfile.interestTopics}
          onChange={(e) => handleEditChange("interestTopics", e.target.value)}
        />

        <EditInputLabel
          label="선호 진행방식"
          value={editProfile.meetingType}
          onChange={(e) => handleEditChange("meetingType", e.target.value)}
        />

        <EditInputLabel
          label="연락링크"
          value={editProfile.contactLink}
          onChange={(e) => handleEditChange("contactLink", e.target.value)}
        />

        <EditInputLabel
          label="한 줄 자기소개"
          value={editProfile.headline}
          placeholder="한 줄 자기소개를 입력해주세요"
          onChange={(e) => handleEditChange("headline", e.target.value)}
          className="col-span-2"
        />

        <EditInputLabel
          label="자기소개"
          value={editProfile.introduction}
          placeholder="자기소개를 입력해주세요"
          onChange={(e) => handleEditChange("introduction", e.target.value)}
          textarea
          className="col-span-2"
        />
      </div>
    </div>
    </>
  );
}
export default App;
