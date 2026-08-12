import { useNavigate, useParams } from "react-router-dom";
import MyPageCard from "../../components/card/MyPageCard";
import InputLabel from "../../components/card/InputLabel";
import { useQuery } from "@tanstack/react-query";
import { getCoffeeChatProfile } from "../../services/coffeeChatProfileService";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export default function CoffeeChatProfilePage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const targetUserId = Number(userId);
  const isValidUserId = Number.isInteger(targetUserId) && targetUserId > 0;
  const { user: authUser, loading: authLoading } = useAuth();
  const accessToken = localStorage.getItem("accessToken");
  const isAuthenticated = !!authUser && !!accessToken;
  const currentUserId = Number(authUser?.userId ?? authUser?.id);
  const isMyProfile = isValidUserId && currentUserId === targetUserId;
  const [chatLoading, setChatLoading] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["coffeeChatProfile", targetUserId],
    queryFn: () => getCoffeeChatProfile(targetUserId),
    enabled: isAuthenticated && isValidUserId, // userId가 있을 때만 호출하기 (이상한 값 방지)
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleChatClick = async () => {
    if (chatLoading) return;

    if (!isValidUserId || isMyProfile) {
      navigate("/coffee-chat");
      return;
    }

    setChatLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${API_BASE}/api/chat/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ targetUserId }),
      });
      const result = await response.json();

      if (response.ok && result.success && result.data?.chatRoomId) {
        navigate("/coffee-chat", {
          state: {
            roomId: result.data.chatRoomId,
          },
        });
        return;
      }

      navigate("/coffee-chat");
    } catch (error) {
      console.error("[CoffeeChatProfilePage] 채팅방 생성 실패", error);
      navigate("/coffee-chat");
    } finally {
      setChatLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return <div className="p-10">프로필을 불러오는 중입니다...</div>;
  }

  if (!isValidUserId) {
    return <div className="p-10">잘못된 커피챗 프로필 주소입니다.</div>;
  }

  if (isError) {
    const status = error?.response?.status;
    const message =
      status === 401
        ? "로그인이 만료되었습니다. 다시 로그인해주세요."
        : status === 403
          ? "비공개 커피챗 프로필입니다."
          : status === 404
            ? "존재하지 않는 커피챗 프로필입니다."
            : "프로필을 불러오지 못했습니다.";

    return <div className="p-10">{message}</div>;
  }

  const coffeeChatProfile = data?.coffeeChatProfile;

  // user와 profile 부분은 AI 사용
  const user = {
    name: data?.name ?? "",
    clubName: Array.isArray(data?.clubs)
      ? data.clubs[0] ?? ""
      : data?.clubs ?? "",
    image:
      coffeeChatProfile?.profileImageUrl ??
      coffeeChatProfile?.profileImage ??
      data?.profileImageUrl ??
      data?.profileImage ??
      "https://placehold.co/250x250",
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

          {!isMyProfile && (
            <button
              type="button"
              onClick={handleChatClick}
              disabled={chatLoading}
              className="rounded-xl bg-blue-600 px-6 py-3 text-xl font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {chatLoading ? "채팅방 생성 중..." : "채팅 보내기"}
            </button>
          )}
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
