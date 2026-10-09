// src/app/(dashboard)/dashboard/appointments/page.jsx
"use client";

import { useEffect, useState } from "react";
import StatusBadge from "@/components/ui/StatusBadge";
import Modal from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [rescheduleModal, setRescheduleModal] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({ date: "", time: "10:00 AM", reason: "" });
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function fetchAppointments() {
    setLoading(true);
    try {
      const res = await fetch("/api/appointments");
      if (res.ok) {
        const d = await res.json();
        // Defensive unwrapping for { appointments: [...] }, { data: [...] }, or raw array
        if (Array.isArray(d)) {
          setAppointments(d);
        } else if (Array.isArray(d.appointments)) {
          setAppointments(d.appointments);
        } else if (Array.isArray(d.data)) {
          setAppointments(d.data);
        } else {
          setAppointments([]);
        }
      } else {
        setAppointments([]);
      }
    } catch (err) {
      console.error("Failed to load appointments", err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleRescheduleSubmit(e) {
    e.preventDefault();
    if (!selectedAppt) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/appointments/${selectedAppt.id}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rescheduleForm),
      });
      if (res.ok) {
        setRescheduleModal(false);
        setRescheduleForm({ date: "", time: "10:00 AM", reason: "" });
        fetchAppointments();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to reschedule appointment");
      }
    } catch (e) {
      console.error("Reschedule error", e);
    } finally {
      setSubmitting(false);
    }
  }

  const apptList = Array.isArray(appointments) ? appointments : [];

  const filtered = apptList.filter((appt) => {
    const patientName = appt.patient?.fullName || appt.patient?.name || "";
    const hospName = appt.hospital?.name || "";
    const refCode = appt.referral?.referralId || "";
    const matchesSearch =
      patientName.toLowerCase().includes(search.toLowerCase()) ||
      hospName.toLowerCase().includes(search.toLowerCase()) ||
      refCode.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStatus === "ALL") return true;
    return appt.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="anim-slide-up flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800">Hospital Appointments</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Track scheduled visits, confirmations, and patient slot reschedules
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="anim-slide-up d1 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["ALL", "REQUESTED", "CONFIRMED", "RESCHEDULED", "COMPLETED", "CANCELLED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                filterStatus === st
                  ? "bg-teal-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st === "ALL" ? "All Slots" : st.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        <div className="relative">
          <span className="absolute left-3.5 top-3 text-slate-400">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient name, hospital, or referral ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Appointment Cards */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-2xl anim-shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 anim-scale">
          <span className="text-4xl">🗓️</span>
          <h3 className="text-base font-bold text-slate-700 mt-2">No Appointments Found</h3>
          <p className="text-xs text-slate-400 mt-1">
            {search ? "No records match your query." : "No patient appointments have been scheduled yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((appt, idx) => {
            const patientName = appt.patient?.fullName || appt.patient?.name || "Patient";
            return (
              <div
                key={appt.id}
                className={`anim-slide-up d${Math.min(idx + 1, 8)} bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">{patientName}</span>
                    <StatusBadge status={appt.status} />
                    {appt.referral?.referralId && (
                      <span className="font-mono text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                        {appt.referral.referralId}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-600">
                    <span className="font-semibold text-teal-800">
                      📅 {formatDate(appt.appointmentDate)} at {appt.appointmentTime || "10:00 AM"}
                    </span>
                    <span>•</span>
                    <span>🏥 {appt.hospital?.name || "Empanelled Hospital"}</span>
                    {appt.department?.name && <span>({appt.department.name})</span>}
                  </div>

                  {appt.notes && (
                    <p className="text-xs text-slate-400 truncate max-w-xl mt-1">
                      Notes: {appt.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  {appt.status !== "COMPLETED" && appt.status !== "CANCELLED" && (
                    <button
                      onClick={() => {
                        setSelectedAppt(appt);
                        setRescheduleModal(true);
                      }}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all active:scale-95"
                    >
                      Reschedule
                    </button>
                  )}
                  {appt.referral?.id && (
                    <a
                      href={`/dashboard/referrals/${appt.referral.id}`}
                      className="px-3.5 py-2 bg-teal-50 hover:bg-teal-600 hover:text-white text-teal-700 font-bold text-xs rounded-xl transition-all"
                    >
                      Case Hub →
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reschedule Modal */}
      <Modal
        isOpen={rescheduleModal}
        onClose={() => setRescheduleModal(false)}
        title="Reschedule Appointment"
      >
        <form onSubmit={handleRescheduleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">New Appointment Date *</label>
            <input
              type="date"
              value={rescheduleForm.date}
              onChange={(e) => setRescheduleForm({ ...rescheduleForm, date: e.target.value })}
              required
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Appointment Time</label>
            <input
              type="text"
              value={rescheduleForm.time}
              onChange={(e) => setRescheduleForm({ ...rescheduleForm, time: e.target.value })}
              placeholder="e.g. 11:30 AM or 02:30 PM"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Reason for Reschedule *</label>
            <textarea
              rows={2}
              value={rescheduleForm.reason}
              onChange={(e) => setRescheduleForm({ ...rescheduleForm, reason: e.target.value })}
              required
              placeholder="e.g. Patient requested afternoon slot due to travel logistics"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? "Updating Appointment..." : "Confirm Reschedule"}
          </button>
        </form>
      </Modal>
    </div>
  );
}