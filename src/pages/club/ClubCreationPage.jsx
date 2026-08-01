import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CalendarDays,
  Clock3,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Plus,
  Upload,
  X,
} from "lucide-react";
import {
  createClub,
  getPendingClubs,
  uploadClubImage,
} from "../../services/clubService";

const INITIAL_FORM = {
  clubName: "",
  category: "",
  shortDescription: "",
  detailDescription: "",
  regularMeetingTime: "",
  activityLocation: "",
  contact: "",
};

function ClubCreationModal({ onClose, onSuccess }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setApiError("");
  };

  const handleImageChange = (file) => {
    setImageFile(file);
    if (!file) {
      setImagePreview("");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setImagePreview(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.clubName.trim()) nextErrors.clubName = "동아리명을 입력해주세요.";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, value.trim()]),
    );

    setSubmitting(true);
    setApiError("");
    try {
      const createdClub = await createClub(payload);
      if (imageFile) await uploadClubImage(createdClub.id, imageFile);
      onSuccess();
    } catch (error) {
      setApiError(
        error.response?.data?.message ||
          "동아리 생성 신청에 실패했습니다. 입력 내용을 확인해주세요.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const fields = [
    { key: "clubName", label: "동아리명", placeholder: "예) SKHU 개발 동아리", required: true },
    { key: "category", label: "카테고리", placeholder: "예) 학술, 봉사, 문화, 체육" },
    { key: "shortDescription", label: "한 줄 소개", placeholder: "동아리를 한 문장으로 소개해주세요." },
    { key: "regularMeetingTime", label: "정기 모임 시간", placeholder: "예) 매주 목요일 오후 6시" },
    { key: "activityLocation", label: "활동 장소", placeholder: "예) 미가엘관 M301" },
    { key: "contact", label: "연락처", placeholder: "이메일, 오픈채팅 링크 등" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">동아리 생성 신청</h2>
            <p className="mt-0.5 text-xs text-gray-400">신청 내용은 관리자 승인 후 서비스에 노출됩니다.</p>
          </div>
          <button type="button" onClick={onClose} disabled={submitting} aria-label="닫기" className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-40 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            {apiError && (
              <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                <AlertCircle size={17} className="mt-0.5 shrink-0" />
                {apiError}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((field) => (
                <label key={field.key} className={field.key === "shortDescription" ? "sm:col-span-2" : ""}>
                  <span className="mb-1.5 block text-xs font-medium text-gray-600">
                    {field.label}
                    {field.required ? <span className="ml-1 text-red-400">*</span> : <span className="ml-1 font-normal text-gray-400">(선택)</span>}
                  </span>
                  <input
                    type="text"
                    value={form[field.key]}
                    onChange={(event) => setField(field.key, event.target.value)}
                    placeholder={field.placeholder}
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors ${errors[field.key] ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-blue-400"}`}
                  />
                  {errors[field.key] && <span className="mt-1 block text-xs text-red-500">{errors[field.key]}</span>}
                </label>
              ))}
            </div>

            <label>
              <span className="mb-1.5 block text-xs font-medium text-gray-600">상세 소개 <span className="font-normal text-gray-400">(선택)</span></span>
              <textarea
                value={form.detailDescription}
                onChange={(event) => setField("detailDescription", event.target.value)}
                placeholder="주요 활동, 운영 방식, 모집 대상 등을 자세히 작성해주세요."
                rows={5}
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm leading-6 outline-none transition-colors focus:border-blue-400"
              />
            </label>

            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-600">대표 이미지 <span className="font-normal text-gray-400">(선택)</span></p>
              <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-gray-300 bg-slate-50 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50/40">
                {imagePreview ? (
                  <img src={imagePreview} alt="대표 이미지 미리보기" className="h-20 w-28 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-lg bg-white text-gray-300">
                    <Upload size={24} />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-700">{imageFile?.name || "이미지를 선택해주세요"}</p>
                  <p className="mt-1 text-xs text-gray-400">이미지 파일을 선택하면 신청 후 자동으로 업로드됩니다.</p>
                </div>
                <input type="file" accept="image/*" onChange={(event) => handleImageChange(event.target.files?.[0] ?? null)} className="hidden" />
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
            <button type="button" onClick={onClose} disabled={submitting} className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 cursor-pointer">취소</button>
            <button type="submit" disabled={submitting} className="flex min-w-32 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer">
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? "신청 중..." : "생성 신청하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PendingClubCard({ club }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="grid sm:grid-cols-[220px_1fr]">
        <div className="relative min-h-48 overflow-hidden bg-gradient-to-br from-amber-50 to-orange-100 sm:min-h-full">
          {club.imageUrl ? (
            <img
              src={club.imageUrl}
              alt={`${club.clubName} 대표 이미지`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-48 items-center justify-center text-amber-300">
              <ImageIcon size={42} strokeWidth={1.5} />
            </div>
          )}
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-amber-50/95 px-3 py-1 text-xs font-semibold text-amber-700 shadow-sm backdrop-blur-sm">
            <Clock3 size={13} />
            승인 대기
          </span>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h2 className="text-xl font-bold text-gray-900">{club.clubName}</h2>
            {club.category && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {club.category}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            {club.shortDescription || "동아리 소개가 아직 등록되지 않았습니다."}
          </p>
          {club.detailDescription && (
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-400">
              {club.detailDescription}
            </p>
          )}

          <div className="mt-5 grid gap-2 border-t border-gray-100 pt-4 text-sm text-gray-500 sm:grid-cols-2">
            <div className="flex items-start gap-2">
              <CalendarDays size={16} className="mt-0.5 shrink-0 text-amber-500" />
              <span>{club.regularMeetingTime || "정기 모임 시간 미정"}</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-amber-500" />
              <span>{club.activityLocation || "활동 장소 미정"}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ClubCreationPage() {
  const [creationModalOpen, setCreationModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const {
    data: clubs = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["pendingClubs"],
    queryFn: getPendingClubs,
  });

  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-50 px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Plus size={25} strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">동아리 생성</h1>
              <p className="mt-1.5 text-sm text-gray-500">
                생성 신청 후 관리자 승인을 기다리고 있는 동아리 목록입니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCreationModalOpen(true)}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 cursor-pointer"
          >
            <Plus size={17} strokeWidth={2.5} />
            동아리 생성 신청하기
          </button>
        </header>

        {isLoading && (
          <div className="flex min-h-80 flex-col items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-white text-gray-400 shadow-sm">
            <Loader2 size={28} className="animate-spin text-amber-500" />
            <p className="text-sm">승인 대기 목록을 불러오는 중입니다.</p>
          </div>
        )}

        {isError && (
          <div className="flex min-h-80 flex-col items-center justify-center gap-3 rounded-2xl border border-red-100 bg-white px-6 text-center shadow-sm">
            <AlertCircle size={30} className="text-red-400" />
            <div>
              <p className="font-medium text-gray-700">승인 대기 목록을 불러오지 못했습니다.</p>
              <p className="mt-1 text-sm text-gray-400">관리자 권한을 확인한 후 다시 시도해주세요.</p>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600 cursor-pointer"
            >
              다시 시도
            </button>
          </div>
        )}

        {!isLoading && !isError && clubs.length === 0 && (
          <div className="flex min-h-80 flex-col items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-white px-6 text-center shadow-sm">
            <Clock3 size={34} className="text-gray-300" />
            <div>
              <p className="font-medium text-gray-700">승인 대기 중인 동아리가 없습니다.</p>
              <p className="mt-1 text-sm text-gray-400">새로운 동아리 생성 신청이 접수되면 이곳에 표시됩니다.</p>
            </div>
          </div>
        )}

        {!isLoading && !isError && clubs.length > 0 && (
          <section className="space-y-4">
            <p className="text-sm text-gray-500">
              승인 대기 <span className="font-semibold text-amber-600">{clubs.length}</span>건
            </p>
            {clubs.map((club) => (
              <PendingClubCard key={club.id} club={club} />
            ))}
          </section>
        )}
      </div>

      {creationModalOpen && (
        <ClubCreationModal
          onClose={() => setCreationModalOpen(false)}
          onSuccess={() => {
            setCreationModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ["pendingClubs"] });
          }}
        />
      )}
    </main>
  );
}
