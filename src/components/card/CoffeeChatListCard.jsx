const DEFAULT_PROFILE_IMAGE = "https://placehold.co/168x168";

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

function CoffeeChatListCard({
  id, // coffeeChatProfileId 받아옴
  name = "이름", // name 받아옴
  headline = "한 줄 소개", // headline 받아옴
  interest = "관심 분야 없음", // interestTopics 받아옴
  clubName = "동아리 없음", // clubName 받아옴
  image = DEFAULT_PROFILE_IMAGE, // profileImage 받아옴
  onClick, // 페이지 이동
}) {
  const profileImageUrl = getProfileImageUrl(image);

  return (
    <div 
      onClick={onClick}
      className="w-175 h-40 bg-cyan-800/10 rounded-2xl outline-[1.5px] outline-offset-[-1.5px]
      outline-black/0 inline-flex overflow-hidden transition-all duration-300 cursor-pointer
      hover:-translate-y-2 hover:shadow-[0px_8px_24px_rgba(0,0,0,0.08)] hover:outline-2 
      hover:outline-offset-2 hover:outline-blue-700">
    
      {/* 프로필 이미지 */}
      <img className="w-40 h-full object-cover" src={profileImageUrl} alt={name}/>

      {/* 내용 영역 */}
      <div className="flex-1 px-5 py-6 flex flex-col justify-center gap-2">
        
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
    </div>
  );
}

export default CoffeeChatListCard;
