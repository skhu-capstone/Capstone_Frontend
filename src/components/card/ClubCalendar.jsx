import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  createClubEvent,
  deleteClubEvent,
  getClubEventDetail,
  getClubMonthlyEvents,
  updateClubEvent,
} from "../../services/calendarService";
import "./ClubCalendar.css";

const emptyForm = {
  title: "",
  start: "",
  end: "",
  description: "",
  location: "",
};

export default function ClubCalendar({ clubId, canManage = false }) {
  const [events, setEvents] = useState([]);
  const [visibleMonth, setVisibleMonth] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [modalMode, setModalMode] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isModalOpen = modalMode === "create" || modalMode === "edit";

  useEffect(() => {
    if (!clubId || !visibleMonth) return;

    setIsLoading(true);
    setIsError(false);

    getClubMonthlyEvents({
      clubId,
      year: visibleMonth.year,
      month: visibleMonth.month,
    })
      .then((data) => {
        setEvents(data.map(mapServerEventToCalendarEvent));
      })
      .catch((error) => {
        console.error(error);
        setIsError(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [clubId, visibleMonth]);

  const handleDatesSet = (info) => {
    const currentDate = info.view.currentStart;
    const nextVisibleMonth = {
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
    };

    setVisibleMonth((prev) =>
      prev?.year === nextVisibleMonth.year &&
      prev?.month === nextVisibleMonth.month
        ? prev
        : nextVisibleMonth
    );
  };

  const openCreateModal = (selectedDate = "") => {
    if (!canManage) return;

    setSelectedEvent(null);
    setFormError("");
    setForm({
      ...emptyForm,
      start: selectedDate,
      end: selectedDate,
    });
    setModalMode("create");
  };

  const openEditModal = async (calendarEvent) => {
    if (!canManage) return;

    setFormError("");
    const fallbackEvent = events.find((event) => event.id === calendarEvent.id);
    const eventData = await getClubEventDetail({
      clubId,
      eventId: calendarEvent.id,
    })
      .then(mapServerEventToCalendarEvent)
      .catch((error) => {
        console.error(error);
        return fallbackEvent;
      });

    if (!eventData) return;

    setSelectedEvent(eventData);
    setForm({
      title: eventData.title ?? "",
      start: toDateInputValue(eventData.start),
      end: toDateInputValue(eventData.end ?? eventData.start),
      description: eventData.description ?? "",
      location: eventData.location ?? "",
    });
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedEvent(null);
    setForm(emptyForm);
    setFormError("");
    setIsSubmitting(false);
  };

  const handleChange = (field, value) => {
    setFormError("");
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      startAt: toStartDateTimeString(form.start),
      endAt: toEndDateTimeString(form.end || form.start),
      location: form.location.trim(),
    };

    if (!payload.title || !payload.startAt) {
      setFormError("제목과 시작일을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      if (modalMode === "create") {
        const newEvent = await createClubEvent({
          clubId,
          event: payload,
        });
        setEvents((prev) => [...prev, mapServerEventToCalendarEvent(newEvent)]);
      }

      if (modalMode === "edit" && selectedEvent) {
        const updatedEvent = await updateClubEvent({
          clubId,
          eventId: selectedEvent.id,
          event: payload,
        });
        setEvents((prev) =>
          prev.map((eventItem) =>
            eventItem.id === selectedEvent.id
              ? mapServerEventToCalendarEvent(updatedEvent)
              : eventItem
          )
        );
      }

      closeModal();
    } catch (error) {
      console.error(error);
      setFormError(
        error.response?.data?.message || "일정 저장에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;

    setIsSubmitting(true);
    setFormError("");

    try {
      await deleteClubEvent({
        clubId,
        eventId: selectedEvent.id,
      });
      setEvents((prev) =>
        prev.filter((eventItem) => eventItem.id !== selectedEvent.id)
      );
      closeModal();
    } catch (error) {
      console.error(error);
      setFormError(
        error.response?.data?.message || "일정 삭제에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="club-calendar-wrap py-7">
      <div className="rounded-xl bg-white p-6 shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)]">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Calendar</h2>
            <p className="mt-1 text-sm text-slate-900/60">
              동아리 일정을 확인하세요
            </p>
          </div>

          {canManage && (
            <button
              type="button"
              onClick={() => openCreateModal()}
              className="rounded-xl bg-sky-700 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-800"
            >
              일정 추가
            </button>
          )}
        </div>

        {isLoading && (
          <p className="mb-3 text-sm text-slate-900/50">
            일정을 불러오는 중입니다.
          </p>
        )}

        {isError && (
          <p className="mb-3 text-sm text-red-500">
            일정을 불러오지 못했습니다.
          </p>
        )}

        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          height="auto"
          dayMaxEvents={3}
          displayEventTime={false}
          fixedWeekCount={false}
          selectable={canManage}
          dateClick={(info) => openCreateModal(info.dateStr)}
          datesSet={handleDatesSet}
          eventClick={(info) => openEditModal(info.event)}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "",
          }}
          buttonText={{
            today: "Today",
          }}
        />
      </div>

      {isModalOpen && (
        <EventModal
          mode={modalMode}
          form={form}
          onChange={handleChange}
          onClose={closeModal}
          onDelete={handleDelete}
          onSubmit={handleSubmit}
          formError={formError}
          isSubmitting={isSubmitting}
        />
      )}
    </section>
  );
}

const mapServerEventToCalendarEvent = (event) => ({
  id: String(event.eventId),
  title: event.title ?? "",
  start: event.startAt,
  end: event.endAt,
  description: event.description ?? "",
  location: event.location ?? "",
  extendedProps: {
    description: event.description ?? "",
    location: event.location ?? "",
  },
});

const toStartDateTimeString = (date) => {
  if (!date) return "";
  return `${date}T00:00:00.000Z`;
};

const toEndDateTimeString = (date) => {
  if (!date) return "";
  return `${date}T23:59:59.000Z`;
};

const toDateInputValue = (dateTime) => {
  if (!dateTime) return "";
  return String(dateTime).slice(0, 10);
};

function EventModal({
  mode,
  form,
  onChange,
  onClose,
  onDelete,
  onSubmit,
  formError,
  isSubmitting,
}) {
  const isEditMode = mode === "edit";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
	      onClick={(event) => {
	        if (event.target === event.currentTarget && !isSubmitting) onClose();
	      }}
    >
      <form
        onSubmit={onSubmit}
        className="flex w-full max-w-lg flex-col gap-5 rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {isEditMode ? "일정 수정" : "일정 추가"}
            </h3>
            <p className="mt-1 text-sm text-slate-900/60">
              동아리 캘린더에 표시할 일정을 입력하세요
            </p>
          </div>

	          <button
	            type="button"
	            onClick={onClose}
	            disabled={isSubmitting}
	            className="flex h-8 w-8 items-center justify-center rounded-full text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
	            aria-label="닫기"
          >
            ×
          </button>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-700">제목</span>
          <input
            type="text"
            value={form.title}
            onChange={(event) => onChange("title", event.target.value)}
            placeholder="예) 정기 회의"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-sky-700"
            required
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-slate-700">시작일</span>
            <input
              type="date"
              value={form.start}
              onChange={(event) => onChange("start", event.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-sky-700"
              required
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-slate-700">종료일</span>
            <input
              type="date"
              value={form.end}
              min={form.start}
              onChange={(event) => onChange("end", event.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-sky-700"
            />
          </label>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-700">메모</span>
	          <textarea
	            value={form.description}
	            onChange={(event) => onChange("description", event.target.value)}
	            placeholder="일정 내용을 입력하세요"
	            className="min-h-28 resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-sky-700"
	          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-700">장소</span>
          <input
            type="text"
            value={form.location}
            onChange={(event) => onChange("location", event.target.value)}
            placeholder="예) 미가엘관 M301"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-sky-700"
          />
	        </label>

	        {formError && (
	          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-500">
	            {formError}
	          </p>
	        )}

	        <div className="flex items-center justify-between pt-2">
	          {isEditMode ? (
	            <button
	              type="button"
	              onClick={onDelete}
	              disabled={isSubmitting}
	              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
	            >
	              {isSubmitting ? "삭제 중..." : "삭제"}
	            </button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2">
	            <button
	              type="button"
	              onClick={onClose}
	              disabled={isSubmitting}
	              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
	            >
	              취소
	            </button>
	            <button
	              type="submit"
	              disabled={isSubmitting}
	              className="rounded-xl bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
	            >
	              {isSubmitting ? "저장 중..." : isEditMode ? "저장" : "추가"}
	            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
