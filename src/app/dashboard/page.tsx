export default function DashboardPage() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <a href="/students" className="border rounded p-4 block hover:bg-gray-100">
          Students
</a>

        <a href="/attendance" className="border rounded p-4 block hover:bg-gray-100">
          Attendance
        </a>

        <a href="/activities"  className="border rounded p-4 block hover:bg-gray-100">
          Activities
        </a>

        <a href="/reports" className="border rounded p-4 block hover:bg-gray-100">
          Reports
        </a>
      </div>
    </main>
  );
}