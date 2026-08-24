import { createElement, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Image as ImageIcon,
  Loader2,
  Mail,
  MapPin,
  Users,
} from "lucide-react";
import { getClubDetail, requestClubJoin } from "../../services/clubService";

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-3 rounded-xl bg-slate-50 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
        {createElement(Icon, {
          size: 18,
          strokeWidth: 2,
        })}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-400">{label}</p>

        <p className="mt-1 break-words text-sm font-medium text-gray-700">
          {value || "정보 없음"}
        </p>
      </div>
    </div>
  );
}

export default function ClubDetailPage() {
  const { clubId } = useParams();
  const navigate = useNavigate();

  const [joinMessage, setJoinMessage] = useState("");

  const numericClubId = Number(clubId);

  const {
    data: club,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["clubDetail", numericClubId],

    queryFn: () => getClubDetail(numericClubId),

    enabled: Number.isInteger(numericClubId) && numericClubId > 0,
  });

  const joinMutation = useMutation({
    mutationFn: () => requestClubJoin(numericClubId, joinMessage.trim()),

    onSuccess: () => {
      alert("동아리 가입 신청이 완료되었습니다.");

      setJoinMessage("");

      navigate("/club/apply");
    },

    onError: (error) => {
      console.error(error);

      alert(
        error.response?.data?.message || "동아리 가입 신청에 실패했습니다.",
      );
    },
  });

  const handleJoin = () => {
    if (!Number.isInteger(numericClubId) || numericClubId <= 0) {
      alert("잘못된 동아리 주소입니다.");
      return;
    }

    if (!joinMessage.trim()) {
      alert("가입 신청 메시지를 입력해주세요.");
      return;
    }

    joinMutation.mutate();
  };

  if (isLoading) {
    return (
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 size={30} className="animate-spin text-blue-500" />

          <p className="text-sm">동아리 정보를 불러오는 중입니다.</p>
        </div>
      </main>
    );
  }

  if (isError || !club) {
    return (
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50 px-5">
        <div className="flex w-full max-w-lg flex-col items-center gap-3 rounded-2xl border border-red-100 bg-white p-10 text-center shadow-sm">
          <AlertCircle size={32} className="text-red-400" />

          <p className="font-medium text-gray-700">
            동아리 정보를 불러오지 못했습니다.
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              돌아가기
            </button>

            <button
              type="button"
              onClick={() => refetch()}
              className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              다시 시도
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-50 px-5 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:bg-white hover:text-gray-800"
        >
          <ArrowLeft size={17} />
          동아리 목록으로
        </button>

        <article className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="relative aspect-[21/8] min-h-56 overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
            {club.imageUrl ? (
              <img
                src={club.imageUrl}
                alt={`${club.clubName} 대표 이미지`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-blue-300">
                <ImageIcon size={56} strokeWidth={1.4} />
              </div>
            )}
          </div>

          <div className="p-6 sm:p-9">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                {club.category && (
                  <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {club.category}
                  </span>
                )}

                <h1 className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">
                  {club.clubName}
                </h1>

                <p className="mt-3 text-base leading-7 text-gray-500">
                  {club.shortDescription ||
                    "동아리 소개가 아직 등록되지 않았습니다."}
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                <Users size={17} />
                <span>{club.memberCount ?? 0}명</span>
              </div>
            </div>

            <section className="mt-8">
              <h2 className="text-base font-bold text-gray-900">동아리 소개</h2>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-600">
                {club.detailDescription ||
                  "상세 소개가 아직 등록되지 않았습니다."}
              </p>
            </section>

            <section className="mt-8 grid gap-3 sm:grid-cols-3">
              <InfoItem
                icon={CalendarDays}
                label="정기 모임"
                value={club.regularMeetingTime}
              />

              <InfoItem
                icon={MapPin}
                label="활동 장소"
                value={club.activityLocation}
              />

              <InfoItem icon={Mail} label="연락처" value={club.contact} />
            </section>

            <section className="mt-10 border-t border-gray-100 pt-8">
              <h2 className="text-lg font-bold text-gray-900">
                동아리 가입 신청
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                가입하고 싶은 이유나 간단한 자기소개를 작성해주세요.
              </p>

              <textarea
                value={joinMessage}
                onChange={(event) => setJoinMessage(event.target.value)}
                placeholder="예) 웹 개발에 관심이 많고 동아리 프로젝트에 적극적으로 참여하고 싶습니다."
                rows={5}
                disabled={joinMutation.isPending}
                className="mt-5 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm leading-6 outline-none transition-colors focus:border-blue-400 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
              />

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleJoin}
                  disabled={!joinMessage.trim() || joinMutation.isPending}
                  className="flex min-w-36 cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {joinMutation.isPending && (
                    <Loader2 size={16} className="animate-spin" />
                  )}

                  {joinMutation.isPending ? "신청 중..." : "가입 신청하기"}
                </button>
              </div>
            </section>
          </div>
        </article>
      </div>
    </main>
  );
}
