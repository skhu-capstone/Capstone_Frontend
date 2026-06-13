import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Send,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
  const commentInputRef = useRef(null);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState("");

  // ── 게시글 조회 ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchPost() {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const data = await res.json();
        if (data.success) {
          setPost(data.data);
          setLikeCount(data.data.likeCount ?? 0);
          setLiked(data.data.liked ?? false);
          setComments(data.data.comments ?? []);
        } else {
          setError(data.message || "게시글을 찾을 수 없어요.");
        }
      } catch {
        setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [id]);

  // ── 좋아요 토글 ──────────────────────────────────────────────────────────
  async function handleLike() {
    if (likeLoading) return;
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
    setLikeLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE_URL}/api/posts/${id}/likes`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (data.success) {
        setLiked(data.data.liked);
        setLikeCount(data.data.likeCount);
      } else {
        setLiked(prevLiked);
        setLikeCount(prevCount);
      }
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
    } finally {
      setLikeLoading(false);
    }
  }

  // ── 댓글 작성 ────────────────────────────────────────────────────────────
  async function handleCommentSubmit() {
    const trimmed = commentText.trim();
    if (!trimmed || commentLoading) return;

    setCommentLoading(true);
    setCommentError("");
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE_URL}/api/posts/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content: trimmed }),
      });
      const data = await res.json();
      if (data.success) {
        setComments((prev) => [...prev, data.data]);
        setCommentText("");
        commentInputRef.current?.focus();
      } else {
        setCommentError(data.message || "댓글 작성에 실패했습니다.");
      }
    } catch {
      setCommentError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setCommentLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCommentSubmit();
    }
  }

  function formatDate(iso) {
    if (!iso) return "";
    return iso.slice(0, 10).replace(/-/g, ".");
  }

  const handleBack = () => {
    if (location.key !== "default") navigate(-1);
    else navigate("/club");
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50">
        <Skeleton />
      </div>
    );

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <p className="text-gray-400 text-sm">{error}</p>
        <button
          onClick={handleBack}
          className="text-sm text-indigo-500 hover:text-indigo-700 transition-colors cursor-pointer"
        >
          돌아가기
        </button>
      </div>
    );
  }

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
            {post.postType === "NOTICE" && (
              <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
                공지
              </span>
            )}
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
              disabled={likeLoading}
              className={`flex items-center gap-1.5 text-sm transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed ${liked ? "text-rose-500" : "text-gray-400 hover:text-rose-400"}`}
            >
              <Heart
                size={16}
                strokeWidth={1.8}
                fill={liked ? "currentColor" : "none"}
                className={`transition-transform duration-150 ${likeLoading ? "scale-90 opacity-60" : liked ? "scale-110" : "scale-100"}`}
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
              {comments.map((c) => (
                <CommentItem key={c.commentId} comment={c} />
              ))}
            </div>
          )}

          {commentError && (
            <p className="text-xs text-red-500">{commentError}</p>
          )}

          <div
            className={`flex items-center gap-2 border rounded-xl px-4 py-2.5 transition-colors ${commentLoading ? "border-gray-100 bg-gray-50" : "border-gray-200 focus-within:border-indigo-300"}`}
          >
            <input
              ref={commentInputRef}
              type="text"
              value={commentText}
              onChange={(e) => {
                setCommentText(e.target.value);
                setCommentError("");
              }}
              onKeyDown={handleKeyDown}
              placeholder="댓글을 입력하세요..."
              disabled={commentLoading}
              className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent disabled:opacity-50"
            />
            <button
              onClick={handleCommentSubmit}
              disabled={!commentText.trim() || commentLoading}
              className={`shrink-0 transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed ${commentText.trim() && !commentLoading ? "text-indigo-600 hover:text-indigo-800" : "text-gray-300"}`}
            >
              {commentLoading ? (
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
