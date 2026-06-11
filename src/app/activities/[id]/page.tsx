import Link from "next/link";
import { supabase } from "../../../lib/supabase";

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: activity, error: activityError } = await supabase
    .from("activities")
    .select("*")
    .eq("id", id)
    .single();

  if (activityError || !activity) {
    return (
      <main className="p-6">
        <p>Error loading activity: {activityError?.message}</p>
      </main>
    );
  }

  const activityStart = makeDateTime(
    activity.activity_date,
    activity.start_time
  );

  const activityEnd = makeDateTime(
    activity.activity_date,
    activity.end_time
  );

  const dayStart = makeDateTime(activity.activity_date, "00:00");
  const dayEnd = makeDateTime(activity.activity_date, "23:59");

  const { data: attendance, error: attendanceError } = await supabase
    .from("attendance")
    .select("*, students(*)")
    .eq("site_id", activity.site_id)
    .gte("check_in_time", dayStart.toISOString())
    .lte("check_in_time", dayEnd.toISOString());

  if (attendanceError) {
    return (
      <main className="p-6">
        <p>Error loading students: {attendanceError.message}</p>
      </main>
    );
  }

  const participatingStudents =
    attendance?.filter((record) => {
      const checkIn = new Date(record.check_in_time);
      const checkOut = record.check_out_time
        ? new Date(record.check_out_time)
        : new Date();

      return checkIn <= activityEnd && checkOut >= activityStart;
    }) || [];

  return (
    <main className="p-6 space-y-6">
      <Link href="/activities" className="underline">
        Back to Activities
      </Link>

      <div className="border rounded p-4 space-y-2">
        <h1 className="text-3xl font-bold">{activity.title}</h1>
        <p>{activity.category}</p>
        <p>
          {activity.activity_date} • {activity.start_time} - {activity.end_time}
        </p>
        {activity.description && <p>{activity.description}</p>}
      </div>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Participating Students</h2>

        {participatingStudents.map((record) => (
          <div key={record.id} className="border rounded p-4">
            <p className="font-semibold">
              {record.students?.first_name} {record.students?.last_name}
            </p>

            <p className="text-sm text-gray-600">
              Checked in: {formatTime(record.check_in_time)}
              {record.check_out_time
                ? ` • Checked out: ${formatTime(record.check_out_time)}`
                : " • Still checked in"}
            </p>
          </div>
        ))}

        {participatingStudents.length === 0 && (
          <p>No students were checked in during this activity.</p>
        )}
      </section>
    </main>
  );
}

function makeDateTime(date: string, time: string) {
  const cleanTime = time.slice(0, 5);
  return new Date(`${date}T${cleanTime}:00`);
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}