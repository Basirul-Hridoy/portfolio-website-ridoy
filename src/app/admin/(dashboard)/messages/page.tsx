"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { AdminHeader } from "@/components/admin/admin-ui";
import { AdminListSkeleton } from "@/components/admin/admin-skeleton";

export default function Messages() {
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    const load = async () => {
      const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
      if (!active) return;
      if (error) setError(error.message);
      else setRows(data || []);
      setLoading(false);
    };

    void load();
    const channel = supabase.channel("admin-contact-messages").on(
      "postgres_changes",
      { event: "*", schema: "public", table: "contact_messages" },
      () => void load()
    ).subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, []);

  const setStatus = async (id: string, status: string) => {
    await createClient().from("contact_messages").update({ status }).eq("id", id);
  };

  const remove = async () => {
    if (!pendingDelete || deleting) return;
    setDeleting(true);
    const { error } = await createClient().from("contact_messages").delete().eq("id", pendingDelete.id);
    if (error) setError(error.message);
    else setRows((current) => current.filter((row) => row.id !== pendingDelete.id));
    setDeleting(false);
    setPendingDelete(null);
  };

  return (
    <div>
      <AdminHeader
        eyebrow="Inbox"
        title="Contact Messages"
        description="Messages submitted through your portfolio contact form. New messages appear here automatically when Realtime is enabled."
      />
      <div className="mt-8 space-y-3">
        {error && <p className="text-xs text-red-300">{error}</p>}
        {loading ? (
          <AdminListSkeleton />
        ) : (
          <>
            {rows.map((row) => (
              <article key={row.id} className="rounded-2xl border border-white/10 bg-[#061224]/60 p-5">
                <div className="flex flex-col justify-between gap-4 md:flex-row">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold">{row.name}</h2>
                      <span className="rounded-full border border-accent/20 px-2 py-1 text-[9px] text-accent">{row.status}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{row.email} · {row.service}</p>
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-300">{row.message}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => void setStatus(row.id, "read")} className="outline-button">Read</button>
                    <button onClick={() => void setStatus(row.id, "archived")} className="outline-button">Archive</button>
                    <button type="button" onClick={() => setPendingDelete({ id: row.id, name: String(row.name || row.email || "this message") })} className="rounded-xl border border-red-400/20 px-3 py-2 text-xs text-red-300">Delete</button>
                  </div>
                </div>
              </article>
            ))}
            {!rows.length && !error && <div className="rounded-2xl border border-white/10 p-8 text-center text-sm text-slate-500">No messages yet.</div>}
          </>
        )}
      </div>

      {pendingDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <section role="alertdialog" aria-modal="true" aria-labelledby="message-delete-title" className="w-full max-w-md rounded-2xl border border-red-400/20 bg-[#071321] p-6 shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-red-400/20 bg-red-500/10 text-red-300" aria-hidden="true">!</div>
            <h2 id="message-delete-title" className="mt-4 text-lg font-bold text-white">Delete this message?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">The message from <strong className="text-slate-200">{pendingDelete.name}</strong> will be permanently deleted. This cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" disabled={deleting} onClick={() => setPendingDelete(null)} className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/5 disabled:opacity-50">Cancel</button>
              <button type="button" disabled={deleting} onClick={() => void remove()} className="rounded-xl border border-red-400/30 bg-red-500/15 px-4 py-2.5 text-xs font-semibold text-red-200 hover:bg-red-500/25 disabled:opacity-50">{deleting ? "Deleting…" : "Yes, delete"}</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
