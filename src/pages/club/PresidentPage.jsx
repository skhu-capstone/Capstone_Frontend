import { useMemo, useState } from "react";

const initialApplicants = [
  {
    id: 1,
    name: "김지원",
    email: "jiwon@example.com",
    message: "동아리 프로젝트에 참여하고 싶습니다.",
  },
  {
    id: 2,
    name: "박민수",
    email: "minsu@example.com",
    message: "프론트엔드 스터디에 관심이 있습니다.",
  },
  {
    id: 3,
    name: "최서연",
    email: "seoyeon@example.com",
    message: "기획과 디자인을 함께 해보고 싶습니다.",
  },
  {
    id: 4,
    name: "한도윤",
    email: "doyoon@example.com",
    message: "백엔드 개발 경험을 쌓고 싶어서 신청합니다.",
  },
  {
    id: 5,
    name: "오하린",
    email: "harin@example.com",
    message: "동아리 행사 운영에 참여하고 싶습니다.",
  },
  {
    id: 6,
    name: "문지호",
    email: "jiho@example.com",
    message: "팀 프로젝트를 꾸준히 진행해보고 싶습니다.",
  },
  {
    id: 7,
    name: "강유진",
    email: "yujin@example.com",
    message: "서비스 기획과 발표 준비에 관심이 있습니다.",
  },
];

const initialMembers = [
  { userId: 101, name: "이대표", email: "president@example.com", role: "PRESIDENT" },
  { userId: 102, name: "최운영", email: "staff@example.com", role: "STAFF" },
  { userId: 103, name: "정회원", email: "member@example.com", role: "MEMBER" },
  { userId: 104, name: "김민재", email: "minjae@example.com", role: "MEMBER" },
  { userId: 105, name: "서지우", email: "jiwoo@example.com", role: "MEMBER" },
  { userId: 106, name: "윤서아", email: "seoa@example.com", role: "STAFF" },
  { userId: 107, name: "임태현", email: "taehyun@example.com", role: "MEMBER" },
  { userId: 108, name: "장예린", email: "yerin@example.com", role: "MEMBER" },
  { userId: 109, name: "백준호", email: "junho@example.com", role: "MEMBER" },
  { userId: 110, name: "신나은", email: "naeun@example.com", role: "MEMBER" },
  { userId: 111, name: "조현우", email: "hyunwoo@example.com", role: "MEMBER" },
  { userId: 112, name: "홍다빈", email: "dabin@example.com", role: "MEMBER" },
  { userId: 113, name: "홍다빈", email: "dabin@example.com", role: "MEMBER" },
  { userId: 114, name: "홍다빈", email: "dabin@example.com", role: "MEMBER" },
  { userId: 115, name: "홍다빈", email: "dabin@example.com", role: "MEMBER" },
];

const loginUserId = 101;

