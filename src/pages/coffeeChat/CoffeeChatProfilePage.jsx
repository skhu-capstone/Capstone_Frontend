// DB에 userId를 확인하지 못해 정확한 페이지 확인 불가능
// 추후 백엔드와 소통해서 코드 수정할 예정

import { useNavigate, useParams } from "react-router-dom";
import MyPageCard from "../../components/card/MyPageCard";
import InputLabel from "../../components/card/InputLabel";
import { useQuery } from "@tanstack/react-query";
import { getCoffeeChatProfile } from "../../services/coffeeChatProfileService";

export default function CoffeeChatProfilePage() {
  const navigate = useNavigate();
  const { userId } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["coffeeChatProfile", userId],
    queryFn: () => getCoffeeChatProfile(userId),
  })

  // 추후 채팅 페이지 나오면 변겨할 예정
  const handleChatClick = () => {
    navigate("/");
  };

  if (isLoading) {
    return <div className="p-10">프로필을 불러오는 중입니다...</div>;
  }

  if (isError) {
    return <div className="p-10">프로필을 불러오지 못했습니다.</div>;
  }

  const coffeeChatProfile = data?.coffeeChatProfile;

  // user와 profile 부분은 AI 사용
  const user = {
    name: data?.name ?? "",
    clubName: data?.clubs?.[0] ?? "",
    image: "https://placehold.co/250x250",
  };

  const profile = {
    studentId: coffeeChatProfile?.studentId ?? "",
    interest: coffeeChatProfile?.interestTopics ?? "",
    preferredMethod: coffeeChatProfile?.meetingType ?? "",
    link: coffeeChatProfile?.contactLink ?? "",
    shortIntro: coffeeChatProfile?.headline ?? "",
    intro: coffeeChatProfile?.introduction ?? "",
  };

  return (
    <main className="min-h-screen bg-gray-50 px-8 py-20">
      <section className="mx-auto max-w-4xl">
        <div className="mb-12 flex items-center justify-between">
          <h1 className="text-5xl font-bold text-gray-900">
            {user.name} 님의 프로필
          </h1>

          <button
            type="button"
            onClick={handleChatClick}
            className="rounded-xl bg-blue-600 px-6 py-3 text-xl font-semibold text-white transition-colors hover:bg-blue-700"
          >
            채팅 보내기
          </button>
        </div>

        <MyPageCard
          name={user.name}
          clubName={user.clubName}
          image={user.image}
        />

        <section className="mt-10">
          <h2 className="border-b border-gray-300 pb-2 text-3xl font-bold text-gray-900">
            Profile Details
          </h2>

          <div className="mt-8">
            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
              <InputLabel label="학번" value={profile.studentId} />
              <InputLabel label="관심분야" value={profile.interest} />
              <InputLabel label="선호 진행방식" value={profile.preferredMethod} />
              <InputLabel label="연락링크" value={profile.link} />
            </div>

            <div className="mt-5">
              <InputLabel label="한 줄 자기소개" value={profile.shortIntro} />
            </div>

            <div className="mt-5">
              <InputLabel label="자기소개" value={profile.intro} multiline />
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}