import Link from "next/link";
import { supabase } from "../../../lib/supabase";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("*, sites(*)")
    .eq("id", id)
    .single();

  if (studentError || !student) {
    return (
      <main className="p-6">
        <Link href="/students" className="underline">
          Back to Students
        </Link>

        <p className="mt-6">Error loading student.</p>
      </main>
    );
  }

  const { data: attendance, error: attendanceError } = await supabase
    .from("attendance")
    .select("*")
    .eq("student_id", id)
    .order("check_in_time", { ascending: false });

  if (attendanceError) {
    return (
      <main className="p-6">
        <Link href="/students" className="underline">
          Back to Students
        </Link>

        <p className="mt-6">Error loading attendance.</p>
      </main>
    );
  }

  const { data: activities, error: activitiesError } = await supabase
    .from("activities")
    .select("*")
    .eq("site_id", student.site_id)
    .order("activity_date", { ascending: false });

  if (activitiesError) {
    return (
      <main className="p-6">
        <Link href="/students" className="underline">
          Back to Students
        </Link>

        <p className="mt-6">Error loading activities.</p>
      </main>
    );
  }

  const attendedActivities =
    activities?.filter((activity) => {
      const activityStart = makeDateTime(
        activity.activity_date,
        activity.start_time
      );

      const activityEnd = makeDateTime(
        activity.activity_date,
        activity.end_time
      );

      return attendance?.some((record) => {
        const checkIn = new Date(record.check_in_time);

        const checkOut = record.check_out_time
          ? new Date(record.check_out_time)
          : new Date();

        return checkIn <= activityEnd && checkOut >= activityStart;
      });
    }) || [];

  return (
    <main className="p-6 space-y-6">
      <Link href="/students" className="underline">
        Back to Students
      </Link>

      <section className="border rounded p-4 space-y-2">
        <h1 className="text-3xl font-bold">
          {student.first_name} {student.last_name}
        </h1>

        <p>
          <span className="font-semibold">Grade:</span>{" "}
          {student.grade || "Not listed"}
        </p>

        <p>
          <span className="font-semibold">Site:</span>{" "}
          {student.sites?.name || "Not listed"}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Attendance History</h2>

        {attendance?.map((record) => (
          <div key={record.id} className="border rounded p-4">
            <p className="font-semibold">{formatDate(record.check_in_time)}</p>

            <p className="text-sm text-gray-600">
              Checked in: {formatTime(record.check_in_time)}
              {record.check_out_time
                ? ` • Checked out: ${formatTime(record.check_out_time)}`
                : " • Still checked in"}
            </p>
          </div>
        ))}

        {attendance?.length === 0 && <p>No attendance records found.</p>}
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Activities Attended</h2>

        {attendedActivities.map((activity) => (
          <div key={activity.id} className="border rounded p-4">
            <Link
              href={`/activities/${activity.id}`}
              className="font-semibold underline"
            >
              {activity.title}
            </Link>

            <p className="text-sm text-gray-600">
              {formatDate(activity.activity_date)} • {activity.category}
            </p>

            <p className="text-sm text-gray-600">
              {formatActivityTime(activity.start_time)} -{" "}
              {formatActivityTime(activity.end_time)}
            </p>

            {activity.description && <p>{activity.description}</p>}
          </div>
        ))}

        {attendedActivities.length === 0 && <p>No activities attended yet.</p>}
      </section>
    </main>
  );
}

function makeDateTime(date: string, time: string) {
  const cleanTime = time.slice(0, 5);
  return new Date(`${date}T${cleanTime}:00`);
}

function formatDate(value: string) {
  const dateValue = value.includes("T") ? value : `${value}T00:00:00`;

  return new Date(dateValue).toLocaleDateString([], {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatActivityTime(time: string) {
  const [hours, minutes] = time.split(":");
  const date = new Date();

  date.setHours(Number(hours));
  date.setMinutes(Number(minutes));
  date.setSeconds(0);

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}