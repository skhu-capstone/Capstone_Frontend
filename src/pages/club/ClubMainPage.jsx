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
} from "lucide-react";

const DUMMY_POSTS = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80",
    likes: 16,
    comments: 4,
    club: "멋쟁이사자처럼",
    content: `😎 LikeLion SKHU 13기 서류 마감 D-7!`,
    author: "현",
    authorColor: "#22c55e",
    createdAt: "2025-04-01",
    myClub: true,
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    likes: 24,
    comments: 8,
    club: "디자인러버",
    content: "디자인러버 봄 학기 신입 부원 모집! 🎨",
    author: "지",
    authorColor: "#6366f1",
    createdAt: "2025-04-03",
    myClub: false,
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
    likes: 9,
    comments: 2,
    club: "코딩왕",
    content: "2026 스타트업 해커톤 출전 후기 🏆",
    author: "민",
    authorColor: "#f59e0b",
    createdAt: "2025-04-05",
    myClub: true,
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80",
    likes: 31,
    comments: 12,
    club: "디자인러버",
    content: "UI/UX 스터디 6주차 회고록 📝",
    author: "수",
    authorColor: "#ec4899",
    createdAt: "2025-04-07",
    myClub: false,
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80",
    likes: 5,
    comments: 1,
    club: "간지툰",
    content: "간지툰 웹툰 공모전 준비 시작! 🖊️",
    author: "태",
    authorColor: "#14b8a6",
    createdAt: "2025-04-08",
    myClub: false,
  },
  {
    id: 6,
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
    likes: 18,
    comments: 6,
    club: "봉사단",
    content: "봄 학기 봉사활동 모집 🌱",
    author: "아",
    authorColor: "#f97316",
    createdAt: "2025-04-09",
    myClub: false,
  },
  {
    id: 7,
    image:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&q=80",
    likes: 42,
    comments: 15,
    club: "뮤직클럽",
    content: "뮤직클럽 봄 정기 공연 📸",
    author: "나",
    authorColor: "#8b5cf6",
    createdAt: "2025-04-10",
    myClub: false,
  },
  {
    id: 8,
    image:
      "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&q=80",
    likes: 13,
    comments: 3,
    club: "코딩왕",
    content: "알고리즘 스터디 모집 💻",
    author: "현",
    authorColor: "#22c55e",
    createdAt: "2025-04-11",
    myClub: true,
  },
];

const POSTS_PER_PAGE = 6;

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

function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = SORT_OPTIONS.find((o) => o.key === value) ?? SORT_OPTIONS[0];

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left transition-colors duration-100 cursor-pointer
                  ${isActive ? "bg-slate-50 text-gray-900 font-medium" : "text-gray-600 hover:bg-slate-50"}`}
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
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = VIEW_OPTIONS.find((o) => o.key === value);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left transition-colors duration-100 cursor-pointer
                  ${isActive ? "bg-slate-50 text-gray-900 font-medium" : "text-gray-600 hover:bg-slate-50"}`}
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

// ─── 게시물 카드 ──────────────────────────────────────────────────────────────
function PostCard({ post, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative rounded-2xl overflow-hidden cursor-pointer aspect-square bg-slate-200"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={post.image}
        alt={post.club}
        className="w-full h-full object-cover transition-transform duration-300"
        style={{ transform: hovered ? "scale(1.04)" : "scale(1)" }}
      />

      {/* 호버 오버레이 — 좋아요·댓글 가운데 정렬 */}
      <div
        className="absolute inset-0 flex items-center justify-center gap-4 transition-opacity duration-200"
        style={{
          background: hovered ? "rgba(0,0,0,0.45)" : "transparent",
          opacity: hovered ? 1 : 0,
        }}
      >
        <span className="flex items-center gap-1.5 text-white text-sm font-semibold drop-shadow">
          <Heart size={16} fill="white" strokeWidth={0} />
          {post.likes}
        </span>
        <span className="flex items-center gap-1.5 text-white text-sm font-semibold drop-shadow">
          <MessageCircle size={16} fill="white" strokeWidth={0} />
          {post.comments}
        </span>
      </div>
    </div>
  );
}

// ─── 정렬 함수 ────────────────────────────────────────────────────────────────
function sortPosts(posts, sortKey) {
  const sorted = [...posts];
  switch (sortKey) {
    case "likes_desc":
      return sorted.sort((a, b) => b.likes - a.likes);
    case "likes_asc":
      return sorted.sort((a, b) => a.likes - b.likes);
    case "comments_desc":
      return sorted.sort((a, b) => b.comments - a.comments);
    case "comments_asc":
      return sorted.sort((a, b) => a.comments - b.comments);
    default:
      return sorted;
  }
}

// ─── 메인 게시판 페이지 ───────────────────────────────────────────────────────
export default function ClubMainPage() {
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("my");
  const [sortKey, setSortKey] = useState("likes_desc");
  const navigate = useNavigate();

  const basePosts =
    viewMode === "my" ? DUMMY_POSTS.filter((p) => p.myClub) : DUMMY_POSTS;
  const filteredPosts = sortPosts(basePosts, sortKey);
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const pagePosts = filteredPosts.slice(
    (page - 1) * POSTS_PER_PAGE,
    page * POSTS_PER_PAGE,
  );

  function handleViewChange(mode) {
    setViewMode(mode);
    setPage(1);
  }
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

        {/* 뷰 드롭다운 먼저, 정렬 드롭다운 다음 */}
        <div className="flex items-center gap-2 mb-4">
          <ViewDropdown value={viewMode} onChange={handleViewChange} />
          <SortDropdown value={sortKey} onChange={handleSortChange} />
        </div>

        {pagePosts.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {pagePosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onClick={() => navigate(`/club/${post.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-sm">게시물이 없습니다</p>
          </div>
        )}

        {totalPages > 1 && (
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
