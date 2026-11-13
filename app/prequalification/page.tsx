import type { Metadata } from "next";
import { AUDIT_STRATEGIQUE_URL } from "@/lib/booking";
import Wizard, { type Question } from "@/components/Wizard";
import { submitPhysiqueForm } from "./actions";

// Route laissee a /prequalification (pas de redirection casse) : le mot
// "pre-qualification" a ete retire de tout ce qui est visible (titre,
// libelles, ecran de confirmation), voir prompt 13/15. Si l'URL change un
// jour, il faudra repercuter le lien sur ep-site (physique/index.html,
// bouton "Reserver mon appel" de la section Accompagnement 1-to-1).
export const metadata: Metadata = {
  title: "EP Coaching · Avant ton audit stratégique",
  description:
    "Réponds à quelques questions avant de réserver ton audit stratégique offert avec Emmanuel Santamaria Sanchéz, coach EP Coaching.",
};

const questions: Question[] = [
  {
    type: "choice",
    id: "objectif",
    label: "C'est quoi ton objectif principal en ce moment ?",
    options: [
      { value: "perte_de_gras", label: "Perte de gras" },
      { value: "prise_de_muscle", label: "Prise de muscle" },
      { value: "recomposition", label: "Recomposition (les deux en même temps)" },
      { value: "competition", label: "Préparation compétition" },
    ],
  },
  {
    // Ajoutée le 2026-09-24 (demande fondateur) : signal d'intention pour
    // prioriser les appels (réponse 1 = déjà convaincu par le contenu,
    // le plus chaud), jamais bloquant contrairement au screening TCA
    // plus bas. Stockée dans answers.lead_qualification_signal, comme
    // toute autre question du formulaire (voir actions.ts, `rest`).
    type: "choice",
    id: "lead_qualification_signal",
    label: "Qu'est-ce qui t'a donné envie de remplir ce formulaire aujourd'hui ?",
    options: [
      {
        value: "contenu_ep_coaching",
        label: "J'ai vu du contenu EP Coaching qui m'a parlé et je veux cette méthode précisément",
      },
      {
        value: "coach_en_general",
        label: "Je cherche un coach en général, EP Coaching est une option parmi d'autres",
      },
      {
        value: "curieux",
        label: "Je suis juste curieux, je ne sais pas encore si je veux un coach",
      },
    ],
  },
  {
    type: "textarea",
    id: "pourquoi",
    label: "Pourquoi cet objectif compte pour toi ?",
    placeholder: "Réponds simplement, avec tes mots.",
  },
  {
    // Ajoutée le 2026-11-13 (niche 18-25 ans, perdre du gras sans
    // culpabiliser) : prépare l'angle de l'appel. Stockée dans
    // answers.blocage comme le reste (voir actions.ts, `rest`).
    type: "choice",
    id: "blocage",
    label: "Qu'est-ce qui te bloque le plus aujourd'hui ?",
    options: [
      { value: "culpabilite_ecart", label: "Je culpabilise après un écart et je lâche tout" },
      { value: "craquages_soir", label: "Je craque souvent le soir ou le week-end" },
      { value: "quoi_manger", label: "Je ne sais pas quoi manger ni en quelle quantité" },
      { value: "regularite", label: "Je n'arrive pas à rester régulier plus de quelques semaines" },
      { value: "resultats", label: "Je fais des efforts mais je ne vois aucun résultat" },
    ],
  },
  {
    type: "choice",
    id: "niveau",
    label: "Depuis combien de temps tu t'entraînes ?",
    helper: "Peu importe la réponse, ce qui compte c'est la suite.",
    options: [
      { value: "debutant", label: "Je débute" },
      { value: "moins_1_an", label: "Moins d'un an" },
      { value: "1_a_3_ans", label: "1 à 3 ans" },
      { value: "plus_3_ans", label: "Plus de 3 ans" },
    ],
  },
  {
    type: "choice",
    id: "motivation",
    label: "Tu es prêt à investir du temps et de l'énergie pour y arriver ?",
    options: [
      { value: "a_fond", label: "Oui, je suis à fond" },
      { value: "doutes_regularite", label: "Oui, mais j'ai des doutes sur ma régularité" },
      { value: "pas_maintenant", label: "Pas vraiment pour l'instant" },
    ],
  },
  {
    // Ajoutée le 2026-08-30 (synthèse webinaire Matis Clouet, voir Notion) :
    // la qualification a deux volets, "as-tu le problème que je résous" (déjà
    // couvert par objectif/niveau/motivation) et "m'identifies-tu comme LA
    // solution", jusqu'ici jamais testé. Un lead qui compare encore plusieurs
    // options n'est pas disqualifié, mais l'appel de vente se prépare
    // différemment selon la réponse.
    type: "choice",
    id: "pourquoi_ep_coaching",
    label: "Pourquoi EP Coaching plutôt qu'un autre coach ou une appli générique ?",
    options: [
      { value: "confiance_contenu", label: "Je suis le contenu depuis un moment, j'ai confiance dans la méthode" },
      { value: "recommandation", label: "On me l'a recommandé" },
      { value: "compare_options", label: "Je compare plusieurs options en ce moment" },
      { value: "decouverte", label: "Je découvre à peine, je ne sais pas encore" },
    ],
  },
  {
    // Ajoutée le 2026-09-01 (TODO Notion #15, source Mastermind ThePrepDad
    // > Nutrition > TCAs) : critère d'exclusion explicite pour les troubles
    // du comportement alimentaire, en amont du premier appel. Avant cette
    // question, seule l'escalade in-app après coup existait côté technique
    // (une fois déjà client) — rien avant, un vrai trou dans le funnel pour
    // un coaching qui touche directement à la nutrition. Question posée
    // sans jugement, une seule fois, réponse "Oui" arrête le parcours
    // immédiatement (voir Wizard.tsx, exitOn) : aucune réponse envoyée à
    // Calendly ni à Supabase dans ce cas, uniquement une orientation vers
    // un professionnel de santé.
    type: "choice",
    id: "tca_screening",
    label: "As-tu, actuellement ou par le passé, un trouble du comportement alimentaire diagnostiqué, ou un suivi médical pour ta relation à la nourriture ?",
    helper: "Question posée à tout le monde, pour t'orienter vers le bon accompagnement.",
    options: [
      { value: "non", label: "Non" },
      { value: "oui", label: "Oui" },
    ],
    exitOn: ["oui"],
    exitScreen: {
      title: "Merci pour ta franchise",
      body: "Ce que tu décris mérite un accompagnement médical, pas un programme de musculation. Je préfère te le dire clairement plutôt que de te faire perdre du temps ou de risquer d'aggraver les choses.",
    },
  },
  { type: "text", id: "prenom", label: "Ton prénom ?", placeholder: "Prénom" },
  { type: "text", id: "nom", label: "Ton nom ?", placeholder: "Nom" },
  {
    type: "tel",
    id: "telephone",
    label: "Ton numéro de téléphone ?",
    placeholder: "06 12 34 56 78",
    helper: "Pour te recontacter si besoin avant l'appel.",
  },
  {
    type: "email",
    id: "email",
    label: "Ton email ?",
    placeholder: "toi@exemple.com",
    helper: "Pour pré-remplir ta réservation de créneau, rien de plus. Facultatif.",
    optional: true,
  },
  {
    type: "choice",
    id: "timeline",
    label: "Tu es prêt à commencer quand ?",
    options: [
      { value: "tout_de_suite", label: "Tout de suite" },
      { value: "prochaines_semaines", label: "Dans les prochaines semaines" },
      { value: "je_me_renseigne", label: "Je me renseigne pour l'instant" },
    ],
  },
  {
    type: "choice",
    id: "budget",
    label: "Quel budget mensuel tu es prêt à investir dans ton accompagnement ?",
    helper: "Sers-toi de ces fourchettes pour te situer, pas besoin d'être exact.",
    options: [
      { value: "moins_350", label: "Moins de 350€ / mois" },
      { value: "350", label: "350€ / mois" },
      { value: "550", label: "550€ / mois" },
      { value: "750", label: "750€ / mois" },
      { value: "flexible", label: "Autant qu'il faut pour atteindre mes objectifs" },
    ],
  },
  {
    type: "choice",
    id: "source_decouverte",
    label: "Comment tu nous as connu ?",
    options: [
      { value: "instagram", label: "Instagram" },
      { value: "tiktok", label: "TikTok" },
      { value: "youtube", label: "YouTube" },
      { value: "recommandation", label: "Recommandation / bouche-à-oreille" },
      { value: "recherche", label: "Recherche Google / internet" },
      { value: "autre", label: "Autre" },
    ],
  },
];

export default function PrequalificationPage() {
  return (
    <Wizard
      intro={{
        eyebrow: "◆ EP Coaching",
        title: "Avant ton audit stratégique",
        body: "Réponds à quelques questions, ça prend moins de 3 minutes. On fait le point avant de se parler.",
      }}
      questions={questions}
      onSubmit={submitPhysiqueForm}
      successTitle="On se parle bientôt"
      successBody="Réserve ton audit stratégique : on fait le point sur ta situation, ce que tu fais déjà et tes leviers prioritaires. Tu repars avec une vision plus claire de tes prochaines étapes."
      // Un seul événement Calendly actif : « Audit stratégique »
      // (lib/booking.ts). L'ancien slug /appel-decouverte-business n'existe plus.
      calendlyUrl={AUDIT_STRATEGIQUE_URL}
      campaignTag="physique"
    />
  );
}
