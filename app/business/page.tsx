import type { Metadata } from "next";
import Wizard, { type Question } from "@/components/Wizard";
import { submitBusinessForm } from "./actions";

// Nouvelle route (n'existait pas), prompt 13/15. /business choisi pour
// rester cohérent avec /physique/ et /business/ sur ep-site : cette URL
// est celle à brancher sur le bouton "Réserver mon appel" de la section
// Accompagnement 1-to-1 de business/index.html au prompt 14/15.
export const metadata: Metadata = {
  title: "EP Coaching · Avant notre appel",
  description:
    "Réponds à quelques questions sur ton activité de coach avant de réserver ton appel avec Santamaria Sànchez.",
};

const questions: Question[] = [
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
    id: "anciennete",
    label: "Depuis combien de temps tu coaches ?",
    options: [
      { value: "pas_encore", label: "Je n'ai pas encore commencé" },
      { value: "moins_1_an", label: "Moins d'un an" },
      { value: "1_a_3_ans", label: "1 à 3 ans" },
      { value: "plus_3_ans", label: "Plus de 3 ans" },
    ],
  },
  {
    type: "choice",
    id: "nb_clients",
    label: "Combien de clients tu accompagnes actuellement ?",
    options: [
      { value: "0", label: "Aucun pour l'instant" },
      { value: "1_a_5", label: "1 à 5" },
      { value: "6_a_15", label: "6 à 15" },
      { value: "16_a_30", label: "16 à 30" },
      { value: "plus_30", label: "Plus de 30" },
    ],
  },
  {
    type: "choice",
    id: "gestion_actuelle",
    label: "Comment tu gères tes clients aujourd'hui ?",
    options: [
      { value: "whatsapp_instagram", label: "WhatsApp / Instagram, à la main" },
      { value: "tableur_outils_eparts", label: "Un tableur et plusieurs outils séparés" },
      { value: "plateforme_dediee", label: "Une plateforme dédiée" },
      { value: "autre", label: "Autre méthode" },
    ],
  },
  {
    type: "textarea",
    id: "blocage_principal",
    label: "Qu'est-ce qui te bloque le plus pour passer au niveau supérieur ?",
    placeholder: "Réponds simplement, avec tes mots.",
  },
  {
    type: "textarea",
    id: "objectif_business",
    label: "C'est quoi ton objectif business sur les prochains mois ?",
    placeholder: "Nombre de clients visé, structuration de ton offre, ce que tu veux atteindre.",
  },
  {
    // Ajoutée le 2026-08-30 (synthèse webinaire Matis Clouet, voir Notion) :
    // meme logique que le questionnaire physique/page.tsx.
    type: "choice",
    id: "pourquoi_ep_coaching",
    label: "Pourquoi EP Coaching plutôt qu'une autre solution pour scaler ton activité ?",
    options: [
      { value: "confiance_contenu", label: "Je suis le contenu depuis un moment, j'ai confiance dans la méthode" },
      { value: "recommandation", label: "On me l'a recommandé" },
      { value: "compare_options", label: "Je compare plusieurs options en ce moment" },
      { value: "decouverte", label: "Je découvre à peine, je ne sais pas encore" },
    ],
  },
  {
    type: "choice",
    id: "budget",
    label: "Quel budget mensuel tu es prêt à investir pour scaler ton activité ?",
    helper: "Sers-toi de ces fourchettes pour te situer, pas besoin d'être exact.",
    options: [
      { value: "150", label: "150€ / mois" },
      { value: "300", label: "300€ / mois" },
      { value: "600", label: "600€ / mois" },
      { value: "flexible", label: "Autant qu'il faut pour scaler mon activité" },
    ],
  },
  {
    type: "choice",
    id: "disponibilite",
    label: "Combien de temps par semaine tu peux consacrer à structurer ton business ?",
    options: [
      { value: "moins_2h", label: "Moins de 2h" },
      { value: "2_a_5h", label: "2 à 5h" },
      { value: "5_a_10h", label: "5 à 10h" },
      { value: "plus_10h", label: "Plus de 10h" },
    ],
  },
  {
    type: "choice",
    id: "source_decouverte",
    label: "Comment tu nous as connu ?",
    options: [
      { value: "instagram", label: "Instagram" },
      { value: "recommandation", label: "Recommandation / bouche-à-oreille" },
      { value: "recherche", label: "Recherche Google / internet" },
      { value: "autre", label: "Autre" },
    ],
  },
];

export default function BusinessPrequalificationPage() {
  return (
    <Wizard
      intro={{
        eyebrow: "◆ EP Coaching",
        title: "Avant notre appel",
        body: "Réponds à quelques questions sur ton activité, ça prend moins de 3 minutes. On fait le point avant de se parler.",
      }}
      questions={questions}
      onSubmit={submitBusinessForm}
      successTitle="On se parle bientôt"
      successBody="Réserve ton créneau, on fait le point sur ton activité et sur ce que tu veux atteindre."
      // Retour direct 2026-09-10 : un seul event type Calendly actif pour
      // tout le monde (voir le commentaire équivalent dans
      // app/prequalification/page.tsx), renommé "Appel Stratégique" côté
      // Calendly. Ce parcours pointait par erreur vers /30min (l'URL de
      // l'event physique, aujourd'hui désactivé) avant ce correctif.
      calendlyUrl="https://calendly.com/peccoux-manu/appel-decouverte-business"
      campaignTag="business"
    />
  );
}
