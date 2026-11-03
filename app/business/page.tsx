import { redirect } from "next/navigation";

// Le formulaire « business » (préqualification pour un accompagnement
// business humain des coachs) est retiré : cette offre est arrêtée
// (décision Notion du 01/11/2026). Les coachs sont orientés vers le
// logiciel EP Coaching, sans prise de rendez-vous. L'URL est conservée
// en redirection pour ne casser aucun ancien lien partagé.
export default function BusinessPage() {
  redirect("https://santamariasanchez.github.io/EPCoaching/business/");
}
