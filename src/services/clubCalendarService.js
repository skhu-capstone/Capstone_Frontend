const getStorageKey = (clubId) => `club-calendar-events:${clubId}`;

const readEvents = (clubId) => {
  if (!clubId) return [];

  try {
    const storedEvents = localStorage.getItem(getStorageKey(clubId));
    return storedEvents ? JSON.parse(storedEvents) : [];
  } catch {
    return [];
  }
};

const writeEvents = (clubId, events) => {
  localStorage.setItem(getStorageKey(clubId), JSON.stringify(events));
};

// TODO: 백엔드 일정 API가 완성되면 localStorage 대신 GET /api/clubs/{clubId}/schedules로 교체
export const getClubCalendarEvents = async (clubId) => {
  return readEvents(clubId);
};

// TODO: 백엔드 일정 API가 완성되면 POST /api/clubs/{clubId}/schedules로 교체
export const createClubCalendarEvent = async (clubId, eventData) => {
  const events = readEvents(clubId);
  const newEvent = {
    ...eventData,
    id: crypto.randomUUID(),
  };

  writeEvents(clubId, [...events, newEvent]);
  return newEvent;
};

// TODO: 백엔드 일정 API가 완성되면 PATCH /api/clubs/{clubId}/schedules/{eventId}로 교체
export const updateClubCalendarEvent = async (clubId, eventId, eventData) => {
  const events = readEvents(clubId);
  const updatedEvents = events.map((event) =>
    event.id === eventId ? { ...event, ...eventData } : event
  );

  writeEvents(clubId, updatedEvents);
  return updatedEvents.find((event) => event.id === eventId);
};

// TODO: 백엔드 일정 API가 완성되면 DELETE /api/clubs/{clubId}/schedules/{eventId}로 교체
export const deleteClubCalendarEvent = async (clubId, eventId) => {
  const events = readEvents(clubId);
  writeEvents(
    clubId,
    events.filter((event) => event.id !== eventId)
  );
};
