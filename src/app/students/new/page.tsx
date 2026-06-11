"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function NewStudentPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [grade, setGrade] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const { data: sites } = await supabase.from("sites").select("id").limit(1);

    if (!sites || sites.length === 0) {
      alert("No site found. Add a site first.");
      return;
    }

    const { error } = await supabase.from("students").insert({
      site_id: sites[0].id,
      first_name: firstName,
      last_name: lastName,
      grade,
    });

    if (error) {
      alert(error.message);
      return;
    }

    window.location.href = "/students";
  }

  return (
    <main className="p-6 space-y-6">
      <a href="/students" className="underline">Back to Students</a>

      <h1 className="text-3xl font-bold">Add Student</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
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

        <button className="border rounded p-3 w-full">
          Save Student
        </button>
      </form>
    </main>
  );
}