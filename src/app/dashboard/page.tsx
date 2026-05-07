export default function DashboardPage() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <a className="border rounded p-4" href="/students">
          Students
        </a>

        <a className="border rounded p-4" href="/attendance">
          Attendance
        </a>

        <a className="border rounded p-4" href="/activities">
          Activities
        </a>

        <a className="border rounded p-4" href="/reports">
          Reports
        </a>
      </div>
    </main>
  );
}