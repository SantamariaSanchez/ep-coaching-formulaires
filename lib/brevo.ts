// Sync des leads de prequalification vers Brevo (2026-09-24, demande
// fondateur : "tout lead va dans Brevo, aucune exception"). Aucune
// intégration Brevo n'existait avant sur ce repo (voir prequalification/
// actions.ts et business/actions.ts avant cette date, Supabase uniquement).
//
// Upsert simple par email, sans liste : contrairement à /ressources sur
// l'app principale (lib/subscription-plans... non, voir utils/brevo.ts),
// aucun consentement newsletter n'est recueilli sur ce formulaire, donc pas
// d'ajout automatique à une liste marketing — juste un contact qui existe
// et reste segmentable (ex: filtrer LEAD_QUALIFICATION_SIGNAL pour prioriser
// les appels).
//
// Attributs vérifiés sur le compte Brevo EP Coaching (2026-09-24, via le
// connecteur Brevo) : le compte utilise PRENOM/NOM (pas FIRSTNAME/LASTNAME)
// et SMS pour le téléphone. FORM_TYPE et LEAD_QUALIFICATION_SIGNAL sont des
// attributs personnalisés qui n'existaient pas encore à cette date — à
// créer manuellement dans Brevo (Contacts > Paramètres > Attributs de
// contact, type Texte) si Brevo ne les crée pas tout seul à la première
// réception.
export async function upsertBrevoLead(input: {
  email: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  formType: "physique" | "business";
  leadQualificationSignal?: string;
}): Promise<boolean> {
  // Un contact Brevo est identifié par email ici (pas de normalisation du
  // numéro de téléphone au format international dans ce formulaire, donc
  // pas d'identifiant SMS fiable en repli) : sans email, pas d'envoi.
  // L'email est le seul champ optionnel du formulaire.
  if (!input.email) return false;

  try {
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify({
        email: input.email,
        attributes: {
          PRENOM: input.firstName,
          NOM: input.lastName,
          SMS: input.phone,
          FORM_TYPE: input.formType,
          ...(input.leadQualificationSignal
            ? { LEAD_QUALIFICATION_SIGNAL: input.leadQualificationSignal }
            : {}),
        },
        updateEnabled: true,
      }),
    });
    return response.ok;
  } catch (e) {
    console.error("upsertBrevoLead", e);
    return false;
  }
}
