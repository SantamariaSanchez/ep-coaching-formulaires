"use server";

import { getSupabaseAdmin } from "@/lib/supabase";
import { upsertBrevoLead } from "@/lib/brevo";
import type { Answers } from "@/components/Wizard";

// Bornes sur ce qui vient du navigateur : action publique.
function clean(answers: Answers): Answers {
  const out: Answers = {};
  for (const [k, v] of Object.entries(answers ?? {}).slice(0, 40)) {
    if (typeof v === "string" && k.length <= 60 && !k.startsWith("_")) out[k] = v.slice(0, 2000);
  }
  return out;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Candidature commencée (dépôt du 18/11 : « si la personne ne termine pas le
 * formulaire, vous avez quand même ses infos ») : dès que le téléphone est
 * donné, les réponses sont gardées avec `_partial: true`, pour que le
 * fondateur puisse rappeler quelqu'un qui a abandonné aux dernières
 * questions. La fin du formulaire complète la même ligne (pas de doublon).
 */
export async function savePartialPhysique(answers: Answers, draftId?: string | null): Promise<{ id?: string }> {
  const { prenom, nom, telephone, email, ...rest } = clean(answers);
  if (!telephone?.trim()) return {};
  try {
    const supabase = getSupabaseAdmin();
    const row = {
      first_name: prenom ?? "",
      last_name: nom ?? "",
      phone: telephone,
      email: email || null,
      answers: { ...rest, _partial: "true" },
    };
    if (draftId && UUID.test(draftId)) {
      const { data } = await supabase
        .from("prequalification_responses")
        .update(row)
        .eq("id", draftId)
        .eq("answers->>_partial", "true")
        .select("id");
      if (data && data.length > 0) return { id: draftId };
    }
    const { data, error } = await supabase
      .from("prequalification_responses")
      .insert({ form_type: "physique", ...row })
      .select("id")
      .single();
    if (error) throw error;
    return { id: (data as { id: string }).id };
  } catch (err) {
    console.error("savePartialPhysique", err);
    return {};
  }
}

export async function submitPhysiqueForm(answers: Answers, draftId?: string | null) {
  const { prenom, nom, telephone, email, ...rest } = clean(answers);

  let result: { ok: true } | { ok: false; error: string };
  try {
    const supabase = getSupabaseAdmin();
    const row = {
      first_name: prenom ?? "",
      last_name: nom ?? "",
      phone: telephone ?? "",
      email: email || null,
      answers: rest,
    };
    // Complète la candidature commencée si elle existe encore (jamais une
    // ligne déjà terminée), sinon en crée une.
    let done = false;
    if (draftId && UUID.test(draftId)) {
      const { data } = await supabase
        .from("prequalification_responses")
        .update(row)
        .eq("id", draftId)
        .eq("answers->>_partial", "true")
        .select("id");
      done = !!data && data.length > 0;
    }
    const { error } = done ? { error: null } : await supabase.from("prequalification_responses").insert({ form_type: "physique", ...row });
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