export default function PresidentPage() {
  const [applicants, setApplicants] = useState(initialApplicants);
  const [members, setMembers] = useState(initialMembers);
  const [clubInfo, setClubInfo] = useState({
    clubName: "Capstone Club",
    description: "함께 프로젝트를 만들고 성장하는 동아리입니다.",
  });
  const [confirmAction, setConfirmAction] = useState(null);

  const president = useMemo(
    () => members.find((member) => member.role === "PRESIDENT"),
    [members]
  );

  const handleApprove = (applicant) => {
    setApplicants((prev) => prev.filter((item) => item.id !== applicant.id));
    setMembers((prev) => [
      ...prev,
      {
        userId: Date.now(),
        name: applicant.name,
        email: applicant.email,
        role: "MEMBER",
      },
    ]);
  };

  const handleReject = (applicantId) => {
    setApplicants((prev) => prev.filter((item) => item.id !== applicantId));
  };

  const handleRoleChange = (targetUserId, nextRole) => {
    if (nextRole === "PRESIDENT") {
      setConfirmAction({
        title: "대표 권한을 이전할까요?",
        description:
          "대표 권한을 이전하면 현재 대표는 일반 부원으로 변경됩니다.",
        confirmText: "이전하기",
        onConfirm: () => transferPresident(targetUserId),
      });
      return;
    }

    setMembers((prev) =>
      prev.map((member) =>
        member.userId === targetUserId ? { ...member, role: nextRole } : member
      )
    );
  };

  const transferPresident = (targetUserId) => {
    setMembers((prev) =>
      prev.map((member) => {
        if (member.userId === targetUserId) return { ...member, role: "PRESIDENT" };
        if (member.role === "PRESIDENT") return { ...member, role: "MEMBER" };
        return member;
      })
    );
    setConfirmAction(null);
  };

  const requestRemoveMember = (member) => {
    if (member.userId === loginUserId) return;
    if (member.role === "PRESIDENT") return;

    setConfirmAction({
      title: "멤버를 내보낼까요?",
      description: `${member.name}님을 동아리에서 내보냅니다. 이 작업은 되돌릴 수 없습니다.`,
      confirmText: "내보내기",
      danger: true,
      onConfirm: () => removeMember(member.userId),
    });
  };

  const removeMember = (targetUserId) => {
    const targetMember = members.find((member) => member.userId === targetUserId);
    if (!targetMember || targetMember.role === "PRESIDENT") return;

    setMembers((prev) =>
      prev.filter((member) => member.userId !== targetUserId)
    );
    setConfirmAction(null);
  };

  const handleClubInfoChange = (field, value) => {
    setClubInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const renderClubInfoPanel = () => (
    <Panel title="동아리 정보 수정">
      <div className="flex flex-col gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-700">
            동아리명
          </span>
          <input
            value={clubInfo.clubName}
            onChange={(event) =>
              handleClubInfoChange("clubName", event.target.value)
            }
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-sky-700"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-700">소개</span>
          <textarea
            value={clubInfo.description}
            onChange={(event) =>
              handleClubInfoChange("description", event.target.value)
            }
            className="min-h-44 resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none focus:border-sky-700"
          />
        </label>

        <button className="self-end rounded-xl bg-sky-700 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-800">
          저장
        </button>
      </div>
    </Panel>
  );

  const renderApplicantsPanel = () => (
    <Panel title="가입 신청자">
      {applicants.length === 0 ? (
        <EmptyText>대기 중인 가입 신청이 없습니다.</EmptyText>
      ) : (
        <div className="max-h-112 overflow-y-auto pr-2">
          <div className="flex flex-col gap-2.5">
            {applicants.map((applicant) => (
              <div
                key={applicant.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 rounded-xl border border-slate-200 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-base font-bold text-gray-900">
                    {applicant.name}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-slate-900/50">
                    {applicant.email}
                  </p>
                </div>

                <div className="row-span-2 flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(applicant)}
                    className="rounded-xl bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800"
                  >
                    승인
                  </button>
                  <button
                    onClick={() => handleReject(applicant.id)}
                    className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100"
                  >
                    거절
                  </button>
                </div>

                <p className="line-clamp-2 text-sm leading-6 text-slate-700">
                  {applicant.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Panel>
  );

  const renderMembersPanel = () => (
    <Panel title="멤버 관리" className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto pr-2">
        <div className="flex flex-col divide-y divide-slate-200">
          {members.map((member) => {
            const isSelf = member.userId === loginUserId;
            const isPresident = member.role === "PRESIDENT";

            return (
              <div
                key={member.userId}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div>
                  <p className="text-base font-bold text-gray-900">
                    {member.name}
                    {isSelf && (
                      <span className="ml-2 text-sm font-medium text-sky-700">
                        나
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-sm text-slate-900/50">
                    {member.email}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={member.role}
                    disabled={isSelf}
                    onChange={(event) =>
                      handleRoleChange(member.userId, event.target.value)
                    }
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="PRESIDENT">대표</option>
                    <option value="STAFF">운영진</option>
                    <option value="MEMBER">부원</option>
                  </select>

                  <button
                    onClick={() => requestRemoveMember(member)}
                    disabled={isSelf || isPresident}
                    className="rounded-xl px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
                  >
                    내보내기
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
  );

  return (
    <main className="min-h-screen bg-slate-50 px-12 py-12">
      <section className="mx-auto flex w-full max-w-330 flex-col gap-8">
        <header className="flex items-start justify-between border-b border-slate-300 pb-6">
          <div>
            <h1 className="text-4xl font-bold leading-10 text-gray-900">
              대표 관리
            </h1>
            <p className="mt-3 text-base text-slate-900/60">
              가입 신청과 멤버 권한, 동아리 정보를 관리하세요.
            </p>
          </div>

          <div className="rounded-xl bg-white px-5 py-4 text-right shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-slate-900/60">현재 대표</p>
            <p className="mt-1 text-lg font-bold text-gray-900">
              {president?.name ?? "대표 없음"}
            </p>
          </div>
        </header>

        <section className="grid grid-cols-[1.1fr_0.9fr] items-stretch gap-8">
          <div className="flex flex-col gap-8">
            {renderClubInfoPanel()}
            {renderApplicantsPanel()}
          </div>
          <div className="h-0 min-h-full">
            {renderMembersPanel()}
          </div>
        </section>
      </section>

      {confirmAction && (
        <ConfirmModal
          {...confirmAction}
          onClose={() => setConfirmAction(null)}
        />
      )}
    </main>
  );
}

function Panel({ title, children, className = "" }) {
  return (
    <section
      className={`rounded-xl bg-white p-6 shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] ${className}`}
    >
      <h2 className="mb-5 text-xl font-bold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}

function EmptyText({ children }) {
  return <p className="py-8 text-center text-sm text-slate-900/50">{children}</p>;
}

function ConfirmModal({
  title,
  description,
  confirmText,
  danger = false,
  onConfirm,
  onClose,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-900/60">
          {description}
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white ${
              danger ? "bg-red-500 hover:bg-red-600" : "bg-sky-700 hover:bg-sky-800"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
