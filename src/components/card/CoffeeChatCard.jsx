import { useNavigate } from "react-router-dom";

const DEFAULT_PROFILE_IMAGE = "https://placehold.co/206x206";

const getProfileImageUrl = (image) => {
  if (!image) return DEFAULT_PROFILE_IMAGE;
  if (typeof image === "string") return image;

  return [
    image.profileImageUrl,
    image.coffeeChatProfileImageUrl,
    image.googleProfileImageUrl,
    image.googleProfileImage,
    image.oauthProfileImageUrl,
    image.oauthProfileImage,
    image.imageUrl,
    image.url,
    image.profileImage,
  ].find((url) => typeof url === "string" && url.trim().length > 0) ??
    DEFAULT_PROFILE_IMAGE;
};

function CoffeeChatCard({
  id, // userId 받아옴
  name = "", // name 받아옴
  interestTopics = "", // interestTopics 받아옴
  meetingType = "", // meetingType 받아옴. online/offline 으로 받는다고 해서 한글로 바꾸는 작업 추가 예정
  profileImage = DEFAULT_PROFILE_IMAGE, // profileImage 받아옴
}) {
  const navigate = useNavigate();
  const profileImageUrl = getProfileImageUrl(profileImage);

  return (
    <div className="w-full min-h-105 px-5 py-6 bg-white rounded-2xl shadow-[0px_8px_24px_rgba(0,0,0,0.08)] md:h-125.75 md:px-6 md:py-4 
    flex flex-col justify-center items-center gap-2.5 overflow-hidden transition-all duration-300
    hover:scale-[1.02] hover:-translate-y-5 hover:outline-[3px] hover:outline-offset-[-3px] hover:outline-blue-700"
    >
      <div className="flex w-full flex-col items-center gap-6 md:gap-7">
        {profileImageUrl ? (
          <img
            className="h-40 w-40 rounded-full object-cover md:h-52 md:w-52"
            src={profileImageUrl}
            alt={`${name} 프로필 이미지`}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="h-40 w-40 rounded-full bg-zinc-300 md:h-52 md:w-52" />
        )}

        <div className="flex w-full flex-col items-center gap-6 md:gap-7">
          <div className="max-w-full text-center text-2xl font-bold leading-7 text-black break-words md:text-3xl md:leading-8">
            {name}
          </div>

          <div className="flex w-full flex-col items-center gap-6 md:gap-8">
            <div className="max-w-full text-center text-xl font-medium leading-7 text-black break-words md:text-2xl">
              관심 분야: {interestTopics}
            </div>

            <div className="max-w-full text-center text-xl font-medium leading-7 text-black break-words md:text-2xl">
              미팅 타입: {meetingType}
            </div>

            <button
              type="button"
              onClick={() => navigate(`/coffee-chat/profile/${id}`)}
              className="h-14 w-full max-w-52 bg-blue-500 rounded-xl border border-blue-700 
              flex items-center justify-center text-white text-2xl font-medium leading-6 md:text-3xl
              hover:bg-blue-600 transition cursor-pointer"
            >
              정보 더보기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoffeeChatCard;
