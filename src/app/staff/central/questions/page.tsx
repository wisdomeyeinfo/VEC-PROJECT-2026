import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isCentralAdmin, requireStaffUser } from "@/lib/auth/staff";
import { importQuestionsCsv } from "./actions";

export default async function CentralQuestionsPage() {
  await requireStaffUser();
  const central = await isCentralAdmin();
  if (!central) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold">Access denied</h1>
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const [{ data: sets }, questionsResp] = await Promise.all([
    supabase.from("question_sets").select("id, language, type, created_at").order("created_at", {
      ascending: false,
    }),
    supabase.from("questions").select("id", { count: "exact", head: true }),
  ]);
  const totalQuestions = questionsResp.count ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Questions</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Import questions per language into the two sets: <b>fixed100</b> and <b>extra50</b>.
        </p>

        <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
          <p className="font-semibold">CSV columns</p>
          <p className="mt-1 font-mono text-xs">
            question_text, option_a, option_b, option_c, option_d, correct_option
          </p>
          <p className="mt-2 text-xs text-zinc-600">
            `correct_option` can be A/B/C/D or 0/1/2/3.
          </p>
        </div>

        <form action={importQuestionsCsv} className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          <select
            name="language"
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 outline-none focus:border-orange-500"
            defaultValue="en"
            required
          >
            <option value="en">English (en)</option>
            <option value="hi">Hindi (hi)</option>
            <option value="mr">Marathi (mr)</option>
            <option value="bn">Bengali (bn)</option>
            <option value="gu">Gujarati (gu)</option>
          </select>
          <select
            name="set_type"
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 outline-none focus:border-orange-500"
            defaultValue="fixed100"
            required
          >
            <option value="fixed100">fixed100</option>
            <option value="extra50">extra50</option>
          </select>
          <input
            name="file"
            type="file"
            accept=".csv,text/csv"
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-orange-500"
            required
          />
          <button
            className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-orange-600 px-4 text-sm font-semibold text-white hover:bg-orange-700 md:col-span-3"
            type="submit"
          >
            Import CSV
          </button>
        </form>

        <p className="mt-3 text-xs text-zinc-500">
          Total questions in DB: {totalQuestions}
        </p>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Question sets</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase text-zinc-500">
              <tr>
                <th className="py-2 pr-4">Language</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Set id</th>
              </tr>
            </thead>
            <tbody>
              {(sets ?? []).map((s) => (
                <tr key={s.id} className="border-t border-zinc-100">
                  <td className="py-3 pr-4 font-semibold">{s.language}</td>
                  <td className="py-3 pr-4">{s.type}</td>
                  <td className="py-3 pr-4 font-mono text-xs">{s.id}</td>
                </tr>
              ))}
              {sets?.length === 0 ? (
                <tr>
                  <td className="py-6 text-zinc-500" colSpan={3}>
                    No sets yet. Import questions to create sets automatically.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

