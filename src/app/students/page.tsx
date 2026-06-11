import { supabase } from "../../lib/supabase";
import AttendanceControls from "../attendance/AttendenceControls";

export default async function StudentsPage() {
  const today = new Date().toISOString().slice(0, 10);

  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("*")
    .order("last_name", { ascending: true });

  const { data: attendance, error: attendanceError } = await supabase
    .from("attendance")
    .select("*")
    .gte("check_in_time", `${today}T00:00:00`)
    .lt("check_in_time", `${today}T23:59:59`);

  if (studentsError || attendanceError) {
    return (
      <main className="p-6">
        <p>Error loading students.</p>
      </main>
    );
  }

  const studentsWithAttendance =
    students
      ?.map((student) => {
        const todayAttendance = attendance?.find(
          (a) => a.student_id === student.id
        );

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

  return (
    <main className="p-6 space-y-6">
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

      <div className="space-y-3">
        {studentsWithAttendance.map(
          ({ student, activeAttendance, todayAttendance }) => (
            <AttendanceControls
              key={student.id}
              student={student}
              activeAttendance={activeAttendance}
              todayAttendance={todayAttendance}
            />
          )
        )}

        {students?.length === 0 && <p>No students found.</p>}
      </div>
    </main>
  );
}