import { getProfileImageUrl, DEFAULT_PROFILE_IMAGE } from "../../utils/imageUtils";
import SafeImage from "../common/SafeImage";

const roleText = {
  PRESIDENT: "대표",
  STAFF: "운영진",
  MEMBER: "동아리 부원",
};

const roleStyle = {
  대표: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
  운영진: "bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300",
  "동아리 부원": "bg-slate-100 text-slate-600 dark:bg-theme-hover dark:text-theme-secondary",
};

const normalizeClub = (club, index) => {
  if (club && typeof club === "object") {
    const name = club.clubName ?? club.name ?? club.title ?? `동아리 ${index + 1}`;
    const rawRole = String(club.role ?? club.clubRole ?? "MEMBER").toUpperCase();
    return { id: club.clubId ?? club.id ?? `${name}-${index}`, name, role: roleText[rawRole] ?? "동아리 부원" };
  }

  const value = String(club ?? "").trim();
  if (!value) return null;
  const matched = value.match(/^(.*?)\s*\/\s*(PRESIDENT|STAFF|MEMBER)\s*$/i);

  return matched
    ? { id: `${matched[1]}-${index}`, name: matched[1].trim(), role: roleText[matched[2].toUpperCase()] }
    : { id: `${value}-${index}`, name: value, role: "동아리 부원" };
};

function MyPageCard({
  compact = false,
  name = "이름", // name 받아옴
  email, // email 받아옴
  schoolEmail, // schoolEmail 받아옴
  clubName = "", // clubs 받아옴
  image = DEFAULT_PROFILE_IMAGE, // profileImage 받아옴
}) {
  const clubItems = (Array.isArray(clubName) ? clubName : clubName ? [clubName] : [])
    .map(normalizeClub)
    .filter(Boolean);

  return (
    <div className={`flex items-center justify-start overflow-hidden rounded-2xl bg-slate-50 shadow-[0px_4px_12px_0px_rgba(0,0,0,0.15)] dark:bg-theme-subtle dark:shadow-theme-shadow ${compact ? "w-full gap-4 px-4 py-5 sm:gap-6 sm:px-6 sm:py-7 md:gap-8 md:px-10 md:py-9" : "w-full max-w-225 gap-6 px-6 py-8 md:gap-10 md:px-12 md:py-10"}`}>
      
      {/* 프로필 이미지 */}
      <SafeImage
        className={`shrink-0 rounded-full border-[1.5px] border-black/0 object-cover ${compact ? "h-20 w-20 sm:h-28 sm:w-28 md:h-40 md:w-40" : "h-28 w-28 md:h-52 md:w-52"}`}
        src={image}
        fallbackSrc={DEFAULT_PROFILE_IMAGE}
        getSrc={getProfileImageUrl}
        alt={`${name} 프로필 이미지`}
        referrerPolicy="no-referrer"
        fallback={
          <div className={`shrink-0 rounded-full bg-zinc-300 dark:bg-theme-disabled-bg ${compact ? "h-20 w-20 sm:h-28 sm:w-28 md:h-40 md:w-40" : "h-28 w-28 md:h-52 md:w-52"}`} />
        }
      />

      <div className={`flex min-w-0 flex-1 flex-col items-start justify-center ${compact ? "gap-1.5 text-sm leading-5 sm:gap-2 sm:text-base md:gap-3 md:text-lg md:leading-7" : "gap-3 text-base leading-6 md:gap-5 md:text-2xl md:leading-8"}`}>

        {/* 이름 */}
        <div className="max-w-full break-words font-semibold text-black dark:text-theme-text">
          {name}
        </div>

        {/* 이메일 */}
        {email && ( // 이메일 무조건 받을 거라 이 조건이 필요한지 고민해야 함
          <div className="max-w-full break-all font-normal text-black dark:text-theme-text">
            {email}
          </div>
        )}

        {/* 학교 이메일 */}
        {schoolEmail && ( // 학교 이메일도 무조건 받을 거라 이 조건이 필요한지 고민해야 함 (인증에 필요)
          <div className="max-w-full break-all font-normal text-black dark:text-theme-text">
            {schoolEmail}
          </div>
        )}

        {/* 동아리 / 역할(대표, 동아리부원 등) */}
        {clubItems.length > 0 ? (
          <div className="flex max-w-full flex-wrap gap-2">
            {clubItems.map((club) => (
              <span key={club.id} className="inline-flex max-w-full overflow-hidden rounded-lg border border-slate-200 text-xs dark:border-theme-border sm:text-sm">
                <span className="min-w-0 max-w-44 flex-1 truncate bg-white px-2.5 py-1.5 font-medium text-slate-700 dark:bg-theme-surface dark:text-theme-text sm:max-w-64">{club.name}</span>
                <span className={`shrink-0 border-l border-slate-200 px-2 py-1.5 font-semibold dark:border-theme-border ${roleStyle[club.role] ?? roleStyle["동아리 부원"]}`}>{club.role}</span>
              </span>
            ))}
          </div>
        ) : (
          <div className="text-sm font-normal text-slate-500 dark:text-theme-muted">소속 동아리 없음</div>
        )}
      </div>
    </div>
  );
}

export default MyPageCard;
