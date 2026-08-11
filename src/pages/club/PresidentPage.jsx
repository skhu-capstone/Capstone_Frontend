import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getClubDetail,
  getClubMembers,
  uploadClubImage,
} from "../../services/clubService";
import {
  approveClubJoinRequest,
  getClubJoinRequests,
  rejectClubJoinRequest,
  removeClubMember,
  transferClubPresident,
  updateClubInfo,
  updateClubMemberRole,
} from "../../services/presidentService";

const EMPTY_LIST = [];

const managementTabs = [
  { key: "info", label: "동아리 정보" },
  { key: "applicants", label: "가입 신청자" },
  { key: "members", label: "멤버 관리" },
];

const parseStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

export default function PresidentPage() {
  const { clubId } = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("info");
  const [removedApplicantIds, setRemovedApplicantIds] = useState([]);
  const [members, setMembers] = useState([]);
  const [clubImageFile, setClubImageFile] = useState(null);
  const [clubImagePreview, setClubImagePreview] = useState("");
  const [clubInfo, setClubInfo] = useState({
    clubName: "",
    category: "",
    shortDescription: "",
    detailDescription: "",
    imageUrl: "",
    regularMeetingTime: "",
    activityLocation: "",
    contact: "",
  });
  const [confirmAction, setConfirmAction] = useState(null);
  const loginUser = parseStoredUser();
  const loginUserId = Number(loginUser?.userId ?? loginUser?.id);

  const president = useMemo(
    () => members.find((member) => member.role === "PRESIDENT"),
    [members]
  );
  const currentUser = useMemo(
    () =>
      members.find((member) => Number(member.userId ?? member.id) === loginUserId),
    [loginUserId, members]
  );
  const isCurrentUserPresident = currentUser?.role === "PRESIDENT";

  const {
    data: joinRequests = EMPTY_LIST,
    isLoading: isJoinRequestsLoading,
    isError: isJoinRequestsError,
  } = useQuery({
    queryKey: ["clubJoinRequests", clubId],
    queryFn: () => getClubJoinRequests(clubId),
    enabled: !!clubId,
  });

  const {
    data: clubMembers = EMPTY_LIST,
    isLoading: isMembersLoading,
    isError: isMembersError,
  } = useQuery({
    queryKey: ["clubMembers", clubId],
    queryFn: () => getClubMembers(clubId),
    enabled: !!clubId,
  });

  const {
    data: clubDetail,
    isLoading: isClubDetailLoading,
    isError: isClubDetailError,
  } = useQuery({
    queryKey: ["clubDetail", clubId],
    queryFn: () => getClubDetail(clubId),
    enabled: !!clubId,
  });

  useEffect(() => {
    setMembers(clubMembers);
  }, [clubMembers]);

  useEffect(() => {
    if (!clubDetail) return;

    setClubInfo({
      clubName: clubDetail.clubName ?? "",
      category: clubDetail.category ?? "",
      shortDescription: clubDetail.shortDescription ?? "",
      detailDescription: clubDetail.detailDescription ?? "",
      imageUrl: clubDetail.imageUrl ?? "",
      regularMeetingTime: clubDetail.regularMeetingTime ?? "",
      activityLocation: clubDetail.activityLocation ?? "",
      contact: clubDetail.contact ?? "",
    });
    setClubImageFile(null);
    setClubImagePreview("");
  }, [clubDetail]);

  const applicants = useMemo(
    () =>
      joinRequests
        .filter((request) => !removedApplicantIds.includes(request.userId))
        .map((request) => ({
          id: request.userId,
          name: request.name ?? "",
          requestedAt: request.requestedAt,
          message: request.joinMessage ?? "",
          status: request.clubJoinStatus,
        })),
    [joinRequests, removedApplicantIds]
  );

  const transferPresidentMutation = useMutation({
    mutationFn: transferClubPresident,
    onSuccess: (result) => {
      setMembers((prev) =>
        prev.map((member) => {
          if (Number(member.userId ?? member.id) === Number(result.newPresidentUserId)) {
            return { ...member, role: "PRESIDENT" };
          }
          if (
            Number(member.userId ?? member.id) ===
            Number(result.previousPresidentUserId)
          ) {
            return { ...member, role: result.previousPresidentRole ?? "MEMBER" };
          }
          return member;
        })
      );
      setConfirmAction(null);
      alert("대표 권한이 이전되었습니다.");
    },
    onError: (error) => {
      console.error(error);
      alert("대표 권한 이전에 실패했습니다.");
    },
  });

  const updateMemberRoleMutation = useMutation({
    mutationFn: updateClubMemberRole,
    onSuccess: (result) => {
      setMembers((prev) =>
        prev.map((member) =>
          Number(member.userId ?? member.id) === Number(result.userId)
            ? { ...member, role: result.role }
            : member
        )
      );
      alert("멤버 역할이 변경되었습니다.");
    },
    onError: (error) => {
      console.error(error);
      alert("멤버 역할 변경에 실패했습니다.");
    },
  });

  const updateClubInfoMutation = useMutation({
    mutationFn: async ({ clubId, clubInfo, imageFile }) => {
      let nextClubInfo = clubInfo;

      if (imageFile) {
        const uploadedImage = await uploadClubImage(clubId, imageFile);
        const uploadedImageUrl =
          typeof uploadedImage === "string"
            ? uploadedImage
            : uploadedImage?.imageUrl;

        if (uploadedImageUrl) {
          nextClubInfo = {
            ...clubInfo,
            imageUrl: uploadedImageUrl,
          };
        }
      }

      return updateClubInfo({
        clubId,
        clubInfo: nextClubInfo,
      });
    },
    onSuccess: async (result, variables) => {
      setClubInfo({
        clubName: result.clubName ?? "",
        category: result.category ?? "",
        shortDescription: result.shortDescription ?? "",
        detailDescription: result.detailDescription ?? "",
        imageUrl: result.imageUrl ?? "",
        regularMeetingTime: result.regularMeetingTime ?? "",
        activityLocation: result.activityLocation ?? "",
        contact: result.contact ?? "",
      });
      setClubImageFile(null);
      setClubImagePreview("");
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["clubDetail", variables.clubId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["myClubs"],
        }),
      ]);
      alert("동아리 정보가 수정되었습니다.");
    },
    onError: (error) => {
      console.error(error);
      alert("동아리 정보 수정에 실패했습니다.");
    },
  });

  const approveJoinRequestMutation = useMutation({
    mutationFn: approveClubJoinRequest,
    onSuccess: async (result, variables) => {
      setRemovedApplicantIds((prev) => [...prev, variables.applicantUserId]);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["clubJoinRequests", variables.clubId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["clubMembers", variables.clubId],
        }),
      ]);
      alert("가입 신청을 승인했습니다.");
    },
    onError: (error) => {
      console.error(error);
      alert("가입 신청 승인에 실패했습니다.");
    },
  });

  const rejectJoinRequestMutation = useMutation({
    mutationFn: rejectClubJoinRequest,
    onSuccess: (result, variables) => {
      setRemovedApplicantIds((prev) => [...prev, variables.applicantUserId]);
      alert("가입 신청을 거절했습니다.");
    },
    onError: (error) => {
      console.error(error);
      alert("가입 신청 거절에 실패했습니다.");
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: removeClubMember,
    onSuccess: (result, variables) => {
      setMembers((prev) =>
        prev.filter(
          (member) =>
            Number(member.userId ?? member.id) !== Number(variables.targetUserId)
        )
      );
      setConfirmAction(null);
      alert("멤버를 내보냈습니다.");
    },
    onError: (error) => {
      console.error(error);
      alert("멤버 내보내기에 실패했습니다.");
    },
  });

  const handleApprove = (applicant) => {
    if (!clubId) {
      alert("동아리 정보를 찾을 수 없습니다.");
      return;
    }

    approveJoinRequestMutation.mutate({
      clubId,
      applicantUserId: applicant.id,
    });
  };

  const handleReject = (applicantId) => {
    if (!clubId) {
      alert("동아리 정보를 찾을 수 없습니다.");
      return;
    }

    rejectJoinRequestMutation.mutate({
      clubId,
      applicantUserId: applicantId,
    });
  };

  const handleRoleChange = (targetUserId, nextRole) => {
    const targetMember = members.find(
      (member) => Number(member.userId ?? member.id) === Number(targetUserId)
    );
    if (!targetMember || targetMember.role === nextRole) return;

    if (nextRole === "PRESIDENT") {
      if (!isCurrentUserPresident) {
        alert("대표만 대표 권한을 이전할 수 있습니다.");
        return;
      }

      setConfirmAction({
        title: "대표 권한을 이전할까요?",
        description:
          "대표 권한을 이전하면 현재 대표는 일반 부원으로 변경됩니다.",
        confirmText: "이전하기",
        onConfirm: () => transferPresident(targetUserId),
      });
      return;
    }

    if (!clubId) {
      alert("동아리 정보를 찾을 수 없습니다.");
      return;
    }

    updateMemberRoleMutation.mutate({
      clubId,
      targetUserId,
      role: nextRole,
    });
  };

  const transferPresident = (targetUserId) => {
    if (!isCurrentUserPresident) {
      alert("대표만 대표 권한을 이전할 수 있습니다.");
      setConfirmAction(null);
      return;
    }

    if (!clubId) {
      alert("동아리 정보를 찾을 수 없습니다.");
      return;
    }

    transferPresidentMutation.mutate({
      clubId,
      newPresidentUserId: targetUserId,
    });
  };

  const requestRemoveMember = (member) => {
    if (Number(member.userId ?? member.id) === loginUserId) return;
    if (member.role === "PRESIDENT") return;

    setConfirmAction({
      title: "멤버를 내보낼까요?",
      description: `${member.name}님을 동아리에서 내보냅니다. 이 작업은 되돌릴 수 없습니다.`,
      confirmText: "내보내기",
      danger: true,
      onConfirm: () => removeMember(member.userId ?? member.id),
    });
  };

  const removeMember = (targetUserId) => {
    const targetMember = members.find(
      (member) => Number(member.userId ?? member.id) === Number(targetUserId)
    );
    if (!targetMember || targetMember.role === "PRESIDENT") return;
    if (Number(targetUserId) === loginUserId) return;

    if (!clubId) {
      alert("동아리 정보를 찾을 수 없습니다.");
      return;
    }

    removeMemberMutation.mutate({
      clubId,
      targetUserId,
    });
  };

  const handleClubInfoChange = (field, value) => {
    setClubInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClubImageChange = (file) => {
    setClubImageFile(file);

    if (!file) {
      setClubImagePreview("");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setClubImagePreview(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleClubInfoSubmit = () => {
    if (!clubId) {
      alert("동아리 정보를 찾을 수 없습니다.");
      return;
    }

    updateClubInfoMutation.mutate({
      clubId,
      clubInfo,
      imageFile: clubImageFile,
    });
  };

  const renderClubInfoPanel = () => (
    <Panel title="동아리 정보 수정" hideTitle>
      {!clubId ? (
        <EmptyText>동아리 정보를 찾을 수 없습니다.</EmptyText>
      ) : isClubDetailLoading ? (
        <EmptyText>동아리 정보를 불러오는 중입니다.</EmptyText>
      ) : isClubDetailError ? (
        <EmptyText>동아리 정보를 불러오지 못했습니다.</EmptyText>
      ) : (
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

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-700">카테고리</span>
              <input
                value={clubInfo.category}
                onChange={(event) =>
                  handleClubInfoChange("category", event.target.value)
                }
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-sky-700"
              />
            </label>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-700">
                대표 이미지
              </span>
              <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 hover:border-sky-400 hover:bg-sky-50/50">
                {clubImagePreview || clubInfo.imageUrl ? (
                  <img
                    src={clubImagePreview || clubInfo.imageUrl}
                    alt="동아리 대표 이미지 미리보기"
                    className="h-20 w-28 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-semibold text-slate-400">
                    이미지
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-700">
                    {clubImageFile?.name || "이미지 파일 선택"}
                  </p>
                  <p className="mt-1 text-xs text-slate-900/50">
                    저장 시 선택한 이미지가 업로드됩니다.
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    handleClubImageChange(event.target.files?.[0] ?? null)
                  }
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-slate-700">한 줄 소개</span>
            <input
              value={clubInfo.shortDescription}
              onChange={(event) =>
                handleClubInfoChange("shortDescription", event.target.value)
              }
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-sky-700"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-slate-700">상세 소개</span>
            <textarea
              value={clubInfo.detailDescription}
              onChange={(event) =>
                handleClubInfoChange("detailDescription", event.target.value)
              }
              className="min-h-44 resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none focus:border-sky-700"
            />
          </label>

          <div className="grid grid-cols-3 gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-700">
                정기 모임
              </span>
              <input
                value={clubInfo.regularMeetingTime}
                onChange={(event) =>
                  handleClubInfoChange("regularMeetingTime", event.target.value)
                }
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-sky-700"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-700">
                활동 장소
              </span>
              <input
                value={clubInfo.activityLocation}
                onChange={(event) =>
                  handleClubInfoChange("activityLocation", event.target.value)
                }
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-sky-700"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-700">연락처</span>
              <input
                value={clubInfo.contact}
                onChange={(event) =>
                  handleClubInfoChange("contact", event.target.value)
                }
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-sky-700"
              />
            </label>
          </div>

          <button
            onClick={handleClubInfoSubmit}
            disabled={updateClubInfoMutation.isPending}
            className="self-end rounded-xl bg-sky-700 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {updateClubInfoMutation.isPending ? "저장 중..." : "저장"}
          </button>
        </div>
      )}
    </Panel>
  );

  const renderApplicantsPanel = () => (
    <Panel title="가입 신청자" hideTitle>
      {!clubId ? (
        <EmptyText>동아리 정보를 찾을 수 없습니다.</EmptyText>
      ) : isJoinRequestsLoading ? (
        <EmptyText>가입 신청자를 불러오는 중입니다.</EmptyText>
      ) : isJoinRequestsError ? (
        <EmptyText>가입 신청자 목록을 불러오지 못했습니다.</EmptyText>
      ) : applicants.length === 0 ? (
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
                    {applicant.requestedAt
                      ? `신청일 ${applicant.requestedAt.slice(0, 10)}`
                      : "신청일 정보 없음"}
                  </p>
                </div>

                <div className="row-span-2 flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(applicant)}
                    disabled={
                      approveJoinRequestMutation.isPending ||
                      rejectJoinRequestMutation.isPending
                    }
                    className="rounded-xl bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    승인
                  </button>
                  <button
                    onClick={() => handleReject(applicant.id)}
                    disabled={
                      approveJoinRequestMutation.isPending ||
                      rejectJoinRequestMutation.isPending
                    }
                    className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
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
    <Panel title="멤버 관리" hideTitle className="flex min-h-130 flex-col">
      {!clubId ? (
        <EmptyText>동아리 정보를 찾을 수 없습니다.</EmptyText>
      ) : isMembersLoading ? (
        <EmptyText>멤버 정보를 불러오는 중입니다.</EmptyText>
      ) : isMembersError ? (
        <EmptyText>멤버 정보를 불러오지 못했습니다.</EmptyText>
      ) : members.length === 0 ? (
        <EmptyText>등록된 멤버가 없습니다.</EmptyText>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto pr-2">
          <div className="flex flex-col divide-y divide-slate-200">
            {members.map((member) => {
              const memberId = member.userId ?? member.id;
              const isSelf = Number(memberId) === loginUserId;
              const isPresident = member.role === "PRESIDENT";

              return (
                <div
                  key={memberId}
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
                    {member.email && (
                      <p className="mt-1 text-sm text-slate-900/50">
                        {member.email}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={member.role}
                      disabled={
                        isSelf ||
                        updateMemberRoleMutation.isPending ||
                        transferPresidentMutation.isPending
                      }
                      onChange={(event) =>
                        handleRoleChange(memberId, event.target.value)
                      }
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="PRESIDENT" disabled={!isCurrentUserPresident}>
                        대표
                      </option>
                      <option value="STAFF">운영진</option>
                      <option value="MEMBER">부원</option>
                    </select>

                    <button
                      onClick={() => requestRemoveMember(member)}
                      disabled={
                        isSelf || isPresident || removeMemberMutation.isPending
                      }
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
      )}
    </Panel>
  );

  if (!isMembersLoading && isMembersError) {
    return (
      <AccessMessage
        title="멤버 정보를 불러오지 못했습니다"
        description="대표 권한을 확인할 수 없어 대표 관리 페이지를 표시할 수 없습니다."
      />
    );
  }

  if (!isMembersLoading && !isCurrentUserPresident) {
    return (
      <AccessMessage
        title="접근 권한이 없습니다"
        description="대표만 대표 관리 페이지에 접근할 수 있습니다."
      />
    );
  }

  const renderActivePanel = () => {
    if (activeTab === "applicants") return renderApplicantsPanel();
    if (activeTab === "members") return renderMembersPanel();
    return renderClubInfoPanel();
  };

  return (
    <main className="min-h-screen bg-slate-50 px-12 py-12">
      <section className="mx-auto flex w-full max-w-330 flex-col gap-8">
        <header className="flex flex-col gap-6 border-b border-slate-300 pb-4">
          <div className="flex items-start justify-between">
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
          </div>

          <nav className="flex">
            {managementTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-7 py-3 text-base font-medium ${
                  activeTab === tab.key
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-slate-900/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </header>

        <section>{renderActivePanel()}</section>
      </section>

      {confirmAction && (
        <ConfirmModal
          {...confirmAction}
          isPending={
            transferPresidentMutation.isPending || removeMemberMutation.isPending
          }
          onClose={() => setConfirmAction(null)}
        />
      )}
    </main>
  );
}

function AccessMessage({ title, description }) {
  return (
    <main className="min-h-screen bg-slate-50 px-12 py-12">
      <section className="mx-auto flex min-h-100 max-w-3xl items-center justify-center rounded-xl bg-white p-8 text-center shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)]">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="mt-3 text-sm text-slate-900/60">{description}</p>
        </div>
      </section>
    </main>
  );
}

function Panel({ title, children, className = "", hideTitle = false }) {
  return (
    <section
      className={`rounded-xl bg-white p-6 shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] ${className}`}
    >
      {!hideTitle && (
        <h2 className="mb-5 text-xl font-bold text-gray-900">{title}</h2>
      )}
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
  isPending = false,
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
            disabled={isPending}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
              danger ? "bg-red-500 hover:bg-red-600" : "bg-sky-700 hover:bg-sky-800"
            }`}
          >
            {isPending ? "처리 중..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
