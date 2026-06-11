"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function ImportStudentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!file) return;

    const confirmed = window.confirm(
      "Uploading from csv will remove all current students"
    );

    if (!confirmed) return;

    setLoading(true);

    const text = await file.text();
    const rows = text.split("\n").map((row) => row.split(","));

    const students = rows.slice(1).map((row) => ({
      first_name: row[0]?.trim(),
      last_name: row[1]?.trim(),
      grade: row[2]?.trim(),
    }));

    const { data: sites } = await supabase.from("sites").select("id").limit(1);

    if (!sites || sites.length === 0) {
      alert("No site found");
      setLoading(false);
      return;
    }

    const siteId = sites[0].id;

    const formatted = students
      .filter((s) => s.first_name && s.last_name)
      .map((s) => ({
        ...s,
        site_id: siteId,
      }));

    const { error: deleteError } = await supabase
      .from("students")
      .delete()
      .eq("site_id", siteId);

    if (deleteError) {
      alert(deleteError.message);
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("students").insert(formatted);

    setLoading(false);

    if (insertError) {
      alert(insertError.message);
      return;
    }

    window.location.href = "/students";
  }

  return (
    <main className="p-6 space-y-6">
      <a href="/students" className="underline">
        Back to Students
      </a>

      <h1 className="text-3xl font-bold">Import Students</h1>

      <p className="text-red-600 font-semibold">
        Uploading from csv will remove all current students.
      </p>

      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="border rounded p-3"
      >
        {loading ? "Uploading..." : "Upload CSV"}
      </button>
    </main>
  );
}