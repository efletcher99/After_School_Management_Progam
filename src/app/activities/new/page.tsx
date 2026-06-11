"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";

const categories = [
  "SEL",
  "STEM",
  "Homework/Reading",
  "Art",
  "Snack",
  "Physical Activity",
  "Enrichment",
];

export default function NewActivityPage() {
  const [title, setTitle] = useState("");
  const [activityDate, setActivityDate] = useState(getTodayDate());
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("SEL");
  const [startTime, setStartTime] = useState(getCurrentTime());
  const [endTime, setEndTime] = useState(getOneHourLater());
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data: sites } = await supabase.from("sites").select("id").limit(1);

    if (!sites || sites.length === 0) {
      alert("No site found");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("activities").insert({
      site_id: sites[0].id,
      title,
      activity_date: activityDate,
      description,
      category,
      start_time: startTime,
      end_time: endTime,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    window.location.href = "/activities";
  }

  return (
    <main className="p-6 space-y-6">
      <a href="/activities" className="underline">
        Back to Activities
      </a>

      <h1 className="text-3xl font-bold">Add Activity</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <input
          className="border rounded p-3 w-full"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          type="date"
          className="border rounded p-3 w-full"
          value={activityDate}
          onChange={(e) => setActivityDate(e.target.value)}
          required
        />

        <select
          className="border rounded p-3 w-full"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>

        <textarea
          className="border rounded p-3 w-full"
          placeholder="Short description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            type="time"
            className="border rounded p-3"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />

          <input
            type="time"
            className="border rounded p-3"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        <button disabled={loading} className="border rounded p-3 w-full">
          {loading ? "Saving..." : "Save Activity"}
        </button>
      </form>
    </main>
  );
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getCurrentTime() {
  const now = new Date();

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

function getOneHourLater() {
  const now = new Date();
  now.setHours(now.getHours() + 1);

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}