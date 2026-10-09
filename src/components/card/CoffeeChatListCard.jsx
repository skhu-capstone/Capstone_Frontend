import { ArrowUpRight, Building2 } from "lucide-react";
import { getProfileImageUrl } from "../../utils/imageUtils";
import SafeImage from "../common/SafeImage";

const DEFAULT_PROFILE_IMAGE = "https://placehold.co/168x168";

const ROLE_LABELS = {
  PRESIDENT: "대표",
  STAFF: "운영진",
  MEMBER: "부원",
};

const ROLE_STYLES = {
  대표: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
  운영진: "bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300",
  부원: "bg-slate-100 text-slate-600 dark:bg-theme-hover dark:text-theme-secondary",
};

const normalizeClub = (club, index) => {
  if (club && typeof club === "object") {
    const name = club.clubName ?? club.name ?? club.title ?? `동아리 ${index + 1}`;
    const rawRole = String(club.role ?? club.clubRole ?? "").toUpperCase();

    return {
      id: club.clubId ?? club.id ?? `${name}-${index}`,
      name,
      role: ROLE_LABELS[rawRole] ?? club.role ?? club.clubRole ?? "부원",
    };
  }

  const value = String(club ?? "").trim();
  if (!value) return null;

  const matched = value.match(/^(.*?)\s*\/\s*(PRESIDENT|STAFF|MEMBER)\s*$/i);
  if (!matched) {
    return { id: `${value}-${index}`, name: value, role: "부원" };
  }

  return {
    id: `${matched[1]}-${index}`,
    name: matched[1].trim(),
    role: ROLE_LABELS[matched[2].toUpperCase()],
  };
};

const normalizeClubs = (clubs) => {
  const values = Array.isArray(clubs) ? clubs : clubs ? [clubs] : [];
  return values.map(normalizeClub).filter(Boolean);
};

function CoffeeChatListCard({
  name = "이름",
  headline = "한 줄 소개",
  interest = "관심 분야 없음",
  clubs = [],
  image = DEFAULT_PROFILE_IMAGE,
  onClick,
  disabled = false,
}) {
  const clubItems = normalizeClubs(clubs);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={`group flex w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition duration-200 dark:border-theme-border dark:bg-theme-surface ${
        disabled
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:hover:border-theme-focus dark:hover:shadow-theme-shadow dark:focus-visible:outline-theme-focus"
      }`}
    >
      <SafeImage
        className="m-3 mr-0 aspect-square h-20 w-20 shrink-0 self-start rounded-xl object-cover sm:m-5 sm:mr-0 sm:h-32 sm:w-32"
        src={image}
        fallbackSrc={DEFAULT_PROFILE_IMAGE}
        getSrc={getProfileImageUrl}
        alt={`${name} 프로필`}
        fallback={<div className="m-3 mr-0 aspect-square h-20 w-20 shrink-0 self-start rounded-xl bg-slate-200 dark:bg-theme-disabled-bg sm:m-5 sm:mr-0 sm:h-32 sm:w-32" />}
      />

      <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-5">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-slate-900 dark:text-theme-text sm:text-xl">
              {name}
            </h2>
            <p className="mt-1 line-clamp-2 break-keep text-xs leading-5 text-slate-600 dark:text-theme-secondary sm:text-sm">
              {headline || "아직 한 줄 소개가 없습니다."}
            </p>
          </div>
          <ArrowUpRight
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0 text-slate-400 transition group-hover:text-blue-600 dark:text-theme-muted dark:group-hover:text-theme-link"
          />
        </div>

        <div className="mt-3 sm:mt-4">
          <span className="inline-flex max-w-full rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:bg-theme-accent dark:text-theme-link sm:text-sm">
            <span className="truncate">관심 분야 · {interest || "미설정"}</span>
          </span>
        </div>

        <div className="mt-3 border-t border-slate-100 pt-3 dark:border-theme-border sm:mt-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-theme-muted">
            <Building2 aria-hidden="true" className="h-3.5 w-3.5" />
            소속 동아리
          </div>

          {clubItems.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {clubItems.map((club) => (
                <span
                  key={club.id}
                  className="inline-flex max-w-full items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 text-xs dark:border-theme-border dark:bg-theme-subtle"
                >
                  <span className="max-w-28 truncate px-2.5 py-1.5 font-medium text-slate-700 dark:text-theme-text min-[380px]:max-w-40 sm:max-w-56">
                    {club.name}
                  </span>
                  <span className={`shrink-0 border-l border-slate-200 px-2 py-1.5 font-semibold dark:border-theme-border ${ROLE_STYLES[club.role] ?? ROLE_STYLES.부원}`}>
                    {club.role}
                  </span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 dark:text-theme-muted">소속 동아리 없음</p>
          )}
        </div>
      </div>
    </button>
  );
}

export default CoffeeChatListCard;
