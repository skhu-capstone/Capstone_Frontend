import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ChevronDown,
  LayoutGrid,
  Globe,
  ArrowUp,
  ArrowDown,
  Plus,
  X,
  Image,
  AlertCircle,
  Loader2,
} from "lucide-react";

const POSTS_PER_PAGE = 6;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ─── 정렬 드롭다운 ────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { key: "likes_desc", label: "좋아요 많은순", icon: Heart, dir: "desc" },
  { key: "likes_asc", label: "좋아요 적은순", icon: Heart, dir: "asc" },
  {
    key: "comments_desc",
    label: "댓글 많은순",
    icon: MessageCircle,
    dir: "desc",
  },
  {
    key: "comments_asc",
    label: "댓글 적은순",
    icon: MessageCircle,
    dir: "asc",
  },
];

function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return { open, setOpen, ref };
}

function SortDropdown({ value, onChange }) {
  const { open, setOpen, ref } = useDropdown();
  const current = SORT_OPTIONS.find((o) => o.key === value) ?? SORT_OPTIONS[0];
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm text-gray-600 bg-white border border-gray-100 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors duration-150 cursor-pointer shadow-sm"
      >
        <ArrowUpDown size={13} strokeWidth={2} />
        {current.label}
        <ChevronDown
          size={13}
          strokeWidth={2}
          className={`ml-0.5 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1.5 w-44 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
          {SORT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const DirIcon = opt.dir === "desc" ? ArrowDown : ArrowUp;
            const isActive = opt.key === value;
            return (
              <button
                key={opt.key}
                onClick={() => {
                  onChange(opt.key);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left transition-colors duration-100 cursor-pointer ${isActive ? "bg-slate-50 text-gray-900 font-medium" : "text-gray-600 hover:bg-slate-50"}`}
              >
                <Icon size={12} strokeWidth={2} />
                <DirIcon size={11} strokeWidth={2} className="text-gray-400" />
                {opt.label}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── 뷰 필터 드롭다운 ─────────────────────────────────────────────────────────
const VIEW_OPTIONS = [
  { key: "my", label: "동아리 게시물 보기", icon: LayoutGrid },
  { key: "all", label: "전체 게시물 보기", icon: Globe },
];

function ViewDropdown({ value, onChange }) {
  const { open, setOpen, ref } = useDropdown();
  const current = VIEW_OPTIONS.find((o) => o.key === value);
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors duration-150 cursor-pointer shadow-sm"
      >
        <current.icon size={13} strokeWidth={2} />
        {current.label}
        <ChevronDown
          size={13}
          strokeWidth={2}
          className={`ml-0.5 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1.5 w-44 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
          {VIEW_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isActive = opt.key === value;
            return (
              <button
                key={opt.key}
                onClick={() => {
                  onChange(opt.key);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left transition-colors duration-100 cursor-pointer ${isActive ? "bg-slate-50 text-gray-900 font-medium" : "text-gray-600 hover:bg-slate-50"}`}
              >
                <Icon size={13} strokeWidth={2} />
                {opt.label}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── 게시물 생성 모달 ─────────────────────────────────────────────────────────
const POST_TYPES = [
  { key: "GENERAL", label: "일반" },
  { key: "NOTICE", label: "공지" },
];

function CreatePostModal({ clubId, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: "",
    content: "",
    imageUrls: [""],
    postType: "GENERAL",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = "게시글 제목은 필수입니다.";
    if (!form.content.trim()) e.content = "게시글 내용은 필수입니다.";
    return e;
  }

  function setField(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    setApiError("");
  }

  function setImageUrl(idx, val) {
    setForm((f) => {
      const urls = [...f.imageUrls];
      urls[idx] = val;
      return { ...f, imageUrls: urls };
    });
  }
  function addImageUrl() {
    setForm((f) => ({ ...f, imageUrls: [...f.imageUrls, ""] }));
  }
  function removeImageUrl(idx) {
    setForm((f) => ({
      ...f,
      imageUrls: f.imageUrls.filter((_, i) => i !== idx),
    }));
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    const token = localStorage.getItem("accessToken");
    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      imageUrls: form.imageUrls.map((u) => u.trim()).filter(Boolean),
      postType: form.postType,
    };

    setLoading(true);
    setApiError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/clubs/${clubId}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        onSuccess(data.data);
      } else {
        setApiError(data.message || "게시글 작성에 실패했습니다.");
      }
    } catch {
      setApiError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">게시물 작성</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={16} strokeWidth={2} className="text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {apiError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
              <AlertCircle
                size={14}
                className="text-red-500 mt-0.5 flex-shrink-0"
                strokeWidth={2}
              />
              <p className="text-sm text-red-600">{apiError}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              게시글 유형
            </label>
            <div className="flex gap-2">
              {POST_TYPES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setField("postType", t.key)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors duration-150 cursor-pointer ${form.postType === t.key ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              제목 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="게시글 제목을 입력하세요"
              maxLength={100}
              className={`w-full text-sm px-3 py-2 rounded-lg border outline-none transition-colors ${errors.title ? "border-red-300 bg-red-50 focus:border-red-400" : "border-gray-200 focus:border-blue-400"}`}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              내용 <span className="text-red-400">*</span>
            </label>
            <textarea
              value={form.content}
              onChange={(e) => setField("content", e.target.value)}
              placeholder="게시글 내용을 입력하세요"
              rows={5}
              className={`w-full text-sm px-3 py-2 rounded-lg border outline-none transition-colors resize-none ${errors.content ? "border-red-300 bg-red-50 focus:border-red-400" : "border-gray-200 focus:border-blue-400"}`}
            />
            {errors.content && (
              <p className="mt-1 text-xs text-red-500">{errors.content}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              이미지 URL
            </label>
            <div className="space-y-2">
              {form.imageUrls.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="flex items-center gap-2 flex-1 border border-gray-200 rounded-lg px-3 py-2 focus-within:border-blue-400 transition-colors">
                    <Image
                      size={13}
                      strokeWidth={2}
                      className="text-gray-400 flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setImageUrl(idx, e.target.value)}
                      placeholder={`이미지 URL ${idx + 1}`}
                      className="flex-1 text-sm outline-none bg-transparent"
                    />
                  </div>
                  {form.imageUrls.length > 1 && (
                    <button
                      onClick={() => removeImageUrl(idx)}
                      className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer flex-shrink-0"
                    >
                      <X size={13} strokeWidth={2} className="text-gray-400" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {form.imageUrls.length < 5 && (
              <button
                onClick={addImageUrl}
                className="mt-2 flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <Plus size={12} strokeWidth={2} />
                URL 추가
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer font-medium"
          >
            {loading ? "등록 중..." : "게시물 등록"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 게시물 카드 ──────────────────────────────────────────────────────────────
function PostCard({ post, onClick }) {
  const [hovered, setHovered] = useState(false);
  // API 응답 필드에 맞게 매핑
  const imageUrl = post.imageUrls?.[0] || null;
  const likeCount = post.likeCount ?? 0;
  const commentCount = post.commentCount ?? 0;

  return (
    <div
      className="relative rounded-2xl overflow-hidden cursor-pointer aspect-square bg-slate-200"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={post.clubName}
          className="w-full h-full object-cover transition-transform duration-300"
          style={{ transform: hovered ? "scale(1.04)" : "scale(1)" }}
        />
      ) : (
        // 이미지 없을 때 fallback
        <div className="w-full h-full flex items-center justify-center bg-slate-100">
          <span className="text-xs text-slate-400 px-3 text-center line-clamp-3">
            {post.title}
          </span>
        </div>
      )}

      {/* 공지 뱃지 */}
      {post.postType === "NOTICE" && (
        <span className="absolute top-2 left-2 text-xs font-medium text-amber-700 bg-amber-50/90 border border-amber-200 rounded-full px-2 py-0.5">
          공지
        </span>
      )}

      <div
        className="absolute inset-0 flex items-center justify-center gap-4 transition-opacity duration-200"
        style={{
          background: hovered ? "rgba(0,0,0,0.45)" : "transparent",
          opacity: hovered ? 1 : 0,
        }}
      >
        <span className="flex items-center gap-1.5 text-white text-sm font-semibold drop-shadow">
          <Heart size={16} fill="white" strokeWidth={0} />
          {likeCount}
        </span>
        <span className="flex items-center gap-1.5 text-white text-sm font-semibold drop-shadow">
          <MessageCircle size={16} fill="white" strokeWidth={0} />
          {commentCount}
        </span>
      </div>
    </div>
  );
}

// ─── 정렬 함수 (프론트 정렬) ──────────────────────────────────────────────────
function sortPosts(posts, sortKey) {
  const sorted = [...posts];
  switch (sortKey) {
    case "likes_desc":
      return sorted.sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0));
    case "likes_asc":
      return sorted.sort((a, b) => (a.likeCount ?? 0) - (b.likeCount ?? 0));
    case "comments_desc":
      return sorted.sort(
        (a, b) => (b.commentCount ?? 0) - (a.commentCount ?? 0),
      );
    case "comments_asc":
      return sorted.sort(
        (a, b) => (a.commentCount ?? 0) - (b.commentCount ?? 0),
      );
    default:
      return sorted;
  }
}

// ─── 스켈레톤 그리드 ──────────────────────────────────────────────────────────
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="aspect-square rounded-2xl bg-slate-200 animate-pulse"
        />
      ))}
    </div>
  );
}

// ─── 메인 ────────────────────────────────────────────────────────────────────
export default function ClubMainPage({ clubId = 1 }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [viewMode, setViewMode] = useState("all"); // "my" | "all"  ※my 필터는 clubName 기준 프론트 필터
  const [sortKey, setSortKey] = useState("likes_desc");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // ── API 호출 ──────────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("accessToken");
    const params = new URLSearchParams({
      page: page - 1, // 백엔드가 0-based면 page-1, 1-based면 page 그대로 — 확인 후 조정
      size: POSTS_PER_PAGE,
    });

    fetch(`${API_BASE_URL}/api/posts?${params}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setPosts(data.data.content ?? []);
          setTotalPages(data.data.totalPages ?? 1);
        } else {
          setError(data.message || "게시글을 불러오지 못했습니다.");
        }
      })
      .catch(() => setError("네트워크 오류가 발생했습니다. 다시 시도해주세요."))
      .finally(() => setLoading(false));
  }, [page]);

  // ── 프론트 필터 + 정렬 ────────────────────────────────────────────────────
  // "my" 모드: clubId로 연결된 clubName 필터링 — 지금은 전체만 내려오므로 일단 pass
  const filteredPosts = sortPosts(posts, sortKey);

  function handleViewChange(mode) {
    setViewMode(mode);
    setPage(1);
  }
  function handleSortChange(key) {
    setSortKey(key);
    setPage(1);
  }

  function handlePostSuccess(newPost) {
    setShowModal(false);
    // 목록 첫 페이지로 돌아가서 새 게시글 반영
    if (page === 1) {
      setPosts((prev) => [newPost, ...prev].slice(0, POSTS_PER_PAGE));
    } else {
      setPage(1);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900">동아리 게시판</h1>
          <p className="text-sm text-gray-500 mt-1">
            동아리 활동 내역을 기록하고 추억하세요
          </p>
        </div>

        {/* 필터 바 */}
        <div className="flex items-center gap-2 mb-4">
          <ViewDropdown value={viewMode} onChange={handleViewChange} />
          <SortDropdown value={sortKey} onChange={handleSortChange} />
          <button
            onClick={() => setShowModal(true)}
            className="ml-auto flex items-center gap-1.5 text-sm text-white bg-blue-500 hover:bg-blue-600 active:scale-95 rounded-lg px-3 py-1.5 transition-all duration-150 cursor-pointer shadow-sm font-medium"
          >
            <Plus size={14} strokeWidth={2.5} />
            게시물 작성
          </button>
        </div>

        {/* 로딩 */}
        {loading && <SkeletonGrid />}

        {/* 에러 */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <AlertCircle size={24} className="text-red-300" strokeWidth={1.5} />
            <p className="text-sm text-gray-400">{error}</p>
            <button
              onClick={() => setPage((p) => p)} // 동일 page로 재요청 트리거
              className="text-xs text-blue-500 hover:text-blue-700 transition-colors cursor-pointer"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 그리드 */}
        {!loading &&
          !error &&
          (filteredPosts.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.postId}
                  post={post}
                  onClick={() => navigate(`/club/${post.postId}`)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <p className="text-sm">게시물이 없습니다</p>
            </div>
          ))}

        {/* 페이지네이션 */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer"
            >
              <ChevronLeft
                size={18}
                strokeWidth={2}
                className="text-gray-600"
              />
            </button>
            <span className="text-sm font-medium text-gray-600 w-12 text-center">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer"
            >
              <ChevronRight
                size={18}
                strokeWidth={2}
                className="text-gray-600"
              />
            </button>
          </div>
        )}
      </main>

      {showModal && (
        <CreatePostModal
          clubId={clubId}
          onClose={() => setShowModal(false)}
          onSuccess={handlePostSuccess}
        />
      )}
    </div>
  );
}
