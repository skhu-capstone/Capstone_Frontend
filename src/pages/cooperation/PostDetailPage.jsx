import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// ─── 동아리 협업모집 더미 데이터 ─────────────────────────────────────────────
const CLUB_POSTS = [
  {
    id: 1,
    title: "11/21일 간지툰 디자이너/프론트엔드 협업 모집해요~",
    dday: "D-5",
    club: "맛사",
    date: "미정",
    content: "2학기때 간지툰 열린대어 같이 나갈실분",
    deadline: "10/15",
    image: null,
  },
  {
    id: 2,
    title: "해커톤 백엔드 개발자 구합니다!",
    dday: "D-8",
    club: "코딩왕",
    date: "04/20",
    content: "Node.js, Express 경험자 우대. 열정있는 분 환영합니다.",
    deadline: "04/20",
    image: null,
  },
  {
    id: 3,
    title: "UX/UI 디자이너 모집 (앱 디자인 프로젝트)",
    dday: "D-13",
    club: "디자인러버",
    date: "미정",
    content: "Figma 사용 가능하신 분, 협업 경험 있으면 좋아요",
    deadline: "04/25",
    image: null,
  },
  {
    id: 4,
    title: "UX/UI 디자이너 모집 (앱 디자인 프로젝트)",
    dday: "D-13",
    club: "디자인러버",
    date: "미정",
    content: "Figma 사용 가능하신 분, 협업 경험 있으면 좋아요",
    deadline: "04/25",
    image: null,
  },
];

// ─── 프로젝트 팀원모집 더미 데이터 ───────────────────────────────────────────
const PROJECT_POSTS = [
  {
    id: 1,
    title: "AI 스타트업 프론트엔드 개발자 모집",
    dday: "D-6",
    field: "백엔드",
    members: "프론트엔드 3, 백엔드 2, 기획 1",
    content:
      "포풀용으로 제대로된 기획부터 개발까지 함께 프로젝트 해보실 분 구합니다.",
    deadline: "04/18",
    image: null,
  },
  {
    id: 2,
    title: "게임 개발 팀원 모집 (Unity)",
    dday: "D-10",
    field: "게임 개발",
    members: "Unity 개발자 2, 3D 모델러 1",
    content: "Unity, C# 경험자. 3D 모델링 가능하신 분 환영",
    deadline: "04/22",
    image: null,
  },
  {
    id: 3,
    title: "데이터 분석 프로젝트 팀원 구해요",
    dday: "D-16",
    field: "데이터 분석",
    members: "데이터 분석가 2, 통계학 전공자 1",
    content: "Python, pandas 다룰 줄 아는 분. 통계학 전공자 우대",
    deadline: "04/28",
    image: null,
  },
  {
    id: 4,
    title: "모바일 앱 UI/UX 디자이너 모집",
    dday: "D-23",
    field: "디자인",
    members: "UI/UX 디자이너 1",
    content:
      "Figma 능숙자. 모바일 디자인 경험 필수. 포트폴리오 제출 필수입니다.",
    deadline: "05/05",
    image: null,
  },
];

function getDdayClass(dday) {
  const n = parseInt(dday.replace("D-", ""));
  if (n <= 7) return "bg-green-100 text-green-700";
  if (n <= 14) return "bg-cyan-100 text-cyan-700";
  return "bg-blue-100 text-blue-700";
}

// ─── 공통 상세 레이아웃 ───────────────────────────────────────────────────────
function DetailLayout({ dday, clubLabel, buttonColor, fields, title, onBack }) {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* 상단 바 */}
      <div className="w-full bg-slate-200 flex items-center justify-between px-4 h-12">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-300 transition-colors duration-150 cursor-pointer"
            aria-label="뒤로가기"
          >
            <ArrowLeft size={18} strokeWidth={2} className="text-gray-600" />
          </button>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full ${getDdayClass(dday)}`}
          >
            {dday}
          </span>
        </div>

        <span className="text-sm font-medium text-gray-600 pr-1">
          {clubLabel}
        </span>
      </div>

      {/* 본문 */}
      <main className="flex-1 flex items-start justify-center px-4 pt-16 pb-8">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* 이미지 영역 */}
          <div
            className="w-full bg-slate-100 flex items-center justify-center"
            style={{ height: 300 }}
          >
            <span className="text-sm text-gray-400">이미지 영역</span>
          </div>

          {/* 정보 영역 */}
          <div className="px-6 py-6 flex flex-col gap-4">
            {/* 제목 */}
            <h1 className="text-lg font-bold text-gray-900 leading-snug">
              {title}
            </h1>

            {/* 상세 필드 */}
            <div className="flex flex-col gap-2">
              {fields.map(({ label, value }) => (
                <div key={label} className="flex gap-4">
                  <span className="text-sm text-gray-400 w-20 shrink-0">
                    {label}
                  </span>
                  <span className="text-sm text-gray-800">{value}</span>
                </div>
              ))}
            </div>

            {/* 문의하기 버튼 */}
            <button
              className={`w-full mt-2 py-3 rounded-xl text-white text-sm font-semibold transition-opacity duration-150 hover:opacity-90 cursor-pointer ${buttonColor}`}
            >
              문의하기
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── 동아리 협업모집 상세 ─────────────────────────────────────────────────────
function ClubPostDetail({ id, onBack }) {
  const post = CLUB_POSTS.find((p) => p.id === Number(id));
  if (!post)
    return (
      <div className="p-8 text-center text-gray-400">
        게시글을 찾을 수 없어요.
      </div>
    );

  const fields = [
    { label: "대회명:", value: post.club },
    { label: "대회날짜:", value: post.date },
    { label: "내용:", value: post.content },
    { label: "마감일:", value: post.deadline },
  ];

  return (
    <DetailLayout
      dday={post.dday}
      clubLabel={post.club}
      buttonColor="bg-green-500 hover:bg-green-600"
      fields={fields}
      title={post.title}
      onBack={onBack}
    />
  );
}

// ─── 프로젝트 팀원모집 상세 ───────────────────────────────────────────────────
function ProjectPostDetail({ id, onBack }) {
  const post = PROJECT_POSTS.find((p) => p.id === Number(id));
  if (!post)
    return (
      <div className="p-8 text-center text-gray-400">
        게시글을 찾을 수 없어요.
      </div>
    );

  const fields = [
    { label: "직성자 분야:", value: post.field },
    { label: "모집 구성:", value: post.members },
    { label: "내용:", value: post.content },
    { label: "마감일:", value: post.deadline },
  ];

  return (
    <DetailLayout
      dday={post.dday}
      clubLabel={post.field}
      buttonColor="bg-indigo-600 hover:bg-indigo-700"
      fields={fields}
      title={post.title}
      onBack={onBack}
    />
  );
}

// ─── 메인 export: 라우트 파라미터로 타입 구분 ────────────────────────────────
// 라우터: /cooperation/club/:id  /  /cooperation/project/:id
export default function PostDetailPage() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // 이전 히스토리가 있으면 뒤로, 없으면 협업/모집 페이지로
    if (location.key !== "default") {
      navigate(-1);
    } else {
      navigate("/cooperation");
    }
  };

  if (type === "club") {
    return <ClubPostDetail id={id} onBack={handleBack} />;
  }
  if (type === "project") {
    return <ProjectPostDetail id={id} onBack={handleBack} />;
  }

  return (
    <div className="p-8 text-center text-gray-400">잘못된 접근입니다.</div>
  );
}
