import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from "lucide-react";

// ─── 더미 데이터 (8개) ────────────────────────────────────────────────────────
const DUMMY_POSTS = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80",
    likes: 16,
    comments: 4,
    club: "멋쟁이사자처럼",
    content: `😎 LikeLion SKHU 13기 서류 마감 D-7! 😎\n안녕하세요 성공회대학교 멋쟁이사자처럼입니다 🦁\n서류 마감까지 7일 남았습니다!\n아직 고민 중이셨다면 지금이 바로 지원할 타이밍입니다!\n개발이 처음이어도 괜찮아요!\n기초부터 차근차근 배우며 함께 성장할 수 있도록 운영진이 옆에서 도와드립니다~!\n멋쟁이사자처럼에서는 탄탄한 개발 학습은 물론 다양한 협업 경험과 즐거운 친목 활동까지 함께할 수 있습니다!\n운영진이 직접 준비한 체계적인 커리큘럼과 중앙에서 진행되는 아이디어톤 & 해커톤을 통해 여러분의 아이디어를 실제 서비스로 만들어보세요\n"내 아이디어를, 내 손으로 구현한다!"\n✅ 스터디 자료 제공\n✅ 아이디어톤 및 해커톤을 통한 협업 & 실전 개발 경험`,
    author: "현",
    authorColor: "#22c55e",
    createdAt: "2025-04-01",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    likes: 24,
    comments: 8,
    club: "디자인러버",
    content:
      "디자인러버 봄 학기 신입 부원 모집! 🎨\nFigma, Adobe XD 등 다양한 툴을 함께 배워요.\n포트폴리오 제작부터 실무 경험까지, 같이 성장해요!",
    author: "지",
    authorColor: "#6366f1",
    createdAt: "2025-04-03",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
    likes: 9,
    comments: 2,
    club: "코딩왕",
    content:
      "2026 스타트업 해커톤 출전 후기 🏆\n3박 4일간의 여정, 정말 값진 경험이었습니다.\n팀원들과 함께 밤새워 만든 결과물, 자랑스럽네요!",
    author: "민",
    authorColor: "#f59e0b",
    createdAt: "2025-04-05",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80",
    likes: 31,
    comments: 12,
    club: "디자인러버",
    content:
      "UI/UX 스터디 6주차 회고록 📝\n이번 주는 사용자 리서치와 페르소나 설정을 다뤘어요.\n다들 너무 열심히 해줘서 뿌듯합니다 :)",
    author: "수",
    authorColor: "#ec4899",
    createdAt: "2025-04-07",
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80",
    likes: 5,
    comments: 1,
    club: "간지툰",
    content:
      "간지툰 웹툰 공모전 준비 시작! 🖊️\n이번 학기 목표는 외부 공모전 수상입니다.\n스토리 작가, 그림 작가 함께 모여요!",
    author: "태",
    authorColor: "#14b8a6",
    createdAt: "2025-04-08",
  },
  {
    id: 6,
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
    likes: 18,
    comments: 6,
    club: "봉사단",
    content:
      "봄 학기 봉사활동 모집 🌱\n지역 아동센터에서 함께 봉사할 분들을 찾습니다.\n따뜻한 마음 하나면 충분해요!",
    author: "아",
    authorColor: "#f97316",
    createdAt: "2025-04-09",
  },
  {
    id: 7,
    image:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&q=80",
    likes: 42,
    comments: 15,
    club: "뮤직클럽",
    content:
      "뮤직클럽 봄 정기 공연 📸\n정말 감동적인 무대였습니다. 와주신 분들 감사해요!\n다음 공연도 기대해 주세요 🎵",
    author: "나",
    authorColor: "#8b5cf6",
    createdAt: "2025-04-10",
  },
  {
    id: 8,
    image:
      "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&q=80",
    likes: 13,
    comments: 3,
    club: "코딩왕",
    content:
      "알고리즘 스터디 모집 💻\n매주 토요일 오전 10시, 백준 문제 함께 풀어요.\n실력 무관 누구나 환영합니다!",
    author: "현",
    authorColor: "#22c55e",
    createdAt: "2025-04-11",
  },
];

const POSTS_PER_PAGE = 6;

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

      {/* 호버 오버레이 */}
      <div
        className="absolute inset-0 flex items-end justify-end p-3 gap-2 transition-opacity duration-200"
        style={{
          background: hovered ? "rgba(0,0,0,0.45)" : "transparent",
          opacity: hovered ? 1 : 0,
        }}
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-white text-sm font-medium drop-shadow">
            <Heart size={15} fill="white" strokeWidth={0} />
            {post.likes}
          </span>
          <span className="flex items-center gap-1 text-white text-sm font-medium drop-shadow">
            <MessageCircle size={15} fill="white" strokeWidth={0} />
            {post.comments}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── 메인 게시판 페이지 ───────────────────────────────────────────────────────
export default function ClubMainPage() {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const totalPages = Math.ceil(DUMMY_POSTS.length / POSTS_PER_PAGE);
  const pagePosts = DUMMY_POSTS.slice(
    (page - 1) * POSTS_PER_PAGE,
    page * POSTS_PER_PAGE,
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* 헤더 텍스트 */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900">동아리 게시판</h1>
          <p className="text-sm text-gray-500 mt-1">
            동아리 활동 내역을 기록하고 추억하세요
          </p>
        </div>

        {/* 정렬 버튼 */}
        <div className="mb-4">
          <button className="flex items-center gap-1.5 text-sm text-gray-600 bg-white border border-gray-100 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors duration-150 cursor-pointer shadow-sm">
            <ArrowUpDown size={13} strokeWidth={2} />
            좋아요순
          </button>
        </div>

        {/* 이미지 그리드 */}
        <div className="grid grid-cols-3 gap-2">
          {pagePosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onClick={() => navigate(`/club/${post.id}`)}
            />
          ))}
        </div>

        {/* 페이지네이션 */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer"
          >
            <ChevronLeft size={18} strokeWidth={2} className="text-gray-600" />
          </button>

          <span className="text-sm font-medium text-gray-600 w-12 text-center">
            {page} / {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer"
          >
            <ChevronRight size={18} strokeWidth={2} className="text-gray-600" />
          </button>
        </div>
      </main>
    </div>
  );
}
