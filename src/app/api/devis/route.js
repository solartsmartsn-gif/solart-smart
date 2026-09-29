import { Resend } from "resend";
import { renderToBuffer } from "@react-pdf/renderer";
import fs from "fs";
import path from "path";
import DevisDocument from "@/pdf/DevisDocument";

const resend = new Resend(process.env.RESEND_API_KEY);

/*
  MODE DÉVELOPPEMENT RESEND

  Resend autorise actuellement l'envoi uniquement
  vers l'adresse email propriétaire du compte.
*/
const EMAIL_TEST = "solartsmart.sn@gmail.com";

const COMPANY = {
  nom: "Solart Smart",
  email: "galsenenergy221@gmail.com",
  telephone: "+221 78 593 25 25",
  adresse:
    "Pikine Icotaf 3, Tally Mbaye Gakou, en face marché Sandika",
};

function cleanText(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function number(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatFCFA(value) {
  return `${Math.round(number(value)).toLocaleString(
    "fr-FR"
  )} FCFA`;
}

export async function POST(request) {
  try {
    console.log("=================================");
    console.log("      NOUVELLE DEMANDE DE DEVIS");
    console.log("=================================");

    /* ================================
       1. VÉRIFICATION RESEND
    ================================= */

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY manquante.");

      return Response.json(
        {
          success: false,
          error: "La clé API Resend est manquante.",
        },
        { status: 500 }
      );
    }

    /* ================================
       2. RÉCUPÉRATION DES DONNÉES
    ================================= */

    let body;

    try {
      body = await request.json();
    } catch (error) {
      return Response.json(
        {
          success: false,
          error: "Les données envoyées sont invalides.",
        },
        { status: 400 }
      );
    }

    const nom = cleanText(body?.nom);
    const emailClient = cleanText(body?.email).toLowerCase();
    const telephone = cleanText(body?.telephone);

    const produits = Array.isArray(body?.produits)
      ? body.produits
      : [];

    /* ================================
       3. VALIDATION
    ================================= */

    if (!nom) {
      return Response.json(
        {
          success: false,
          error: "Le nom est obligatoire.",
        },
        { status: 400 }
      );
    }

    if (!emailClient) {
      return Response.json(
        {
          success: false,
          error: "L'adresse email est obligatoire.",
        },
        { status: 400 }
      );
    }

    const emailValide =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClient);

    if (!emailValide) {
      return Response.json(
        {
          success: false,
          error: "L'adresse email n'est pas valide.",
        },
        { status: 400 }
      );
    }

    if (produits.length === 0) {
      return Response.json(
        {
          success: false,
          error: "Aucun produit sélectionné.",
        },
        { status: 400 }
      );
    }

    /* ================================
       4. NETTOYAGE DES PRODUITS
    ================================= */

    const produitsPropres = produits.map((produit) => ({
      ...produit,
      nom: cleanText(produit?.nom) || "Produit",
      quantite: Math.max(
        1,
        Math.floor(number(produit?.quantite) || 1)
      ),
      prix: Math.max(0, number(produit?.prix)),
    }));

    /* ================================
       5. NUMÉRO DE DEVIS
    ================================= */

    const now = new Date();

    const numeroDevis =
      "SS" +
      String(now.getFullYear()).slice(-2) +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0") +
      String(Math.floor(Math.random() * 900000) + 100000);

    /* ================================
       6. DATE
    ================================= */

    const date = now.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    /* ================================
       7. CALCUL DU TOTAL
    ================================= */

    const total = produitsPropres.reduce(
      (sum, produit) =>
        sum +
        number(produit.prix) *
          number(produit.quantite),
      0
    );

    /* ================================
       8. CHARGEMENT DU LOGO
    ================================= */

    let logoBase64 = null;

    try {
      const logoPath = path.join(
        process.cwd(),
        "public",
        "logo.png"
      );

      if (fs.existsSync(logoPath)) {
        const logoData = fs.readFileSync(logoPath);

        logoBase64 =
          `data:image/png;base64,${logoData.toString(
            "base64"
          )}`;
      }
    } catch (error) {
      console.error(
        "Erreur chargement logo :",
        error
      );

      logoBase64 = null;
    }

    /* ================================
       9. GÉNÉRATION DU PDF
    ================================= */

    let pdfBuffer;

    try {
      pdfBuffer = await renderToBuffer(
        <DevisDocument
          numeroDevis={numeroDevis}
          date={date}
          nom={nom}
          telephone={telephone}
          produits={produitsPropres}
          logoBase64={logoBase64}
        />
      );
    } catch (error) {
      console.error(
        "Erreur génération PDF :",
        error
      );

      return Response.json(
        {
          success: false,
          error:
            "Impossible de générer le devis PDF.",
        },
        { status: 500 }
      );
    }

    /* ================================
       10. LISTE DES PRODUITS
    ================================= */

    const listeProduits = produitsPropres
      .map(
        (p) =>
          `• ${p.nom} — Quantité : ${
            p.quantite
          } — ${formatFCFA(
            p.prix * p.quantite
          )}`
      )
      .join("\n");

    /* =====================================================
       11. EMAIL DE TEST

       IMPORTANT :
       L'adresse saisie par le client n'est PAS utilisée
       comme destinataire pendant le développement.

       Resend envoie à EMAIL_TEST.
    ===================================================== */

    console.log(
      "Email saisi par le client :",
      emailClient
    );

    console.log(
      "Email réellement utilisé par Resend :",
      EMAIL_TEST
    );

    const emailClientTest = await resend.emails.send({
      from: "Solart Smart <onboarding@resend.dev>",

      to: EMAIL_TEST,

      subject:
        `TEST DEVIS — ${numeroDevis} — ${nom}`,

      text: `Bonjour,

UNE NOUVELLE DEMANDE DE DEVIS A ÉTÉ EFFECTUÉE.

--------------------------------
DEVIS
--------------------------------

Numéro : ${numeroDevis}
Date : ${date}

--------------------------------
CLIENT
--------------------------------

Nom : ${nom}
Email demandé par le client : ${emailClient}
Téléphone : ${
        telephone || "Non renseigné"
      }

--------------------------------
PRODUITS
--------------------------------

${listeProduits}

--------------------------------
TOTAL DU PANIER
--------------------------------

${formatFCFA(total)}

--------------------------------

IMPORTANT :
Ce site est actuellement en développement.
Resend est utilisé en mode test.
Le message a donc été envoyé à :
${EMAIL_TEST}

L'adresse réelle du client est :
${emailClient}

--------------------------------

${COMPANY.nom}
${COMPANY.adresse}
Tél / WhatsApp : ${COMPANY.telephone}
Email : ${COMPANY.email}`,

      attachments: [
        {
          filename: `Devis_${numeroDevis}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    /* ================================
       12. VÉRIFICATION RESEND
    ================================= */

    if (emailClientTest?.error) {
      console.error(
        "ERREUR RESEND :",
        emailClientTest.error
      );

      return Response.json(
        {
          success: false,
          error:
            emailClientTest.error?.message ||
            "Resend n'a pas pu envoyer le devis.",
        },
        { status: 500 }
      );
    }

    console.log(
      "✓ Email envoyé à l'adresse de test Resend."
    );

    /* ================================
       13. RÉPONSE AU SITE
    ================================= */

    return Response.json({
      success: true,
      numeroDevis,
      message:
        "Votre demande de devis a bien été envoyée.",
      mode: "development",
    });
  } catch (error) {
    console.error(
      "ERREUR API DEVIS :",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          error?.message ||
          "Une erreur inattendue est survenue.",
      },
      { status: 500 }
    );
  }
}