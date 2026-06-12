"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Site = {
  id: string;
  name: string;
};

export default function NewStudentPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [siteId, setSiteId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [grade, setGrade] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSites() {
      const { data, error } = await supabase
        .from("sites")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        alert(error.message);
        return;
      }

      setSites(data || []);

      if (data && data.length > 0) {
        setSiteId(data[0].id);
      }
    }

    loadSites();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!siteId) {
      alert("Please choose a site.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("students").insert({
      site_id: siteId,
      first_name: firstName,
      last_name: lastName,
      grade,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    window.location.href = "/students";
  }

  return (
    <main className="p-6 space-y-6">
      <a href="/students" className="underline">
        Back to Students
      </a>

      <h1 className="text-3xl font-bold">Add Student</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <select
          className="border rounded p-3 w-full"
          value={siteId}
          onChange={(e) => setSiteId(e.target.value)}
          required
        >
          <option value="">Select site</option>

          {sites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.name}
            </option>
          ))}
        </select>

        <input
          className="border rounded p-3 w-full"
          placeholder="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />

        <input
          className="border rounded p-3 w-full"
          placeholder="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />

        <input
          className="border rounded p-3 w-full"
          placeholder="Grade"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
        />

        <button className="border rounded p-3 w-full" disabled={loading}>
          {loading ? "Saving..." : "Save Student"}
        </button>
      </form>
    </main>
  );
}