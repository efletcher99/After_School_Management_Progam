import Link from "next/link";
import { supabase } from "../../lib/supabase";
import DeleteActivityButton from "./DeleteActivityButton";

export default async function ActivitiesPage() {
  const { data: activities, error } = await supabase
    .from("activities")
    .select("*")
    .order("activity_date", { ascending: false });

  if (error) {
    return <p>Error loading activities: {error.message}</p>;
  }

  return (
    <main className="p-6 space-y-6">
      <Link href="/dashboard" className="underline">
        Back to Dashboard
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Activities</h1>

        <Link href="/activities/new" className="border rounded p-3">
          Add Activity
        </Link>
      </div>

      <div className="space-y-3">
        {activities?.map((activity) => (
          <div key={activity.id} className="border rounded p-4 hover:bg-gray-100">
            <div className="flex items-start justify-between gap-4">
              <Link href={`/activities/${activity.id}`} className="block flex-1">
                <h2 className="font-semibold text-xl">{activity.title}</h2>
                <p>{activity.category}</p>
                <p className="text-sm text-gray-600">
                  {activity.activity_date} • {formatTime(activity.start_time)} -{" "}
                  {formatTime(activity.end_time)}
                </p>
                {activity.description && <p>{activity.description}</p>}
              </Link>

              <DeleteActivityButton id={activity.id} />
            </div>
          </div>
        ))}

        {activities?.length === 0 && <p>No activities found.</p>}
      </div>
    </main>
  );
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(":");
  const date = new Date();
  date.setHours(Number(hours));
  date.setMinutes(Number(minutes));

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}