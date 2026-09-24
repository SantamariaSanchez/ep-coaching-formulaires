"use server";

import { getSupabaseAdmin } from "@/lib/supabase";
import { upsertBrevoLead } from "@/lib/brevo";
import type { Answers } from "@/components/Wizard";

export async function submitBusinessForm(answers: Answers) {
  const { prenom, nom, telephone, email, ...rest } = answers;

  let result: { ok: true } | { ok: false; error: string };
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("prequalification_responses").insert({
      form_type: "business",
      first_name: prenom ?? "",
      last_name: nom ?? "",
      phone: telephone ?? "",
      email: email || null,
      answers: rest,
    });
    if (error) throw error;
    result = { ok: true as const };
  } catch (err) {
    console.error("submitBusinessForm", err);
    result = { ok: false as const, error: "insert_failed" };
  }

  // Même règle que le parcours physique (voir prequalification/actions.ts) :
  // tout lead va dans Brevo, indépendamment du résultat Supabase.
  await upsertBrevoLead({
    email: email || null,
    firstName: prenom ?? "",
    lastName: nom ?? "",
    phone: telephone ?? "",
    formType: "business",
    leadQualificationSignal: rest.lead_qualification_signal,
  });

  return result;
}
