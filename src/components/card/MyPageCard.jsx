import { getProfileImageUrl, DEFAULT_PROFILE_IMAGE } from "../../utils/imageUtils";
import SafeImage from "../common/SafeImage";

const roleText = {
  PRESIDENT: "대표",
  STAFF: "운영진",
  MEMBER: "동아리 부원",
};

function MyPageCard({
  compact = false,
  name = "이름", // name 받아옴
  email, // email 받아옴
  schoolEmail, // schoolEmail 받아옴
  clubName = "", // clubs 받아옴
  image = DEFAULT_PROFILE_IMAGE, // profileImage 받아옴
}) {
  const formattedClubName = clubName // role 없애고 "동아리 / 직책" 형식으로 나타낼 때 직책 replace로 텍스트로 바꾸기
      ? clubName.replace(/PRESIDENT|STAFF|MEMBER/g, (role) => roleText[role])
      : "소속 동아리 없음";

  return (
    <div className={`bg-slate-50 dark:bg-theme-subtle rounded-2xl shadow-[0px_4px_12px_0px_rgba(0,0,0,0.15)] dark:shadow-theme-shadow
    inline-flex justify-start items-center overflow-hidden ${compact ? "w-full max-w-208 px-12 py-10 gap-10" : "w-225 px-16 py-12 gap-12"}`}>
      
      {/* 프로필 이미지 */}
      <SafeImage
        className={`rounded-full border-[1.5px] border-black/0 object-cover ${compact ? "w-56 h-56 shrink-0" : "w-62.5 h-62.5"}`}
        src={image}
        fallbackSrc={DEFAULT_PROFILE_IMAGE}
        getSrc={getProfileImageUrl}
        alt={`${name} 프로필 이미지`}
        referrerPolicy="no-referrer"
        fallback={
          <div className={`rounded-full bg-zinc-300 dark:bg-theme-disabled-bg shrink-0 ${compact ? "w-56 h-56" : "w-62.5 h-62.5"}`} />
        }
      />

      <div className={`inline-flex flex-col justify-center items-start ${compact ? "min-w-0 gap-5 text-2xl leading-8 break-words [&>div]:max-w-full" : "gap-6 text-3xl leading-10"}`}>

        {/* 이름 */}
        <div className="text-black dark:text-theme-text font-normal">
          {name}
        </div>

        {/* 이메일 */}
        {email && ( // 이메일 무조건 받을 거라 이 조건이 필요한지 고민해야 함
          <div className="text-black dark:text-theme-text font-normal">
            {email}
          </div>
        )}

        {/* 학교 이메일 */}
        {schoolEmail && ( // 학교 이메일도 무조건 받을 거라 이 조건이 필요한지 고민해야 함 (인증에 필요)
          <div className="text-black dark:text-theme-text font-normal">
            {schoolEmail}
          </div>
        )}

        {/* 동아리 / 역할(대표, 동아리부원 등) */}
        <div className="text-black dark:text-theme-text font-normal">
          {/* 동아리 소속되어 있을 땐 동아리랑 역할 다 출력하고 아니면 '소속 동아리 없음'으로 출력 */}
          {formattedClubName}
        </div>
      </div>
    </div>
  );
}

export default MyPageCard;
