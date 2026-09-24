"use server";

import { getSupabaseAdmin } from "@/lib/supabase";
import { upsertBrevoLead } from "@/lib/brevo";
import type { Answers } from "@/components/Wizard";

export async function submitPhysiqueForm(answers: Answers) {
  const { prenom, nom, telephone, email, ...rest } = answers;

  let result: { ok: true } | { ok: false; error: string };
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("prequalification_responses").insert({
      form_type: "physique",
      first_name: prenom ?? "",
      last_name: nom ?? "",
      phone: telephone ?? "",
      email: email || null,
      answers: rest,
    });
    if (error) throw error;
    result = { ok: true as const };
  } catch (err) {
    console.error("submitPhysiqueForm", err);
    result = { ok: false as const, error: "insert_failed" };
  }

  // Indépendant du résultat Supabase ci-dessus : un lead doit atteindre
  // Brevo même si l'insert échoue, et l'inverse ne doit jamais faire
  // basculer l'écran d'erreur (voir Wizard.tsx, réserver l'appel prime
  // toujours sur l'enregistrement des réponses).
  await upsertBrevoLead({
    email: email || null,
    firstName: prenom ?? "",
    lastName: nom ?? "",
    phone: telephone ?? "",
    formType: "physique",
    leadQualificationSignal: rest.lead_qualification_signal,
  });

  return result;
}
