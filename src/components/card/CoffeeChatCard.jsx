function CoffeeChatCard({
  id, // coffeeChatProfileId 받아옴
  name = "윤현승", // name 받아옴
  interest = "프론트엔드", // interestTopics 받아옴
  meetingType = "오프라인", // meetingType 받아옴. online/offline 으로 받는다고 해서 한글로 바꾸는 작업 추가 예정
  image = "https://placehold.co/206x206", // profileImage 받아옴
  onMoreClick, // link 적용할 예정이라 삭제 예정
}) {
  return (
    <div className="w-96 h-125.75 px-6 py-4 bg-white rounded-2xl shadow-[0px_8px_24px_rgba(0,0,0,0.08)] 
    flex flex-col justify-center items-center gap-2.5 overflow-hidden transition-all duration-300
    hover:h-130.5 hover:-translate-y-5 hover:outline-[3px] hover:outline-offset-[-3px] hover:outline-blue-700"
    >
      <div className="flex flex-col items-center gap-7">
        <img
          className="w-52 h-52 rounded-full object-cover"
          src={image}
          alt={`${name} 프로필 이미지`}
        />

        <div className="flex flex-col items-center gap-7">
          <div className="text-center text-black text-3xl font-bold leading-6">
            {name}
          </div>

          <div className="flex flex-col items-center gap-8">
            <div className="text-center text-black text-2xl font-medium leading-6">
              관심 분야: {interest}
            </div>

            <div className="text-center text-black text-2xl font-medium leading-6">
              미팅 타입: {meetingType}
            </div>

            <button // 링크로 교체 예정 > to={`/커피챗 페이지/${id}`}
              type="button"
              onClick={onMoreClick}
              className="w-52 h-14 bg-blue-500 rounded-xl border border-blue-700 
              flex items-center justify-center text-white text-3xl font-medium leading-6
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