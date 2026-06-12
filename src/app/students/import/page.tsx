"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";

type Site = {
  id: string;
  name: string;
};

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

    const rows = text
      .split("\n")
      .map((row) => row.trim())
      .filter(Boolean)
      .map((row) => row.split(",").map((cell) => cell.trim()));

    const { data: sites, error: sitesError } = await supabase
      .from("sites")
      .select("*");

    if (sitesError) {
      alert(sitesError.message);
      setLoading(false);
      return;
    }

    if (!sites || sites.length === 0) {
      alert("No sites found. Add East, Iron Springs, North, and South first.");
      setLoading(false);
      return;
    }

    const siteMap = new Map<string, string>();

    (sites as Site[]).forEach((site) => {
      siteMap.set(site.name.toLowerCase().trim(), site.id);
    });

    const students = rows.slice(1).map((row) => {
      const siteName = row[3]?.trim();

      return {
        first_name: row[0]?.trim(),
        last_name: row[1]?.trim(),
        grade: row[2]?.trim(),
        site_name: siteName,
        site_id: siteName ? siteMap.get(siteName.toLowerCase()) : undefined,
      };
    });

    const missingSite = students.find((student) => !student.site_id);

    if (missingSite) {
      alert(
        `Could not find site "${missingSite.site_name}". Make sure it matches East, Iron Springs, North, or South exactly.`
      );
      setLoading(false);
      return;
    }

    const formatted = students
      .filter((student) => student.first_name && student.last_name)
      .map((student) => ({
        first_name: student.first_name,
        last_name: student.last_name,
        grade: student.grade,
        site_id: student.site_id,
      }));

    const { error: deleteError } = await supabase
      .from("students")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (deleteError) {
      alert(deleteError.message);
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("students")
      .insert(formatted);

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

      <div className="flex items-center gap-2">
  <label className="border rounded p-3 cursor-pointer">
    Choose File
    <input
      type="file"
      accept=".csv"
      onChange={(e) => setFile(e.target.files?.[0] || null)}
      className="hidden"
    />
  </label>

  <span>{file ? file.name : "No file chosen"}</span>

  <button
    onClick={handleUpload}
    disabled={!file || loading}
    className="border rounded p-3"
  >
    {loading ? "Uploading..." : "Upload CSV"}
  </button>
</div>

      <div className="text-sm text-gray-600">
       
      </div>
    </main>
  );
}