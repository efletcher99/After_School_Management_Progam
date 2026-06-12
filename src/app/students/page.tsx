import { supabase } from "../../lib/supabase";
import AttendanceControls from "../attendance/AttendenceControls";

export default async function StudentsPage() {
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
        <p>Error loading students.</p>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-8">
      <a href="/dashboard" className="underline">
        Back to Dashboard
      </a>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Students</h1>

        <div className="flex gap-2">
          <a href="/students/import" className="border rounded p-3">
            Import CSV
          </a>

          <a href="/students/new" className="border rounded p-3">
            Add Student
          </a>
        </div>
      </div>

      {sites?.map((site) => {
        const studentsForSite =
          students
            ?.filter((student) => student.site_id === site.id)
            .map((student) => {
              const attendanceForStudent =
  attendance
    ?.filter((a) => a.student_id === student.id)
    .sort(
      (a, b) =>
        new Date(b.check_in_time).getTime() -
        new Date(a.check_in_time).getTime()
    ) || [];

const todayAttendance = attendanceForStudent[0] || null;

              return {
                student,
                todayAttendance: todayAttendance || null,
                activeAttendance:
                  todayAttendance && !todayAttendance.check_out_time
                    ? todayAttendance
                    : null,
                sortOrder: todayAttendance?.check_out_time
                  ? 3
                  : todayAttendance
                  ? 1
                  : 2,
              };
            })
            .sort((a, b) => a.sortOrder - b.sortOrder) || [];

        if (studentsForSite.length === 0) {
          return null;
        }

        return (
          <section key={site.id} className="space-y-3">
            <h2 className="text-2xl font-bold border-b pb-2">{site.name}</h2>

            {studentsForSite.map(
              ({ student, activeAttendance, todayAttendance }) => (
                <AttendanceControls
                  key={student.id}
                  student={student}
                  activeAttendance={activeAttendance}
                  todayAttendance={todayAttendance}
                />
              )
            )}
          </section>
        );
      })}

      {students?.length === 0 && <p>No students found.</p>}
    </main>
  );
}