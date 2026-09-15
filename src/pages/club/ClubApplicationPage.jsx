import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  ClipboardCheck,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { getClubs } from "../../services/clubService";

function ClubCard({ club }) {
  const navigate = useNavigate();
  const [hasImageError, setHasImageError] = useState(false);

  const goToDetail = () => {
    navigate(`/club/apply/${club.id}`);
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={goToDetail}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          goToDetail();
        }
      }}
      aria-label={`${club.clubName} 상세 정보 보기`}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-100 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
        {club.imageUrl && !hasImageError ? (
          <img
            src={club.imageUrl}
            alt={`${club.clubName} 대표 이미지`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setHasImageError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-blue-300">
            <ImageIcon size={40} strokeWidth={1.5} />
          </div>
        )}

        {club.category && (
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm backdrop-blur-sm">
            {club.category}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-lg font-bold text-gray-900">{club.clubName}</h2>

        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-gray-500">
          {club.shortDescription || "동아리 소개가 아직 등록되지 않았습니다."}
        </p>

        <div className="mt-auto pt-5">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              goToDetail();
            }}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            신청하기
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function ClubApplicationPage() {
  const {
    data: clubData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["clubs"],
    queryFn: () =>
      getClubs({
        page: 0,
        size: 100,
      }),
  });

  const clubs = clubData?.content ?? [];

  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-50 px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <ClipboardCheck size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              동아리 신청
            </h1>

            <p className="mt-1.5 text-sm text-gray-500">
              관심 있는 동아리를 살펴보고 나에게 맞는 활동을 찾아보세요.
            </p>
          </div>
        </header>

        {isLoading && (
          <div className="flex min-h-80 flex-col items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-white text-gray-400 shadow-sm">
            <Loader2 size={28} className="animate-spin text-blue-500" />

            <p className="text-sm">동아리 목록을 불러오는 중입니다.</p>
          </div>
        )}

        {isError && (
          <div className="flex min-h-80 flex-col items-center justify-center gap-3 rounded-2xl border border-red-100 bg-white px-6 text-center shadow-sm">
            <AlertCircle size={30} className="text-red-400" />

            <div>
              <p className="font-medium text-gray-700">
                동아리 목록을 불러오지 못했습니다.
              </p>

              <p className="mt-1 text-sm text-gray-400">
                잠시 후 다시 시도해주세요.
              </p>
            </div>

            <button
              type="button"
              onClick={() => refetch()}
              className="mt-1 cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              다시 시도
            </button>
          </div>
        )}

        {!isLoading && !isError && clubs.length === 0 && (
          <div className="flex min-h-80 flex-col items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-white px-6 text-center shadow-sm">
            <ClipboardCheck size={32} className="text-gray-300" />

            <div>
              <p className="font-medium text-gray-700">
                현재 등록된 동아리가 없습니다.
              </p>

              <p className="mt-1 text-sm text-gray-400">
                새로운 동아리가 등록되면 이곳에 표시됩니다.
              </p>
            </div>
          </div>
        )}

        {!isLoading && !isError && clubs.length > 0 && (
          <>
            <p className="mb-4 text-sm text-gray-500">
              총{" "}
              <span className="font-semibold text-blue-600">
                {clubData?.totalElements ?? clubs.length}
              </span>
              개의 동아리
            </p>

            <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {clubs.map((club) => (
                <ClubCard key={club.id} club={club} />
              ))}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
