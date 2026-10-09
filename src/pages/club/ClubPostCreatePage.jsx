import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import {
  createClubPost,
  getClubDetail,
  getClubMembers,
  uploadPostImage,
} from "../../services/clubService";
import { useAuth } from "../../context/AuthContext";

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg"];
const MAX_IMAGE_SIZE = 20 * 1024 * 1024;
const MAX_IMAGE_COUNT = 5;
const MAX_TITLE_LENGTH = 50;
const MAX_CONTENT_LENGTH = 1000;

function ImagePreview({ file, index, onRemove }) {
  const [previewUrl] = useState(() => URL.createObjectURL(file));

  useEffect(() => {
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  return (
    <div className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-theme-border bg-gray-100 dark:bg-theme-subtle">
      {previewUrl && (
        <img
          src={previewUrl}
          alt={`첨부 이미지 ${index + 1}`}
          className="h-full w-full object-cover"
        />
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`첨부 이미지 ${index + 1} 삭제`}
        title="이미지 삭제"
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/65 text-white transition-colors hover:bg-black/80"
      >
        <X size={17} aria-hidden="true" />
      </button>
    </div>
  );
}

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
  const [imageFiles, setImageFiles] = useState([]);

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
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (selectedFiles.length === 0) return;

    const invalidTypeFile = selectedFiles.find(
      (file) => !ALLOWED_IMAGE_TYPES.includes(file.type)
    );
    if (invalidTypeFile) {
      alert("PNG 또는 JPG 이미지만 업로드할 수 있습니다.");
      return;
    }

    const oversizedFile = selectedFiles.find(
      (file) => file.size > MAX_IMAGE_SIZE
    );
    if (oversizedFile) {
      alert("각 이미지는 20MB 이하만 업로드할 수 있습니다.");
      return;
    }

    setImageFiles((currentFiles) => {
      const uniqueFiles = selectedFiles.filter(
        (selectedFile) =>
          !currentFiles.some(
            (currentFile) =>
              currentFile.name === selectedFile.name &&
              currentFile.size === selectedFile.size &&
              currentFile.lastModified === selectedFile.lastModified
          )
      );
      const availableCount = MAX_IMAGE_COUNT - currentFiles.length;

      if (uniqueFiles.length > availableCount) {
        alert(`이미지는 최대 ${MAX_IMAGE_COUNT}장까지 첨부할 수 있습니다.`);
      }

      return [...currentFiles, ...uniqueFiles.slice(0, availableCount)];
    });
  };

  const removeImage = (targetIndex) => {
    setImageFiles((currentFiles) =>
      currentFiles.filter((_, index) => index !== targetIndex)
    );
  };

  const isFormValid = title.trim() && content.trim();

  const createPostMutation = useMutation({
    mutationFn: createClubPost,

    onSuccess: async (createdPost) => {
      if (imageFiles.length > 0) {
        let uploadedCount = 0;

        for (const imageFile of imageFiles) {
          try {
            await uploadPostImage(createdPost.postId, imageFile);
            uploadedCount += 1;
          } catch (error) {
            console.error(error);
            alert(
              `게시물은 등록되었지만 이미지 ${uploadedCount}/${imageFiles.length}장만 업로드됐습니다.`
            );
            navigate(`/club/main/${targetClubId}`);
            return;
          }
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
      <main className="min-h-screen bg-[#F7F8FA] dark:bg-theme-page px-16 py-14">
        <section className="max-w-295 mx-auto text-gray-500 dark:text-theme-muted">
          게시물 작성 권한을 확인하는 중입니다...
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA] dark:bg-theme-page px-16 py-14">
      <section className="max-w-295 mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#1F2937] dark:text-theme-text">
            {clubDetail?.clubName ?? "동아리"}
          </h1>
          <p className="mt-3 text-sm text-gray-500 dark:text-theme-muted">
            동아리 피드에 공유할 게시물을 작성해주세요.
          </p>
        </div>

        <div className="bg-white dark:bg-theme-surface rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.12)] dark:shadow-theme-shadow p-8">
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
                className="w-full h-12 px-4 border border-gray-300 dark:border-theme-border-strong rounded-lg outline-none focus:border-blue-500 dark:focus:border-theme-focus"
              />
              <p className="mt-2 text-right text-xs text-gray-400 dark:text-theme-muted">
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
                className="w-full h-64 px-4 py-4 border border-gray-300 dark:border-theme-border-strong rounded-lg resize-none outline-none focus:border-blue-500 dark:focus:border-theme-focus"
              />
              <p className="mt-2 text-right text-xs text-gray-400 dark:text-theme-muted">
                {content.length}/{MAX_CONTENT_LENGTH}
              </p>
            </div>

          <div className="mb-10">
            <label className="block mb-3 text-sm font-semibold">
              이미지 첨부
            </label>

            <label className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-theme-border-strong px-5 py-8 cursor-pointer hover:border-blue-500 dark:hover:border-theme-focus">
              <span className="text-gray-500 dark:text-theme-muted text-sm">
                이미지를 클릭해서 업로드해주세요
              </span>
              <span className="mt-2 text-xs text-gray-400 dark:text-theme-muted">
                PNG, JPG 파일 지원 · 각 20MB 이하 · 최대 {MAX_IMAGE_COUNT}장
              </span>
              <span className="mt-2 text-xs font-medium text-blue-600 dark:text-theme-link">
                {imageFiles.length}/{MAX_IMAGE_COUNT}장 선택됨
              </span>
              <input
                type="file"
                accept="image/png, image/jpeg"
                multiple
                disabled={imageFiles.length >= MAX_IMAGE_COUNT}
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {imageFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {imageFiles.map((file, index) => (
                  <ImagePreview
                    key={`${file.name}-${file.size}-${file.lastModified}`}
                    file={file}
                    index={index}
                    onRemove={() => removeImage(index)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-24 h-11 border border-gray-300 dark:border-theme-border-strong rounded-lg text-gray-600 dark:text-theme-secondary hover:bg-gray-100 dark:hover:bg-theme-hover"
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
              className="w-24 h-11 bg-[#0B72B9] dark:bg-theme-primary text-white rounded-lg hover:bg-[#095f9b] dark:hover:bg-theme-primary-hover disabled:bg-gray-400 dark:disabled:bg-theme-disabled-bg disabled:cursor-not-allowed"
            >
              {createPostMutation.isPending ? "등록 중" : "등록"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
