import { getProfileImageUrl } from "../../utils/imageUtils";
import SafeImage from "../common/SafeImage";

const DEFAULT_PROFILE_IMAGE = "https://placehold.co/168x168";

function CoffeeChatListCard({
  name = "이름", // name 받아옴
  headline = "한 줄 소개", // headline 받아옴
  interest = "관심 분야 없음", // interestTopics 받아옴
  clubName = "동아리 없음", // clubName 받아옴
  image = DEFAULT_PROFILE_IMAGE, // profileImage 받아옴
  onClick, // 페이지 이동
  disabled = false,
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={`w-full min-w-0 h-40 text-left bg-cyan-800/10 rounded-2xl outline-[1.5px] outline-offset-[-1.5px]
      outline-black/0 inline-flex overflow-hidden transition-all duration-300 ${
        disabled
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer sm:hover:-translate-y-2 hover:shadow-[0px_8px_24px_rgba(0,0,0,0.08)] hover:outline-2 hover:outline-offset-2 hover:outline-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
      }`}>
    
      {/* 프로필 이미지 */}
      <SafeImage
        className="w-24 h-full shrink-0 object-cover sm:w-40"
        src={image}
        fallbackSrc={DEFAULT_PROFILE_IMAGE}
        getSrc={getProfileImageUrl}
        alt={name}
        fallback={<div className="h-full w-24 shrink-0 bg-zinc-300 sm:w-40" />}
      />

      {/* 내용 영역 */}
      <div className="min-w-0 flex-1 px-3 py-4 flex flex-col justify-center gap-2 sm:px-5 sm:py-6">
        
        {/* 이름 */}
        <div className="text-neutral-800 text-base font-bold line-clamp-1">
          {name}
        </div>

        {/* 한 줄 소개 */}
        <div className="text-neutral-800 text-sm line-clamp-1">
          {headline}
        </div>

        {/* 관심 분야 */}
        <div className="text-neutral-800 text-sm line-clamp-1">
          관심 분야 : {interest}
        </div>

        {/* 동아리 */}
        <div className="text-black text-sm line-clamp-1">
          소속 동아리 : {clubName || "없음"}
        </div>
      </div>
    </button>
  );
}

export default CoffeeChatListCard;
