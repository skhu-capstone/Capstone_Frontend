import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  X,
  Image,
  AlertCircle,
  CalendarDays,
  Users,
  FileText,
  Link,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

function ClubPostCard({ post, onClick }) {
  return (
    <div
      className="bg-white rounded-2xl px-6 py-5 shadow-sm flex flex-col gap-2 cursor-pointer hover:shadow-md transition-shadow duration-150"
      onClick={onClick}
    >
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

function ProjectPostCard({ post, onClick }) {
  return (
    <div
      className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-2.5 cursor-pointer hover:shadow-md transition-shadow duration-150"
      onClick={onClick}
    >
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
      <button
        className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors duration-150 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        지원하기
      </button>
    </div>
  );
}

// ─── 팀원 모집 모달 ───────────────────────────────────────────────────────────
function CreateProjectModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: "",
    imageUrl: "",
    positions: "",
    content: "",
    deadline: "",
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

  function setField(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    setApiError("");
  }

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = "제목을 입력해주세요.";
    if (!form.positions.trim()) e.positions = "모집 포지션을 입력해주세요.";
    if (!form.content.trim()) e.content = "내용을 입력해주세요.";
    if (!form.deadline) e.deadline = "마감일을 선택해주세요.";
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    const payload = {
      title: form.title.trim(),
      imageUrl: form.imageUrl.trim() || undefined,
      positions: form.positions.trim(),
      content: form.content.trim(),
      deadline: form.deadline,
    };

    setLoading(true);
    setApiError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/project-recruitments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        onSuccess(data.data);
      } else {
        setApiError(data.message || "등록에 실패했습니다.");
      }
    } catch {
      setApiError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  // 오늘 날짜 (deadline min값)
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              새 팀원 모집하기
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              프로젝트 팀원을 모집해보세요
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={16} strokeWidth={2} className="text-gray-500" />
          </button>
        </div>

        {/* 바디 */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {/* API 에러 */}
          {apiError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
              <AlertCircle
                size={14}
                className="text-red-500 mt-0.5 shrink-0"
                strokeWidth={2}
              />
              <p className="text-sm text-red-600">{apiError}</p>
            </div>
          )}

          {/* 제목 */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
              <FileText size={12} strokeWidth={2} />
              제목 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="예) 포폴용 앱 프로젝트 같이하실분"
              maxLength={100}
              className={`w-full text-sm px-3 py-2 rounded-lg border outline-none transition-colors
                ${errors.title ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-indigo-400"}`}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title}</p>
            )}
          </div>

          {/* 모집 포지션 */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
              <Users size={12} strokeWidth={2} />
              모집 포지션 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.positions}
              onChange={(e) => setField("positions", e.target.value)}
              placeholder="예) 프론트 2명, 백엔드 1명"
              className={`w-full text-sm px-3 py-2 rounded-lg border outline-none transition-colors
                ${errors.positions ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-indigo-400"}`}
            />
            {errors.positions && (
              <p className="mt-1 text-xs text-red-500">{errors.positions}</p>
            )}
          </div>

          {/* 마감일 */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
              <CalendarDays size={12} strokeWidth={2} />
              마감일 <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={form.deadline}
              min={today}
              onChange={(e) => setField("deadline", e.target.value)}
              className={`w-full text-sm px-3 py-2 rounded-lg border outline-none transition-colors
                ${errors.deadline ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-indigo-400"}`}
            />
            {errors.deadline && (
              <p className="mt-1 text-xs text-red-500">{errors.deadline}</p>
            )}
          </div>

          {/* 내용 */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
              <FileText size={12} strokeWidth={2} />
              내용 <span className="text-red-400">*</span>
            </label>
            <textarea
              value={form.content}
              onChange={(e) => setField("content", e.target.value)}
              placeholder="프로젝트 소개, 기술 스택, 우대 조건 등을 자유롭게 작성해주세요"
              rows={5}
              className={`w-full text-sm px-3 py-2 rounded-lg border outline-none transition-colors resize-none
                ${errors.content ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-indigo-400"}`}
            />
            {errors.content && (
              <p className="mt-1 text-xs text-red-500">{errors.content}</p>
            )}
          </div>

          {/* 이미지 URL (선택) */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
              <Image size={12} strokeWidth={2} />
              이미지 URL
              <span className="text-gray-400 font-normal">(선택)</span>
            </label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 focus-within:border-indigo-400 transition-colors">
              <Link
                size={12}
                strokeWidth={2}
                className="text-gray-400 shrink-0"
              />
              <input
                type="text"
                value={form.imageUrl}
                onChange={(e) => setField("imageUrl", e.target.value)}
                placeholder="https://example.com/image.png"
                className="flex-1 text-sm outline-none bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* 푸터 */}
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
            className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer font-medium"
          >
            {loading ? "등록 중..." : "모집 등록"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────
export default function CooperationPage() {
  const [tab, setTab] = useState("club");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const isClub = tab === "club";

  const filteredClub = CLUB_POSTS.filter(
    (p) =>
      !search || p.title.includes(search) || p.description.includes(search),
  );
  const filteredProject = PROJECT_POSTS.filter(
    (p) =>
      !search || p.title.includes(search) || p.description.includes(search),
  );

  function handleSuccess(newPost) {
    setShowModal(false);
    console.log("등록된 모집글:", newPost);
  }

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
              <ClubPostCard
                key={post.id}
                post={post}
                onClick={() => navigate(`/post/club/${post.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredProject.map((post) => (
              <ProjectPostCard
                key={post.id}
                post={post}
                onClick={() => navigate(`/post/project/${post.id}`)}
              />
            ))}
          </div>
        )}

        {/* CTA 버튼 */}
        <div className="flex justify-center mt-2">
          <button
            onClick={() => {
              if (!isClub) setShowModal(true);
            }}
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

      {/* 모집 모달 */}
      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
