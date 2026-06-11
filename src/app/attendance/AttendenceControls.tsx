"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

type Student = {
  id: string;
  site_id: string;
  first_name: string;
  last_name: string;
  grade?: string | null;
};

type Attendance = {
  id: string;
  student_id: string;
  site_id: string;
  check_in_time: string;
  check_out_time: string | null;
};

export default function AttendanceControls({
  student,
  activeAttendance,
  todayAttendance,
}: {
  student: Student;
  activeAttendance: Attendance | null;
  todayAttendance: Attendance | null;
}) {
  const [checkInTime, setCheckInTime] = useState(getCurrentLocalTime());
  const [checkOutTime, setCheckOutTime] = useState(getCurrentLocalTime());
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isCheckedOutToday = !!todayAttendance?.check_out_time;

  async function handleCheckIn() {
    if (activeAttendance) {
      alert("Student is already checked in");
      return;
    }

    if (isCheckedOutToday) {
      alert("Student has already been checked out today");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("attendance").insert({
      student_id: student.id,
      site_id: student.site_id,
      check_in_time: combineTodayWithTime(checkInTime),
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    window.location.reload();
  }

  async function handleCheckOut() {
    if (!todayAttendance) {
      alert("Student has not been checked in today");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("attendance")
      .update({
        check_out_time: combineTodayWithTime(checkOutTime),
      })
      .eq("id", todayAttendance.id);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    window.location.reload();
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete ${student.first_name} ${student.last_name}? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    const { error } = await supabase
      .from("students")
      .delete()
      .eq("id", student.id);

    setDeleting(false);

    if (error) {
      alert(error.message);
      return;
    }

    window.location.reload();
  }

  return (
    <div
      className={`border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
        isCheckedOutToday ? "bg-gray-100 opacity-60" : ""
      }`}
    >
      <div className="min-w-[180px]">
        <p className="font-semibold">
          {student.first_name} {student.last_name}
        </p>

        {isCheckedOutToday ? (
          <p className="text-sm text-gray-600">Checked out today</p>
        ) : activeAttendance ? (
          <p className="text-sm text-green-700">Checked in</p>
        ) : (
          <p className="text-sm text-gray-600">Not checked in</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="time"
          value={checkInTime}
          onChange={(e) => setCheckInTime(e.target.value)}
          className="border rounded p-2"
        />

        <button
          onClick={handleCheckIn}
          disabled={loading || deleting || !!activeAttendance || isCheckedOutToday}
          className="border rounded p-2"
        >
          Check In
        </button>

        <input
          type="time"
          value={checkOutTime}
          onChange={(e) => setCheckOutTime(e.target.value)}
          className="border rounded p-2"
        />

        <button
          onClick={handleCheckOut}
          disabled={loading || deleting || !todayAttendance}
          className="border rounded p-2"
        >
          Check Out
        </button>

        <button
          onClick={handleDelete}
          disabled={loading || deleting}
          className="text-red-600 hover:text-red-800 rounded p-2"
          aria-label={`Delete ${student.first_name} ${student.last_name}`}
          title="Delete student"
        >
          ×
        </button>
      </div>
    </div>
  );
}

function combineTodayWithTime(time: string) {
  const today = new Date();
  const [hours, minutes] = time.split(":");

  today.setHours(Number(hours));
  today.setMinutes(Number(minutes));
  today.setSeconds(0);
  today.setMilliseconds(0);

  return today.toISOString();
}

function getCurrentLocalTime() {
  const now = new Date();

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}