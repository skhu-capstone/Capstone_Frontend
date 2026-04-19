function CollaboCard({
  id, // collabId 받아옴
  title = "제목", // title 받아옴
  author = "작성자", // writerName 받아옴
  time = "n시간 전", // createAt 받아서 계산하는 기능 제작 예정
  content = "내용", // content 받아옴
  dDay = "D-00", // dDay 받아옴
  onClick,
}) {
  return (
    // 전체 컨테이너
    <div
      onClick={onClick}
      className="w-96 h-44 p-4 bg-white rounded-xl shadow-[0px_4px_10px_0px_rgba(0,0,0,0.05)]
      outline-1 outline-offset-1 outline-slate-100 flex flex-col gap-2.5 
      cursor-pointer transition hover:shadow-md active:scale-[0.98]"
    >
      {/* 제목 */}
      <h3 className="text-black text-2xl font-semibold font-pretendard">
        {title}
      </h3>

      {/* 작성자, 시간 */}
      <div className="flex justify-end">
        <span className="text-black text-base font-normal font-pretendard">
          {author} · {time}
        </span>
      </div>

      {/* 내용 */}
      <p className="text-black text-base font-normal font-pretendard line-clamp-2">
        {content}
      </p>

      {/* D-Day */}
      <div className="w-16 h-7 px-1 py-2.5 bg-blue-100 rounded-full flex justify-center items-center overflow-hidden">
        <span className="text-center text-black text-base font-normal font-pretendard">
          {dDay}
        </span>
      </div>
    </div>
  );
}

export default CollaboCard;