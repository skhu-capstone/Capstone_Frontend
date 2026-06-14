import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ChevronDown,
  ArrowUp,
  ArrowDown,
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

// ─── 게시물 카드 ──────────────────────────────────────────────────────────────
function PostCard({ post, onClick }) {
  const [hovered, setHovered] = useState(false);
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
        <div className="w-full h-full flex items-center justify-center bg-slate-100">
          <span className="text-xs text-slate-400 px-3 text-center line-clamp-3">
            {post.title}
          </span>
        </div>
      )}

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

export default function ClubPostPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortKey, setSortKey] = useState("likes_desc");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("accessToken");
    const params = new URLSearchParams({
      page: page - 1,
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

  const filteredPosts = sortPosts(posts, sortKey);

  function handleSortChange(key) {
    setSortKey(key);
    setPage(1);
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

        <div className="flex items-center gap-2 mb-4">
          <SortDropdown value={sortKey} onChange={handleSortChange} />
        </div>

        {loading && <SkeletonGrid />}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <AlertCircle size={24} className="text-red-300" strokeWidth={1.5} />
            <p className="text-sm text-gray-400">{error}</p>
            <button
              onClick={() => setPage((p) => p)}
              className="text-xs text-blue-500 hover:text-blue-700 transition-colors cursor-pointer"
            >
              다시 시도
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          (filteredPosts.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.postId}
                  post={post}
                  onClick={() => navigate(`/club/posts/${post.postId}`)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <p className="text-sm">게시물이 없습니다</p>
            </div>
          ))}

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
    </div>
  );
}
