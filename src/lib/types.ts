export type EventType = "RDV_TEL" | "PERSONNEL" | "DEADLINE";

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  type: EventType;
  date: string;
  endDate: string | null;
  allDay: boolean;
  clientId: string | null;
  projectId: string | null;
  client: { id: string; name: string } | null;
  project: { id: string; title: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarClient {
  id: string;
  name: string;
}

export interface CalendarProject {
  id: string;
  title: string;
}
