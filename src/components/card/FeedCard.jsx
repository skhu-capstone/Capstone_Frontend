import { useNavigate } from "react-router-dom";
import { DEFAULT_FEED_IMAGE, getContentImageUrl } from "../../utils/imageUtils";
import SafeImage from "../common/SafeImage";

function FeedCard({
  id, // postId 받아옴
  clubId,
  author = "", // writer.userName 받아옴
  date = "", // createdAt 받아옴
  image = DEFAULT_FEED_IMAGE,// imageUrl 받아옴
  content = "", // content 받아옴
  profileImage, // writer.profileImage 받아옴
}) {
  const navigate = useNavigate();
  const hasClubId =
    clubId !== undefined && clubId !== null && String(clubId).trim() !== "";
  const detailPath = hasClubId
    ? `/clubs/${clubId}/posts/${id}`
    : `/club/posts/${id}`;
  
  return (
    <button
      type="button"
      onClick={() => navigate(detailPath)}
      aria-label={`${author || "동아리"} 게시글 상세 보기`}
      className="grid h-full min-h-36 w-full min-w-0 touch-manipulation cursor-pointer grid-cols-[7rem_minmax(0,1fr)] grid-rows-[auto_1fr] gap-x-3 gap-y-2 overflow-hidden rounded-xl border border-slate-200 bg-white p-3 text-left shadow-[0px_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-theme-border dark:bg-theme-surface dark:shadow-theme-shadow dark:focus-visible:outline-theme-focus md:flex md:min-h-100 md:flex-col md:items-start md:justify-start md:gap-4 md:border-0 md:p-5 md:shadow-[0px_4px_12px_rgba(0,0,0,0.15)] md:hover:-translate-y-3 md:hover:scale-[1.01] md:hover:outline-[3px] md:hover:outline-offset-[-3px] md:hover:outline-blue-500 md:dark:hover:outline-theme-focus xl:h-113.75 xl:min-h-0"
    >
      <div className="col-start-2 row-start-1 flex min-w-0 items-center gap-2 md:order-1 md:col-auto md:row-auto md:gap-4">
        {/* 프로필 이미지 */}
        <SafeImage
          src={profileImage}
          alt={`${author} 프로필 이미지`}
          className="h-8 w-8 shrink-0 rounded-full object-cover md:h-12 md:w-12"
          referrerPolicy="no-referrer"
          fallback={<div className="h-8 w-8 shrink-0 rounded-full bg-zinc-300 dark:bg-theme-disabled-bg md:h-12 md:w-12" />}
        />

        <div className="flex h-8 min-w-0 flex-col items-start justify-center md:h-12 md:justify-start">
          {/* 작성자 */}
          <div className="max-w-full truncate text-xs font-semibold leading-4 text-black dark:text-theme-text md:text-base md:font-normal md:leading-6">
            {author}
          </div>
          {/* 작성한 날짜 */}
          <div className="text-[11px] font-normal leading-4 text-slate-500 dark:text-theme-muted md:text-base md:leading-6 md:text-black md:dark:text-theme-text">
            {date?.slice(0, 10).replace(/-/g, ".")}
          </div>
        </div>
      </div>

      {/* 피드 이미지 -> 여기서 이미지 없으면 어떻게 할지 생각해야 할듯. 필수요소 설정? */}
      <SafeImage
        className="col-start-1 row-span-2 row-start-1 h-full min-h-30 w-28 self-stretch rounded-lg object-cover md:order-2 md:h-64 md:min-h-0 md:w-full md:rounded-xl"
        src={image}
        fallbackSrc={DEFAULT_FEED_IMAGE}
        getSrc={getContentImageUrl}
        alt="피드 이미지"
      />

      {/* 내용 */}
      <div className="col-start-2 row-start-2 line-clamp-4 min-w-0 self-stretch break-words text-sm font-normal leading-5 text-slate-700 dark:text-theme-secondary md:order-3 md:col-auto md:row-auto md:line-clamp-3 md:text-base md:leading-6 md:text-black md:dark:text-theme-text">
        {content}
      </div>
    </button>
  );
}

export default FeedCard;
