import { useState, useEffect, useCallback } from "react";
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

function authHeader() {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getDdayClass(dday) {
  const n = parseInt((dday ?? "D-99").replace("D-", ""));
  if (n <= 7) return "bg-yellow-100 text-yellow-700";
  if (n <= 14) return "bg-cyan-100 text-cyan-700";
  return "bg-green-100 text-green-700";
}

// ─── 카드 컴포넌트 ────────────────────────────────────────────────────────────
function ClubPostCard({ post, onClick }) {
  const dday = post.dDayText ?? "D-?";
  const tags = post.contestName ? [post.contestName] : [];
  const club = post.clubName ?? "";
  const deadline = post.deadline ? `마감: ${post.deadline}` : "";

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
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${getDdayClass(
              dday
            )}`}
          >
            {dday}
          </span>
          <span className="text-xs text-gray-400">{club}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {tags.map((tag) => (
          <span
            key={tag}
            className="bg-indigo-50 text-indigo-600 text-xs font-medium px-2.5 py-0.5 rounded-full"
          >
            {tag}
          </span>
        ))}
        <span className="text-xs text-gray-400">{deadline}</span>
      </div>
      <p className="text-xs text-gray-500">{post.content}</p>
    </div>
  );
}

function ProjectPostCard({ post, onClick }) {
  const dday = post.dDay ?? "D-?";
  return (
    <div
      className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-2.5 cursor-pointer hover:shadow-md transition-shadow duration-150"
      onClick={onClick}
    >
      <span
        className={`text-xs font-bold px-2.5 py-0.5 rounded-full self-start ${getDdayClass(
          dday
        )}`}
      >
        {dday}
      </span>
      <p className="font-bold text-sm text-gray-900 leading-snug">
        {post.title}
      </p>
      <p className="text-xs text-gray-500 flex-1">{post.content}</p>
      <p className="text-xs text-gray-400">
        {post.deadline ? `~ ${post.deadline}` : ""}
      </p>
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

// ─── 협업 모집 모달 ───────────────────────────────────────────────────────────
function CreateClubCollabModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    clubId: "",
    title: "",
    contestName: "",
    contestDate: "",
    content: "",
    deadline: "",
    imageUrl: "",
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
    if (!form.clubId.trim()) e.clubId = "동아리 ID를 입력해주세요.";
    if (!form.title.trim()) e.title = "제목을 입력해주세요.";
    if (!form.contestName.trim()) e.contestName = "대회명을 입력해주세요.";
    if (!form.contestDate) e.contestDate = "대회 날짜를 선택해주세요.";
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
      clubId: Number(form.clubId),
      title: form.title.trim(),
      contestName: form.contestName.trim(),
      contestDate: form.contestDate,
      content: form.content.trim(),
      deadline: form.deadline,
      imageUrl: form.imageUrl.trim() || undefined,
    };

    setLoading(true);
    setApiError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/club-collaborations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
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
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              새 협업 모집하기
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              동아리 협업 팀원을 모집해보세요
            </p>
          </div>
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
                className="text-red-500 mt-0.5 shrink-0"
                strokeWidth={2}
              />
              <p className="text-sm text-red-600">{apiError}</p>
            </div>
          )}

          {/* 동아리 ID */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
              <Users size={12} strokeWidth={2} />
              동아리 ID <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              value={form.clubId}
              onChange={(e) => setField("clubId", e.target.value)}
              placeholder="소속 동아리 ID"
              className={`w-full text-sm px-3 py-2 rounded-lg border outline-none transition-colors ${
                errors.clubId
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 focus:border-green-400"
              }`}
            />
            {errors.clubId && (
              <p className="mt-1 text-xs text-red-500">{errors.clubId}</p>
            )}
          </div>

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
              placeholder="예) 간지톤 같이 나갈 기획자 구해요"
              maxLength={100}
              className={`w-full text-sm px-3 py-2 rounded-lg border outline-none transition-colors ${
                errors.title
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 focus:border-green-400"
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title}</p>
            )}
          </div>

          {/* 대회명 */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
              <FileText size={12} strokeWidth={2} />
              대회명 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.contestName}
              onChange={(e) => setField("contestName", e.target.value)}
              placeholder="예) 간지톤"
              className={`w-full text-sm px-3 py-2 rounded-lg border outline-none transition-colors ${
                errors.contestName
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 focus:border-green-400"
              }`}
            />
            {errors.contestName && (
              <p className="mt-1 text-xs text-red-500">{errors.contestName}</p>
            )}
          </div>

          {/* 대회 날짜 */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
              <CalendarDays size={12} strokeWidth={2} />
              대회 날짜 <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={form.contestDate}
              min={today}
              onChange={(e) => setField("contestDate", e.target.value)}
              className={`w-full text-sm px-3 py-2 rounded-lg border outline-none transition-colors ${
                errors.contestDate
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 focus:border-green-400"
              }`}
            />
            {errors.contestDate && (
              <p className="mt-1 text-xs text-red-500">{errors.contestDate}</p>
            )}
          </div>

          {/* 모집 마감일 */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
              <CalendarDays size={12} strokeWidth={2} />
              모집 마감일 <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={form.deadline}
              min={today}
              onChange={(e) => setField("deadline", e.target.value)}
              className={`w-full text-sm px-3 py-2 rounded-lg border outline-none transition-colors ${
                errors.deadline
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 focus:border-green-400"
              }`}
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
              placeholder="모집 내용, 우대 조건 등을 자유롭게 작성해주세요"
              rows={4}
              className={`w-full text-sm px-3 py-2 rounded-lg border outline-none transition-colors resize-none ${
                errors.content
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 focus:border-green-400"
              }`}
            />
            {errors.content && (
              <p className="mt-1 text-xs text-red-500">{errors.content}</p>
            )}
          </div>

          {/* 이미지 URL */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
              <Image size={12} strokeWidth={2} />
              이미지 URL
              <span className="text-gray-400 font-normal">(선택)</span>
            </label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 focus-within:border-green-400 transition-colors">
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
            className="px-4 py-2 text-sm text-white bg-green-500 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer font-medium"
          >
            {loading ? "등록 중..." : "모집 등록"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 프로젝트 모집 모달 ───────────────────────────────────────────────────────
function CreateProjectModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: "",
    imageUrl: "",
    writerStack: "",
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
      writerStack: form.writerStack.trim() || undefined,
      positions: form.positions.trim(),
      content: form.content.trim(),
      deadline: form.deadline,
    };

    setLoading(true);
    setApiError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/project-recruitments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
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

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
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
              className={`w-full text-sm px-3 py-2 rounded-lg border outline-none transition-colors ${
                errors.title
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 focus:border-indigo-400"
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
              <FileText size={12} strokeWidth={2} />내 스택/분야
              <span className="text-gray-400 font-normal">(선택)</span>
            </label>
            <input
              type="text"
              value={form.writerStack}
              onChange={(e) => setField("writerStack", e.target.value)}
              placeholder="예) 백엔드, 프론트엔드, 디자인"
              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-400 outline-none transition-colors"
            />
          </div>

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
              className={`w-full text-sm px-3 py-2 rounded-lg border outline-none transition-colors ${
                errors.positions
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 focus:border-indigo-400"
              }`}
            />
            {errors.positions && (
              <p className="mt-1 text-xs text-red-500">{errors.positions}</p>
            )}
          </div>

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
              className={`w-full text-sm px-3 py-2 rounded-lg border outline-none transition-colors ${
                errors.deadline
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 focus:border-indigo-400"
              }`}
            />
            {errors.deadline && (
              <p className="mt-1 text-xs text-red-500">{errors.deadline}</p>
            )}
          </div>

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
              className={`w-full text-sm px-3 py-2 rounded-lg border outline-none transition-colors resize-none ${
                errors.content
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 focus:border-indigo-400"
              }`}
            />
            {errors.content && (
              <p className="mt-1 text-xs text-red-500">{errors.content}</p>
            )}
          </div>

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

// ─── 스켈레톤 ─────────────────────────────────────────────────────────────────
function SkeletonList() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl px-6 py-5 h-24 animate-pulse"
        />
      ))}
    </div>
  );
}
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-5 h-44 animate-pulse" />
      ))}
    </div>
  );
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────
export default function CooperationPage() {
  const [tab, setTab] = useState("club");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [showClubModal, setShowClubModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const navigate = useNavigate();

  const [clubPosts, setClubPosts] = useState([]);
  const [clubLoading, setClubLoading] = useState(false);
  const [clubError, setClubError] = useState("");

  const [projectPosts, setProjectPosts] = useState([]);
  const [projectLoading, setProjectLoading] = useState(false);
  const [projectError, setProjectError] = useState("");

  const isClub = tab === "club";

  const fetchClubPosts = useCallback(async (keyword = "") => {
    setClubLoading(true);
    setClubError("");
    try {
      const params = new URLSearchParams({ page: 0, size: 20 });
      if (keyword) params.set("keyword", keyword);
      const res = await fetch(
        `${API_BASE_URL}/api/club-collaborations?${params}`,
        {
          headers: { ...authHeader() },
        }
      );
      const data = await res.json();
      if (data.success) setClubPosts(data.data.content ?? []);
      else setClubError(data.message || "목록을 불러오지 못했습니다.");
    } catch {
      setClubError("네트워크 오류가 발생했습니다.");
    } finally {
      setClubLoading(false);
    }
  }, []);

  const fetchProjectPosts = useCallback(async (keyword = "") => {
    setProjectLoading(true);
    setProjectError("");
    try {
      const params = new URLSearchParams({ page: 0, size: 20 });
      if (keyword) params.set("keyword", keyword);
      const res = await fetch(
        `${API_BASE_URL}/api/project-recruitments?${params}`,
        {
          headers: { ...authHeader() },
        }
      );
      const data = await res.json();
      if (data.success) setProjectPosts(data.data.content ?? []);
      else setProjectError(data.message || "목록을 불러오지 못했습니다.");
    } catch {
      setProjectError("네트워크 오류가 발생했습니다.");
    } finally {
      setProjectLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isClub) fetchClubPosts("");
    else fetchProjectPosts("");
  }, [tab]);

  function handleSearch() {
    setSearch(searchInput);
    if (isClub) fetchClubPosts(searchInput);
    else fetchProjectPosts(searchInput);
  }

  function handleTabChange(newTab) {
    setTab(newTab);
    setSearchInput("");
    setSearch("");
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 flex flex-col gap-5">
        {/* 탭 */}
        <div className="grid grid-cols-2 bg-slate-200 rounded-full p-1 gap-1">
          <button
            onClick={() => handleTabChange("club")}
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
            onClick={() => handleTabChange("project")}
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
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
          />
          <button onClick={handleSearch} className="cursor-pointer">
            <Search size={17} className="text-gray-400 shrink-0" />
          </button>
        </div>

        {/* 카드 목록 */}
        {isClub ? (
          clubLoading ? (
            <SkeletonList />
          ) : clubError ? (
            <div className="flex flex-col items-center py-12 gap-2">
              <AlertCircle size={20} className="text-red-300" />
              <p className="text-sm text-gray-400">{clubError}</p>
            </div>
          ) : clubPosts.length === 0 ? (
            <div className="flex flex-col items-center py-12">
              <p className="text-sm text-gray-400">모집글이 없습니다</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {clubPosts.map((post) => (
                <ClubPostCard
                  key={post.collabId}
                  post={post}
                  onClick={() => navigate(`/cooperation/club/${post.collabId}`)}
                />
              ))}
            </div>
          )
        ) : projectLoading ? (
          <SkeletonGrid />
        ) : projectError ? (
          <div className="flex flex-col items-center py-12 gap-2">
            <AlertCircle size={20} className="text-red-300" />
            <p className="text-sm text-gray-400">{projectError}</p>
          </div>
        ) : projectPosts.length === 0 ? (
          <div className="flex flex-col items-center py-12">
            <p className="text-sm text-gray-400">모집글이 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {projectPosts.map((post) => (
              <ProjectPostCard
                key={post.projectRecruitmentId}
                post={post}
                onClick={() =>
                  navigate(`/cooperation/project/${post.projectRecruitmentId}`)
                }
              />
            ))}
          </div>
        )}

        {/* CTA 버튼 */}
        <div className="flex justify-center mt-2">
          <button
            onClick={() =>
              isClub ? setShowClubModal(true) : setShowProjectModal(true)
            }
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

      {showClubModal && (
        <CreateClubCollabModal
          onClose={() => setShowClubModal(false)}
          onSuccess={() => {
            setShowClubModal(false);
            fetchClubPosts(search);
          }}
        />
      )}
      {showProjectModal && (
        <CreateProjectModal
          onClose={() => setShowProjectModal(false)}
          onSuccess={() => {
            setShowProjectModal(false);
            fetchProjectPosts(search);
          }}
        />
      )}
    </div>
  );
}
