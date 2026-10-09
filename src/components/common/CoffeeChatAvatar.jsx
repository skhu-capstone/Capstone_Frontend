import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { getCoffeeChatProfile } from "../../services/coffeeChatProfileService";
import { getProfileImageUrl } from "../../utils/imageUtils";
import SafeImage from "./SafeImage";

const AVATAR_COLORS = [
  ["var(--avatar-sky-bg)", "var(--avatar-sky-text)"],
  ["var(--avatar-pink-bg)", "var(--avatar-pink-text)"],
  ["var(--avatar-green-bg)", "var(--avatar-green-text)"],
  ["var(--avatar-amber-bg)", "var(--avatar-amber-text)"],
  ["var(--avatar-violet-bg)", "var(--avatar-violet-text)"],
  ["var(--avatar-red-bg)", "var(--avatar-red-text)"],
];

export default function CoffeeChatAvatar({ userId, name, image, className = "" }) {
  const { user, loading } = useAuth();
  const targetUserId = Number(userId);
  const { data: profile } = useQuery({
    queryKey: ["coffeeChatProfile", targetUserId],
    queryFn: () => getCoffeeChatProfile(targetUserId),
    enabled: !loading && !!user && Number.isInteger(targetUserId) && targetUserId > 0,
    staleTime: 60_000,
    retry: false,
  });

  // Room responses may omit the uploaded coffee-chat photo or contain an old
  // OAuth photo. Prefer the same profile source used by the profile screen.
  const roomImage = typeof image === "string" ? image : {
    coffeeChatProfileImageUrl: image?.targetCoffeeChatProfileImageUrl ?? image?.coffeeChatProfileImageUrl,
    coffeeChatProfileImage: image?.targetCoffeeChatProfileImage ?? image?.coffeeChatProfileImage,
    coffeeChatProfile: image?.targetCoffeeChatProfile ?? image?.coffeeChatProfile,
    profileImageUrl: image?.targetProfileImageUrl ?? image?.profileImageUrl,
    profileImage: image?.targetProfileImage ?? image?.profileImage,
  };
  const roomImageUrl = getProfileImageUrl(roomImage, "");
  const imageUrl = getProfileImageUrl(profile, "") || roomImageUrl;
  const [background, color] = AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold ${className}`}
      style={{ background, color }}
    >
      <SafeImage
        src={imageUrl}
        fallbackSrc={roomImageUrl !== imageUrl ? roomImageUrl : ""}
        fallback={<span>{name?.[0] || "?"}</span>}
        alt={`${name || "상대방"} 프로필 사진`}
        className="h-full w-full object-cover"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
