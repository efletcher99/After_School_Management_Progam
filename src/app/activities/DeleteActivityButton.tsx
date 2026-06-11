"use client";

import { supabase } from "../../lib/supabase";

export default function DeleteActivityButton({ id }: { id: string }) {
  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();

    const confirmed = window.confirm(
      "Are you sure you want to delete this activity?"
    );

    if (!confirmed) return;

    const { error } = await supabase.from("activities").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    window.location.reload();
  }

  return (
    <button
      onClick={handleDelete}
      className="border rounded p-2 text-red-600 hover:bg-red-50"
    >
      Delete
    </button>
  );
}