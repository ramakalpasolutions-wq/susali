// src/app/(dashboard)/dashboard/audit-logs/page.jsx
"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import { formatDateTime } from "@/lib/utils";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  async function fetchAuditLogs() {
    setLoading(true);
    try {
      const res = await fetch("/api/audit-logs");
      if (res.ok) {
        const d = await res.json();
        // Defensive unwrapping for { auditLogs: [...] }, { logs: [...] }, { data: [...] }, or raw array
        if (Array.isArray(d)) {
          setLogs(d);
        } else if (Array.isArray(d.auditLogs)) {
          setLogs(d.auditLogs);
        } else if (Array.isArray(d.logs)) {
          setLogs(d.logs);
        } else if (Array.isArray(d.data)) {
          setLogs(d.data);
        } else {
          setLogs([]);
        }
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error("Failed to load audit logs", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }

  const logList = Array.isArray(logs) ? logs : [];

  const filtered = logList.filter((log) => {
    const term = search.toLowerCase();
    const matchesSearch =
      (log.action && log.action.toLowerCase().includes(term)) ||
      (log.entityType && log.entityType.toLowerCase().includes(term)) ||
      (log.userName && log.userName.toLowerCase().includes(term)) ||
      (log.ipAddress && log.ipAddress.includes(term));

    if (!matchesSearch) return false;
    if (actionFilter === "ALL") return true;
    return log.action === actionFilter;
  });

  // Extract unique actions for the filter strip
  const uniqueActions = ["ALL", ...Array.from(new Set(logList.map((l) => l.action).filter(Boolean)))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="anim-slide-up flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800">Security & Compliance Audit Trail</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Immutable activity records, entity state modifications, and IP tracking
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="anim-slide-up d1 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        {uniqueActions.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {uniqueActions.map((act) => (
              <button
                key={act}
                onClick={() => setActionFilter(act)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                  actionFilter === act
                    ? "bg-teal-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {act === "ALL" ? "All Actions" : act.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        )}

        <div className="relative">
          <span className="absolute left-3.5 top-3 text-slate-400">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit logs by action, user, entity, or IP address..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Audit Logs Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-2xl anim-shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 anim-scale">
          <span className="text-4xl">🔒</span>
          <h3 className="text-base font-bold text-slate-700 mt-2">No Audit Records Found</h3>
          <p className="text-xs text-slate-400 mt-1">
            {search ? "No log entries match your search query." : "No system audit logs recorded yet."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden anim-slide-up d2">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-5 py-3.5 font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
                  <th className="text-left px-5 py-3.5 font-bold text-slate-500 uppercase tracking-wider">Action</th>
                  <th className="text-left px-5 py-3.5 font-bold text-slate-500 uppercase tracking-wider">Entity</th>
                  <th className="text-left px-5 py-3.5 font-bold text-slate-500 uppercase tracking-wider">User & Role</th>
                  <th className="text-left px-5 py-3.5 font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">IP Address</th>
                  <th className="text-right px-5 py-3.5 font-bold text-slate-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-teal-50/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-slate-500 whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 font-semibold whitespace-nowrap">
                      {log.entityType || "System"}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="font-medium text-slate-800">{log.userName || "System"}</span>
                      {log.userRole && (
                        <span className="ml-1.5 px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">
                          {log.userRole}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-400 hidden md:table-cell whitespace-nowrap">
                      {log.ipAddress || "127.0.0.1"}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      {(log.oldValue || log.newValue || log.reason) ? (
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-teal-600 hover:text-white text-slate-700 font-bold text-[11px] rounded-lg transition-all"
                        >
                          Inspect JSON
                        </button>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Log Details Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title={`Audit Log: ${selectedLog?.action || ""}`}
        size="lg"
      >
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
              <div>
                <span className="text-slate-400 font-semibold">Entity Type:</span>
                <p className="font-bold text-slate-800">{selectedLog.entityType}</p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Entity ID:</span>
                <p className="font-mono text-slate-800">{selectedLog.entityId || "N/A"}</p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Performed By:</span>
                <p className="font-bold text-slate-800">{selectedLog.userName} ({selectedLog.userRole})</p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Timestamp:</span>
                <p className="font-mono text-slate-800">{formatDateTime(selectedLog.createdAt)}</p>
              </div>
            </div>

            {selectedLog.reason && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                <span className="font-bold">Reason Provided: </span>
                <span>{selectedLog.reason}</span>
              </div>
            )}

            {selectedLog.oldValue && (
              <div>
                <span className="font-bold text-slate-700 block mb-1">Previous State (Old Value):</span>
                <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl overflow-x-auto text-[11px] font-mono max-h-48">
                  {typeof selectedLog.oldValue === "string"
                    ? selectedLog.oldValue
                    : JSON.stringify(selectedLog.oldValue, null, 2)}
                </pre>
              </div>
            )}

            {selectedLog.newValue && (
              <div>
                <span className="font-bold text-slate-700 block mb-1">New State (New Value):</span>
                <pre className="p-3 bg-slate-900 text-teal-300 rounded-xl overflow-x-auto text-[11px] font-mono max-h-48">
                  {typeof selectedLog.newValue === "string"
                    ? selectedLog.newValue  
                    : JSON.stringify(selectedLog.newValue, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}