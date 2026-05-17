import { useState } from "react";
import { Search, Plus } from "lucide-react";

const CLUB_POSTS = [
  {
    id: 1,
    title: "11/21일 간지툰 디자이너/프론트엔드 협업 모집해요~",
    tags: ["간지툰"],
    deadline: "마감: 10/15",
    dday: "D-5",
    description: "2학기때 간지툰 열린대어 같이 나갈실분",
    club: "맛사",
  },
  {
    id: 2,
    title: "해커톤 백엔드 개발자 구합니다!",
    tags: ["2026 스타트업 해커톤"],
    deadline: "마감: 04/20",
    dday: "D-8",
    description: "Node.js, Express 경험자 우대. 열정있는 분 환영합니다.",
    club: "코딩왕",
  },
  {
    id: 3,
    title: "UX/UI 디자이너 모집 (앱 디자인 프로젝트)",
    tags: ["캡스톤 디자인"],
    deadline: "마감: 04/25",
    dday: "D-13",
    description: "Figma 사용 가능하신 분, 협업 경험 있으면 좋아요",
    club: "디자인러버",
  },
  {
    id: 4,
    title: "UX/UI 디자이너 모집 (앱 디자인 프로젝트)",
    tags: ["캡스톤 디자인"],
    deadline: "마감: 04/25",
    dday: "D-13",
    description: "Figma 사용 가능하신 분, 협업 경험 있으면 좋아요",
    club: "디자인러버",
  },
];

const PROJECT_POSTS = [
  {
    id: 1,
    title: "AI 스타트업 프론트엔드 개발자 모집",
    description:
      "React, TypeScript 사용 가능하신 분을 찾습니다. 스타트업 경험 우대합니다.",
    deadline: "~ 04/18",
    dday: "D-6",
  },
  {
    id: 2,
    title: "게임 개발 팀원 모집 (Unity)",
    description: "Unity, C# 경험자. 3D 모델링 가능하신 분 환영",
    deadline: "~ 04/22",
    dday: "D-10",
  },
  {
    id: 3,
    title: "데이터 분석 프로젝트 팀원 구해요",
    description: "Python, pandas 다룰 줄 아는 분. 통계학 전공자 우대",
    deadline: "~ 04/28",
    dday: "D-16",
  },
  {
    id: 4,
    title: "모바일 앱 UI/UX 디자이너 모집",
    description:
      "Figma 능숙자. 모바일 디자인 경험 필수. 포트폴리오 제출 필수입니다.",
    deadline: "~ 05/05",
    dday: "D-23",
  },
];

function getDdayClass(dday) {
  const n = parseInt(dday.replace("D-", ""));
  if (n <= 7) return "bg-yellow-100 text-yellow-700";
  if (n <= 14) return "bg-cyan-100 text-cyan-700";
  return "bg-green-100 text-green-700";
}

function ClubPostCard({ post }) {
  return (
    <div className="bg-white rounded-2xl px-6 py-5 shadow-sm flex flex-col gap-2">
      <div className="flex justify-between items-start gap-3">
        <span className="font-semibold text-sm text-gray-900 leading-snug flex-1">
          {post.title}
        </span>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${getDdayClass(post.dday)}`}
          >
            {post.dday}
          </span>
          <span className="text-xs text-gray-400">{post.club}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="bg-indigo-50 text-indigo-600 text-xs font-medium px-2.5 py-0.5 rounded-full"
          >
            {tag}
          </span>
        ))}
        <span className="text-xs text-gray-400">{post.deadline}</span>
      </div>

      <p className="text-xs text-gray-500">{post.description}</p>
    </div>
  );
}

function ProjectPostCard({ post }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-2.5">
      <span
        className={`text-xs font-bold px-2.5 py-0.5 rounded-full self-start ${getDdayClass(post.dday)}`}
      >
        {post.dday}
      </span>

      <p className="font-bold text-sm text-gray-900 leading-snug">
        {post.title}
      </p>

      <p className="text-xs text-gray-500 flex-1">{post.description}</p>

      <p className="text-xs text-gray-400">{post.deadline}</p>

      <button className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors duration-150 cursor-pointer">
        지원하기
      </button>
    </div>
  );
}

export default function CooperationPage() {
  const [tab, setTab] = useState("club");
  const [search, setSearch] = useState("");

  const isClub = tab === "club";

  const filteredClub = CLUB_POSTS.filter(
    (p) =>
      !search || p.title.includes(search) || p.description.includes(search),
  );
  const filteredProject = PROJECT_POSTS.filter(
    (p) =>
      !search || p.title.includes(search) || p.description.includes(search),
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 flex flex-col gap-5">
        {/* 탭 */}
        <div className="grid grid-cols-2 bg-slate-200 rounded-full p-1 gap-1">
          <button
            onClick={() => setTab("club")}
            className={[
              "rounded-full py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer",
              isClub
                ? "bg-green-500 text-white shadow"
                : "text-gray-500 hover:text-gray-700",
            ].join(" ")}
          >
            동아리 협업모집
          </button>
          <button
            onClick={() => setTab("project")}
            className={[
              "rounded-full py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer",
              !isClub
                ? "bg-indigo-600 text-white shadow"
                : "text-gray-500 hover:text-gray-700",
            ].join(" ")}
          >
            프로젝트 팀원 모집
          </button>
        </div>

        {/* 검색창 */}
        <div className="flex items-center bg-white rounded-xl px-4 py-2.5 gap-2.5 shadow-sm">
          <input
            type="text"
            placeholder="검색어를 입력하세요..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
          />
          <Search size={17} className="text-gray-400 shrink-0" />
        </div>

        {/* 카드 목록 */}
        {isClub ? (
          <div className="flex flex-col gap-3">
            {filteredClub.map((post) => (
              <ClubPostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredProject.map((post) => (
              <ProjectPostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {/* CTA 버튼 */}
        <div className="flex justify-center mt-2">
          <button
            className={[
              "flex items-center gap-2 px-12 py-3.5 rounded-full text-white font-bold text-sm shadow-lg hover:opacity-90 transition-opacity duration-150 cursor-pointer",
              isClub ? "bg-green-500" : "bg-indigo-600",
            ].join(" ")}
          >
            <Plus size={18} strokeWidth={2.5} />
            {isClub ? "새 협업 모집하기" : "새 팀원 모집하기"}
          </button>
        </div>
      </main>
    </div>
  );
}
