import { useState, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import MyPageCard from "../../components/card/MyPageCard";
import InputLabel from "../../components/card/InputLabel";
import EditInputLabel from "../../components/card/EditInputLabel";
import { getMyPage, updateNickname, updateCoffeeChatProfile, updateCoffeeChatVisibility, uploadProfileImage } from "../../services/myPageService";
import { useAuth } from "../../context/AuthContext";
import { getProfileImageUrl } from "../../utils/imageUtils";

const MAX_PROFILE_IMAGE_SIZE = 20 * 1024 * 1024;
const ALLOWED_PROFILE_IMAGE_TYPES = ["image/png", "image/jpeg"];

export default function MyPage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false); // 수정
  const [isVisible, setIsVisible] = useState(false); // 커피챗 공개 여부
  const { user: authUser, loading: authLoading, updateUserProfile } = useAuth();
  const queryClient = useQueryClient();
  const accessToken = localStorage.getItem("accessToken");
  const isAuthenticated = !!authUser && !!accessToken;
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const previewImage = useMemo(
    () => (selectedImageFile ? URL.createObjectURL(selectedImageFile) : ""),
    [selectedImageFile],
  );
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nicknameDraft, setNicknameDraft] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  const [pageNotice, setPageNotice] = useState(null);
  const [imageError, setImageError] = useState("");

  const [user, setUser] = useState({
    name: "",
    email: "",
    schoolEmail: "",
    clubName: "",
    image: getProfileImageUrl(authUser?.profileImageUrl ?? authUser?.profileImage),
  });

  const [profile, setProfile] = useState({
    studentId: "",
    interest: "",
    preferredMethod: "ONLINE",
    link: "",
    shortIntro: "",
    intro: "",
    image: getProfileImageUrl(authUser?.profileImageUrl ?? authUser?.profileImage),
  });

  const [tempProfile, setTempProfile] = useState(profile);

  // 마이페이지 조회 (AI 사용)
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["myPage"],
    queryFn: getMyPage,
    enabled: isAuthenticated,
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!data) return;

    const frame = window.requestAnimationFrame(() => {
      const coffeeChatProfile = data.coffeeChatProfile;

      setUser({
        name: data.name ?? "",
        email: data.email ?? "",
        schoolEmail: data.schoolEmail ?? "",
        clubName: data.clubs?.[0] ?? "",
        image: getProfileImageUrl({
          profileImageUrl: data.profileImageUrl ?? authUser?.profileImageUrl,
          profileImage: data.profileImage ?? authUser?.profileImage,
        }),
      });

      const newProfile = {
        studentId: coffeeChatProfile?.studentId ?? "",
        interest: coffeeChatProfile?.interestTopics ?? "",
        preferredMethod: coffeeChatProfile?.meetingType ?? "ONLINE",
        link: coffeeChatProfile?.contactLink ?? "",
        shortIntro: coffeeChatProfile?.headline ?? "",
        intro: coffeeChatProfile?.introduction ?? "",
        image: getProfileImageUrl({
          coffeeChatProfileImageUrl: coffeeChatProfile?.profileImageUrl,
          coffeeChatProfileImage: coffeeChatProfile?.profileImage,
          profileImageUrl: authUser?.profileImageUrl,
          profileImage: authUser?.profileImage,
        }),
      };

      setProfile(newProfile);
      setTempProfile(newProfile);
      setIsVisible(coffeeChatProfile?.isPublic ?? false);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [authUser?.profileImage, authUser?.profileImageUrl, data]);

  useEffect(() => {
    return () => {
      if (previewImage) URL.revokeObjectURL(previewImage);
    };
  }, [previewImage]);

  const updateNicknameMutation = useMutation({
    mutationFn: updateNickname,
    onSuccess: (result, submittedName) => {
      const name = result?.name ?? submittedName;
      setUser((prev) => ({ ...prev, name }));
      updateUserProfile({ name });
      queryClient.setQueryData(["myPage"], (prev) =>
        prev ? { ...prev, name } : prev
      );
      setIsEditingNickname(false);
      setNicknameError("");
      setPageNotice({ type: "success", text: "닉네임을 변경했습니다." });
    },
    onError: (error) => {
      setNicknameError(
        error.response?.data?.message ?? "닉네임 변경에 실패했습니다. 다시 시도해주세요."
      );
    },
  });

  const handleNicknameSave = (event) => {
    event.preventDefault();
    if (updateNicknameMutation.isPending) return;
    const name = nicknameDraft.trim();
    if (!name) {
      setNicknameError("닉네임을 입력해주세요.");
      return;
    }
    if (name === user.name) {
      setIsEditingNickname(false);
      setNicknameError("");
      return;
    }
    updateNicknameMutation.mutate(name);
  };

  // 커피챗 프로필 저장
    const updateProfileMutation = useMutation({
      mutationFn: updateCoffeeChatProfile,
      onSuccess: () => {
        setProfile(tempProfile);
        setIsEditing(false);
        queryClient.invalidateQueries({ queryKey: ["myPage"] });
        setPageNotice({ type: "success", text: "커피챗 프로필을 저장했습니다." });
      },

      onError: (error) => {
        console.error(error);
        setPageNotice({
          type: "error",
          text: error.response?.data?.message ?? "프로필 저장에 실패했습니다. 다시 시도해주세요.",
        });
      },
    });

  // 커피챗 프로필 공개여부 변경
  const updateVisibilityMutation = useMutation({
    mutationFn: updateCoffeeChatVisibility,
    onSuccess: (_, nextVisible) => {
      setPageNotice({
        type: "success",
        text: nextVisible ? "커피챗 프로필을 공개했습니다." : "커피챗 프로필을 비공개로 전환했습니다.",
      });
    },
    onError: (error) => {
      console.error(error);
      setIsVisible((prev) => !prev);
      setPageNotice({ type: "error", text: "공개 여부 변경에 실패했습니다. 다시 시도해주세요." });
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: uploadProfileImage,
    onSuccess: (imageUrl) => {
      const nextImageUrl = getProfileImageUrl(imageUrl);
      setProfile((prev) => ({ ...prev, image: nextImageUrl }));
      setTempProfile((prev) => ({ ...prev, image: nextImageUrl }));
      setSelectedImageFile(null);
      setImageError("");
      queryClient.invalidateQueries({ queryKey: ["myPage"] });
      setPageNotice({ type: "success", text: "커피챗 프로필 이미지를 변경했습니다." });
    },
    onError: (error) => {
      console.error(error);
      setImageError(error.response?.data?.message ?? "프로필 이미지 변경에 실패했습니다.");
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
    setPageNotice(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setIsEditing(false);
  };

  // 저장 버튼 클릭시 put 호출
  const handleSave = () => {
    if (updateProfileMutation.isPending) return;
    setPageNotice(null);
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
    if (updateVisibilityMutation.isPending) return;
    setPageNotice(null);
    const nextVisible = !isVisible;
    setIsVisible(nextVisible);
    updateVisibilityMutation.mutate(nextVisible);
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_PROFILE_IMAGE_TYPES.includes(file.type)) {
      setImageError("PNG 또는 JPG 이미지만 업로드할 수 있습니다.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_PROFILE_IMAGE_SIZE) {
      setImageError("이미지는 20MB 이하만 업로드할 수 있습니다.");
      event.target.value = "";
      return;
    }

    setImageError("");
    setPageNotice(null);
    setSelectedImageFile(file);
  };

  const handleImageUpload = () => {
    const userId = authUser?.userId ?? authUser?.id;

    if (!userId) {
      setImageError("사용자 정보를 찾을 수 없습니다.");
      return;
    }

    if (!selectedImageFile) {
      setImageError("변경할 이미지를 선택해주세요.");
      return;
    }

    uploadImageMutation.mutate({
      userId,
      file: selectedImageFile,
    });
  };

  const handleImageCancel = () => {
    setSelectedImageFile(null);
    setImageError("");
  };

  if (authLoading || isLoading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center bg-gray-50 px-4 py-12 dark:bg-theme-page">
        <div className="text-center" role="status" aria-live="polite">
          <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-3 border-blue-600/25 border-t-blue-600 dark:border-theme-primary/25 dark:border-t-theme-primary" />
          <p className="mt-4 text-sm font-medium text-gray-600 dark:text-theme-muted">마이페이지를 불러오는 중입니다...</p>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center bg-gray-50 px-4 py-12 dark:bg-theme-page">
        <div className="max-w-sm text-center" role="alert">
          <p className="font-semibold text-gray-900 dark:text-theme-text">마이페이지를 불러오지 못했습니다.</p>
          <button type="button" onClick={() => refetch()} className="mt-4 min-h-11 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-theme-primary dark:hover:bg-theme-primary-hover dark:focus-visible:outline-theme-focus">
            다시 시도
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gray-50 px-4 pt-6 pb-8 dark:bg-theme-page sm:px-6 sm:pt-10 sm:pb-12 lg:pt-14">
      <section className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-theme-text sm:mb-8 sm:text-4xl lg:text-5xl">My Page</h1>

        <MyPageCard
          compact
          name={user.name}
          email={user.email}
          schoolEmail={user.schoolEmail}
          clubName={user.clubName}
          image={profile.image}
        />

        {pageNotice && (
          <p role={pageNotice.type === "error" ? "alert" : "status"} aria-live="polite" className={`mt-5 rounded-xl px-4 py-3 text-sm leading-5 ${pageNotice.type === "error" ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-theme-danger" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"}`}>
            {pageNotice.text}
          </p>
        )}

        <section className="mt-8 sm:mt-10">
          <h2 className="border-b border-gray-300 pb-3 text-2xl font-bold text-gray-900 dark:border-theme-border-strong dark:text-theme-text sm:text-3xl">
            Profile Settings
          </h2>

          <div className="border-b border-gray-300 py-6 dark:border-theme-border-strong sm:py-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
              <div className="flex shrink-0 flex-col items-center gap-3">
                <img
                  src={previewImage || profile.image}
                  alt="커피챗 프로필"
                  className="h-24 w-24 rounded-full object-cover sm:h-28 sm:w-28"
                  referrerPolicy="no-referrer"
                />

                <label className="flex min-h-11 cursor-pointer items-center rounded-xl border border-blue-600 px-4 py-2 text-center text-sm font-semibold text-blue-600 hover:bg-blue-50 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-blue-600 dark:border-theme-focus dark:text-theme-link dark:hover:bg-theme-accent-hover dark:focus-within:outline-theme-focus">
                  커피챗 이미지 변경
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={handleImageChange}
                    disabled={uploadImageMutation.isPending}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-4">
                <form onSubmit={handleNicknameSave} className="flex flex-col gap-2">
                  <label htmlFor="nickname" className="text-xs font-medium text-gray-900 dark:text-theme-text">
                    닉네임
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                    {isEditingNickname ? (
                      <>
                        <input
                          id="nickname"
                          type="text"
                          value={nicknameDraft}
                          onChange={(event) => {
                            setNicknameDraft(event.target.value);
                            setNicknameError("");
                          }}
                          disabled={updateNicknameMutation.isPending}
                          aria-invalid={!!nicknameError}
                          aria-describedby={nicknameError ? "nickname-error" : undefined}
                          autoFocus
                          className="min-h-11 min-w-0 flex-1 rounded-lg bg-blue-900/10 px-3.5 py-2.5 text-base outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:bg-theme-accent dark:focus:ring-theme-focus"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingNickname(false);
                            setNicknameDraft(user.name);
                            setNicknameError("");
                          }}
                          disabled={updateNicknameMutation.isPending}
                          className="min-h-11 rounded-xl px-4 py-2 text-sm font-semibold text-gray-500 disabled:opacity-50 dark:text-theme-muted"
                        >
                          취소
                        </button>
                        <button
                          type="submit"
                          disabled={updateNicknameMutation.isPending}
                          className="min-h-11 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-theme-primary dark:hover:bg-theme-primary-hover"
                        >
                          {updateNicknameMutation.isPending ? "저장 중..." : "저장"}
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="min-w-0 flex-1 break-words text-base text-gray-900 dark:text-theme-text">{user.name || "미설정"}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setNicknameDraft(user.name);
                            setNicknameError("");
                            setIsEditingNickname(true);
                          }}
                          className="min-h-11 rounded-xl border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 dark:border-theme-focus dark:text-theme-link dark:hover:bg-theme-accent-hover"
                        >
                          닉네임 수정
                        </button>
                      </>
                    )}
                  </div>
                  {nicknameError && (
                    <p id="nickname-error" role="alert" className="text-sm text-red-600 dark:text-theme-danger">{nicknameError}</p>
                  )}
                </form>
                <InputLabel label="Email" value={user.email} />
                <InputLabel label="University Email" value={user.schoolEmail} />

                {selectedImageFile && (
                  <div className="flex flex-col gap-3 rounded-xl bg-blue-50 px-4 py-3 dark:bg-theme-accent sm:flex-row sm:items-center sm:justify-between">
                    <span className="min-w-0 break-all text-sm font-medium text-blue-900 dark:text-theme-link">
                      {selectedImageFile.name}
                    </span>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleImageCancel}
                        disabled={uploadImageMutation.isPending}
                        className="min-h-11 rounded-xl px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:text-theme-muted dark:hover:bg-theme-hover"
                      >
                        취소
                      </button>
                      <button
                        type="button"
                        onClick={handleImageUpload}
                        disabled={uploadImageMutation.isPending}
                        className="min-h-11 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-theme-primary dark:hover:bg-theme-primary-hover"
                      >
                        {uploadImageMutation.isPending ? "업로드 중..." : "저장"}
                      </button>
                    </div>
                  </div>
                )}
                {imageError && <p role="alert" className="text-sm text-red-600 dark:text-theme-danger">{imageError}</p>}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5 border-b border-gray-300 py-6 dark:border-theme-border-strong sm:flex-row sm:items-center sm:justify-between sm:py-8">
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-gray-900 dark:text-theme-text">Visibility</h3>

              <p className="mt-2 font-semibold text-gray-900 dark:text-theme-text">
                커피챗 프로필 공개
              </p>

              <p className="mt-1 text-sm text-gray-500 dark:text-theme-muted">
                {isVisible
                  ? "다른 사용자가 내 커피챗 프로필을 볼 수 있습니다."
                  : "현재 내 커피챗 프로필이 비공개 상태입니다."}
              </p>
            </div>

            <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
              <span
                className={`text-sm font-semibold ${
                  isVisible ? "text-blue-600 dark:text-theme-link" : "text-gray-500 dark:text-theme-muted"
                }`}
              >
                {isVisible ? "공개" : "비공개"}
              </span>

              <button
                type="button"
                onClick={handleToggleVisibility}
                disabled={updateVisibilityMutation.isPending}
                role="switch"
                aria-checked={isVisible}
                aria-label="커피챗 프로필 공개 여부"
                className={`relative h-8 w-16 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:outline-theme-focus ${
                  isVisible ? "bg-blue-600 dark:bg-theme-primary" : "bg-gray-300 dark:bg-theme-disabled-bg"
                }`}
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full bg-white dark:bg-theme-surface shadow-md dark:shadow-theme-shadow transition-all duration-300 ${
                    isVisible ? "left-9" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="mb-6 text-lg font-bold text-gray-900 dark:text-theme-text">
              Edit Profile
            </h3>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-x-4">
              {isEditing ? (
                <>
                  <EditInputLabel
                    label="학번"
                    value={tempProfile.studentId}
                    onChange={(e) => handleChange("studentId", e.target.value)}
                    disabled={updateProfileMutation.isPending}
                  />

                  <EditInputLabel
                    label="관심분야"
                    value={tempProfile.interest}
                    onChange={(e) => handleChange("interest", e.target.value)}
                    disabled={updateProfileMutation.isPending}
                  />

                  <EditInputLabel
                    label="선호 진행방식"
                    value={tempProfile.preferredMethod}
                    onChange={(e) =>
                      handleChange("preferredMethod", e.target.value)
                    }
                    disabled={updateProfileMutation.isPending}
                  />

                  <EditInputLabel
                    label="연락링크"
                    value={tempProfile.link}
                    onChange={(e) => handleChange("link", e.target.value)}
                    disabled={updateProfileMutation.isPending}
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
                  disabled={updateProfileMutation.isPending}
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
                  disabled={updateProfileMutation.isPending}
                />
              ) : (
                <InputLabel label="자기소개" value={profile.intro} multiline />
              )}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={updateProfileMutation.isPending}
                    className="min-h-12 rounded-xl bg-gray-400 px-5 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-theme-disabled-bg sm:min-w-24"
                  >
                    취소
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={updateProfileMutation.isPending}
                    className="min-h-12 rounded-xl bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-theme-primary dark:hover:bg-theme-primary-hover sm:min-w-24"
                  >
                    {updateProfileMutation.isPending ? "저장 중..." : "저장"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleEdit}
                  className="min-h-12 rounded-xl bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 dark:bg-theme-primary dark:hover:bg-theme-primary-hover sm:min-w-24"
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
