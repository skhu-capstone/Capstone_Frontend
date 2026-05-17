import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Heart, MessageCircle } from "lucide-react";

// ─── 더미 데이터 (ClubMainPage와 동일하게 유지) ──────────────────────────────
const DUMMY_POSTS = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
    likes: 16,
    comments: 4,
    club: "멋쟁이사자처럼",
    content: `😎 LikeLion SKHU 13기 서류 마감 D-7! 😎\n안녕하세요 성공회대학교 멋쟁이사자처럼입니다 🦁\n서류 마감까지 7일 남았습니다!\n아직 고민 중이셨다면 지금이 바로 지원할 타이밍입니다!\n개발이 처음이어도 괜찮아요!\n기초부터 차근차근 배우며 함께 성장할 수 있도록 운영진이 옆에서 도와드립니다~!\n멋쟁이사자처럼에서는 탄탄한 개발 학습은 물론 다양한 협업 경험과 즐거운 친목 활동까지 함께할 수 있습니다!\n운영진이 직접 준비한 체계적인 커리큘럼과 중앙에서 진행되는 아이디어톤 & 해커톤을 통해 여러분의 아이디어를 실제 서비스로 만들어보세요\n"내 아이디어를, 내 손으로 구현한다!"\n✅ 스터디 자료 제공\n✅ 아이디어톤 및 해커톤을 통한 협업 & 실전 개발 경험`,
    author: "현",
    authorColor: "#22c55e",
    createdAt: "2025-04-01",
    dummyComments: [],
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    likes: 24,
    comments: 8,
    club: "디자인러버",
    content:
      "디자인러버 봄 학기 신입 부원 모집! 🎨\nFigma, Adobe XD 등 다양한 툴을 함께 배워요.\n포트폴리오 제작부터 실무 경험까지, 같이 성장해요!",
    author: "지",
    authorColor: "#6366f1",
    createdAt: "2025-04-03",
    dummyComments: [],
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    likes: 9,
    comments: 2,
    club: "코딩왕",
    content:
      "2026 스타트업 해커톤 출전 후기 🏆\n3박 4일간의 여정, 정말 값진 경험이었습니다.\n팀원들과 함께 밤새워 만든 결과물, 자랑스럽네요!",
    author: "민",
    authorColor: "#f59e0b",
    createdAt: "2025-04-05",
    dummyComments: [],
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
    likes: 31,
    comments: 12,
    club: "디자인러버",
    content:
      "UI/UX 스터디 6주차 회고록 📝\n이번 주는 사용자 리서치와 페르소나 설정을 다뤘어요.\n다들 너무 열심히 해줘서 뿌듯합니다 :)",
    author: "수",
    authorColor: "#ec4899",
    createdAt: "2025-04-07",
    dummyComments: [],
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
    likes: 5,
    comments: 1,
    club: "간지툰",
    content:
      "간지툰 웹툰 공모전 준비 시작! 🖊️\n이번 학기 목표는 외부 공모전 수상입니다.\n스토리 작가, 그림 작가 함께 모여요!",
    author: "태",
    authorColor: "#14b8a6",
    createdAt: "2025-04-08",
    dummyComments: [],
  },
  {
    id: 6,
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
    likes: 18,
    comments: 6,
    club: "봉사단",
    content:
      "봄 학기 봉사활동 모집 🌱\n지역 아동센터에서 함께 봉사할 분들을 찾습니다.\n따뜻한 마음 하나면 충분해요!",
    author: "아",
    authorColor: "#f97316",
    createdAt: "2025-04-09",
    dummyComments: [],
  },
  {
    id: 7,
    image:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80",
    likes: 42,
    comments: 15,
    club: "뮤직클럽",
    content:
      "뮤직클럽 봄 정기 공연 📸\n정말 감동적인 무대였습니다. 와주신 분들 감사해요!\n다음 공연도 기대해 주세요 🎵",
    author: "나",
    authorColor: "#8b5cf6",
    createdAt: "2025-04-10",
    dummyComments: [],
  },
  {
    id: 8,
    image:
      "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80",
    likes: 13,
    comments: 3,
    club: "코딩왕",
    content:
      "알고리즘 스터디 모집 💻\n매주 토요일 오전 10시, 백준 문제 함께 풀어요.\n실력 무관 누구나 환영합니다!",
    author: "현",
    authorColor: "#22c55e",
    createdAt: "2025-04-11",
    dummyComments: [],
  },
];

export default function ClubPostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const post = DUMMY_POSTS.find((p) => p.id === Number(id));

  const handleBack = () => {
    if (location.key !== "default") navigate(-1);
    else navigate("/club");
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">게시글을 찾을 수 없어요.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-0">
        {/* 이미지 */}
        <div className="w-full rounded-2xl overflow-hidden bg-slate-200">
          <img
            src={post.image}
            alt={post.club}
            className="w-full object-cover"
            style={{ maxHeight: 420 }}
          />
        </div>

        {/* 본문 카드 */}
        <div className="bg-white rounded-2xl shadow-sm px-6 py-5 flex flex-col gap-4 mt-3">
          {/* 좋아요 / 댓글 수 */}
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-sm text-gray-500">
              <Heart size={16} strokeWidth={1.8} className="text-gray-400" />
              {post.likes}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-gray-500">
              <MessageCircle
                size={16}
                strokeWidth={1.8}
                className="text-gray-400"
              />
              {post.comments}
            </span>
          </div>

          {/* 본문 텍스트 */}
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
            {post.content}
          </p>
        </div>

        {/* 댓글 영역 */}
        <div className="bg-white rounded-2xl shadow-sm px-6 py-5 mt-2 flex flex-col gap-4">
          <p className="text-sm font-semibold text-gray-700">댓글</p>

          {/* 댓글 없을 때 */}
          {post.dummyComments.length === 0 && (
            <p className="text-sm text-gray-400">
              아직 댓글이 없어요. 첫 댓글을 남겨보세요!
            </p>
          )}

          {/* 댓글 목록 */}
          {post.dummyComments.length > 0 && (
            <div className="flex flex-col gap-3">
              {post.dummyComments.map((c, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: c.color }}
                  >
                    {c.author}
                  </div>
                  <p className="text-sm text-gray-700 pt-0.5">{c.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* 댓글 입력창 */}
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5">
            <input
              type="text"
              placeholder="댓글을 입력하세요..."
              className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
            />
            <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors duration-150 cursor-pointer shrink-0">
              등록
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
