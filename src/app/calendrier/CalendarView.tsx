"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, X, Phone, User, Flag, Trash2, CalendarClock } from "lucide-react";
import type { CalendarEvent, CalendarClient, CalendarProject, EventType } from "@/lib/types";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

const EVENT_CONFIG: Record<EventType, { label: string; icon: React.ElementType; dot: string; badge: string }> = {
  RDV_TEL:   { label: "RDV Téléphonique", icon: Phone,  dot: "bg-neutral-900",  badge: "bg-neutral-900 text-white" },
  PERSONNEL: { label: "Personnel",         icon: User,   dot: "bg-neutral-400",  badge: "bg-neutral-100 text-neutral-700" },
  DEADLINE:  { label: "Deadline",          icon: Flag,   dot: "bg-neutral-600",  badge: "bg-neutral-800 text-white" },
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  // 0=lundi .. 6=dimanche
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function toLocalISO(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

interface FormState {
  title: string;
  description: string;
  type: EventType;
  date: string;
  time: string;
  clientId: string;
  projectId: string;
}

const defaultForm = (dateStr: string): FormState => ({
  title: "",
  description: "",
  type: "RDV_TEL",
  date: dateStr,
  time: "10:00",
  clientId: "",
  projectId: "",
});

export default function CalendarView({
  clients,
  projects,
}: {
  clients: CalendarClient[];
  projects: CalendarProject[];
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [upcoming, setUpcoming] = useState<CalendarEvent[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm(toLocalISO(today)));
  const [saving, setSaving] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch(`/api/events?year=${year}&month=${month}`);
      const text = await res.text();
      if (!text) { setEvents([]); return; }
      const data = JSON.parse(text);
      if (Array.isArray(data)) setEvents(data);
      else { console.error("[fetchEvents] réponse inattendue:", data); setEvents([]); }
    } catch (err) {
      console.error("[fetchEvents]", err);
      setEvents([]);
    }
  }, [year, month]);

  const fetchUpcoming = useCallback(async () => {
    try {
      const res = await fetch("/api/events?upcoming=true");
      const text = await res.text();
      if (!text) { setUpcoming([]); return; }
      const data = JSON.parse(text);
      if (Array.isArray(data)) setUpcoming(data);
    } catch { setUpcoming([]); }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);
  useEffect(() => { fetchUpcoming(); }, [fetchUpcoming]);

  function prevMonth() {
    setDirection(-1);
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }

  function nextMonth() {
    setDirection(1);
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  function openAdd(day: Date) {
    setSelectedDay(day);
    setForm(defaultForm(toLocalISO(day)));
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const [h, min] = form.time.split(":").map(Number);
    const dateObj = new Date(form.date);
    dateObj.setHours(h, min, 0, 0);

    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        description: form.description || null,
        type: form.type,
        date: dateObj.toISOString(),
        clientId: form.clientId || null,
        projectId: form.projectId || null,
        allDay: false,
      }),
    });

    await Promise.all([fetchEvents(), fetchUpcoming()]);
    setSaving(false);
    setShowModal(false);
  }

  async function deleteEvent(id: string) {
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    await Promise.all([fetchEvents(), fetchUpcoming()]);
  }

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const eventsForDay = (day: Date) =>
    events.filter(e => isSameDay(new Date(e.date), day));

  const selectedEvents = selectedDay ? eventsForDay(selectedDay) : [];

  return (
    <div className="p-8 bg-[#f5f5f5] min-h-full flex gap-6">
      {/* Calendrier principal */}
      <div className="flex-1 min-w-0">
        {/* Header mois */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              {MONTHS[month]} {year}
            </h1>
            <p className="text-sm text-neutral-400 mt-0.5">Calendrier</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-neutral-200 hover:bg-neutral-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-neutral-600" />
            </button>
            <button
              onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); setDirection(1); }}
              className="px-3 h-9 text-xs font-medium rounded-xl bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-600 transition-colors"
            >
              Aujourd&apos;hui
            </button>
            <button
              onClick={nextMonth}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-neutral-200 hover:bg-neutral-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-neutral-600" />
            </button>
          </div>
        </div>

        {/* Grille */}
        <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
          {/* Jours de la semaine */}
          <div className="grid grid-cols-7 border-b border-neutral-100">
            {DAYS.map(d => (
              <div key={d} className="py-3 text-center text-xs font-semibold text-neutral-400 uppercase tracking-widest">
                {d}
              </div>
            ))}
          </div>

          {/* Cellules */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${year}-${month}`}
              initial={{ opacity: 0, x: direction * 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -30 }}
              transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
              className="grid grid-cols-7"
            >
              {Array.from({ length: totalCells }).map((_, i) => {
                const dayNum = i - firstDay + 1;
                const isValid = dayNum >= 1 && dayNum <= daysInMonth;
                const date = isValid ? new Date(year, month, dayNum) : null;
                const isToday = date ? isSameDay(date, today) : false;
                const isSelected = date && selectedDay ? isSameDay(date, selectedDay) : false;
                const dayEvents = date ? eventsForDay(date) : [];
                const isWeekend = i % 7 >= 5;

                return (
                  <div
                    key={i}
                    onClick={() => date && setSelectedDay(isSelected ? null : date)}
                    className={[
                      "min-h-[90px] p-2 border-b border-r border-neutral-100 last:border-r-0 relative group",
                      isValid ? "cursor-pointer" : "bg-neutral-50/50",
                      isWeekend && isValid ? "bg-neutral-50/30" : "",
                      isSelected ? "bg-neutral-900 text-white" : isValid ? "hover:bg-neutral-50" : "",
                      "[&:nth-child(7n)]:border-r-0",
                    ].join(" ")}
                  >
                    {isValid && (
                      <>
                        <div className="flex items-start justify-between mb-1.5">
                          <span className={[
                            "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                            isToday && !isSelected ? "bg-neutral-900 text-white" : "",
                            isSelected ? "text-white" : "text-neutral-700",
                          ].join(" ")}>
                            {dayNum}
                          </span>
                          <button
                            onClick={e => { e.stopPropagation(); openAdd(date!); }}
                            className={[
                              "w-5 h-5 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                              isSelected ? "bg-white/20 text-white hover:bg-white/30" : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300",
                            ].join(" ")}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="space-y-0.5">
                          {dayEvents.slice(0, 3).map(ev => {
                            const cfg = EVENT_CONFIG[ev.type];
                            return (
                              <div
                                key={ev.id}
                                className={[
                                  "flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium truncate",
                                  isSelected ? "bg-white/15 text-white" : cfg.badge,
                                ].join(" ")}
                                title={ev.title}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? "bg-white/60" : cfg.dot}`} />
                                <span className="truncate">{ev.title}</span>
                              </div>
                            );
                          })}
                          {dayEvents.length > 3 && (
                            <p className={`text-[10px] pl-1 ${isSelected ? "text-white/60" : "text-neutral-400"}`}>
                              +{dayEvents.length - 3} autres
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Liste événements à venir */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-4">
          <CalendarClock className="w-4 h-4 text-neutral-400" />
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
            Événements à venir
          </p>
        </div>

        {upcoming.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-6 text-center">
            <p className="text-sm text-neutral-400">Aucun événement à venir</p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.map((ev, i) => {
              const cfg = EVENT_CONFIG[ev.type];
              const Icon = cfg.icon;
              const evDate = new Date(ev.date);
              const isEvToday = isSameDay(evDate, today);
              const dayLabel = isEvToday
                ? "Aujourd'hui"
                : new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short" }).format(evDate);
              const timeLabel = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(evDate);

              return (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                  className="group bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow duration-300 p-4 flex items-center gap-4"
                >
                  {/* Date block */}
                  <div className={`w-12 text-center shrink-0 rounded-xl py-2 ${isEvToday ? "bg-neutral-900" : "bg-neutral-100"}`}>
                    <p className={`text-[10px] font-semibold uppercase ${isEvToday ? "text-white/60" : "text-neutral-400"}`}>
                      {new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(evDate)}
                    </p>
                    <p className={`text-xl font-bold leading-tight ${isEvToday ? "text-white" : "text-neutral-900"}`}>
                      {evDate.getDate()}
                    </p>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.badge}`}>
                        <Icon className="w-2.5 h-2.5" />
                        {cfg.label}
                      </span>
                      <span className="text-xs text-neutral-400">{dayLabel} · {timeLabel}</span>
                    </div>
                    <p className="font-semibold text-neutral-900 text-sm mt-0.5 truncate">{ev.title}</p>
                    {(ev.client || ev.project) && (
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {ev.client?.name}{ev.client && ev.project && " · "}{ev.project?.title}
                      </p>
                    )}
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => deleteEvent(ev.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-neutral-300 hover:text-red-400 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Panel latéral */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, x: 24, width: 0 }}
            animate={{ opacity: 1, x: 0, width: 300 }}
            exit={{ opacity: 0, x: 24, width: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="shrink-0 overflow-hidden"
          >
            <div className="w-[300px] space-y-4">
              {/* En-tête du panel */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
                    {new Intl.DateTimeFormat("fr-FR", { weekday: "long" }).format(selectedDay)}
                  </p>
                  <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
                    {new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" }).format(selectedDay)}
                  </h2>
                </div>
                <button
                  onClick={() => openAdd(selectedDay)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#0a0a0a] text-white hover:bg-[#1a1a1a] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Événements du jour */}
              {selectedEvents.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-6 text-center">
                  <p className="text-sm text-neutral-400">Aucun événement</p>
                  <button
                    onClick={() => openAdd(selectedDay)}
                    className="mt-3 text-xs font-medium text-neutral-900 underline underline-offset-2"
                  >
                    Ajouter un événement
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {selectedEvents.map((ev, i) => {
                      const cfg = EVENT_CONFIG[ev.type];
                      const Icon = cfg.icon;
                      const time = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(ev.date));
                      return (
                        <motion.div
                          key={ev.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: i * 0.04, duration: 0.2 }}
                          className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-4 group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${cfg.badge}`}>
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-neutral-900 text-sm truncate">{ev.title}</p>
                                <p className="text-xs text-neutral-400 mt-0.5">{time} · {cfg.label}</p>
                                {ev.client && (
                                  <p className="text-xs text-neutral-500 mt-1">👤 {ev.client.name}</p>
                                )}
                                {ev.project && (
                                  <p className="text-xs text-neutral-500 mt-0.5">📁 {ev.project.title}</p>
                                )}
                                {ev.description && (
                                  <p className="text-xs text-neutral-400 mt-1.5 line-clamp-2">{ev.description}</p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => deleteEvent(ev.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-neutral-300 hover:text-red-400 shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal ajout d'événement */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-neutral-900">
                    Nouvel événement
                    {form.date && (
                      <span className="font-normal text-neutral-400 text-sm ml-2">
                        {new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" }).format(new Date(form.date + "T12:00:00"))}
                      </span>
                    )}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 text-neutral-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Type */}
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.entries(EVENT_CONFIG) as [EventType, typeof EVENT_CONFIG[EventType]][]).map(([type, cfg]) => {
                      const Icon = cfg.icon;
                      const active = form.type === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, type }))}
                          className={[
                            "flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all duration-150",
                            active ? "bg-neutral-900 border-neutral-900 text-white" : "bg-white border-neutral-200 text-neutral-500 hover:border-neutral-400",
                          ].join(" ")}
                        >
                          <Icon className="w-4 h-4" />
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Titre */}
                  <div>
                    <input
                      required
                      placeholder="Titre de l'événement"
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
                    />
                  </div>

                  {/* Date & heure */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Date</label>
                      <input
                        type="date"
                        required
                        value={form.date}
                        onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                        className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Heure</label>
                      <input
                        type="time"
                        value={form.time}
                        onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                        className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
                      />
                    </div>
                  </div>

                  {/* Client (pour RDV) */}
                  {form.type === "RDV_TEL" && (
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Client</label>
                      <select
                        value={form.clientId}
                        onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}
                        className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
                      >
                        <option value="">— Sélectionner un client —</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  )}

                  {/* Projet (pour Deadline) */}
                  {form.type === "DEADLINE" && (
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Projet lié</label>
                      <select
                        value={form.projectId}
                        onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}
                        className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
                      >
                        <option value="">— Sélectionner un projet —</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                      </select>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <textarea
                      placeholder="Notes (optionnel)"
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      rows={2}
                      className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white resize-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50"
                    >
                      {saving ? "Enregistrement..." : "Ajouter"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
