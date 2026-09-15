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
    <div
      onClick={() => navigate(detailPath)}
      className="w-full min-h-100 p-5 bg-white rounded-xl shadow-[0px_4px_12px_0px_rgba(0,0,0,0.15)] xl:h-113.75 
      flex flex-col justify-start items-start gap-4 overflow-hidden transition-all duration-300
      cursor-pointer hover:scale-[1.01] hover:-translate-y-4 hover:outline-[3px] hover:outline-offset-[-3px] hover:outline-blue-500"
    >
      <div className="flex justify-center items-center gap-4">
        {/* 프로필 이미지 */}
        <SafeImage
          src={profileImage}
          alt={`${author} 프로필 이미지`}
          className="w-12 h-12 rounded-full object-cover"
          referrerPolicy="no-referrer"
          fallback={<div className="w-12 h-12 bg-zinc-300 rounded-full shrink-0" />}
        />

        <div className="min-w-0 h-12 flex flex-col justify-start items-start">
          {/* 작성자 */}
          <div className="max-w-full truncate text-black text-base font-normal leading-6">
            {author}
          </div>
          {/* 작성한 날짜 */}
          <div className="text-black text-base font-normal leading-6">
            {date?.slice(0, 10).replace(/-/g, ".")}
          </div>
        </div>
      </div>

      {/* 피드 이미지 -> 여기서 이미지 없으면 어떻게 할지 생각해야 할듯. 필수요소 설정? */}
      <SafeImage
        className="h-52 w-full self-stretch rounded-xl object-cover md:h-64"
        src={image}
        fallbackSrc={DEFAULT_FEED_IMAGE}
        getSrc={getContentImageUrl}
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
