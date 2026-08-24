import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createClubPost,
  getClubDetail,
  getClubMembers,
  uploadPostImage,
} from "../../services/clubService";
import { useAuth } from "../../context/AuthContext";

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_TITLE_LENGTH = 50;
const MAX_CONTENT_LENGTH = 1000;

export default function ClubPostCreatePage() {
  const navigate = useNavigate();
  const { clubId } = useParams();
  const targetClubId = Number(clubId);
  const isValidClubId = Number.isInteger(targetClubId) && targetClubId > 0;
  const { user: authUser, loading: authLoading } = useAuth();
  const accessToken = localStorage.getItem("accessToken");
  const isAuthenticated = !!authUser && !!accessToken;
  const currentUserId = Number(authUser?.userId ?? authUser?.id);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const {
    data: members = [],
    isLoading: isMembersLoading,
    isError: isMembersError,
  } = useQuery({
    queryKey: ["clubMembers", targetClubId],
    queryFn: () => getClubMembers(targetClubId),
    enabled: isAuthenticated && isValidClubId,
  });

  const {
    data: clubDetail,
    isLoading: isClubDetailLoading,
    isError: isClubDetailError,
  } = useQuery({
    queryKey: ["clubDetail", targetClubId],
    queryFn: () => getClubDetail(targetClubId),
    enabled: isAuthenticated && isValidClubId,
  });

  const myRole = members
    .find((member) => Number(member.userId ?? member.id) === currentUserId)
    ?.role?.trim()
    .toUpperCase();
  const canCreatePost = ["PRESIDENT", "STAFF"].includes(myRole);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!isValidClubId) {
      alert("잘못된 동아리 주소입니다.");
      navigate("/club/main", { replace: true });
    }
  }, [isValidClubId, navigate]);

  useEffect(() => {
    if (!isAuthenticated || !isValidClubId || isMembersLoading) return;

    if (isMembersError || isClubDetailError || !canCreatePost) {
      alert("게시물 작성 권한이 없습니다.");
      navigate(`/club/main/${targetClubId}`, { replace: true });
    }
  }, [
    canCreatePost,
    isAuthenticated,
    isClubDetailError,
    isValidClubId,
    isMembersError,
    isMembersLoading,
    navigate,
    targetClubId,
  ]);

  const handleCreatePost = () => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    if (!isValidClubId) {
      alert("잘못된 동아리 주소입니다.");
      navigate("/club/main", { replace: true });
      return;
    }

    if (!canCreatePost) {
      alert("게시물 작성 권한이 없습니다.");
      navigate(`/club/main/${targetClubId}`, { replace: true });
      return;
    }

    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    if (title.trim().length > MAX_TITLE_LENGTH) {
      alert(`제목은 ${MAX_TITLE_LENGTH}자 이하로 입력해주세요.`);
      return;
    }

    if (content.trim().length > MAX_CONTENT_LENGTH) {
      alert(`내용은 ${MAX_CONTENT_LENGTH}자 이하로 입력해주세요.`);
      return;
    }
    
    createPostMutation.mutate({
      clubId: targetClubId,
      title: title.trim(),
      content: content.trim(),
      imageUrls: [],
    });
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setImageFile(null);
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      alert("PNG 또는 JPG 이미지만 업로드할 수 있습니다.");
      event.target.value = "";
      setImageFile(null);
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      alert("이미지는 5MB 이하만 업로드할 수 있습니다.");
      event.target.value = "";
      setImageFile(null);
      return;
    }

    setImageFile(file);
  };

  const isFormValid = title.trim() && content.trim();

  const createPostMutation = useMutation({
    mutationFn: createClubPost,

    onSuccess: async (createdPost) => {
      if (imageFile) {
        try {
          await uploadPostImage(createdPost.postId, imageFile);
        } catch (error) {
          console.error(error);
          alert("게시물은 등록되었지만 이미지 업로드에 실패했습니다.");
          navigate(`/club/main/${targetClubId}`);
          return;
        }
      }

      alert("게시물이 등록되었습니다.");
      navigate(`/club/main/${targetClubId}`);
    },

    onError: (error) => {
      console.error(error);
      alert("게시물 등록에 실패했습니다.");
    },
  });

  if (
    authLoading ||
    (isValidClubId && (isMembersLoading || isClubDetailLoading))
  ) {
    return (
      <main className="min-h-screen bg-[#F7F8FA] px-16 py-14">
        <section className="max-w-295 mx-auto text-gray-500">
          게시물 작성 권한을 확인하는 중입니다...
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA] px-16 py-14">
      <section className="max-w-295 mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#1F2937]">
            {clubDetail?.clubName ?? "동아리"}
          </h1>
          <p className="mt-3 text-sm text-gray-500">
            동아리 피드에 공유할 게시물을 작성해주세요.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.12)] p-8">
          <h2 className="text-2xl font-bold mb-8">게시물 작성</h2>

          <div className="mb-7">
            <label className="block mb-3 text-sm font-semibold">
              제목
            </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={MAX_TITLE_LENGTH}
                placeholder="게시물 제목을 입력해주세요"
                className="w-full h-12 px-4 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
              />
              <p className="mt-2 text-right text-xs text-gray-400">
                {title.length}/{MAX_TITLE_LENGTH}
              </p>
            </div>

          <div className="mb-7">
            <label className="block mb-3 text-sm font-semibold">
              내용
            </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={MAX_CONTENT_LENGTH}
                placeholder="동아리원들에게 공유할 내용을 작성해주세요"
                className="w-full h-64 px-4 py-4 border border-gray-300 rounded-lg resize-none outline-none focus:border-blue-500"
              />
              <p className="mt-2 text-right text-xs text-gray-400">
                {content.length}/{MAX_CONTENT_LENGTH}
              </p>
            </div>

          <div className="mb-10">
            <label className="block mb-3 text-sm font-semibold">
              이미지 첨부
            </label>

            <label className="flex flex-col items-center justify-center h-52 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500">
              <span className="text-gray-500 text-sm">
                이미지를 클릭해서 업로드해주세요
              </span>
              <span className="mt-2 text-xs text-gray-400">
                PNG, JPG 파일 지원 · 최대 5MB
              </span>
              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleImageChange}
                className="hidden"
              />
              {imageFile && (
                <span className="mt-2 text-xs text-blue-600">
                  {imageFile.name}
                </span>
              )}
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-24 h-11 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              취소
            </button>

            <button
              onClick={handleCreatePost}
              disabled={
                !isAuthenticated ||
                !canCreatePost ||
                !isFormValid ||
                createPostMutation.isPending
              }
              className="w-24 h-11 bg-[#0B72B9] text-white rounded-lg hover:bg-[#095f9b] disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {createPostMutation.isPending ? "등록 중" : "등록"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
