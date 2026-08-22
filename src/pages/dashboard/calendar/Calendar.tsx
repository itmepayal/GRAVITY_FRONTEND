import React, { useState, useMemo } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import { useGetUserWorkspaces } from "@/hooks/queries/workspace/use-get-user-workspaces";
import { useGetWorkspaceCalendarEvents } from "@/hooks/queries/calendar/use-get-workspace-calendar-events";
import { useCreateCalendarEvent } from "@/hooks/mutations/calendar/use-create-calendar-event";
import { useUpdateCalendarEvent } from "@/hooks/mutations/calendar/use-update-calendar-event";
import { useDeleteCalendarEvent } from "@/hooks/mutations/calendar/use-delete-calendar-event";
import { DashboardMetricsBanner } from "@/components/common/DashboardMetricsBanner";
import { toast } from "sonner";
import {
  FONT_GOLDMAN,
  FONT_POPPINS,
  COMMON_CLASSES,
} from "@/components/common/design-system";
import type { CalendarEventType } from "@/apis/calendar.api";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Building2,
  MapPin,
  Trash2,
  Pencil,
  X,
  AlertCircle,
  Video,
  ListOrdered,
  CalendarCheck2,
  Search,
} from "lucide-react";

export function Calendar() {
  const { openMobileNav } = useDashboardContext();

  const { data: workspacesResponse, isLoading: isLoadingWorkspaces } =
    useGetUserWorkspaces();
  const workspaces = workspacesResponse?.data || [];

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("");

  React.useEffect(() => {
    if (workspaces.length > 0 && !selectedWorkspaceId) {
      setSelectedWorkspaceId(workspaces[0]._id || workspaces[0].id);
    }
  }, [workspaces, selectedWorkspaceId]);

  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const todayMonth = () => {
    setCurrentDate(new Date());
  };

  const {
    data: eventsResponse,
    // isLoading: isLoadingEvents,
    refetch,
  } = useGetWorkspaceCalendarEvents(selectedWorkspaceId, {
    startDate: firstDayOfMonth.toISOString(),
    endDate: lastDayOfMonth.toISOString(),
  });

  const calendarEvents = eventsResponse?.data || [];

  // Filter & Search state
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredEvents = useMemo(() => {
    return calendarEvents.filter((ev: any) => {
      const matchesType = typeFilter === "all" || ev.type === typeFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        ev.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.location?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [calendarEvents, typeFilter, searchQuery]);

  // Metrics
  const activeWorkspaceName =
    workspaces.find((w: any) => (w._id || w.id) === selectedWorkspaceId)
      ?.name ?? "Workspace";

  const meetingsCount = useMemo(
    () => calendarEvents.filter((e: any) => e.type === "meeting").length,
    [calendarEvents],
  );

  const deadlinesCount = useMemo(
    () => calendarEvents.filter((e: any) => e.type === "deadline").length,
    [calendarEvents],
  );

  const metricCards = [
    {
      title: "Monthly Events",
      value: calendarEvents.length,
      subtitle: `Scheduled in ${currentDate.toLocaleString("default", {
        month: "long",
      })} ${year}`,
      icon: CalendarDays,
      accentColor: "#0F2D29",
      bgGradient: "from-[#0F2D29]/5 to-transparent",
    },
    {
      title: "Active Meetings",
      value: meetingsCount,
      subtitle: "Team syncs & video calls",
      icon: Video,
      accentColor: "#0F8A65",
      bgGradient: "from-[#0F8A65]/10 to-transparent",
    },
    {
      title: "Deadlines",
      value: deadlinesCount,
      subtitle: "Upcoming project targets",
      icon: AlertCircle,
      accentColor: "#E11D48",
      bgGradient: "from-[#E11D48]/10 to-transparent",
    },
    {
      title: "Workspace",
      value: activeWorkspaceName,
      subtitle: `${workspaces.length} workspaces available`,
      icon: Building2,
      accentColor: "#6366F1",
      bgGradient: "from-[#6366F1]/10 to-transparent",
    },
  ];

  // Calendar Grid Days Calculation
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  // Map events to day numbers
  const eventsByDay = useMemo(() => {
    const map: Record<number, any[]> = {};
    filteredEvents.forEach((ev: any) => {
      const d = new Date(ev.startTime);
      if (d.getMonth() === month && d.getFullYear() === year) {
        const dayNum = d.getDate();
        if (!map[dayNum]) map[dayNum] = [];
        map[dayNum].push(ev);
      }
    });
    return map;
  }, [filteredEvents, month, year]);

  // Mutations
  const { mutate: createEvent, isPending: isCreatingEvent } =
    useCreateCalendarEvent();
  const { mutate: updateEvent } = useUpdateCalendarEvent();
  const { mutate: deleteEvent } = useDeleteCalendarEvent();

  // Create & Edit Event Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventType, setEventType] = useState<CalendarEventType>("meeting");
  const [eventDate, setEventDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [eventStartTime, setEventStartTime] = useState("10:00");
  const [eventEndTime, setEventEndTime] = useState("11:00");
  const [eventLocation, setEventLocation] = useState("");

  // Delete Confirmation Modal State
  const [eventToDelete, setEventToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const resetForm = () => {
    setEditingEventId(null);
    setEventTitle("");
    setEventDesc("");
    setEventType("meeting");
    setEventDate(new Date().toISOString().split("T")[0]);
    setEventStartTime("10:00");
    setEventEndTime("11:00");
    setEventLocation("");
  };

  const handleEditEvent = (ev: any) => {
    setEditingEventId(ev._id || ev.id);
    setEventTitle(ev.title || "");
    setEventDesc(ev.description || "");
    setEventType(ev.type || "meeting");
    if (ev.startTime) {
      const d = new Date(ev.startTime);
      setEventDate(d.toISOString().split("T")[0]);
      setEventStartTime(d.toTimeString().slice(0, 5));
    }
    if (ev.endTime) {
      const d = new Date(ev.endTime);
      setEventEndTime(d.toTimeString().slice(0, 5));
    }
    setEventLocation(ev.location || "");
    setIsCreateModalOpen(true);
  };

  const handleCreateEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !selectedWorkspaceId) return;

    const startIso = new Date(
      `${eventDate}T${eventStartTime}:00`,
    ).toISOString();
    const endIso = new Date(`${eventDate}T${eventEndTime}:00`).toISOString();

    if (editingEventId) {
      updateEvent(
        {
          eventId: editingEventId,
          data: {
            title: eventTitle.trim(),
            description: eventDesc.trim(),
            type: eventType,
            startTime: startIso,
            endTime: endIso,
            location: eventLocation.trim(),
          },
        },
        {
          onSuccess: () => {
            setIsCreateModalOpen(false);
            resetForm();
            refetch();
          },
        },
      );
    } else {
      createEvent(
        {
          title: eventTitle.trim(),
          description: eventDesc.trim(),
          workspace: selectedWorkspaceId,
          type: eventType,
          startTime: startIso,
          endTime: endIso,
          location: eventLocation.trim(),
          color:
            eventType === "meeting"
              ? "#6366F1"
              : eventType === "deadline"
                ? "#E11D48"
                : eventType === "milestone"
                  ? "#10B981"
                  : "#F59E0B",
        },
        {
          onSuccess: () => {
            setIsCreateModalOpen(false);
            resetForm();
            refetch();
          },
        },
      );
    }
  };

  // Step 1: user clicks the trash icon -> just open the confirmation modal
  const handleDeleteEvent = (ev: any) => {
    setEventToDelete(ev);
  };

  // Step 2: user types the exact title and confirms -> actually delete
  const confirmDeleteEvent = () => {
    if (!eventToDelete) return;
    const eventId = eventToDelete._id || eventToDelete.id;

    setIsDeleting(true);
    deleteEvent(eventId, {
      onSuccess: () => {
        toast.success(`"${eventToDelete.title}" was deleted.`);
        setEventToDelete(null);
        setIsDeleting(false);
        refetch();
      },
      onError: (err: any) => {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to delete event.";
        toast.error(message);
        setIsDeleting(false);
      },
    });
  };

  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case "meeting":
        return {
          bg: "bg-indigo-50 text-indigo-800 border-indigo-200",
          dot: "bg-indigo-500",
        };
      case "deadline":
        return {
          bg: "bg-rose-50 text-rose-800 border-rose-200",
          dot: "bg-rose-500",
        };
      case "milestone":
        return {
          bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
          dot: "bg-emerald-500",
        };
      default:
        return {
          bg: "bg-amber-50 text-amber-800 border-amber-200",
          dot: "bg-amber-500",
        };
    }
  };

  return (
    <>
      <Topbar
        variant="light"
        title="Schedule & Calendar"
        subtitle={`${activeWorkspaceName} · ${monthName} ${year}`}
        onMenuClick={openMobileNav}
      />

      <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
        <DashboardMetricsBanner cards={metricCards} />

        <div className="border border-[#0F2D29]/15 bg-white p-4 shadow-2xs">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-[190px]">
                <label className={COMMON_CLASSES.labelUppercase}>
                  Workspace
                </label>
                <div className="relative">
                  <select
                    value={selectedWorkspaceId}
                    onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                    disabled={isLoadingWorkspaces}
                    className={COMMON_CLASSES.selectBase + " w-full pl-8"}
                  >
                    {workspaces.map((ws: any) => (
                      <option key={ws._id || ws.id} value={ws._id || ws.id}>
                        {ws.name}
                      </option>
                    ))}
                  </select>
                  <Building2
                    size={15}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#5B6E68]"
                  />
                </div>
              </div>

              {/* Month Navigation */}
              <div className="flex items-center gap-1.5 pt-5">
                <button
                  onClick={prevMonth}
                  className={COMMON_CLASSES.btnSecondary + " p-2"}
                  title="Previous Month"
                >
                  <ChevronLeft size={16} />
                </button>
                <span
                  className={`${FONT_GOLDMAN} min-w-[150px] text-center text-sm font-bold text-[#0F2D29] bg-[#0F2D29]/5 border border-[#0F2D29]/12 py-1.5 px-3`}
                >
                  {monthName} {year}
                </span>
                <button
                  onClick={nextMonth}
                  className={COMMON_CLASSES.btnSecondary + " p-2"}
                  title="Next Month"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={todayMonth}
                  className={COMMON_CLASSES.btnSecondary + " text-xs"}
                >
                  Today
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-[200px] flex-1">
                <label className={COMMON_CLASSES.labelUppercase}>
                  Search Events
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search event title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={COMMON_CLASSES.inputBase + " pl-8 text-xs"}
                  />
                  <Search
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#5B6E68]"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div className="min-w-[140px]">
                <label className={COMMON_CLASSES.labelUppercase}>
                  Filter Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className={COMMON_CLASSES.selectBase + " w-full"}
                >
                  <option value="all">All Types</option>
                  <option value="meeting">Meetings</option>
                  <option value="deadline">Deadlines</option>
                  <option value="milestone">Milestones</option>
                  <option value="reminder">Reminders</option>
                </select>
              </div>

              <div className="pt-5">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className={COMMON_CLASSES.btnPrimary}
                >
                  <Plus size={15} />
                  Schedule Event
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid & Agenda Stream Split */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left 3 Cols: Month Grid */}
          <div className="lg:col-span-3 border border-[#0F2D29]/15 bg-white p-4 sm:p-6 shadow-2xs">
            <div className="mb-4 flex items-center justify-between border-b border-[#0F2D29]/10 pb-3">
              <h3
                className={`${COMMON_CLASSES.headingTitle} text-base flex items-center gap-2`}
              >
                <CalendarCheck2 className="text-[#0F8A65]" size={18} />
                {monthName} {year} Schedule Grid
              </h3>
              <span
                className={`${FONT_GOLDMAN} bg-[#0F2D29]/6 text-[#0F2D29] border border-[#0F2D29]/15 px-3 py-1 text-xs font-bold`}
              >
                {filteredEvents.length} Events
              </span>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-px border border-[#0F2D29]/15 bg-[#0F2D29] text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className={`${FONT_GOLDMAN} bg-[#0F2D29] py-2 text-[11px] font-bold text-white uppercase tracking-wider`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days Cells Grid */}
            <div className="grid grid-cols-7 gap-px bg-[#0F2D29]/15 border-x border-b border-[#0F2D29]/15">
              {/* Blank padding cells before month start */}
              {[...Array(startingDayOfWeek)].map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="min-h-[110px] bg-gray-50/60 p-2 text-gray-300"
                />
              ))}

              {/* Month Day Cells */}
              {[...Array(daysInMonth)].map((_, i) => {
                const dayNum = i + 1;
                const isToday =
                  dayNum === new Date().getDate() &&
                  month === new Date().getMonth() &&
                  year === new Date().getFullYear();

                const dayEvents = eventsByDay[dayNum] || [];

                return (
                  <div
                    key={`day-${dayNum}`}
                    className={`min-h-[120px] bg-white p-2 transition hover:bg-emerald-50/20 flex flex-col ${
                      isToday
                        ? "bg-emerald-50/40 ring-2 ring-[#0F8A65] ring-inset"
                        : ""
                    }`}
                  >
                    {/* Day header */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`${FONT_GOLDMAN} flex h-6 w-6 items-center justify-center text-xs font-bold ${
                          isToday
                            ? "rounded-full bg-[#0F8A65] text-white shadow-2xs"
                            : "text-[#0F2D29]"
                        }`}
                      >
                        {dayNum}
                      </span>
                      {dayEvents.length > 0 && (
                        <span
                          className={`${FONT_POPPINS} text-[10px] font-semibold text-[#5B6E68] bg-[#0F2D29]/6 border border-[#0F2D29]/10 px-1.5 py-0.5`}
                        >
                          {dayEvents.length} ev
                        </span>
                      )}
                    </div>

                    {/* Day Events list */}
                    <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[95px] pr-0.5">
                      {dayEvents.map((ev: any) => {
                        const style = getTypeBadgeStyle(ev.type);
                        const timeStr = new Date(
                          ev.startTime,
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        });

                        return (
                          <div
                            key={ev._id || ev.id}
                            className={`group relative flex flex-col border px-2 py-1 text-[11px] font-medium transition hover:shadow-2xs ${style.bg}`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1 min-w-0">
                                <span
                                  className={`h-1.5 w-1.5 rounded-full shrink-0 ${style.dot}`}
                                />
                                <span className="truncate font-semibold text-[#0F2D29]">
                                  {ev.title}
                                </span>
                              </div>
                              <div className="hidden group-hover:flex items-center gap-1">
                                <button
                                  onClick={() => handleEditEvent(ev)}
                                  className="text-[#0F8A65] hover:text-[#0F2D29]"
                                  title="Edit Event"
                                >
                                  <Pencil size={11} />
                                </button>
                                <button
                                  onClick={() => handleDeleteEvent(ev)}
                                  className="text-rose-600 hover:text-rose-800"
                                  title="Delete Event"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </div>
                            <span className="text-[9.5px] opacity-75 mt-0.5">
                              {timeStr}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border border-[#0F2D29]/15 bg-white p-5 shadow-2xs flex flex-col">
            <div className="mb-4 flex items-center justify-between border-b border-[#0F2D29]/10 pb-3">
              <h3
                className={`${COMMON_CLASSES.headingTitle} text-sm flex items-center gap-2`}
              >
                <ListOrdered className="text-[#0F8A65]" size={16} />
                Upcoming Agenda Stream
              </h3>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center my-auto">
                <CalendarDays size={28} className="text-[#8FA69E] mb-2" />
                <p className={`${COMMON_CLASSES.headingSubtitle} text-xs`}>
                  No events scheduled for this view.
                </p>
              </div>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[520px] pr-1">
                {filteredEvents.slice(0, 10).map((ev: any) => {
                  const style = getTypeBadgeStyle(ev.type);
                  const dateStr = new Date(ev.startTime).toLocaleDateString(
                    [],
                    {
                      month: "short",
                      day: "numeric",
                    },
                  );
                  const timeStr = new Date(ev.startTime).toLocaleTimeString(
                    [],
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  );

                  return (
                    <div
                      key={ev._id || ev.id}
                      className="border border-[#0F2D29]/12 bg-white p-3 shadow-2xs hover:border-[#0F8A65]/40 transition space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`${FONT_GOLDMAN} text-[10px] uppercase border px-2 py-0.5 font-bold ${style.bg}`}
                        >
                          {ev.type}
                        </span>
                        <span
                          className={`${FONT_POPPINS} text-[10.5px] font-semibold text-[#5B6E68]`}
                        >
                          {dateStr} · {timeStr}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <h4
                          className={`${FONT_GOLDMAN} text-xs font-bold text-[#0F2D29] line-clamp-1`}
                        >
                          {ev.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditEvent(ev)}
                            className="text-[#0F8A65] hover:text-[#0F2D29] text-xs font-semibold"
                            title="Edit Event"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(ev)}
                            className="text-rose-600 hover:text-rose-800 text-xs font-semibold"
                            title="Delete Event"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {ev.location && (
                        <div className="flex items-center gap-1 text-[11px] text-[#5B6E68]">
                          <MapPin size={12} className="text-[#8FA69E]" />
                          <span className="truncate">{ev.location}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/40 backdrop-blur-xs p-4">
          <div className={COMMON_CLASSES.modalShell}>
            <div className="flex items-center justify-between border-b border-[#0F2D29]/15 p-4">
              <h3
                className={`${COMMON_CLASSES.headingTitle} text-base flex items-center gap-2`}
              >
                <Plus className="text-[#0F8A65]" size={18} />
                Schedule New Event
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateEventSubmit} className="p-4 space-y-4">
              <div>
                <label className={COMMON_CLASSES.labelUppercase}>
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sprint Planning Sync"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className={COMMON_CLASSES.inputBase}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={COMMON_CLASSES.labelUppercase}>
                    Event Type
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) =>
                      setEventType(e.target.value as CalendarEventType)
                    }
                    className={COMMON_CLASSES.selectBase + " w-full"}
                  >
                    <option value="meeting">Meeting</option>
                    <option value="deadline">Deadline</option>
                    <option value="milestone">Milestone</option>
                    <option value="reminder">Reminder</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className={COMMON_CLASSES.labelUppercase}>Date</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className={COMMON_CLASSES.inputBase}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={COMMON_CLASSES.labelUppercase}>
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                    className={COMMON_CLASSES.inputBase}
                  />
                </div>

                <div>
                  <label className={COMMON_CLASSES.labelUppercase}>
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={eventEndTime}
                    onChange={(e) => setEventEndTime(e.target.value)}
                    className={COMMON_CLASSES.inputBase}
                  />
                </div>
              </div>

              <div>
                <label className={COMMON_CLASSES.labelUppercase}>
                  Location / Meeting Link
                </label>
                <input
                  type="text"
                  placeholder="e.g. Google Meet link or Room 402"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className={COMMON_CLASSES.inputBase}
                />
              </div>

              <div>
                <label className={COMMON_CLASSES.labelUppercase}>
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Event details..."
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  className={COMMON_CLASSES.inputBase}
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#0F2D29]/15 pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className={COMMON_CLASSES.btnSecondary}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingEvent}
                  className={COMMON_CLASSES.btnPrimary}
                >
                  {isCreatingEvent ? "Scheduling..." : "Schedule Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/40 backdrop-blur-xs p-4">
          <div className={COMMON_CLASSES.modalShell + " max-w-md"}>
            <div className="flex items-center justify-between border-b border-[#0F2D29]/15 p-4">
              <h3
                className={`${COMMON_CLASSES.headingTitle} text-base flex items-center gap-2 text-rose-700`}
              >
                <Trash2 size={18} />
                Delete Calendar Event
              </h3>
              <button
                onClick={() => !isDeleting && setEventToDelete(null)}
                disabled={isDeleting}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-40"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <p className={`${FONT_POPPINS} text-[13.5px] text-[#3A4B46]`}>
                Are you sure you want to permanently delete this event? This
                action cannot be undone.
              </p>

              <div className="border border-rose-200 bg-rose-50 px-3 py-2.5">
                <p
                  className={`${FONT_GOLDMAN} text-[13px] font-bold text-[#0F2D29] truncate`}
                >
                  {eventToDelete.title}
                </p>
                <p
                  className={`${FONT_POPPINS} mt-0.5 text-[11.5px] text-[#5B6E68]`}
                >
                  {new Date(eventToDelete.startTime).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {eventToDelete.location ? ` · ${eventToDelete.location}` : ""}
                </p>
              </div>

              <p className={`${FONT_POPPINS} text-[12px] text-[#8FA69E]`}>
                Type the event title below to confirm deletion.
              </p>

              <DeleteConfirmInput
                expectedTitle={eventToDelete.title}
                onConfirm={confirmDeleteEvent}
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[#0F2D29]/15 p-4">
              <button
                type="button"
                onClick={() => setEventToDelete(null)}
                disabled={isDeleting}
                className={COMMON_CLASSES.btnSecondary}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DeleteConfirmInput({
  expectedTitle,
  onConfirm,
}: {
  expectedTitle: string;
  onConfirm: () => void;
}) {
  const [value, setValue] = useState("");
  const isMatch =
    value.trim() === expectedTitle.trim() && value.trim().length > 0;

  return (
    <div className="space-y-2.5">
      <input
        type="text"
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={expectedTitle}
        className={COMMON_CLASSES.inputBase}
      />
      <button
        type="button"
        disabled={!isMatch}
        onClick={onConfirm}
        className={`${COMMON_CLASSES.btnPrimary} w-full justify-center bg-rose-600 hover:bg-rose-700 border-rose-600 disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <Trash2 size={15} />
        Confirm Delete
      </button>
    </div>
  );
}

export default Calendar;
