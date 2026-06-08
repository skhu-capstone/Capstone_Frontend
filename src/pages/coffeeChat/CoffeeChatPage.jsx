import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Coffee, Circle } from "lucide-react";

// ─── 더미 데이터 ──────────────────────────────────────────────────────────────
const DUMMY_ROOMS = [
  {
    chatRoomId: 1,
    targetUserId: 7,
    targetUserName: "김철수",
    targetProfileImage: null,
    lastMessage: "안녕하세요! 커피챗 가능하실까요?",
    lastMessageAt: "2026-05-31T14:10:00",
    unreadCount: 3,
  },
  {
    chatRoomId: 2,
    targetUserId: 12,
    targetUserName: "이지은",
    targetProfileImage: null,
    lastMessage: "다음 주 수요일 오후 2시 어떠세요?",
    lastMessageAt: "2026-05-30T09:22:00",
    unreadCount: 0,
  },
  {
    chatRoomId: 3,
    targetUserId: 5,
    targetUserName: "박민준",
    targetProfileImage: null,
    lastMessage: "넵 그때 뵙겠습니다 😊",
    lastMessageAt: "2026-05-29T18:45:00",
    unreadCount: 0,
  },
  {
    chatRoomId: 4,
    targetUserId: 9,
    targetUserName: "최수아",
    targetProfileImage: null,
    lastMessage: "포트폴리오 관련해서 여쭤봐도 될까요?",
    lastMessageAt: "2026-05-28T11:05:00",
    unreadCount: 1,
  },
  {
    chatRoomId: 5,
    targetUserId: 3,
    targetUserName: "정태양",
    targetProfileImage: null,
    lastMessage: "감사합니다! 많은 도움이 됐어요.",
    lastMessageAt: "2026-05-27T16:30:00",
    unreadCount: 0,
  },
  {
    chatRoomId: 6,
    targetUserId: 21,
    targetUserName: "한나연",
    targetProfileImage: null,
    lastMessage: "스터디 같이 하실 분 구하고 있어서요!",
    lastMessageAt: "2026-05-25T20:10:00",
    unreadCount: 0,
  },
];

// ─── 유틸 ─────────────────────────────────────────────────────────────────────
function formatTime(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays === 0)
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  if (diffDays === 1) return "어제";
  if (diffDays < 7) return `${diffDays}일 전`;
  return date.toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
}

// 이름 기반 아바타 색상
const AVATAR_COLORS = [
  ["#e0f2fe", "#0369a1"],
  ["#fce7f3", "#be185d"],
  ["#dcfce7", "#15803d"],
  ["#fef3c7", "#b45309"],
  ["#ede9fe", "#6d28d9"],
  ["#fee2e2", "#b91c1c"],
];
function avatarColor(name) {
  const idx = (name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

// ─── 채팅방 아이템 ────────────────────────────────────────────────────────────
function RoomItem({ room, onClick }) {
  const [bg, text] = avatarColor(room.targetUserName);
  const initial = room.targetUserName?.[0] ?? "?";

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-slate-50 active:bg-slate-100 transition-colors duration-100 cursor-pointer text-left"
    >
      {/* 아바타 */}
      <div className="relative shrink-0">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-base font-semibold"
          style={{ background: bg, color: text }}
        >
          {room.targetProfileImage ? (
            <img
              src={room.targetProfileImage}
              alt={room.targetUserName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            initial
          )}
        </div>
        {/* 온라인 인디케이터 — 더미라 항상 표시 */}
        {room.unreadCount > 0 && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-white" />
        )}
      </div>

      {/* 텍스트 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span
            className={`text-sm ${room.unreadCount > 0 ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}
          >
            {room.targetUserName}
          </span>
          <span className="text-xs text-gray-400 shrink-0 ml-2">
            {formatTime(room.lastMessageAt)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p
            className={`text-sm truncate ${room.unreadCount > 0 ? "text-gray-700 font-medium" : "text-gray-400"}`}
          >
            {room.lastMessage}
          </p>
          {room.unreadCount > 0 && (
            <span className="shrink-0 min-w-[20px] h-5 rounded-full bg-blue-500 text-white text-xs font-semibold flex items-center justify-center px-1.5">
              {room.unreadCount > 99 ? "99+" : room.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────
export default function CoffeeChatPage() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = DUMMY_ROOMS.filter(
    (r) => r.targetUserName.includes(search) || r.lastMessage.includes(search),
  );

  const totalUnread = DUMMY_ROOMS.reduce((acc, r) => acc + r.unreadCount, 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto flex flex-col">
        {/* 헤더 */}
        <div className="px-5 pt-8 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <Coffee size={20} strokeWidth={1.8} className="text-amber-500" />
            <h1 className="text-xl font-bold text-gray-900">커피챗</h1>
            {totalUnread > 0 && (
              <span className="text-xs font-semibold text-white bg-blue-500 rounded-full px-2 py-0.5">
                {totalUnread}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400">대화를 이어가 보세요</p>
        </div>

        {/* 검색창 */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2.5 bg-slate-100 rounded-xl px-3.5 py-2.5">
            <Search
              size={15}
              strokeWidth={2}
              className="text-gray-400 shrink-0"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이름 또는 메시지 검색"
              className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
            />
          </div>
        </div>

        {/* 구분선 */}
        <div className="h-px bg-gray-100 mx-4" />

        {/* 채팅방 목록 */}
        <div className="flex-1">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Coffee size={32} strokeWidth={1.5} className="text-gray-200" />
              <p className="text-sm text-gray-400">
                {search ? "검색 결과가 없어요" : "아직 대화가 없어요"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((room) => (
                <RoomItem
                  key={room.chatRoomId}
                  room={room}
                  onClick={() => navigate(`/coffee-chat/${room.chatRoomId}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
