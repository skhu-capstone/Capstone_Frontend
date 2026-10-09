import { useNavigate } from "react-router-dom";
import { getProfileImageUrl } from "../../utils/imageUtils";
import SafeImage from "../common/SafeImage";

const DEFAULT_PROFILE_IMAGE = "https://placehold.co/206x206";

function CoffeeChatCard({
  id, // userId 받아옴
  name = "", // name 받아옴
  interestTopics = "", // interestTopics 받아옴
  meetingType = "", // meetingType 받아옴. online/offline 으로 받는다고 해서 한글로 바꾸는 작업 추가 예정
  profileImage = DEFAULT_PROFILE_IMAGE, // profileImage 받아옴
}) {
  const navigate = useNavigate();

  return (
    <div className="flex h-full min-h-44 w-full min-w-0 items-center overflow-hidden rounded-xl bg-white p-4 shadow-[0px_6px_18px_rgba(0,0,0,0.08)] transition-all duration-300 dark:bg-theme-surface dark:shadow-theme-shadow md:h-125.75 md:min-h-0 md:flex-col md:justify-center md:rounded-2xl md:px-6 md:py-4 md:shadow-[0px_8px_24px_rgba(0,0,0,0.08)] md:hover:-translate-y-3 md:hover:scale-[1.02] md:hover:outline-[3px] md:hover:outline-offset-[-3px] md:hover:outline-blue-700 md:dark:hover:outline-theme-focus"
    >
      <div className="flex w-full min-w-0 items-center gap-4 md:flex-col md:gap-7">
        <SafeImage
          className="h-24 w-24 shrink-0 rounded-full object-cover ring-1 ring-slate-200 dark:ring-theme-border md:h-52 md:w-52 md:ring-0"
          src={profileImage}
          fallbackSrc={DEFAULT_PROFILE_IMAGE}
          getSrc={getProfileImageUrl}
          alt={`${name} 프로필 이미지`}
          referrerPolicy="no-referrer"
          fallback={
            <div className="h-24 w-24 shrink-0 rounded-full bg-zinc-300 ring-1 ring-slate-200 dark:bg-theme-disabled-bg dark:ring-theme-border md:h-52 md:w-52 md:ring-0" />
          }
        />

        <div className="flex min-w-0 flex-1 flex-col items-center gap-3 md:w-full md:flex-none md:gap-7">
          <div className="max-w-full truncate text-center text-lg font-bold leading-6 text-black dark:text-theme-text md:text-3xl md:leading-8">
            {name}
          </div>

          <div className="flex w-full min-w-0 flex-col items-center gap-2 md:gap-8">
            <div className="max-w-full truncate rounded-md bg-slate-100 px-2 py-1 text-center text-xs font-medium leading-5 text-slate-700 dark:bg-theme-raised dark:text-theme-secondary md:bg-transparent md:p-0 md:text-2xl md:leading-7 md:text-black md:dark:bg-transparent md:dark:text-theme-text">
              관심 분야 · {interestTopics}
            </div>

            <div className="max-w-full truncate text-center text-xs font-medium leading-5 text-slate-500 dark:text-theme-muted md:text-2xl md:leading-7 md:text-black md:dark:text-theme-text">
              미팅 타입 · {meetingType}
            </div>

            <button
              type="button"
              onClick={() => navigate(`/coffee-chat/profile/${id}`)}
              className="flex h-11 w-full touch-manipulation cursor-pointer items-center justify-center rounded-lg border border-blue-700 bg-blue-500 px-3 text-sm font-semibold leading-5 text-white transition hover:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-theme-focus dark:bg-theme-primary dark:hover:bg-theme-primary-hover dark:focus-visible:outline-theme-focus md:h-14 md:max-w-52 md:rounded-xl md:text-3xl md:font-medium md:leading-6"
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
