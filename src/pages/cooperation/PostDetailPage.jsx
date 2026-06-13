import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function authHeader() {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getDdayClass(dday) {
  const n = parseInt((dday ?? "D-99").replace("D-", ""));
  if (n <= 7) return "bg-green-100 text-green-700";
  if (n <= 14) return "bg-cyan-100 text-cyan-700";
  return "bg-blue-100 text-blue-700";
}

// ─── 공통 상세 레이아웃 (UI 동일) ────────────────────────────────────────────
function DetailLayout({
  dday,
  clubLabel,
  buttonColor,
  fields,
  title,
  imageUrl,
  onBack,
  onContact,
}) {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
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
            className={`text-xs font-bold px-3 py-1 rounded-full ${getDdayClass(
              dday
            )}`}
          >
            {dday}
          </span>
        </div>
        <span className="text-sm font-medium text-gray-600 pr-1">
          {clubLabel}
        </span>
      </div>

      <main className="flex-1 flex items-start justify-center px-4 pt-16 pb-8">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* 이미지 영역 */}
          <div
            className="w-full bg-slate-100 flex items-center justify-center"
            style={{ height: 300 }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="모집 이미지"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm text-gray-400">이미지 영역</span>
            )}
          </div>

          <div className="px-6 py-6 flex flex-col gap-4">
            <h1 className="text-lg font-bold text-gray-900 leading-snug">
              {title}
            </h1>

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

            <button
              onClick={onContact}
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

// ─── 로딩 / 에러 공통 ─────────────────────────────────────────────────────────
function LoadingView() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <Loader2 size={24} className="text-gray-300 animate-spin" />
    </div>
  );
}

function ErrorView({ message, onBack }) {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center gap-3">
      <AlertCircle size={24} className="text-red-300" strokeWidth={1.5} />
      <p className="text-sm text-gray-400">{message}</p>
      <button
        onClick={onBack}
        className="text-sm text-indigo-500 hover:text-indigo-700 transition-colors cursor-pointer"
      >
        돌아가기
      </button>
    </div>
  );
}

// ─── 동아리 협업모집 상세 ─────────────────────────────────────────────────────
// GET /api/club-collaborations/:collabId
function ClubPostDetail({ id, onBack }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/club-collaborations/${id}`,
          {
            headers: { ...authHeader() },
          }
        );
        const data = await res.json();
        if (data.success) {
          setPost(data.data);
        } else {
          setError(data.message || "게시글을 찾을 수 없어요.");
        }
      } catch {
        setError("네트워크 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <LoadingView />;
  if (error) return <ErrorView message={error} onBack={onBack} />;

  const fields = [
    { label: "동아리:", value: post.clubName ?? "-" },
    { label: "대회명:", value: post.contestName ?? "-" },
    { label: "대회날짜:", value: post.contestDate ?? "미정" },
    { label: "내용:", value: post.content ?? "-" },
    { label: "마감일:", value: post.deadline ?? "-" },
    { label: "작성자:", value: post.writerName ?? "-" },
  ];

  // 문의하기 → 커피챗으로 연결 (writerId 없으므로 일단 목록으로)
  function handleContact() {
    navigate("/coffee-chat");
  }

  return (
    <DetailLayout
      dday={post.dDayText ?? "D-?"}
      clubLabel={post.clubName ?? ""}
      buttonColor="bg-green-500 hover:bg-green-600"
      fields={fields}
      title={post.title}
      imageUrl={post.imageUrl}
      onBack={onBack}
      onContact={handleContact}
    />
  );
}

// ─── 프로젝트 팀원모집 상세 ───────────────────────────────────────────────────
// GET /api/project-recruitments/:projectRecruitmentId
function ProjectPostDetail({ id, onBack }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/project-recruitments/${id}`,
          {
            headers: { ...authHeader() },
          }
        );
        const data = await res.json();
        if (data.success) {
          setPost(data.data);
        } else {
          setError(data.message || "게시글을 찾을 수 없어요.");
        }
      } catch {
        setError("네트워크 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <LoadingView />;
  if (error) return <ErrorView message={error} onBack={onBack} />;

  const fields = [
    { label: "작성자:", value: post.writerName ?? "-" },
    { label: "작성자 분야:", value: post.writerStack ?? "-" },
    { label: "모집 구성:", value: post.positions ?? "-" },
    { label: "내용:", value: post.content ?? "-" },
    { label: "마감일:", value: post.deadline ?? "-" },
  ];

  // 문의하기 → writerId로 커피챗 생성 후 이동
  async function handleContact() {
    if (!post.writerId) {
      navigate("/coffee-chat");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ targetUserId: post.writerId }),
      });
      const data = await res.json();
      if (data.success) {
        navigate("/coffee-chat", {
          state: {
            roomId: data.data.chatRoomId,
          },
        });
      } else {
        navigate("/coffee-chat");
      }
    } catch {
      navigate("/coffee-chat");
    }
  }

  return (
    <DetailLayout
      dday={post.dDay ?? "D-?"}
      clubLabel={post.writerStack ?? ""}
      buttonColor="bg-indigo-600 hover:bg-indigo-700"
      fields={fields}
      title={post.title}
      imageUrl={post.imageUrl}
      onBack={onBack}
      onContact={handleContact}
    />
  );
}

// ─── 메인 export ──────────────────────────────────────────────────────────────
// 라우터: /cooperation/club/:id  /  /cooperation/project/:id
export default function PostDetailPage() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (location.key !== "default") navigate(-1);
    else navigate("/cooperation");
  };

  if (type === "club") return <ClubPostDetail id={id} onBack={handleBack} />;
  if (type === "project")
    return <ProjectPostDetail id={id} onBack={handleBack} />;

  return (
    <div className="p-8 text-center text-gray-400">잘못된 접근입니다.</div>
  );
}
