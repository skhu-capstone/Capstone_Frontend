import { createElement, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Image as ImageIcon,
  Loader2,
  Mail,
  MapPin,
} from "lucide-react";
import { getClubDetail } from "../../services/clubService";

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-3 rounded-xl bg-slate-50 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
        {createElement(Icon, { size: 18, strokeWidth: 2 })}
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
  const [hasImageError, setHasImageError] = useState(false);
  const { data: club, isLoading, isError, refetch } = useQuery({
    queryKey: ["clubDetail", clubId],
    queryFn: () => getClubDetail(clubId),
    enabled: Boolean(clubId),
  });

  if (isLoading) {
    return (
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50">
        <Loader2 size={30} className="animate-spin text-blue-500" />
      </main>
    );
  }

  if (isError || !club) {
    return (
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50 px-5">
        <div className="flex w-full max-w-lg flex-col items-center gap-3 rounded-2xl border border-red-100 bg-white p-10 text-center shadow-sm">
          <AlertCircle size={32} className="text-red-400" />
          <p className="font-medium text-gray-700">동아리 정보를 불러오지 못했습니다.</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => navigate(-1)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">
              돌아가기
            </button>
            <button type="button" onClick={() => refetch()} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 cursor-pointer">
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
          className="mb-5 flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:bg-white hover:text-gray-800 cursor-pointer"
        >
          <ArrowLeft size={17} />
          동아리 목록으로
        </button>

        <article className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="relative aspect-[21/8] min-h-56 overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
            {club.imageUrl && !hasImageError ? (
              <img
                src={club.imageUrl}
                alt={`${club.clubName} 대표 이미지`}
                className="h-full w-full object-cover"
                onError={() => setHasImageError(true)}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-blue-300">
                <ImageIcon size={56} strokeWidth={1.4} />
              </div>
            )}
          </div>

          <div className="p-6 sm:p-9">
            {club.category && (
              <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {club.category}
              </span>
            )}
            <h1 className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">{club.clubName}</h1>
            <p className="mt-3 text-base leading-7 text-gray-500">
              {club.shortDescription || "동아리 소개가 아직 등록되지 않았습니다."}
            </p>

            <section className="mt-8">
              <h2 className="text-base font-bold text-gray-900">동아리 소개</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-600">
                {club.detailDescription || "상세 소개가 아직 등록되지 않았습니다."}
              </p>
            </section>

            <section className="mt-8 grid gap-3 sm:grid-cols-3">
              <InfoItem icon={CalendarDays} label="정기 모임" value={club.regularMeetingTime} />
              <InfoItem icon={MapPin} label="활동 장소" value={club.activityLocation} />
              <InfoItem icon={Mail} label="연락처" value={club.contact} />
            </section>
          </div>
        </article>
      </div>
    </main>
  );
}
