function FeedCard({
  id, // postId 받아옴
  author = "윤현승", // writer.userName 받아옴
  date = "2026년 04월 10일", // createdAt 받아옴
  image = "https://placehold.co/600x250",// imageUrl 받아옴
  content = "디폴트값이니깐 일단 아무 내용", // content 받아옴
  profileImage, // writer.profileImage 받아옴
}) {
  return (
    // 여기 link 추가 에정
    <div className="w-160 h-113.75 p-5 bg-white rounded-xl shadow-[0px_4px_12px_0px_rgba(0,0,0,0.15)] 
    flex flex-col justify-start items-start gap-4 overflow-hidden transition-all duration-300
      hover:h-118 hover:-translate-y-4 hover:outline-[3px] hover:outline-offset-[-3px] hover:outline-blue-500">
      <div className="flex justify-center items-center gap-4">
        {/* 프로필 이미지 */}
        {profileImage ? (
          <img
            src={profileImage}
            alt={`${author} 프로필 이미지`}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 bg-zinc-300 rounded-full" />
          // 일단은 프로필 이미지가 없으면 회색원 처리했고 디폴트 이미지로 카톡처럼 사람 실루엣 사진 적용할 예정
        )}

        <div className="h-12 flex flex-col justify-start items-start">
          {/* 작성자 */}
          <div className="text-black text-base font-normal leading-6">
            {author}
          </div>
          {/* 작성한 날짜 */}
          <div className="text-black text-base font-normal leading-6">
            {date}
          </div>
        </div>
      </div>

      {/* 피드 이미지 -> 여기서 이미지 없으면 어떻게 할지 생각해야 할듯. 필수요소 설정? */}
      <img
        className="self-stretch h-64 rounded-xl object-cover"
        src={image}
        alt="피드 이미지"
      />

      {/* 내용 */}
      <div className="self-stretch text-black text-base font-normal leading-6 line-clamp-3">
        {content}
      </div>
    </div>
  );
}

export default FeedCard;