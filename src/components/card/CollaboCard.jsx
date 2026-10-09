import { useNavigate } from "react-router-dom";

function CollaboCard({
  id, // collabId 또는 projectRecruitmentId 받아옴
  type = "club", // 협업 게시글 관련 props
  title = "제목", // title 받아옴
  author = "작성자", // writerName 받아옴
  time = "n시간 전", // createAt 받아서 계산하는 기능 제작 예정
  content = "내용", // content 받아옴
  dDay = "D-00", // dDay 받아옴
  onClick,
}) {
  const navigate = useNavigate();

  return (
    // 전체 컨테이너
    <button
      type="button"
      // onClick이 따로 없으면 협업 타입에 맞는 상세 페이지로 이동
      onClick={onClick ?? (() => navigate(`/cooperation/${type}/${id}`))}
      aria-label={`${title} 상세 보기`}
      className="flex h-full min-h-36 w-full min-w-0 touch-manipulation cursor-pointer flex-col gap-2.5 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 text-left shadow-[0px_4px_10px_rgba(0,0,0,0.04)] transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-theme-border dark:bg-theme-surface dark:shadow-theme-shadow dark:focus-visible:outline-theme-focus md:min-h-44 md:border-0 md:shadow-[0px_4px_10px_rgba(0,0,0,0.05)] md:outline-1 md:outline-offset-1 md:outline-slate-100 md:dark:outline-theme-border md:hover:-translate-y-3 md:hover:scale-[1.02] md:hover:outline-[3px] md:hover:outline-offset-[-3px] md:hover:outline-blue-700 md:dark:hover:outline-theme-focus"
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        {/* 제목 */}
        <h3 className="line-clamp-2 min-w-0 flex-1 break-words font-pretendard text-base font-semibold leading-6 text-black dark:text-theme-text md:text-2xl md:leading-8">
          {title}
        </h3>

        {/* D-Day */}
        <div className="flex h-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 px-2.5 dark:bg-theme-accent md:order-none md:w-16 md:px-1">
          <span className="text-center font-pretendard text-sm font-semibold text-blue-800 dark:text-theme-text md:text-base md:font-normal md:text-black">
            {dDay}
          </span>
        </div>
      </div>

      {/* 작성자, 시간 */}
      <div className="flex min-w-0 justify-start border-b border-slate-100 pb-2 dark:border-theme-border md:justify-end md:border-0 md:pb-0">
        <span className="max-w-full truncate text-left font-pretendard text-xs font-normal text-slate-500 dark:text-theme-muted md:text-right md:text-base md:text-black md:dark:text-theme-text">
          {author} · {time}
        </span>
      </div>

      {/* 내용 */}
      <p className="line-clamp-2 break-words font-pretendard text-sm font-normal leading-5 text-slate-700 dark:text-theme-secondary md:text-base md:leading-normal md:text-black md:dark:text-theme-text">
        {content}
      </p>
    </button>
  );
}

export default CollaboCard;
