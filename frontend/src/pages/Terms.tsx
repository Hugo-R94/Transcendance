import { useState } from "react";

const content = {
  terms: {
    title: "Conditions d'Utilisation",

    object: [
      "1. Objet",
      "Clickbet est une plateforme de jeux vidéo permettant aux utilisateurs de consulter des informations sur des jeux, de jouer en ligne, de publier des avis et commentaires, d'interagir avec d'autres utilisateurs et de gérer leur liste de jeux."
    ],

    account: [
      "2. Compte Utilisateur",
      "L'utilisation de certaines fonctionnalités nécessite la création d'un compte. L'utilisateur est responsable de la sécurité de ses identifiants et des actions réalisées avec son compte. Chaque utilisateur peut supprimer son compte à tout moment depuis les fonctionnalités prévues à cet effet."
    ],

    behavior: [
      "3. Comportement et Interactions",
      "Les utilisateurs peuvent publier des avis et commentaires, utiliser le chat et ajouter d'autres utilisateurs à leur liste d'amis. Les contenus insultants, haineux, discriminatoires, menaçants, malveillants ou assimilables à du spam ne sont pas autorisés. Les utilisateurs peuvent notamment bloquer d'autres utilisateurs."
    ],

    content: [
      "4. Contenu des Utilisateurs",
      "Les utilisateurs restent responsables des avis, commentaires et messages qu'ils publient. Ils s'engagent à ne pas utiliser la plateforme pour diffuser du contenu illégal, malveillant ou portant atteinte aux droits d'autrui. Les contenus ne respectant pas ces règles peuvent être supprimés."
    ],

    gaming: [
      "5. Jeu en Ligne et Équité",
      "Les fonctionnalités de jeu sont destinées au divertissement. L'utilisation de bots, cheats, exploits, scripts ou de tout autre moyen permettant de tricher ou de manipuler les scores et classements est interdite."
    ],

    moderation: [
      "6. Modération",
      "Afin de maintenir un environnement respectueux, les contenus contraires aux présentes conditions peuvent être supprimés et les comptes concernés peuvent être temporairement suspendus ou définitivement bloqués en cas de comportement abusif ou répété."
    ],

    intellectualProperty: [
      "7. Propriété Intellectuelle",
      "Le code et les éléments originaux de Clickbet sont développés dans le cadre du projet. Les noms, logos, images, jaquettes et informations concernant les jeux restent la propriété de leurs détenteurs respectifs. Les informations relatives aux jeux sont notamment fournies par l'intermédiaire de l'API Steam."
    ],

    availability: [
      "8. Disponibilité du Service",
      "Clickbet est un projet pédagogique. Le service peut être temporairement indisponible en raison de maintenance, de problèmes techniques ou de modifications de la plateforme."
    ],

    modifications: [
      "9. Modification des Conditions",
      "Ces conditions peuvent être modifiées lorsque le fonctionnement ou les fonctionnalités de Clickbet évoluent. La version affichée sur cette page est la version actuellement applicable."
    ]
  },

  privacy: {
    title: "Politique de Confidentialité",

    collection: [
      "1. Données Stockées",
      "Clickbet stocke uniquement les données nécessaires au fonctionnement de la plateforme. Cela comprend notamment le nom d'utilisateur, l'adresse e-mail, le mot de passe sous forme hachée, l'avatar, le titre du profil, les avis, commentaires, likes, l'historique des parties et leurs scores, les listes de jeux (like, dislike et wishlist), ainsi que les listes d'amis et d'utilisateurs bloqués."
    ],

    messages: [
      "2. Messages et Chat",
      "Les messages envoyés via le chat sont stockés en base de données afin de permettre le fonctionnement de la messagerie et de conserver les conversations entre utilisateurs."
    ],

    usage: [
      "3. Utilisation des Données",
      "Les données sont utilisées uniquement pour permettre le fonctionnement des fonctionnalités de Clickbet : authentification, gestion du profil, avis et commentaires, interactions sociales, listes de jeux, historique des parties, scores, classements et messagerie."
    ],

    authentication: [
      "4. Authentification",
      "Les mots de passe ne sont pas stockés en clair et sont enregistrés sous forme hachée. L'application utilise également des jetons d'authentification stockés localement dans le navigateur afin de maintenir la session de l'utilisateur."
    ],

    localStorage: [
      "5. Stockage Local",
      "L'application utilise le stockage local du navigateur (localStorage) pour conserver certaines informations nécessaires au fonctionnement de la session et de l'interface, notamment les jetons d'authentification et certaines informations de profil."
    ],

    external: [
      "6. Données provenant de Services Externes",
      "Clickbet utilise l'API Steam afin de récupérer des informations relatives aux jeux vidéo, notamment leurs noms, descriptions et images. Ces informations sont fournies par un service externe et restent soumises aux droits et conditions applicables à leurs propriétaires."
    ],

    sharing: [
      "7. Partage des Données",
      "Les données des utilisateurs ne sont pas vendues ni utilisées à des fins publicitaires. Elles sont utilisées dans le cadre du fonctionnement de la plateforme."
    ],

    deletion: [
      "8. Suppression du Compte et des Données",
      "Chaque utilisateur peut supprimer son compte. La suppression du compte entraîne la suppression des données qui lui sont associées, conformément au fonctionnement de la plateforme."
    ],

    modifications: [
      "9. Modification de la Politique",
      "Cette politique peut être mise à jour si les fonctionnalités ou le fonctionnement de Clickbet évoluent. La version affichée sur cette page correspond à la version actuellement applicable."
    ]
  }
};

export default function TermsOfServices() {
  const [page, setPage] = useState<"terms" | "privacy">("terms");

  const currentContent = content[page];

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center">

      {/* SELECTEUR */}
      <div className="flex w-full h-15 gap-x-3 mt-20 font-bold">

        <button
          onClick={() => setPage("terms")}
          className={`bg-bred w-40 h-full ml-auto rounded-2xl hover:outline-3
            hover:outline-white ${page === "terms" ? "outline-3 outline-white" : ""}`}>
          Terms of Services
        </button>

        <button
          onClick={() => setPage("privacy")}
          className={`bg-byellow w-40 h-full mr-auto rounded-2xl
            hover:outline-3 hover:outline-white 
            ${page === "privacy" ? "outline-3 outline-white" : ""}`}>
          Privacy Policy
        </button>

      </div>

      {/* CONTENU */}
      <div className="bg-bdarkgreen w-[90%] p-5 h-[75vh] mx-auto mt-5 rounded-2xl card">

        <div className="w-full h-full bg-black/50 rounded-2xl overflow-auto p-5">

          <h1 className="text-3xl font-bold mb-4">
            {currentContent.title}
          </h1>

          {Object.values(currentContent)
            .slice(1)
            .map(([title, desc], i) => (
              <section key={i} className="mb-5">
                <h2 className="font-semibold text-lg mb-1">
                  {title}
                </h2>

                <p className="opacity-90 text-sm leading-relaxed">
                  {desc}
                </p>
              </section>
            ))}

        </div>

      </div>
    </div>
  );
}