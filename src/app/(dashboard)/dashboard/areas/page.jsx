// src/app/(dashboard)/dashboard/areas/page.jsx
"use client";
import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";

export default function AreasPage() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", state: "", district: "" });

  useEffect(() => { fetch("/api/areas").then(r => r.json()).then(d => setAreas(d.data || d)).catch(() => {}).finally(() => setLoading(false)); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    await fetch("/api/areas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowModal(false);
    setForm({ name: "", code: "", state: "", district: "" });
    const res = await fetch("/api/areas");
    setAreas((await res.json()).data || await res.json());
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 anim-slide-up">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">Mining Areas</h1>
          <p className="text-sm text-slate-400">Geographic zones and mining operations</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-4 py-2.5 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition-all duration-200 hover:shadow-lg hover:shadow-teal-500/20 active:scale-95">+ Add Area</button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-32 rounded-2xl anim-shimmer" />)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {areas.map((area, i) => (
            <div key={area.id} className={`anim-slide-up d${i+1} bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">{area.name}</h3>
                  <span className="text-xs font-mono text-teal-600 bg-teal-50 px-2 py-0.5 rounded mt-1 inline-block">{area.code}</span>
                </div>
                <span className={`w-2.5 h-2.5 rounded-full ${area.isActive !== false ? "bg-emerald-400" : "bg-slate-300"}`} />
              </div>
              <div className="mt-3 flex gap-4 text-xs text-slate-400">
                {area.state && <span>📍 {area.state}</span>}
                {area.district && <span>🏛️ {area.district}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Area">
        <form onSubmit={handleCreate} className="space-y-4">
          {["name","code","state","district"].map(f => (
            <div key={f}>
              <label className="block text-xs font-semibold text-slate-600 mb-1 capitalize">{f}</label>
              <input value={form[f]} onChange={e => setForm({...form, [f]: e.target.value})} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all" />
            </div>
          ))}
          <button type="submit" className="w-full py-2.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all active:scale-[0.98]">Create Area</button>
        </form>
      </Modal>
    </div>
  );
}