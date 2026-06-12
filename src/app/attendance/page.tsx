import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default async function AttendancePage() {
  const today = new Date().toISOString().slice(0, 10);

  const { data: sites, error: sitesError } = await supabase
    .from("sites")
    .select("*")
    .order("name", { ascending: true });

  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("*")
    .order("last_name", { ascending: true });

  const { data: attendance, error: attendanceError } = await supabase
    .from("attendance")
    .select("*")
    .gte("check_in_time", `${today}T00:00:00`)
    .lt("check_in_time", `${today}T23:59:59`);

  if (sitesError || studentsError || attendanceError) {
    return (
      <main className="p-6">
        <p>Error loading attendance.</p>
      </main>
    );
  }

  const studentsWithStatus =
    students?.map((student) => {
      const attendanceForStudent =
        attendance
          ?.filter((record) => record.student_id === student.id)
          .sort(
            (a, b) =>
              new Date(b.check_in_time).getTime() -
              new Date(a.check_in_time).getTime()
          ) || [];

      const todayAttendance = attendanceForStudent[0] || null;

      const status = todayAttendance?.check_out_time
        ? "checked_out"
        : todayAttendance
        ? "checked_in"
        : "not_checked_in";

      return {
        student,
        todayAttendance,
        status,
      };
    }) || [];

  const checkedInCount = studentsWithStatus.filter(
    (item) => item.status === "checked_in"
  ).length;

  const checkedOutCount = studentsWithStatus.filter(
    (item) => item.status === "checked_out"
  ).length;

  const notCheckedInCount = studentsWithStatus.filter(
    (item) => item.status === "not_checked_in"
  ).length;

  return (
    <main className="p-6 space-y-6">
      <Link href="/dashboard" className="underline">
        Back to Dashboard
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendance Today</h1>
          <p className="text-gray-600">{formatDate(today)}</p>
        </div>

        <Link href="/students" className="border rounded p-3">
          Take Attendance
        </Link>
      </div>

      <section className="grid gap-3 md:grid-cols-4">
        <div className="border rounded p-4">
          <p className="text-sm text-gray-600">Total Students</p>
          <p className="text-3xl font-bold">{students?.length || 0}</p>
        </div>

        <div className="border rounded p-4 bg-green-100">
          <p className="text-sm text-gray-600">Currently Checked In</p>
          <p className="text-3xl font-bold">{checkedInCount}</p>
        </div>

        <div className="border rounded p-4 bg-gray-100">
          <p className="text-sm text-gray-600">Checked Out Today</p>
          <p className="text-3xl font-bold">{checkedOutCount}</p>
        </div>

        <div className="border rounded p-4">
          <p className="text-sm text-gray-600">Not Checked In</p>
          <p className="text-3xl font-bold">{notCheckedInCount}</p>
        </div>
      </section>

      <section className="space-y-6">
        {sites?.map((site) => {
          const studentsForSite = studentsWithStatus.filter(
            (item) => item.student.site_id === site.id
          );

          if (studentsForSite.length === 0) {
            return null;
          }

          const siteCheckedIn = studentsForSite.filter(
            (item) => item.status === "checked_in"
          );

          const siteCheckedOut = studentsForSite.filter(
            (item) => item.status === "checked_out"
          );

          const siteNotCheckedIn = studentsForSite.filter(
            (item) => item.status === "not_checked_in"
          );

          return (
            <div key={site.id} className="border rounded p-4 space-y-4">
              <h2 className="text-2xl font-bold">{site.name}</h2>

              <div className="grid gap-3 md:grid-cols-3">
                <StatusGroup
                  title="Currently Checked In"
                  students={siteCheckedIn}
                  emptyText="No students currently checked in."
                />

                <StatusGroup
                  title="Checked Out Today"
                  students={siteCheckedOut}
                  emptyText="No students checked out yet."
                />

                <StatusGroup
                  title="Not Checked In"
                  students={siteNotCheckedIn}
                  emptyText="Everyone has checked in."
                />
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}

function StatusGroup({
  title,
  students,
  emptyText,
}: {
  title: string;
  students: {
    student: {
      id: string;
      first_name: string;
      last_name: string;
    };
    todayAttendance: {
      check_in_time: string;
      check_out_time: string | null;
    } | null;
    status: string;
  }[];
  emptyText: string;
}) {
  return (
    <div className="border rounded p-3 space-y-3">
      <h3 className="font-bold">{title}</h3>

      {students.map(({ student, todayAttendance, status }) => (
        <Link
          key={student.id}
          href={`/students/${student.id}`}
          className={`block rounded p-3 border ${
            status === "checked_in"
              ? "bg-green-100"
              : status === "checked_out"
              ? "bg-gray-100"
              : "bg-white"
          }`}
        >
          <p className="font-semibold">
            {student.first_name} {student.last_name}
          </p>

          {todayAttendance && (
            <p className="text-sm text-gray-600">
              In: {formatTime(todayAttendance.check_in_time)}
              {todayAttendance.check_out_time
                ? ` • Out: ${formatTime(todayAttendance.check_out_time)}`
                : ""}
            </p>
          )}
        </Link>
      ))}

      {students.length === 0 && <p className="text-sm text-gray-600">{emptyText}</p>}
    </div>
  );
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString([], {
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