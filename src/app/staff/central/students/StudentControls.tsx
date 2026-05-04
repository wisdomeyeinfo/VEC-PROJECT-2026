"use client";

import { useState } from "react";
import { resetStudentPassword, deleteStudent } from "./actions";
import { RefreshCw, Trash2, Key, Copy } from "lucide-react";

export function ResetPasswordButton({ studentId }: { studentId: string }) {
  const [loading, setLoading] = useState(false);
  const [newPass, setNewPass] = useState<string | null>(null);

  async function handleReset() {
    if (!confirm("Are you sure you want to reset this student's password? They will be forced to onboard again.")) return;

    setLoading(true);

    try {
      const res = await resetStudentPassword(studentId);

      if (!res?.newTempPassword) {
        throw new Error("Password reset failed");
      }

      setNewPass(res.newTempPassword);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (newPass) {
    return (
      <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-3 py-1 rounded-lg border border-green-200">
        <Key className="h-4 w-4" />
        {newPass}
        <button
          onClick={() => navigator.clipboard.writeText(newPass)}
          title="Copy"
        >
          <Copy className="h-4 w-4 ml-1 hover:text-green-800" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleReset}
      disabled={loading}
      className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-800 disabled:opacity-50"
    >
      <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
      Reset Password
    </button>
  );
}

export function DeleteStudentButton({ studentId }: { studentId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this student forever? This cannot be undone.")) return;

    setLoading(true);

    try {
      const res = await deleteStudent(studentId);

      if (!res?.success) {
        throw new Error("Delete failed");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-50"
    >
      <Trash2 className="h-3 w-3" />
      Delete
    </button>
  );
}