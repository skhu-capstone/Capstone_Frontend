// 프로필 이미지 관련해서 api가 수정되면 다시 수정해야 함

import { useState, useEffect } from "react";
import { useMutation, useQuery} from "@tanstack/react-query";
import MyPageCard from "../../components/card/MyPageCard";
import InputLabel from "../../components/card/InputLabel";
import EditInputLabel from "../../components/card/EditInputLabel";
import { getMyPage, updateCoffeeChatProfile,updateCoffeeChatVisibility } from "../../services/myPageService";
import { useAuth } from "../../context/AuthContext";

export default function MyPage() {
  const [isEditing, setIsEditing] = useState(false); // 수정
  const [isVisible, setIsVisible] = useState(false); // 커피챗 공개 여부
  const { user: authUser } = useAuth();

  const [user, setUser] = useState({
    name: "",
    email: "",
    schoolEmail: "",
    clubName: "",
    image: authUser?.profileImage || "https://placehold.co/250x250",
  });

  const [profile, setProfile] = useState({
    studentId: "",
    interest: "",
    preferredMethod: "ONLINE",
    link: "",
    shortIntro: "",
    intro: "",
  });

  const [tempProfile, setTempProfile] = useState(profile);

  // 마이페이지 조회 (AI 사용)
  const { data, isLoading, isError} = useQuery({
    queryKey: ["myPage"],
    queryFn: getMyPage,
  })

  useEffect(() => {
    if (!data) return;

    const coffeeChatProfile = data.coffeeChatProfile;

    setUser({
      name: data.name ?? "",
      email: data.email ?? "",
      schoolEmail: data.schoolEmail ?? "",
      clubName: data.clubs?.[0] ?? "",
      image: authUser?.profileImage || "https://placehold.co/250x250",
    });

    const newProfile = {
      studentId: coffeeChatProfile?.studentId ?? "",
      interest: coffeeChatProfile?.interestTopics ?? "",
      preferredMethod: coffeeChatProfile?.meetingType ?? "ONLINE",
      link: coffeeChatProfile?.contactLink ?? "",
      shortIntro: coffeeChatProfile?.headline ?? "",
      intro: coffeeChatProfile?.introduction ?? "",
    };

    setProfile(newProfile);
    setTempProfile(newProfile);
    setIsVisible(coffeeChatProfile?.isPublic ?? false);
  }, [data]);

  // 커피챗 프로필 저장
    const updateProfileMutation = useMutation({
      mutationFn: updateCoffeeChatProfile,
      onSuccess: () => {
        setProfile(tempProfile);
        setIsEditing(false);
        alert("프로필이 저장되었습니다.");
      },

      onError: (error) => {
        console.error(error);
        alert("프로필 저장에 실패했습니다.");
      },
    });

  // 커피챗 프로필 공개여부 변경
  const updateVisibilityMutation = useMutation({
    mutationFn: updateCoffeeChatVisibility,
    onError: (error) => {
      console.error(error);
      setIsVisible((prev) => !prev);
      alert("공개 여부 변경에 실패했습니다.");
    },
  });

  const handleChange = (field, value) => {
    setTempProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEdit = () => {
    setTempProfile(profile);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setIsEditing(false);
  };

  // 저장 버튼 클릭시 put 호출
  const handleSave = () => {
    updateProfileMutation.mutate({
      studentId: tempProfile.studentId,
      headline: tempProfile.shortIntro,
      interestTopics: tempProfile.interest,
      meetingType: tempProfile.preferredMethod,
      contactLink: tempProfile.link,
      introduction: tempProfile.intro,
    });
  };

  // 토글 클릭시 patch 호출
  const handleToggleVisibility = () => {
    const nextVisible = !isVisible;
    setIsVisible(nextVisible);
    updateVisibilityMutation.mutate(nextVisible);
  };

  if (isLoading) {
    return <div className="p-10">마이페이지를 불러오는 중입니다...</div>;
  }

  if (isError) {
    return <div className="p-10">마이페이지를 불러오지 못했습니다.</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-8 py-20">
      <section className="mx-auto max-w-4xl">
        <h1 className="mb-10 text-5xl font-bold text-gray-900">My Page</h1>

        <MyPageCard
          name={user.name}
          email={user.email}
          schoolEmail={user.schoolEmail}
          clubName={user.clubName}
          image={user.image}
        />

        <section className="mt-10">
          <h2 className="border-b border-gray-300 pb-2 text-3xl font-bold text-gray-900">
            Profile Settings
          </h2>

          <div className="mt-8 border-b border-gray-300 pb-8">
            <div className="flex items-center gap-8">
              <img
                src={user.image}
                alt="프로필"
                className="h-20 w-20 rounded-full object-cover"
              />

              <div className="flex flex-1 flex-col gap-4">
                <InputLabel label="Email" value={user.email} />
                <InputLabel label="University Email" value={user.schoolEmail} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-gray-300 py-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Visibility</h3>

              <p className="mt-2 font-semibold text-gray-900">
                커피챗 프로필 공개
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {isVisible
                  ? "다른 사용자가 내 커피챗 프로필을 볼 수 있습니다."
                  : "현재 내 커피챗 프로필이 비공개 상태입니다."}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <span
                className={`text-sm font-semibold ${
                  isVisible ? "text-blue-600" : "text-gray-500"
                }`}
              >
                {isVisible ? "공개" : "비공개"}
              </span>

              <button
                type="button"
                onClick={handleToggleVisibility}
                className={`relative h-8 w-16 rounded-full transition-all duration-300 ${
                  isVisible ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-300 ${
                    isVisible ? "left-9" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="mb-6 text-lg font-bold text-gray-900">
              Edit Profile
            </h3>

            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
              {isEditing ? (
                <>
                  <EditInputLabel
                    label="학번"
                    value={tempProfile.studentId}
                    onChange={(e) => handleChange("studentId", e.target.value)}
                  />

                  <EditInputLabel
                    label="관심분야"
                    value={tempProfile.interest}
                    onChange={(e) => handleChange("interest", e.target.value)}
                  />

                  <EditInputLabel
                    label="선호 진행방식"
                    value={tempProfile.preferredMethod}
                    onChange={(e) =>
                      handleChange("preferredMethod", e.target.value)
                    }
                  />

                  <EditInputLabel
                    label="연락링크"
                    value={tempProfile.link}
                    onChange={(e) => handleChange("link", e.target.value)}
                  />
                </>
              ) : (
                <>
                  <InputLabel label="학번" value={profile.studentId} />
                  <InputLabel label="관심분야" value={profile.interest} />
                  <InputLabel
                    label="선호 진행방식"
                    value={profile.preferredMethod}
                  />
                  <InputLabel label="연락링크" value={profile.link} />
                </>
              )}
            </div>

            <div className="mt-5">
              {isEditing ? (
                <EditInputLabel
                  label="한 줄 자기소개"
                  value={tempProfile.shortIntro}
                  onChange={(e) => handleChange("shortIntro", e.target.value)}
                />
              ) : (
                <InputLabel label="한 줄 자기소개" value={profile.shortIntro} />
              )}
            </div>

            <div className="mt-5">
              {isEditing ? (
                <EditInputLabel
                  label="자기소개"
                  value={tempProfile.intro}
                  onChange={(e) => handleChange("intro", e.target.value)}
                  textarea
                />
              ) : (
                <InputLabel label="자기소개" value={profile.intro} multiline />
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="rounded-full bg-gray-400 px-5 py-2 font-semibold text-white"
                  >
                    취소
                  </button>

                  <button
                    onClick={handleSave}
                    className="rounded-full bg-blue-600 px-5 py-2 font-semibold text-white"
                  >
                    저장
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEdit}
                  className="rounded-full bg-blue-600 px-5 py-2 font-semibold text-white"
                >
                  수정
                </button>
              )}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}