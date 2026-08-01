import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  createClubCalendarEvent,
  deleteClubCalendarEvent,
  getClubCalendarEvents,
  updateClubCalendarEvent,
} from "../../services/clubCalendarService";
import "./ClubCalendar.css";

const emptyForm = {
  title: "",
  start: "",
  end: "",
  description: "",
};

export default function ClubCalendar({ clubId, canManage = false }) {
  const [events, setEvents] = useState([]);
  const [modalMode, setModalMode] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const isModalOpen = modalMode === "create" || modalMode === "edit";

  useEffect(() => {
    if (!clubId) return;

    getClubCalendarEvents(clubId).then(setEvents);
  }, [clubId]);

  const openCreateModal = (selectedDate = "") => {
    if (!canManage) return;

    setSelectedEvent(null);
    setForm({
      ...emptyForm,
      start: selectedDate,
      end: selectedDate,
    });
    setModalMode("create");
  };

  const openEditModal = (calendarEvent) => {
    if (!canManage) return;

    const eventData = events.find((event) => event.id === calendarEvent.id);
    if (!eventData) return;

    setSelectedEvent(eventData);
    setForm({
      title: eventData.title ?? "",
      start: eventData.start ?? "",
      end: eventData.end ?? eventData.start ?? "",
      description: eventData.description ?? "",
    });
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedEvent(null);
    setForm(emptyForm);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      title: form.title.trim(),
      start: form.start,
      end: form.end || form.start,
      description: form.description.trim(),
    };

    if (!payload.title || !payload.start) return;

    if (modalMode === "create") {
      const newEvent = await createClubCalendarEvent(clubId, payload);
      setEvents((prev) => [...prev, newEvent]);
    }

    if (modalMode === "edit" && selectedEvent) {
      const updatedEvent = await updateClubCalendarEvent(
        clubId,
        selectedEvent.id,
        payload
      );
      setEvents((prev) =>
        prev.map((eventItem) =>
          eventItem.id === selectedEvent.id ? updatedEvent : eventItem
        )
      );
    }

    closeModal();
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;

    await deleteClubCalendarEvent(clubId, selectedEvent.id);
    setEvents((prev) =>
      prev.filter((eventItem) => eventItem.id !== selectedEvent.id)
    );
    closeModal();
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

        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          height="auto"
          dayMaxEvents={3}
          fixedWeekCount={false}
          selectable={canManage}
          dateClick={(info) => openCreateModal(info.dateStr)}
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
        />
      )}
    </section>
  );
}

function EventModal({
  mode,
  form,
  onChange,
  onClose,
  onDelete,
  onSubmit,
}) {
  const isEditMode = mode === "edit";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
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
            placeholder="장소나 준비물을 적어둘 수 있어요"
            className="min-h-28 resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-sky-700"
          />
        </label>

        <div className="flex items-center justify-between pt-2">
          {isEditMode ? (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50"
            >
              삭제
            </button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100"
            >
              취소
            </button>
            <button
              type="submit"
              className="rounded-xl bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-800"
            >
              {isEditMode ? "저장" : "추가"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
