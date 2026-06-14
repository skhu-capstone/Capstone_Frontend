import { useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Send,
} from "lucide-react";
import { 
  deleteClubPost, 
  getClubPostDetail, 
  toggleLike, 
  createComment 
} from "../../services/clubService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ─── 이미지 캐러셀 ────────────────────────────────────────────────────────────
function ImageCarousel({ images }) {
  const [idx, setIdx] = useState(0);
  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-slate-200">
      <img
        src={images[idx] || null}
        alt={`이미지 ${idx + 1}`}
        className="w-full object-cover"
        style={{ maxHeight: 420 }}
      />
      {idx > 0 && (
        <button
          onClick={() => setIdx((i) => i - 1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 transition-colors cursor-pointer"
        >
          <ChevronLeft size={18} strokeWidth={2} className="text-white" />
        </button>
      )}
      {idx < images.length - 1 && (
        <button
          onClick={() => setIdx((i) => i + 1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 transition-colors cursor-pointer"
        >
          <ChevronRight size={18} strokeWidth={2} className="text-white" />
        </button>
      )}
      {images.length > 1 && (
        <>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 cursor-pointer ${i === idx ? "bg-white scale-125" : "bg-white/50"}`}
              />
            ))}
          </div>
          <span className="absolute top-3 right-3 text-xs text-white bg-black/40 rounded-full px-2 py-0.5">
            {idx + 1} / {images.length}
          </span>
        </>
      )}
    </div>
  );
}

// ─── 스켈레톤 ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-3 animate-pulse">
      <div
        className="w-full rounded-2xl bg-slate-200"
        style={{ height: 420 }}
      />
      <div className="bg-white rounded-2xl px-6 py-5 flex flex-col gap-3">
        <div className="h-4 w-1/3 bg-slate-200 rounded" />
        <div className="h-3 w-full bg-slate-100 rounded" />
        <div className="h-3 w-5/6 bg-slate-100 rounded" />
      </div>
    </div>
  );
}

// ─── 댓글 아이템 ─────────────────────────────────────────────────────────────
function CommentItem({ comment }) {
  function formatDate(iso) {
    if (!iso) return "";
    return iso.slice(0, 10).replace(/-/g, ".");
  }

  return (
    <div className="flex items-start gap-2.5">
      <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-600 shrink-0">
        {comment.writerName?.[0] ?? "?"}
      </div>
      <div className="flex flex-col gap-0.5 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-700">
            {comment.writerName}
          </span>
          <span className="text-xs text-gray-400">
            {formatDate(comment.createdAt)}
          </span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">
          {comment.content}
        </p>
      </div>
    </div>
  );
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────
export default function ClubPostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const commentInputRef = useRef(null);
  const [commentText, setCommentText] = useState("");

  // ── 게시글 조회 (React Query) ──────────────────────────────────────────
  const { 
    data: post, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ["clubPostDetail", id],
    queryFn: async () => {
      console.log(`[ClubPostDetail] Fetching data for post ID: ${id}`);
      const data = await getClubPostDetail(id);
      console.log("[ClubPostDetail] API Response Data:", data);
      console.log("[ClubPostDetail] API Response Keys:", Object.keys(data));
      return data;
    },
    enabled: !!id,
    refetchOnWindowFocus: true,
  });

  // ── 좋아요 토글 (React Query) ──────────────────────────────────────────
  const likeMutation = useMutation({
    mutationFn: async () => {
      console.log("[ClubPostDetail] Toggling like for ID:", id);
      const res = await toggleLike(id);
      console.log("[ClubPostDetail] Toggle like API Response:", res);
      return res;
    },
    onSuccess: (data) => {
      // 서버 응답으로 캐시 즉시 업데이트
      queryClient.setQueryData(["clubPostDetail", id], (old) => {
        if (!old) return old;
        return {
          ...old,
          liked: data.liked ?? data.isLiked ?? !old.liked,
          likeCount: data.likeCount ?? data.likes ?? old.likeCount,
        };
      });
      // 혹시 모르니 서버에서 다시 불러오기 예약
      queryClient.invalidateQueries({ queryKey: ["clubPostDetail", id] });
    },
    onError: (err) => {
      console.error("[ClubPostDetail] Like mutation error:", err);
    }
  });

  // ── 댓글 작성 (React Query) ────────────────────────────────────────────
  const commentMutation = useMutation({
    mutationFn: async (content) => {
      console.log("[ClubPostDetail] Submitting comment for ID:", id);
      const res = await createComment(id, content);
      console.log("[ClubPostDetail] Create comment API Response:", res);
      return res;
    },
    onSuccess: (newComment) => {
      setCommentText("");
      // 캐시 즉시 업데이트
      queryClient.setQueryData(["clubPostDetail", id], (old) => {
        if (!old) return old;
        const currentComments = old.comments || old.postComments || [];
        return {
          ...old,
          comments: [...currentComments, newComment],
        };
      });
      // 서버에서 다시 불러오기 예약
      queryClient.invalidateQueries({ queryKey: ["clubPostDetail", id] });
      commentInputRef.current?.focus();
    },
    onError: (err) => {
      console.error("[ClubPostDetail] Comment mutation error:", err);
    }
  });

  // ── 게시글 삭제 (React Query) ──────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: deleteClubPost,
    onSuccess: () => {
      alert("게시글이 삭제되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["clubPosts"] });
      navigate("/club/main");
    },
    onError: (err) => {
      console.error(err);
      if (err.response?.status === 403) {
        alert("게시글을 삭제할 권한이 없습니다.");
      } else {
        alert("게시글 삭제에 실패했습니다.");
      }
    },
  });

  const handleDeletePost = () => {
    if (window.confirm("정말 게시글을 삭제하시겠습니까?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleLike = () => {
    likeMutation.mutate();
  };

  const handleCommentSubmit = () => {
    const trimmed = commentText.trim();
    if (!trimmed || commentMutation.isPending) return;
    commentMutation.mutate(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (e.nativeEvent.isComposing) return;
      e.preventDefault();
      handleCommentSubmit();
    }
  };

  function formatDate(iso) {
    if (!iso) return "";
    return iso.slice(0, 10).replace(/-/g, ".");
  }

  const handleBack = () => {
    if (location.key !== "default") navigate(-1);
    else navigate("/club/main");
  };

  if (isLoading) return <Skeleton />;

  if (isError || !post) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-gray-400 text-sm">{error?.message || "게시글을 찾을 수 없어요."}</p>
        <button
          onClick={handleBack}
          className="text-sm text-indigo-500 hover:text-indigo-700 transition-colors cursor-pointer"
        >
          돌아가기
        </button>
      </div>
    );
  }

  // 필드명 유연하게 대응
  const comments = post.comments || post.postComments || [];
  const liked = post.liked ?? post.isLiked ?? false;
  const likeCount = post.likeCount ?? post.likes ?? 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-0">
        <ImageCarousel images={post.imageUrls} />

        <div className="bg-white rounded-2xl shadow-sm px-6 py-5 flex flex-col gap-4 mt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-600">
                {post.writerName?.[0] ?? "?"}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {post.writerName}
              </span>
              <span className="text-xs text-gray-400">
                {formatDate(post.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {post.postType === "NOTICE" && (
                <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
                  공지
                </span>
              )}

              <button
                onClick={handleDeletePost}
                disabled={deleteMutation.isPending}
                className="text-xs font-medium text-red-500 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
              >
                {deleteMutation.isPending ? "삭제 중" : "삭제"}
              </button>
            </div>
          </div>

          {post.title && (
            <h2 className="text-base font-semibold text-gray-900">
              {post.title}
            </h2>
          )}

          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
            {post.content}
          </p>

          <div className="flex items-center gap-4 pt-1 border-t border-gray-100">
            <button
              onClick={handleLike}
              disabled={likeMutation.isPending}
              className={`flex items-center gap-1.5 text-sm transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed ${liked ? "text-rose-500" : "text-gray-400 hover:text-rose-400"}`}
            >
              <Heart
                size={16}
                strokeWidth={1.8}
                fill={liked ? "currentColor" : "none"}
                className={`transition-transform duration-150 ${likeMutation.isPending ? "scale-90 opacity-60" : liked ? "scale-110" : "scale-100"}`}
              />
              {likeCount}
            </button>
            <span className="flex items-center gap-1.5 text-sm text-gray-400">
              <MessageCircle size={16} strokeWidth={1.8} />
              {comments.length}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm px-6 py-5 mt-2 flex flex-col gap-4">
          <p className="text-sm font-semibold text-gray-700">
            댓글
            {comments.length > 0 && (
              <span className="ml-1.5 text-xs font-normal text-gray-400">
                {comments.length}
              </span>
            )}
          </p>

          {comments.length === 0 ? (
            <p className="text-sm text-gray-400">
              아직 댓글이 없어요. 첫 댓글을 남겨보세요!
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {comments.map((c, idx) => (
                <CommentItem key={c.commentId || idx} comment={c} />
              ))}
            </div>
          )}

          {commentMutation.isError && (
            <p className="text-xs text-red-500">댓글 작성에 실패했습니다.</p>
          )}

          <div
            className={`flex items-center gap-2 border rounded-xl px-4 py-2.5 transition-colors ${commentMutation.isPending ? "border-gray-100 bg-gray-50" : "border-gray-200 focus-within:border-indigo-300"}`}
          >
            <input
              ref={commentInputRef}
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="댓글을 입력하세요..."
              disabled={commentMutation.isPending}
              className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent disabled:opacity-50"
            />
            <button
              onClick={handleCommentSubmit}
              disabled={!commentText.trim() || commentMutation.isPending}
              className={`shrink-0 transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed ${commentText.trim() && !commentMutation.isPending ? "text-indigo-600 hover:text-indigo-800" : "text-gray-300"}`}
            >
              {commentMutation.isPending ? (
                <span className="text-xs text-gray-400">등록 중...</span>
              ) : (
                <Send size={15} strokeWidth={2} />
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
