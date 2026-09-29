"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

const WHATSAPP =
  "https://wa.me/221785932525";

const VILLES = [
  {
    nom: "Dakar",
    lat: 14.7167,
    lon: -17.4677,
  },
  {
    nom: "Thiès",
    lat: 14.7886,
    lon: -16.926,
  },
  {
    nom: "Touba",
    lat: 14.85,
    lon: -15.8833,
  },
  {
    nom: "Diourbel",
    lat: 14.65,
    lon: -16.2333,
  },
  {
    nom: "Saint-Louis",
    lat: 16.0326,
    lon: -16.4818,
  },
  {
    nom: "Louga",
    lat: 15.6144,
    lon: -16.2244,
  },
  {
    nom: "Kaolack",
    lat: 14.1515,
    lon: -16.0726,
  },
  {
    nom: "Fatick",
    lat: 14.339,
    lon: -16.416,
  },
  {
    nom: "Tambacounda",
    lat: 13.7707,
    lon: -13.6673,
  },
  {
    nom: "Kolda",
    lat: 12.8939,
    lon: -14.941,
  },
  {
    nom: "Ziguinchor",
    lat: 12.5833,
    lon: -16.2719,
  },
  {
    nom: "Matam",
    lat: 15.6559,
    lon: -13.2554,
  },
  {
    nom: "Kédougou",
    lat: 12.5605,
    lon: -12.1747,
  },
];

const TARIFS = {
  dpp: {
    nom: "DPP — Domestique Petite Puissance",
    secteur: "residentiel",
    tranches: [
      {
        limite: 150,
        prix: 82,
      },
      {
        limite: 250,
        prix: 136.49,
      },
      {
        limite: Infinity,
        prix: 159.36,
      },
    ],
  },

  dmp: {
    nom: "DMP — Domestique Moyenne Puissance",
    secteur: "residentiel",
    tranches: [
      {
        limite: 50,
        prix: 111.23,
      },
      {
        limite: 300,
        prix: 143.54,
      },
      {
        limite: Infinity,
        prix: 158.46,
      },
    ],
  },

  ppp: {
    nom: "PPP — Professionnel Petite Puissance",
    secteur: "commercial",
    tranches: [
      {
        limite: 50,
        prix: 147.43,
      },
      {
        limite: 500,
        prix: 189.84,
      },
      {
        limite: Infinity,
        prix: 208.63,
      },
    ],
  },

  pmp: {
    nom: "PMP — Professionnel Moyenne Puissance",
    secteur: "commercial",
    tranches: [
      {
        limite: 100,
        prix: 165.01,
      },
      {
        limite: 500,
        prix: 191.01,
      },
      {
        limite: Infinity,
        prix: 210.81,
      },
    ],
  },

  dgp: {
    nom: "DGP — Domestique Grande Puissance",
    secteur: "industriel",
    pointe: 170.53,
    horsPointe: 118.37,
    primeFixe: 956.13,
  },

  pgp: {
    nom: "PGP — Professionnel Grande Puissance",
    secteur: "industriel",
    pointe: 232.23,
    horsPointe: 140.74,
    primeFixe: 2868.39,
  },

  tg: {
    nom: "TG — Moyenne Tension Tarif Général",
    secteur: "industriel",
    pointe: 184.65,
    horsPointe: 111.91,
    primeFixe: 4093.6,
  },
};

const SECTEURS = {
  residentiel: {
    nom: "Résidentiel",
    icon: "🏠",
    description:
      "Maison, appartement, villa",
    tarifs: ["dpp", "dmp"],

    appareils: [
      {
        id: "frigo",
        nom: "Réfrigérateur",
        icon: "🧊",
        puissance: 150,
        heures: 8,
        jours: 7,
        periode: "mixte",
      },
      {
        id: "congelateur",
        nom: "Congélateur",
        icon: "❄️",
        puissance: 200,
        heures: 8,
        jours: 7,
        periode: "mixte",
      },
      {
        id: "clim9000",
        nom: "Climatiseur 9 000 BTU",
        icon: "❄️",
        puissance: 700,
        heures: 8,
        jours: 7,
        periode: "mixte",
      },
      {
        id: "clim12000",
        nom: "Climatiseur 12 000 BTU",
        icon: "❄️",
        puissance: 1000,
        heures: 8,
        jours: 7,
        periode: "mixte",
      },
      {
        id: "clim18000",
        nom: "Climatiseur 18 000 BTU",
        icon: "❄️",
        puissance: 1500,
        heures: 8,
        jours: 7,
        periode: "mixte",
      },
      {
        id: "tv",
        nom: "Télévision LED",
        icon: "📺",
        puissance: 100,
        heures: 5,
        jours: 7,
        periode: "soir",
      },
      {
        id: "ventilateur",
        nom: "Ventilateur",
        icon: "🌀",
        puissance: 60,
        heures: 8,
        jours: 7,
        periode: "mixte",
      },
      {
        id: "eclairage",
        nom: "Éclairage LED",
        icon: "💡",
        puissance: 10,
        heures: 5,
        jours: 7,
        periode: "soir",
      },
      {
        id: "ordinateur",
        nom: "Ordinateur",
        icon: "💻",
        puissance: 100,
        heures: 6,
        jours: 5,
        periode: "jour",
      },
      {
        id: "chauffe_eau",
        nom: "Chauffe-eau",
        icon: "🚿",
        puissance: 1500,
        heures: 1.5,
        jours: 7,
        periode: "mixte",
      },
      {
        id: "machine_laver",
        nom: "Machine à laver",
        icon: "🧺",
        puissance: 500,
        heures: 1,
        jours: 4,
        periode: "jour",
      },
      {
        id: "fer",
        nom: "Fer à repasser",
        icon: "👕",
        puissance: 1800,
        heures: 0.5,
        jours: 3,
        periode: "jour",
      },
      {
        id: "microonde",
        nom: "Micro-ondes",
        icon: "🍲",
        puissance: 1200,
        heures: 0.5,
        jours: 7,
        periode: "mixte",
      },
      {
        id: "pompe",
        nom: "Pompe à eau",
        icon: "💧",
        puissance: 750,
        heures: 2,
        jours: 7,
        periode: "jour",
      },
    ],
  },

  commercial: {
    nom: "Commercial",
    icon: "🏢",
    description:
      "Boutique, magasin, bureau, restaurant",
    tarifs: ["ppp", "pmp"],

    appareils: [
      {
        id: "clim12000",
        nom: "Climatiseur 12 000 BTU",
        icon: "❄️",
        puissance: 1000,
        heures: 10,
        jours: 6,
        periode: "mixte",
      },
      {
        id: "clim18000",
        nom: "Climatiseur 18 000 BTU",
        icon: "❄️",
        puissance: 1500,
        heures: 10,
        jours: 6,
        periode: "mixte",
      },
      {
        id: "clim24000",
        nom: "Climatiseur 24 000 BTU",
        icon: "❄️",
        puissance: 2200,
        heures: 10,
        jours: 6,
        periode: "mixte",
      },
      {
        id: "vitrine",
        nom: "Vitrine réfrigérée",
        icon: "🧊",
        puissance: 800,
        heures: 12,
        jours: 6,
        periode: "jour",
      },
      {
        id: "congelateur",
        nom: "Congélateur professionnel",
        icon: "❄️",
        puissance: 700,
        heures: 12,
        jours: 6,
        periode: "jour",
      },
      {
        id: "frigo",
        nom: "Réfrigérateur professionnel",
        icon: "🧊",
        puissance: 500,
        heures: 12,
        jours: 6,
        periode: "jour",
      },
      {
        id: "eclairage",
        nom: "Éclairage commercial",
        icon: "💡",
        puissance: 30,
        heures: 10,
        jours: 6,
        periode: "jour",
      },
      {
        id: "ordinateur",
        nom: "Ordinateur de bureau",
        icon: "💻",
        puissance: 150,
        heures: 8,
        jours: 6,
        periode: "jour",
      },
      {
        id: "caisse",
        nom: "Caisse / POS",
        icon: "🧾",
        puissance: 100,
        heures: 10,
        jours: 6,
        periode: "jour",
      },
      {
        id: "serveur",
        nom: "Serveur / informatique",
        icon: "🖥️",
        puissance: 500,
        heures: 24,
        jours: 7,
        periode: "mixte",
      },
      {
        id: "pompe",
        nom: "Pompe à eau",
        icon: "💧",
        puissance: 1500,
        heures: 3,
        jours: 6,
        periode: "jour",
      },
      {
        id: "four",
        nom: "Four électrique",
        icon: "🔥",
        puissance: 3000,
        heures: 3,
        jours: 6,
        periode: "jour",
      },
    ],
  },

  industriel: {
    nom: "Industriel",
    icon: "⚙️",
    description:
      "Atelier, usine, production, grande installation",
    tarifs: ["dgp", "pgp", "tg"],

    appareils: [
      {
        id: "moteur",
        nom: "Moteur électrique",
        icon: "⚙️",
        puissance: 11000,
        heures: 8,
        jours: 6,
        periode: "jour",
        moteur: true,
      },
      {
        id: "pompe",
        nom: "Pompe industrielle",
        icon: "💧",
        puissance: 15000,
        heures: 8,
        jours: 6,
        periode: "jour",
        moteur: true,
      },
      {
        id: "compresseur",
        nom: "Compresseur",
        icon: "🔧",
        puissance: 15000,
        heures: 8,
        jours: 6,
        periode: "jour",
        moteur: true,
      },
      {
        id: "clim",
        nom: "Climatisation industrielle",
        icon: "❄️",
        puissance: 10000,
        heures: 10,
        jours: 6,
        periode: "jour",
      },
      {
        id: "chambre_froide",
        nom: "Chambre froide",
        icon: "🧊",
        puissance: 8000,
        heures: 12,
        jours: 7,
        periode: "mixte",
      },
      {
        id: "eclairage",
        nom: "Éclairage industriel",
        icon: "💡",
        puissance: 100,
        heures: 10,
        jours: 6,
        periode: "jour",
      },
      {
        id: "machine",
        nom: "Machine de production",
        icon: "🏭",
        puissance: 22000,
        heures: 8,
        jours: 6,
        periode: "jour",
      },
      {
        id: "ventilation",
        nom: "Ventilation industrielle",
        icon: "🌀",
        puissance: 5000,
        heures: 10,
        jours: 6,
        periode: "jour",
      },
      {
        id: "soudeuse",
        nom: "Poste à souder",
        icon: "⚡",
        puissance: 6000,
        heures: 4,
        jours: 6,
        periode: "jour",
      },
    ],
  },
};

const PANNEAUX = [
  450,
  550,
  580,
  610,
  620,
  700,
];

const MOIS = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Août",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
];

function formatNombre(value, decimals = 1) {
  return Number(value || 0).toLocaleString(
    "fr-FR",
    {
      maximumFractionDigits: decimals,
    }
  );
}

function formatFCFA(value) {
  return (
    Math.round(Number(value || 0)).toLocaleString(
      "fr-FR"
    ) + " FCFA"
  );
}

/*
 * ---------------------------------------------------------
 * FACTURE SENELEC
 * ---------------------------------------------------------
 */

function calculerFacture(
  kWh,
  tarifId,
  puissanceSouscrite = 0
) {
  const tarif = TARIFS[tarifId];

  if (!tarif || kWh <= 0) {
    return 0;
  }

  if (tarif.tranches) {
    let reste = kWh;
    let precedent = 0;
    let total = 0;

    for (const tranche of tarif.tranches) {
      const limite = tranche.limite;

      const volume =
        limite === Infinity
          ? reste
          : Math.max(
              0,
              Math.min(
                reste,
                limite - precedent
              )
            );

      total +=
        volume * tranche.prix;

      reste -= volume;

      if (limite !== Infinity) {
        precedent = limite;
      }

      if (reste <= 0) {
        break;
      }
    }

    return total;
  }

  const puissance =
    Number(puissanceSouscrite) || 0;

  const pointe = kWh * 0.3;

  const horsPointe =
    kWh - pointe;

  return (
    horsPointe * tarif.horsPointe +
    pointe * tarif.pointe +
    puissance * tarif.primeFixe
  );
}

/*
 * ---------------------------------------------------------
 * PROFILS HORAIRES
 * ---------------------------------------------------------
 */

function heuresDansFenetre(
  heure,
  debut,
  fin
) {
  if (debut < fin) {
    return heure >= debut && heure < fin;
  }

  return (
    heure >= debut ||
    heure < fin
  );
}

function creerProfilFacture(
  energieJour,
  partJour
) {
  const profil = Array(24).fill(0);

  const jour = Math.max(
    0,
    Math.min(
      1,
      partJour / 100
    )
  );

  const nuit = 1 - jour;

  const heuresJour = [];

  const heuresNuit = [];

  for (let h = 0; h < 24; h++) {
    if (
      heuresDansFenetre(
        h,
        8,
        18
      )
    ) {
      heuresJour.push(h);
    } else {
      heuresNuit.push(h);
    }
  }

  const energieJourHoraire =
    energieJour * jour;

  const energieNuitHoraire =
    energieJour * nuit;

  heuresJour.forEach((h) => {
    profil[h] =
      energieJourHoraire /
      heuresJour.length;
  });

  heuresNuit.forEach((h) => {
    profil[h] =
      energieNuitHoraire /
      heuresNuit.length;
  });

  return profil;
}

function creerProfilAppareils(
  appareilsActifs,
  appareils
) {
  const profil = Array(24).fill(0);

  appareilsActifs.forEach(
    (appareil) => {
      const data =
        appareils[appareil.id];

      if (!data) {
        return;
      }

      const quantite =
        Number(data.quantite) || 0;

      const puissance =
        Number(data.puissance) || 0;

      const heures =
        Number(data.heures) || 0;

      const jours =
        Number(data.jours) || 0;

      const periode =
        data.periode ||
        appareil.periode ||
        "jour";

      if (
        quantite <= 0 ||
        puissance <= 0 ||
        heures <= 0 ||
        jours <= 0
      ) {
        return;
      }

      const energieJour =
        (quantite *
          puissance *
          heures *
          (jours / 7)) /
        1000;

      let fenetre = [];

      if (periode === "jour") {
        fenetre = Array.from(
          { length: 10 },
          (_, i) => i + 8
        );
      } else if (
        periode === "soir"
      ) {
        fenetre = [
          18,
          19,
          20,
          21,
          22,
        ];
      } else {
        fenetre = [
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          15,
          16,
          17,
          18,
          19,
          20,
          21,
          22,
          23,
          0,
          1,
          2,
          3,
          4,
          5,
          6,
          7,
        ];
      }

      /*
       * On répartit l'énergie de l'appareil
       * dans sa fenêtre d'utilisation.
       *
       * Cela évite de supposer qu'un appareil
       * consomme toute sa puissance pendant
       * les 24 heures.
       */

      const energieParHeure =
        energieJour /
        fenetre.length;

      fenetre.forEach((heure) => {
        profil[heure] +=
          energieParHeure;
      });
    }
  );

  return profil;
}

/*
 * ---------------------------------------------------------
 * SIMULATION PV + BATTERIE + RESEAU
 * ---------------------------------------------------------
 */

function simulerSysteme({
  pvKw,
  productionHoraire1kWp,
  profilCharge,
  batterieKWh,
}) {
  const CHARGE_EFF =
    0.95;

  const DECHARGE_EFF =
    0.95;

  let batterie =
    Math.max(
      0,
      Number(batterieKWh) || 0
    );

  let energieDirecte = 0;
  let energieBatterie = 0;
  let energieReseau = 0;
  let energiePV = 0;
  let energiePerdue = 0;

  const heures =
    Math.min(
      productionHoraire1kWp.length,
      8760
    );

  for (let i = 0; i < heures; i++) {
    const pv =
      Math.max(
        0,
        Number(
          productionHoraire1kWp[i]
        ) || 0
      ) * pvKw;

    const charge =
      Math.max(
        0,
        Number(
          profilCharge[
            i % 24
          ]
        ) || 0
      );

    energiePV += pv;

    const direct =
      Math.min(
        pv,
        charge
      );

    energieDirecte +=
      direct;

    const surplus =
      Math.max(
        0,
        pv - direct
      );

    if (surplus > 0) {
      const espace =
        Math.max(
          0,
          batterieKWh -
            batterie
        );

      const stockage =
        Math.min(
          espace,
          surplus *
            CHARGE_EFF
        );

      batterie += stockage;

      const surplusNonStocke =
        Math.max(
          0,
          surplus -
            stockage /
              CHARGE_EFF
        );

      energiePerdue +=
        surplusNonStocke;
    }

    const manque =
      Math.max(
        0,
        charge - direct
      );

    if (manque > 0) {
      const disponible =
        batterie *
        DECHARGE_EFF;

      const depuisBatterie =
        Math.min(
          manque,
          disponible
        );

      batterie -=
        depuisBatterie /
        DECHARGE_EFF;

      energieBatterie +=
        depuisBatterie;

      energieReseau +=
        Math.max(
          0,
          manque -
            depuisBatterie
        );
    }
  }

  const energieCharge =
    profilCharge.reduce(
      (a, b) => a + b,
      0
    ) *
    (heures / 24);

  const autoconsommation =
    energieDirecte +
    energieBatterie;

  const tauxAutoconsommation =
    energiePV > 0
      ? Math.min(
          100,
          (autoconsommation /
            energiePV) *
            100
        )
      : 0;

  const couvertureCharge =
    energieCharge > 0
      ? Math.min(
          100,
          (autoconsommation /
            energieCharge) *
            100
        )
      : 0;

  return {
    energiePV,
    energieDirecte,
    energieBatterie,
    energieReseau,
    energiePerdue,
    energieCharge,
    tauxAutoconsommation,
    couvertureCharge,
  };
}

/*
 * ---------------------------------------------------------
 * ESTIMATION BATTERIE
 * ---------------------------------------------------------
 */

function calculerBatterie(
  profil,
  facteur
) {
  let energieSoirNuit = 0;

  for (let h = 18; h < 24; h++) {
    energieSoirNuit +=
      Number(profil[h]) || 0;
  }

  for (let h = 0; h < 8; h++) {
    energieSoirNuit +=
      Number(profil[h]) || 0;
  }

  /*
   * Batterie nominale :
   *
   * énergie soir/nuit
   * × facteur scénario
   *
   * puis correction :
   * - DoD 80 %
   * - rendement batterie 95 %
   */

  const dod = 0.8;

  const rendement =
    0.95;

  const nominale =
    (energieSoirNuit *
      facteur) /
    (dod * rendement);

  return Math.max(
    0,
    nominale
  );
}

/*
 * ---------------------------------------------------------
 * COMPOSANT
 * ---------------------------------------------------------
 */

export default function Estimation() {
  const [secteur, setSecteur] =
    useState("residentiel");

  const [source, setSource] =
    useState("facture");

  const [fichierFacture, setFichierFacture] =
    useState(null);

  const [kwhFacture, setKwhFacture] =
    useState("");

  const [montantFacture, setMontantFacture] =
    useState("");

  const [
    puissanceSouscrite,
    setPuissanceSouscrite,
  ] = useState("");

  const [tarifId, setTarifId] =
    useState("dpp");

  const [appareils, setAppareils] =
    useState({});

  const [appareilActif, setAppareilActif] =
    useState(null);

  const [ville, setVille] =
    useState("Dakar");

  const [latitude, setLatitude] =
    useState(14.7167);

  const [longitude, setLongitude] =
    useState(-17.4677);

  const [
    localisationMessage,
    setLocalisationMessage,
  ] = useState("");

  const [angle, setAngle] =
    useState("15");

  const [aspect, setAspect] =
    useState("0");

  const [pertes, setPertes] =
    useState("14");

  const [panneauW, setPanneauW] =
    useState(620);

  const [jourShare, setJourShare] =
    useState(45);

  const [resultat, setResultat] =
    useState(null);

  const [chargement, setChargement] =
    useState(false);

  const [erreur, setErreur] =
    useState("");

  const appareilsRef =
    useRef(null);

  const configurationRef =
    useRef(null);

  const configSecteur =
    SECTEURS[secteur];

  const appareilsActifs =
    configSecteur.appareils;

  /*
   * ---------------------------------------------------------
   * RESUME APPAREILS
   * ---------------------------------------------------------
   */

  const resumeAppareils =
    useMemo(() => {
      let nombre = 0;
      let puissance = 0;
      let energie = 0;

      appareilsActifs.forEach(
        (appareil) => {
          const data =
            appareils[
              appareil.id
            ];

          if (!data) {
            return;
          }

          const q =
            Number(
              data.quantite
            ) || 0;

          const w =
            Number(
              data.puissance
            ) || 0;

          const h =
            Number(
              data.heures
            ) || 0;

          const j =
            Number(
              data.jours
            ) || 0;

          if (
            q <= 0 ||
            w <= 0 ||
            h <= 0 ||
            j <= 0
          ) {
            return;
          }

          nombre++;

          puissance +=
            q * w;

          energie +=
            (q *
              w *
              h *
              (j / 7)) /
            1000;
        }
      );

      return {
        nombre,
        puissance,
        energie,
      };
    }, [
      appareils,
      appareilsActifs,
    ]);

  /*
   * ---------------------------------------------------------
   * SCROLL CONFIGURATION
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (
      appareilActif &&
      configurationRef.current
    ) {
      const timer =
        setTimeout(() => {
          configurationRef.current.scrollIntoView(
            {
              behavior: "smooth",
              block: "center",
            }
          );
        }, 100);

      return () =>
        clearTimeout(timer);
    }
  }, [appareilActif]);

  /*
   * ---------------------------------------------------------
   * SECTEUR
   * ---------------------------------------------------------
   */

  function changerSecteur(
    nouveau
  ) {
    setSecteur(nouveau);

    setTarifId(
      SECTEURS[
        nouveau
      ].tarifs[0]
    );

    setAppareils({});

    setAppareilActif(null);

    setResultat(null);

    setErreur("");
  }

  /*
   * ---------------------------------------------------------
   * VILLE
   * ---------------------------------------------------------
   */

  function choisirVille(nom) {
    if (
      nom ===
      "Position actuelle"
    ) {
      utiliserMaPosition();
      return;
    }

    const villeTrouvee =
      VILLES.find(
        (v) =>
          v.nom === nom
      );

    if (!villeTrouvee) {
      return;
    }

    setVille(nom);

    setLatitude(
      villeTrouvee.lat
    );

    setLongitude(
      villeTrouvee.lon
    );

    setLocalisationMessage(
      ""
    );
  }

  /*
   * ---------------------------------------------------------
   * GPS
   * ---------------------------------------------------------
   */

  function utiliserMaPosition() {
    setLocalisationMessage(
      ""
    );

    if (
      typeof navigator ===
        "undefined" ||
      !navigator.geolocation
    ) {
      setLocalisationMessage(
        "La géolocalisation n'est pas disponible."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat =
          position.coords
            .latitude;

        const lon =
          position.coords
            .longitude;

        setLatitude(lat);

        setLongitude(lon);

        setVille(
          "Position actuelle"
        );

        setLocalisationMessage(
          "✓ Position récupérée. Ces coordonnées seront utilisées par PVGIS."
        );
      },
      () => {
        setLocalisationMessage(
          "Impossible de récupérer votre position. Vérifiez l'autorisation de localisation du navigateur."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }

  /*
   * ---------------------------------------------------------
   * APPAREILS
   * ---------------------------------------------------------
   */

  function ouvrirAppareil(
    appareil
  ) {
    setErreur("");

    setAppareils(
      (ancien) => {
        const actuel =
          ancien[
            appareil.id
          ] || {};

        return {
          ...ancien,

          [appareil.id]: {
            quantite:
              actuel.quantite ??
              0,

            puissance:
              actuel.puissance ??
              appareil.puissance ??
              0,

            heures:
              actuel.heures ??
              appareil.heures ??
              0,

            jours:
              actuel.jours ??
              appareil.jours ??
              1,

            periode:
              actuel.periode ??
              appareil.periode ??
              "jour",
          },
        };
      }
    );

    setAppareilActif(
      appareil.id
    );
  }

  function modifierAppareil(
    id,
    champ,
    valeur
  ) {
    setAppareils(
      (ancien) => {
        const appareil =
          appareilsActifs.find(
            (item) =>
              item.id === id
          );

        const actuel =
          ancien[id] || {};

        return {
          ...ancien,

          [id]: {
            quantite:
              actuel.quantite ??
              0,

            puissance:
              actuel.puissance ??
              appareil?.puissance ??
              0,

            heures:
              actuel.heures ??
              appareil?.heures ??
              0,

            jours:
              actuel.jours ??
              appareil?.jours ??
              1,

            periode:
              actuel.periode ??
              appareil?.periode ??
              "jour",

            [champ]: valeur,
          },
        };
      }
    );
  }

  function valeurAppareil(
    appareil,
    champ
  ) {
    const valeur =
      appareils[
        appareil.id
      ]?.[champ];

    if (
      valeur !== undefined &&
      valeur !== null
    ) {
      return String(
        valeur
      );
    }

    if (
      appareil[champ] !==
        undefined &&
      appareil[champ] !== null
    ) {
      return String(
        appareil[champ]
      );
    }

    if (
      champ === "periode"
    ) {
      return "jour";
    }

    return "";
  }

  function appareilAjoute(
    appareil
  ) {
    return (
      Number(
        appareils[
          appareil.id
        ]?.quantite
      ) > 0
    );
  }

  function ajouterAppareil(
    appareil
  ) {
    const data =
      appareils[
        appareil.id
      ] || {};

    const q =
      Number(
        data.quantite
      ) || 0;

    const w =
      Number(
        data.puissance
      ) || 0;

    const h =
      Number(
        data.heures
      ) || 0;

    const j =
      Number(
        data.jours
      ) || 0;

    if (q <= 0) {
      setErreur(
        `Indiquez la quantité pour ${appareil.nom}.`
      );
      return;
    }

    if (w <= 0) {
      setErreur(
        `Indiquez la puissance réelle de ${appareil.nom}.`
      );
      return;
    }

    if (h <= 0 || h > 24) {
      setErreur(
        `Les heures d'utilisation de ${appareil.nom} doivent être comprises entre 0 et 24.`
      );
      return;
    }

    if (j <= 0 || j > 7) {
      setErreur(
        `Les jours d'utilisation de ${appareil.nom} doivent être compris entre 1 et 7.`
      );
      return;
    }

    setErreur("");

    setAppareils(
      (ancien) => ({
        ...ancien,

        [appareil.id]: {
          ...ancien[
            appareil.id
          ],

          quantite: q,

          puissance: w,

          heures: h,

          jours: j,

          periode:
            data.periode ||
            appareil.periode ||
            "jour",
        },
      })
    );

    setAppareilActif(
      null
    );

    setTimeout(() => {
      appareilsRef.current?.scrollIntoView(
        {
          behavior: "smooth",
          block: "start",
        }
      );
    }, 150);
  }

  function supprimerAppareil(
    id
  ) {
    setAppareils(
      (ancien) => {
        const copie = {
          ...ancien,
        };

        delete copie[id];

        return copie;
      }
    );

    setAppareilActif(null);
  }

  /*
   * ---------------------------------------------------------
   * LANCEMENT ESTIMATION
   * ---------------------------------------------------------
   */

  async function lancerEstimation() {
    setErreur("");

    setResultat(null);

    let energieJour = 0;

    let puissancePointeW = 0;

    let profilCharge = [];

    if (
      source ===
      "facture"
    ) {
      const kWh =
        Number(
          kwhFacture
        ) || 0;

      if (kWh <= 0) {
        setErreur(
          "Indiquez votre consommation mensuelle en kWh."
        );
        return;
      }

      energieJour =
        kWh / 30;

      puissancePointeW =
        Number(
          puissanceSouscrite
        ) > 0
          ? Number(
              puissanceSouscrite
            ) * 1000
          : 0;

      profilCharge =
        creerProfilFacture(
          energieJour,
          Number(
            jourShare
          ) || 45
        );
    } else {
      energieJour =
        resumeAppareils.energie;

      puissancePointeW =
        resumeAppareils.puissance;

      if (
        energieJour <= 0
      ) {
        setErreur(
          "Ajoutez au moins un appareil à votre estimation."
        );
        return;
      }

      profilCharge =
        creerProfilAppareils(
          appareilsActifs,
          appareils
        );

      const sommeProfil =
        profilCharge.reduce(
          (a, b) => a + b,
          0
        );

      if (
        sommeProfil <= 0
      ) {
        setErreur(
          "Le profil de consommation est vide."
        );
        return;
      }

      const energieJourCalculee =
        sommeProfil;

      const partJour =
        profilCharge
          .slice(8, 18)
          .reduce(
            (a, b) => a + b,
            0
          ) /
        energieJourCalculee;

      setJourShare(
        Math.round(
          partJour * 100
        )
      );
    }

    const kwhMois =
      energieJour * 30;

    const consommationAnnuelle =
      energieJour * 365;

    setChargement(true);

    try {
      /*
       * -----------------------------------------------------
       * APPEL PVGIS
       * -----------------------------------------------------
       */

      const response =
        await fetch(
          "/api/estimation-solaire",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              latitude:
                Number(
                  latitude
                ),

              longitude:
                Number(
                  longitude
                ),

              angle:
                Number(
                  angle
                ),

              aspect:
                Number(
                  aspect
                ),

              pertes:
                Number(
                  pertes
                ),
            }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data?.error ||
            "PVGIS n'a pas répondu correctement."
        );
      }

      const production1kWpAn =
        Number(
          data.annualKWhPerKWp
        ) || 0;

      const productionMensuelle =
        Array.isArray(
          data.monthlyKWhPerKWp
        )
          ? data.monthlyKWhPerKWp
          : [];

      const hourly =
        Array.isArray(
          data.hourly
        )
          ? data.hourly.map(
              (item) =>
                Number(
                  item.powerKW
                ) || 0
            )
          : [];

      if (
        production1kWpAn <= 0 ||
        hourly.length < 8500
      ) {
        throw new Error(
          "Les données PVGIS sont insuffisantes pour réaliser le dimensionnement."
        );
      }

      /*
       * -----------------------------------------------------
       * SCENARIOS
       * -----------------------------------------------------
       */

      const objectifs = [
        {
          id: "economique",

          nom: "Économie",

          couvertureCible:
            0.45,

          batterieFacteur:
            0.65,

          description:
            "Réduction importante de l'énergie achetée au réseau avec un stockage modéré.",
        },

        {
          id: "equilibre",

          nom: "Équilibre",

          couvertureCible:
            0.65,

          batterieFacteur:
            1,

          description:
            "Compromis entre production solaire, stockage et énergie restante du réseau.",
        },

        {
          id: "autonomie",

          nom: "Autonomie renforcée",

          couvertureCible:
            0.85,

          batterieFacteur:
            1.35,

          description:
            "Davantage de production et de stockage pour réduire fortement le recours au réseau.",
        },
      ];

      /*
       * -----------------------------------------------------
       * CALCUL FACTURE
       * -----------------------------------------------------
       */

      const factureModelee =
        calculerFacture(
          kwhMois,
          tarifId,
          Number(
            puissanceSouscrite
          ) || 0
        );

      /*
       * -----------------------------------------------------
       * SCENARIOS TECHNIQUES
       * -----------------------------------------------------
       */

      const scenarios =
        objectifs.map(
          (objectif) => {
            /*
             * Dimensionnement initial selon
             * la production annuelle PVGIS.
             *
             * 1.05 = petite marge de conception.
             */

            const pvCible =
              (consommationAnnuelle *
                objectif.couvertureCible *
                1.05) /
              production1kWpAn;

            let nombrePanneaux =
              Math.max(
                1,
                Math.ceil(
                  (pvCible *
                    1000) /
                    panneauW
                )
              );

            let pvKw =
              (nombrePanneaux *
                panneauW) /
              1000;

            /*
             * Batterie.
             */

            const batterieKWh =
              calculerBatterie(
                profilCharge,
                objectif.batterieFacteur
              );

            /*
             * Simulation réelle sur toutes les heures
             * PVGIS disponibles.
             */

            const simulation =
              simulerSysteme({
                pvKw,

                productionHoraire1kWp:
                  hourly,

                profilCharge,

                batterieKWh,
              });

            /*
             * Puissance d'onduleur.
             *
             * On prend :
             * - 1.25 × puissance de pointe
             * - au minimum une fraction de la puissance PV.
             */

            const puissanceChargeKW =
              puissancePointeW /
              1000;

            const onduleurBase =
              Math.max(
                puissanceChargeKW *
                  1.25,

                pvKw * 0.8
              );

            const onduleurKVA =
              onduleurBase /
              0.9;

            /*
             * Détection charges moteur.
             */

            const presenceMoteur =
              appareilsActifs.some(
                (appareil) => {
                  if (
                    !appareil.moteur
                  ) {
                    return false;
                  }

                  return (
                    Number(
                      appareils[
                        appareil.id
                      ]?.quantite
                    ) > 0
                  );
                }
              );

            /*
             * Production mensuelle.
             */

            const productionMensuelleScenario =
              productionMensuelle.map(
                (value) =>
                  Number(value) *
                  pvKw
              );

            const productionAnnuelle =
              simulation.energiePV;

            /*
             * Taux de couverture réel.
             */

            const couvertureReelle =
              simulation.couvertureCharge;

            /*
             * Taux d'autoconsommation PV.
             */

            const autoconsommation =
              simulation.tauxAutoconsommation;

            /*
             * Économie approximative.
             *
             * On utilise ici la fraction de consommation
             * effectivement couverte, pas simplement
             * la production annuelle PV.
             */

            const economie =
              factureModelee *
              Math.min(
                0.9,
                couvertureReelle /
                  100
              );

            const factureApres =
              Math.max(
                0,
                factureModelee -
                  economie
              );

            /*
             * Si l'utilisateur a donné un montant
             * réel de facture, on le garde séparément.
             */

            return {
              ...objectif,

              pvKw,

              nombrePanneaux,

              puissancePanneau:
                panneauW,

              productionAnnuelle,

              productionMensuelle:
                productionMensuelleScenario,

              batterieKwh:
                batterieKWh,

              onduleurKw:
                onduleurBase,

              onduleurKva:
                onduleurKVA,

              couvertureReelle,

              autoconsommation,

              energieDirecte:
                simulation.energieDirecte,

              energieBatterie:
                simulation.energieBatterie,

              energieReseau:
                simulation.energieReseau,

              energiePerdue:
                simulation.energiePerdue,

              factureActuelle:
                factureModelee,

              factureApres,

              economieMensuelle:
                economie,

              economieAnnuelle:
                economie * 12,

              presenceMoteur,
            };
          }
        );

      /*
       * -----------------------------------------------------
       * PROFIL 24 H POUR AFFICHAGE
       * -----------------------------------------------------
       */

      const profil24h =
        profilCharge.map(
          (value, heure) => ({
            heure,
            kWh:
              Number(value) || 0,
          })
        );

      /*
       * -----------------------------------------------------
       * RESULTAT
       * -----------------------------------------------------
       */

      setResultat({
        source,

        kwhMois,

        energieJour,

        consommationAnnuelle,

        puissanceMaxW:
          puissancePointeW,

        factureModelee,

        montantFacture:
          Number(
            montantFacture
          ) || 0,

        production1kWpAn,

        productionMensuelle,

        hourly,

        profil24h,

        scenarios,

        localisation: {
          ville,
          latitude:
            Number(latitude),
          longitude:
            Number(longitude),
        },
      });
    } catch (error) {
      console.error(error);

      setErreur(
        error?.message ||
          "Une erreur est survenue pendant l'estimation."
      );
    } finally {
      setChargement(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * WHATSAPP
   * ---------------------------------------------------------
   */

  const messageWhatsApp =
    resultat
      ? `Bonjour Solart Smart.

Je viens de réaliser une pré-estimation solaire.

Secteur : ${configSecteur.nom}

Consommation :
${formatNombre(
  resultat.kwhMois
)} kWh/mois

Moyenne :
${formatNombre(
  resultat.energieJour
)} kWh/jour

Localisation :
${ville}

Coordonnées :
${Number(
  latitude
).toFixed(6)}, ${Number(
  longitude
).toFixed(6)}

PVGIS :
${formatNombre(
  resultat.production1kWpAn
)} kWh/an/kWc

Je souhaite faire vérifier le dimensionnement et obtenir un devis précis.`
      : "";

  /*
   * ---------------------------------------------------------
   * RENDU
   * ---------------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* HEADER */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-950 text-xl font-black text-white">
              S
            </div>

            <div>
              <div className="text-lg font-black">
                <span className="text-blue-950">
                  Solart
                </span>{" "}
                <span className="text-orange-500">
                  Smart
                </span>
              </div>

              <div className="text-[11px] font-semibold text-slate-500">
                Énergie solaire
              </div>
            </div>
          </Link>

          <nav className="hidden gap-7 md:flex">
            <Link
              href="/"
              className="text-sm font-bold text-slate-600 hover:text-blue-950"
            >
              Accueil
            </Link>

            <Link
              href="/#services"
              className="text-sm font-bold text-slate-600 hover:text-blue-950"
            >
              Services
            </Link>

            <Link
              href="/#produits"
              className="text-sm font-bold text-slate-600 hover:text-blue-950"
            >
              Produits
            </Link>

            <Link
              href="/#contact"
              className="rounded-full bg-blue-950 px-5 py-2.5 text-sm font-bold text-white"
            >
              Contact
            </Link>
          </nav>

          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-green-500 px-4 py-2.5 text-sm font-black text-white"
          >
            WhatsApp
          </a>
        </div>
      </header>

      {/* HERO */}

      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800">
        <div className="mx-auto max-w-5xl px-5 py-16 text-center">

          <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-blue-100">
            Pré-dimensionnement solaire
          </div>

          <h1 className="mt-6 text-4xl font-black leading-tight text-white sm:text-6xl">
            Estimez votre installation
            <span className="block text-orange-400">
              avec vos vraies données.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-7 text-blue-100 sm:text-lg">
            Facture Senelec, appareils,
            puissance, profil de consommation,
            localisation et production PVGIS.
          </p>

          <div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">

            <div className="rounded-2xl border border-white/10 bg-white/10 p-5 text-left">
              <div className="text-2xl">
                📄
              </div>

              <div className="mt-2 font-black text-white">
                Facture
              </div>

              <div className="mt-1 text-xs text-blue-200">
                Consommation réelle
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-5 text-left">
              <div className="text-2xl">
                ⚡
              </div>

              <div className="mt-2 font-black text-white">
                Appareils
              </div>

              <div className="mt-1 text-xs text-blue-200">
                Profil détaillé
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-5 text-left">
              <div className="text-2xl">
                ☀️
              </div>

              <div className="mt-2 font-black text-white">
                PVGIS
              </div>

              <div className="mt-1 text-xs text-blue-200">
                Production horaire
              </div>
            </div>

          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10">

        {/* SECTEUR */}

        <section className="mb-8">

          <div className="mb-5">
            <div className="text-xs font-black uppercase tracking-widest text-orange-500">
              01 — Secteur
            </div>

            <h2 className="mt-2 text-3xl font-black text-blue-950">
              Quel est votre secteur ?
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">

            {Object.entries(
              SECTEURS
            ).map(
              ([id, item]) => {
                const active =
                  secteur === id;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() =>
                      changerSecteur(
                        id
                      )
                    }
                    className={`rounded-3xl border p-6 text-left transition ${
                      active
                        ? "border-orange-400 bg-orange-50 shadow-xl"
                        : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg"
                    }`}
                  >
                    <div className="text-4xl">
                      {item.icon}
                    </div>

                    <div className="mt-4 text-xl font-black text-blue-950">
                      {item.nom}
                    </div>

                    <div className="mt-1 text-sm text-slate-500">
                      {item.description}
                    </div>

                    <div className="mt-4 text-xs font-black text-orange-600">
                      {item.appareils.length} appareils disponibles
                    </div>
                  </button>
                );
              }
            )}

          </div>
        </section>

        <div className="space-y-8">

          {/* LOCALISATION */}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            <div className="text-xs font-black uppercase tracking-widest text-orange-500">
              02 — Localisation
            </div>

            <h2 className="mt-2 text-2xl font-black text-blue-950">
              Où se trouve l'installation ?
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">

              <select
                value={
                  ville || ""
                }
                onChange={(e) =>
                  choisirVille(
                    e.target.value
                  )
                }
                className="rounded-2xl border border-slate-300 bg-white p-4 font-bold outline-none focus:border-blue-700"
              >
                {VILLES.map(
                  (item) => (
                    <option
                      key={
                        item.nom
                      }
                      value={
                        item.nom
                      }
                    >
                      {item.nom}
                    </option>
                  )
                )}

                <option value="Position actuelle">
                  📍 Position actuelle
                </option>
              </select>

              <button
                type="button"
                onClick={
                  utiliserMaPosition
                }
                className="rounded-2xl bg-blue-950 px-5 py-4 font-black text-white"
              >
                📍 Utiliser ma position
              </button>

            </div>

            {localisationMessage && (
              <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm font-bold text-blue-900">
                {localisationMessage}
              </div>
            )}

            <div className="mt-5 grid gap-4 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-xs font-black uppercase text-slate-500">
                  Latitude
                </label>

                <input
                  type="number"
                  step="any"
                  value={
                    latitude ?? ""
                  }
                  onChange={(e) =>
                    setLatitude(
                      e.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-slate-300 p-4 font-bold"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase text-slate-500">
                  Longitude
                </label>

                <input
                  type="number"
                  step="any"
                  value={
                    longitude ?? ""
                  }
                  onChange={(e) =>
                    setLongitude(
                      e.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-slate-300 p-4 font-bold"
                />
              </div>

            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              PVGIS utilisera :
              <strong className="ml-1 text-blue-950">
                {Number(
                  latitude
                ).toFixed(5)}
              </strong>
              {" / "}
              <strong className="text-blue-950">
                {Number(
                  longitude
                ).toFixed(5)}
              </strong>
            </div>

          </section>

          {/* SOURCE */}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            <div className="text-xs font-black uppercase tracking-widest text-orange-500">
              03 — Consommation
            </div>

            <h2 className="mt-2 text-2xl font-black text-blue-950">
              Comment voulez-vous calculer votre consommation ?
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">

              <button
                type="button"
                onClick={() =>
                  setSource(
                    "facture"
                  )
                }
                className={`rounded-3xl border p-6 text-left ${
                  source ===
                  "facture"
                    ? "border-orange-400 bg-orange-50"
                    : "border-slate-200"
                }`}
              >
                <div className="text-3xl">
                  📄
                </div>

                <div className="mt-3 font-black text-blue-950">
                  J'ai une facture Senelec
                </div>

                <div className="mt-1 text-sm text-slate-500">
                  Utiliser les kWh mensuels
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setSource(
                    "appareils"
                  )
                }
                className={`rounded-3xl border p-6 text-left ${
                  source ===
                  "appareils"
                    ? "border-orange-400 bg-orange-50"
                    : "border-slate-200"
                }`}
              >
                <div className="text-3xl">
                  ⚡
                </div>

                <div className="mt-3 font-black text-blue-950">
                  Je connais mes appareils
                </div>

                <div className="mt-1 text-sm text-slate-500">
                  Calculer appareil par appareil
                </div>
              </button>

            </div>

            {source ===
              "facture" && (
              <div className="mt-6 space-y-5">

                <label className="block cursor-pointer rounded-3xl border-2 border-dashed border-blue-200 bg-blue-50 p-7 text-center">

                  <div className="text-4xl">
                    📸
                  </div>

                  <div className="mt-3 font-black text-blue-950">
                    Joindre la facture
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    JPG, PNG ou PDF
                  </div>

                  <input
                    type="file"
                    accept="image/*,.pdf,application/pdf"
                    className="hidden"
                    onChange={(e) =>
                      setFichierFacture(
                        e.target
                          .files?.[0] ||
                          null
                      )
                    }
                  />

                </label>

                {fichierFacture && (
                  <div className="rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-800">
                    ✓{" "}
                    {
                      fichierFacture.name
                    }
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-sm font-black">
                      Consommation mensuelle
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        kwhFacture
                      }
                      onChange={(e) =>
                        setKwhFacture(
                          e.target
                            .value
                        )
                      }
                      placeholder="Ex : 600"
                      className="w-full rounded-2xl border border-slate-300 p-4"
                    />

                    <div className="mt-1 text-xs text-slate-400">
                      kWh/mois
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-black">
                      Montant facture
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        montantFacture
                      }
                      onChange={(e) =>
                        setMontantFacture(
                          e.target
                            .value
                        )
                      }
                      placeholder="Ex : 95000"
                      className="w-full rounded-2xl border border-slate-300 p-4"
                    />

                    <div className="mt-1 text-xs text-slate-400">
                      FCFA
                    </div>
                  </div>

                </div>

                <div className="grid gap-4 md:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-sm font-black">
                      Puissance souscrite
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={
                        puissanceSouscrite
                      }
                      onChange={(e) =>
                        setPuissanceSouscrite(
                          e.target
                            .value
                        )
                      }
                      placeholder="Ex : 6"
                      className="w-full rounded-2xl border border-slate-300 p-4"
                    />

                    <div className="mt-1 text-xs text-slate-400">
                      kW
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-black">
                      Tarif Senelec
                    </label>

                    <select
                      value={
                        tarifId
                      }
                      onChange={(e) =>
                        setTarifId(
                          e.target
                            .value
                        )
                      }
                      className="w-full rounded-2xl border border-slate-300 bg-white p-4"
                    >
                      {configSecteur.tarifs.map(
                        (id) => (
                          <option
                            key={id}
                            value={id}
                          >
                            {
                              TARIFS[
                                id
                              ].nom
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>

                </div>

                <div className="rounded-3xl border border-orange-200 bg-orange-50 p-5">

                  <div className="font-black text-orange-950">
                    Profil de consommation
                  </div>

                  <div className="mt-2 text-sm text-orange-900">
                    Quelle part de votre consommation
                    se fait approximativement pendant
                    la journée ?
                  </div>

                  <div className="mt-5 flex items-center gap-5">

                    <input
                      type="range"
                      min="10"
                      max="90"
                      value={
                        jourShare
                      }
                      onChange={(e) =>
                        setJourShare(
                          Number(
                            e.target
                              .value
                          )
                        )
                      }
                      className="flex-1"
                    />

                    <div className="w-20 rounded-xl bg-orange-500 p-3 text-center font-black text-white">
                      {
                        jourShare
                      }%
                    </div>

                  </div>

                </div>

              </div>
            )}

          </section>

          {/* APPAREILS */}

          {source ===
            "appareils" && (
            <section
              ref={
                appareilsRef
              }
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
            >

              <div className="text-xs font-black uppercase tracking-widest text-orange-500">
                04 — Appareils
              </div>

              <h2 className="mt-2 text-2xl font-black text-blue-950">
                Construisez votre profil de consommation
              </h2>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-black uppercase text-slate-400">
                    Appareils
                  </div>

                  <div className="mt-1 text-2xl font-black text-blue-950">
                    {
                      resumeAppareils.nombre
                    }
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-black uppercase text-slate-400">
                    Pointe
                  </div>

                  <div className="mt-1 text-2xl font-black text-blue-950">
                    {formatNombre(
                      resumeAppareils.puissance /
                        1000,
                      2
                    )}{" "}
                    kW
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-black uppercase text-slate-400">
                    Énergie
                  </div>

                  <div className="mt-1 text-2xl font-black text-blue-950">
                    {formatNombre(
                      resumeAppareils.energie,
                      2
                    )}{" "}
                    kWh/j
                  </div>
                </div>

              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                {appareilsActifs.map(
                  (appareil) => {
                    const ajoute =
                      appareilAjoute(
                        appareil
                      );

                    return (
                      <button
                        key={
                          appareil.id
                        }
                        type="button"
                        onClick={() =>
                          ouvrirAppareil(
                            appareil
                          )
                        }
                        className={`rounded-3xl border p-5 text-left transition hover:-translate-y-1 hover:shadow-lg ${
                          ajoute
                            ? "border-green-300 bg-green-50"
                            : "border-slate-200 bg-white"
                        }`}
                      >

                        <div className="flex items-start justify-between">

                          <div className="text-3xl">
                            {
                              appareil.icon
                            }
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-[10px] font-black ${
                              ajoute
                                ? "bg-green-500 text-white"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {ajoute
                              ? "✓ Ajouté"
                              : "À configurer"}
                          </span>

                        </div>

                        <div className="mt-4 font-black text-blue-950">
                          {
                            appareil.nom
                          }
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {
                            appareil.puissance
                          }{" "}
                          W ·{" "}
                          {
                            appareil.heures
                          }{" "}
                          h/j
                        </div>

                      </button>
                    );
                  }
                )}

              </div>

              {appareilActif && (
                <div
                  ref={
                    configurationRef
                  }
                  className="mt-8 overflow-hidden rounded-3xl border-2 border-orange-200 bg-orange-50"
                >

                  {(() => {
                    const appareil =
                      appareilsActifs.find(
                        (item) =>
                          item.id ===
                          appareilActif
                      );

                    if (!appareil) {
                      return null;
                    }

                    const q =
                      valeurAppareil(
                        appareil,
                        "quantite"
                      );

                    const w =
                      valeurAppareil(
                        appareil,
                        "puissance"
                      );

                    const h =
                      valeurAppareil(
                        appareil,
                        "heures"
                      );

                    const j =
                      valeurAppareil(
                        appareil,
                        "jours"
                      );

                    const periode =
                      valeurAppareil(
                        appareil,
                        "periode"
                      );

                    const energie =
                      ((Number(q) ||
                        0) *
                        (Number(w) ||
                          0) *
                        (Number(h) ||
                          0) *
                        ((Number(j) ||
                          0) /
                          7)) /
                      1000;

                    return (
                      <>
                        <div className="flex items-center justify-between border-b border-orange-200 p-6">

                          <div>
                            <div className="text-xs font-black uppercase text-orange-600">
                              Configuration
                            </div>

                            <h3 className="mt-1 text-2xl font-black text-blue-950">
                              {
                                appareil.nom
                              }
                            </h3>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setAppareilActif(
                                null
                              )
                            }
                            className="rounded-full bg-white px-4 py-2 text-sm font-black text-slate-600"
                          >
                            Fermer
                          </button>

                        </div>

                        <div className="p-6">

                          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                            <div>
                              <label className="mb-2 block text-xs font-black uppercase text-slate-500">
                                Quantité
                              </label>

                              <input
                                type="number"
                                min="0"
                                value={
                                  q
                                }
                                onChange={(e) =>
                                  modifierAppareil(
                                    appareil.id,
                                    "quantite",
                                    e.target
                                      .value
                                  )
                                }
                                className="w-full rounded-2xl border border-slate-300 bg-white p-4 font-black"
                              />
                            </div>

                            <div>
                              <label className="mb-2 block text-xs font-black uppercase text-slate-500">
                                Puissance
                              </label>

                              <input
                                type="number"
                                min="1"
                                value={
                                  w
                                }
                                onChange={(e) =>
                                  modifierAppareil(
                                    appareil.id,
                                    "puissance",
                                    e.target
                                      .value
                                  )
                                }
                                className="w-full rounded-2xl border border-slate-300 bg-white p-4 font-black"
                              />

                              <div className="mt-1 text-xs text-slate-400">
                                W
                              </div>
                            </div>

                            <div>
                              <label className="mb-2 block text-xs font-black uppercase text-slate-500">
                                Heures / jour
                              </label>

                              <input
                                type="number"
                                min="0"
                                max="24"
                                step="0.5"
                                value={
                                  h
                                }
                                onChange={(e) =>
                                  modifierAppareil(
                                    appareil.id,
                                    "heures",
                                    e.target
                                      .value
                                  )
                                }
                                className="w-full rounded-2xl border border-slate-300 bg-white p-4 font-black"
                              />
                            </div>

                            <div>
                              <label className="mb-2 block text-xs font-black uppercase text-slate-500">
                                Jours / semaine
                              </label>

                              <input
                                type="number"
                                min="1"
                                max="7"
                                value={
                                  j
                                }
                                onChange={(e) =>
                                  modifierAppareil(
                                    appareil.id,
                                    "jours",
                                    e.target
                                      .value
                                  )
                                }
                                className="w-full rounded-2xl border border-slate-300 bg-white p-4 font-black"
                              />
                            </div>

                          </div>

                          <div className="mt-5">

                            <label className="mb-2 block text-xs font-black uppercase text-slate-500">
                              Période d'utilisation
                            </label>

                            <select
                              value={
                                periode ||
                                "jour"
                              }
                              onChange={(e) =>
                                modifierAppareil(
                                  appareil.id,
                                  "periode",
                                  e.target
                                    .value
                                )
                              }
                              className="w-full rounded-2xl border border-slate-300 bg-white p-4 font-bold"
                            >
                              <option value="jour">
                                ☀️ Principalement le jour
                              </option>

                              <option value="soir">
                                🌙 Principalement le soir
                              </option>

                              <option value="mixte">
                                ☀️🌙 Jour + soir/nuit
                              </option>
                            </select>

                          </div>

                          <div className="mt-6 grid gap-4 sm:grid-cols-3">

                            <div className="rounded-2xl bg-blue-950 p-5 text-white">
                              <div className="text-xs font-bold text-blue-300">
                                Puissance
                              </div>

                              <div className="mt-2 text-2xl font-black">
                                {formatNombre(
                                  ((Number(q) ||
                                    0) *
                                    (Number(w) ||
                                      0)) /
                                    1000,
                                  2
                                )}{" "}
                                kW
                              </div>
                            </div>

                            <div className="rounded-2xl bg-orange-500 p-5 text-white">
                              <div className="text-xs font-bold text-orange-100">
                                Énergie
                              </div>

                              <div className="mt-2 text-2xl font-black">
                                {formatNombre(
                                  energie,
                                  2
                                )}{" "}
                                kWh/j
                              </div>
                            </div>

                            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                              <div className="text-xs font-bold text-slate-400">
                                Mensuel
                              </div>

                              <div className="mt-2 text-2xl font-black text-blue-950">
                                {formatNombre(
                                  energie *
                                    30,
                                  1
                                )}{" "}
                                kWh
                              </div>
                            </div>

                          </div>

                          <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                            <button
                              type="button"
                              onClick={() =>
                                ajouterAppareil(
                                  appareil
                                )
                              }
                              className="flex-1 rounded-2xl bg-orange-500 px-6 py-4 font-black text-white"
                            >
                              ✓ Ajouter à mon estimation
                            </button>

                            {appareilAjoute(
                              appareil
                            ) && (
                              <button
                                type="button"
                                onClick={() =>
                                  supprimerAppareil(
                                    appareil.id
                                  )
                                }
                                className="rounded-2xl border border-red-200 bg-white px-6 py-4 font-black text-red-600"
                              >
                                Retirer
                              </button>
                            )}

                          </div>

                        </div>
                      </>
                    );
                  })()}

                </div>
              )}

            </section>
          )}

          {/* CONFIGURATION SOLAIRE */}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            <div className="text-xs font-black uppercase tracking-widest text-orange-500">
              05 — Configuration solaire
            </div>

            <h2 className="mt-2 text-2xl font-black text-blue-950">
              Paramètres photovoltaïques
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              <div className="rounded-3xl bg-slate-50 p-5">

                <label className="text-xs font-black uppercase text-slate-500">
                  Panneau
                </label>

                <div className="mt-3 grid grid-cols-3 gap-2">

                  {PANNEAUX.map(
                    (w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() =>
                          setPanneauW(
                            w
                          )
                        }
                        className={`rounded-xl p-3 text-sm font-black ${
                          panneauW ===
                          w
                            ? "bg-orange-500 text-white"
                            : "bg-white text-blue-950 ring-1 ring-slate-200"
                        }`}
                      >
                        {w}W
                      </button>
                    )
                  )}

                </div>

              </div>

              <div className="rounded-3xl bg-slate-50 p-5">

                <label className="text-xs font-black uppercase text-slate-500">
                  Inclinaison
                </label>

                <input
                  type="number"
                  min="0"
                  max="90"
                  value={
                    angle
                  }
                  onChange={(e) =>
                    setAngle(
                      e.target
                        .value
                    )
                  }
                  className="mt-3 w-full rounded-2xl border border-slate-300 bg-white p-4 font-black"
                />

                <div className="mt-2 text-xs text-slate-400">
                  0° à 90°
                </div>

              </div>

              <div className="rounded-3xl bg-slate-50 p-5">

                <label className="text-xs font-black uppercase text-slate-500">
                  Orientation
                </label>

                <select
                  value={
                    aspect
                  }
                  onChange={(e) =>
                    setAspect(
                      e.target
                        .value
                    )
                  }
                  className="mt-3 w-full rounded-2xl border border-slate-300 bg-white p-4 font-black"
                >
                  <option value="-90">
                    Est
                  </option>

                  <option value="0">
                    Sud
                  </option>

                  <option value="90">
                    Ouest
                  </option>
                </select>

                <div className="mt-2 text-xs text-slate-400">
                  PVGIS : 0° = Sud
                </div>

              </div>

            </div>

            <div className="mt-4 rounded-3xl bg-slate-50 p-5">

              <label className="text-xs font-black uppercase text-slate-500">
                Pertes système
              </label>

              <div className="mt-3 flex items-center gap-4">

                <input
                  type="range"
                  min="0"
                  max="30"
                  value={
                    pertes
                  }
                  onChange={(e) =>
                    setPertes(
                      e.target
                        .value
                    )
                  }
                  className="flex-1"
                />

                <div className="w-20 rounded-xl bg-blue-950 p-3 text-center font-black text-white">
                  {pertes}%
                </div>

              </div>

              <div className="mt-2 text-xs text-slate-400">
                Câbles, température, conversion,
                poussière et autres pertes globales.
              </div>

            </div>

          </section>

          {/* ERREUR */}

          {erreur && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-5 font-bold text-red-800">
              ⚠️ {erreur}
            </div>
          )}

          {/* BOUTON */}

          <button
            type="button"
            disabled={
              chargement
            }
            onClick={
              lancerEstimation
            }
            className="w-full rounded-3xl bg-orange-500 px-6 py-6 text-lg font-black text-white shadow-xl shadow-orange-200 hover:bg-orange-600 disabled:opacity-60"
          >
            {chargement
              ? "☀️ Analyse PVGIS en cours..."
              : "Calculer mon estimation complète →"}
          </button>

          {/* RESULTATS */}

          {resultat && (
            <section className="space-y-6">

              {/* RESUME */}

              <div className="rounded-3xl bg-blue-950 p-7 text-white shadow-xl">

                <div className="text-xs font-black uppercase tracking-widest text-blue-300">
                  Résultat
                </div>

                <h2 className="mt-2 text-3xl font-black">
                  Votre profil énergétique
                </h2>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                  <div className="rounded-2xl bg-white/10 p-5">
                    <div className="text-xs text-blue-300">
                      Consommation
                    </div>

                    <div className="mt-2 text-2xl font-black">
                      {formatNombre(
                        resultat.kwhMois
                      )}{" "}
                      kWh/mois
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-5">
                    <div className="text-xs text-blue-300">
                      Moyenne
                    </div>

                    <div className="mt-2 text-2xl font-black">
                      {formatNombre(
                        resultat.energieJour
                      )}{" "}
                      kWh/j
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-5">
                    <div className="text-xs text-blue-300">
                      Pointe
                    </div>

                    <div className="mt-2 text-2xl font-black">
                      {formatNombre(
                        resultat.puissanceMaxW /
                          1000,
                        2
                      )}{" "}
                      kW
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-5">
                    <div className="text-xs text-blue-300">
                      Facture modélisée
                    </div>

                    <div className="mt-2 text-xl font-black">
                      {formatFCFA(
                        resultat.factureModelee
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* PVGIS */}

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="text-xs font-black uppercase tracking-widest text-orange-500">
                  PVGIS
                </div>

                <h3 className="mt-2 text-2xl font-black text-blue-950">
                  Production solaire du site
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Production spécifique estimée :
                  <strong className="ml-1 text-blue-950">
                    {formatNombre(
                      resultat.production1kWpAn
                    )}{" "}
                    kWh/an/kWc
                  </strong>
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">

                  {resultat.productionMensuelle.map(
                    (
                      value,
                      index
                    ) => {
                      const max =
                        Math.max(
                          ...resultat.productionMensuelle,
                          1
                        );

                      return (
                        <div
                          key={
                            MOIS[
                              index
                            ]
                          }
                          className="rounded-2xl bg-slate-50 p-4"
                        >

                          <div className="text-xs font-black text-slate-400">
                            {
                              MOIS[
                                index
                              ]
                            }
                          </div>

                          <div className="mt-2 font-black text-blue-950">
                            {formatNombre(
                              value
                            )}{" "}
                            kWh/kWc
                          </div>

                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">

                            <div
                              className="h-full rounded-full bg-orange-500"
                              style={{
                                width:
                                  `${
                                    (value /
                                      max) *
                                    100
                                  }%`,
                              }}
                            />

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              </section>

              {/* PROFIL */}

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="text-xs font-black uppercase tracking-widest text-orange-500">
                  Profil de charge
                </div>

                <h3 className="mt-2 text-2xl font-black text-blue-950">
                  Consommation moyenne par heure
                </h3>

                <div className="mt-6 grid grid-cols-6 gap-2 sm:grid-cols-12">

                  {resultat.profil24h.map(
                    (item) => {
                      const max =
                        Math.max(
                          ...resultat.profil24h.map(
                            (
                              x
                            ) =>
                              x.kWh
                          ),
                          0.01
                        );

                      return (
                        <div
                          key={
                            item.heure
                          }
                          className="text-center"
                        >

                          <div className="flex h-32 items-end justify-center">

                            <div
                              className="w-full max-w-5 rounded-t-lg bg-blue-950"
                              style={{
                                height:
                                  `${Math.max(
                                    3,
                                    (item.kWh /
                                      max) *
                                      100
                                  )}%`,
                              }}
                            />

                          </div>

                          <div className="mt-2 text-[9px] font-black text-slate-400">
                            {String(
                              item.heure
                            ).padStart(
                              2,
                              "0"
                            )}
                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              </section>

              {/* SCENARIOS */}

              <section>

                <div className="mb-5">

                  <div className="text-xs font-black uppercase tracking-widest text-orange-500">
                    Dimensionnement
                  </div>

                  <h3 className="mt-2 text-2xl font-black text-blue-950">
                    Trois scénarios à comparer
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Le calcul utilise maintenant la
                    production PVGIS horaire et simule
                    directement la consommation, la
                    batterie et l'énergie restante du réseau.
                  </p>

                </div>

                <div className="grid gap-5 lg:grid-cols-3">

                  {resultat.scenarios.map(
                    (
                      scenario
                    ) => (
                      <article
                        key={
                          scenario.id
                        }
                        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                      >

                        <div className="bg-blue-950 p-6 text-white">

                          <h4 className="text-xl font-black">
                            {
                              scenario.nom
                            }
                          </h4>

                          <p className="mt-2 text-sm leading-6 text-blue-200">
                            {
                              scenario.description
                            }
                          </p>

                        </div>

                        <div className="space-y-3 p-6">

                          <div className="flex justify-between rounded-2xl bg-slate-50 p-4">
                            <span>
                              PV
                            </span>

                            <strong>
                              {formatNombre(
                                scenario.pvKw,
                                2
                              )}{" "}
                              kWc
                            </strong>
                          </div>

                          <div className="flex justify-between rounded-2xl bg-slate-50 p-4">
                            <span>
                              Panneaux
                            </span>

                            <strong>
                              {
                                scenario.nombrePanneaux
                              }{" "}
                              ×{" "}
                              {
                                scenario.puissancePanneau
                              }{" "}
                              W
                            </strong>
                          </div>

                          <div className="flex justify-between rounded-2xl bg-slate-50 p-4">
                            <span>
                              Batterie
                            </span>

                            <strong>
                              {formatNombre(
                                scenario.batterieKwh
                              )}{" "}
                              kWh
                            </strong>
                          </div>

                          <div className="flex justify-between rounded-2xl bg-slate-50 p-4">
                            <span>
                              Onduleur
                            </span>

                            <strong>
                              {formatNombre(
                                scenario.onduleurKw
                              )}{" "}
                              kW
                            </strong>
                          </div>

                          <div className="flex justify-between rounded-2xl bg-slate-50 p-4">
                            <span>
                              Onduleur
                            </span>

                            <strong>
                              {formatNombre(
                                scenario.onduleurKva
                              )}{" "}
                              kVA
                            </strong>
                          </div>

                          <div className="rounded-2xl bg-blue-50 p-4">

                            <div className="text-xs font-black uppercase text-blue-600">
                              Couverture simulée
                            </div>

                            <div className="mt-1 text-2xl font-black text-blue-950">
                              {formatNombre(
                                scenario.couvertureReelle
                              )}%
                            </div>

                          </div>

                          <div className="rounded-2xl bg-green-50 p-4">

                            <div className="text-xs font-black uppercase text-green-700">
                              Énergie encore achetée
                            </div>

                            <div className="mt-1 text-xl font-black text-green-800">
                              {formatNombre(
                                scenario.energieReseau
                              )}{" "}
                              kWh/an
                            </div>

                          </div>

                          <div className="rounded-2xl bg-orange-50 p-4">

                            <div className="text-xs font-black uppercase text-orange-700">
                              Économie théorique
                            </div>

                            <div className="mt-1 text-xl font-black text-orange-800">
                              {formatFCFA(
                                scenario.economieMensuelle
                              )}
                              /mois
                            </div>

                          </div>

                          {scenario.presenceMoteur && (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-bold leading-5 text-amber-900">
                              ⚠️ Présence d'un moteur,
                              d'une pompe ou d'un
                              compresseur : les courants
                              de démarrage doivent être
                              vérifiés avant de choisir
                              l'onduleur définitif.
                            </div>
                          )}

                        </div>

                      </article>
                    )
                  )}

                </div>

              </section>

              {/* FACTURE */}

              {resultat.montantFacture >
                0 && (
                <section className="rounded-3xl border border-blue-200 bg-blue-50 p-6">

                  <div className="text-xl font-black text-blue-950">
                    Vérification de votre facture
                  </div>

                  <div className="mt-3 text-sm text-blue-800">
                    Montant déclaré :
                    <strong className="ml-1">
                      {formatFCFA(
                        resultat.montantFacture
                      )}
                    </strong>
                  </div>

                  <div className="mt-1 text-sm text-blue-800">
                    Modèle selon la consommation et
                    le tarif :
                    <strong className="ml-1">
                      {formatFCFA(
                        resultat.factureModelee
                      )}
                    </strong>
                  </div>

                  <div className="mt-3 text-xs leading-5 text-blue-700">
                    Le montant réel peut différer en
                    fonction des éléments présents sur
                    la facture. La consommation en kWh
                    reste la donnée principale utilisée
                    pour le dimensionnement énergétique.
                  </div>

                </section>
              )}

              {/* AVERTISSEMENT */}

              <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6">

                <div className="text-xl font-black text-amber-950">
                  ⚠️ Pré-dimensionnement technique
                </div>

                <p className="mt-3 text-sm leading-7 text-amber-900">
                  Cette estimation est beaucoup plus
                  proche d'une étude énergétique que
                  l'ancien calcul annuel, mais elle ne
                  remplace toujours pas une étude
                  d'exécution. Pour un projet définitif,
                  il faut vérifier notamment les
                  caractéristiques exactes des panneaux,
                  batteries et onduleurs, les sections de
                  câbles, protections DC/AC, courant de
                  court-circuit, tension MPPT, puissance
                  de démarrage des moteurs, monophasé ou
                  triphasé, structure et conditions
                  réelles du site.
                </p>

              </section>

              {/* WHATSAPP */}

              <div className="flex flex-col gap-3 sm:flex-row">

                <a
                  href={`${WHATSAPP}?text=${encodeURIComponent(
                    messageWhatsApp
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-2xl bg-green-500 px-6 py-4 text-center font-black text-white"
                >
                  Demander une vérification WhatsApp
                </a>

                <Link
                  href="/#produits"
                  className="flex-1 rounded-2xl bg-blue-950 px-6 py-4 text-center font-black text-white"
                >
                  Voir les kits Solart Smart
                </Link>

              </div>

            </section>
          )}

        </div>
      </section>

      {/* FOOTER */}

      <footer className="bg-slate-950 px-5 py-12 text-center text-sm text-slate-400">

        <div className="text-xl font-black text-white">
          Solart{" "}
          <span className="text-orange-500">
            Smart
          </span>
        </div>

        <div className="mt-2">
          Énergie solaire
        </div>

        <div className="mt-5">
          Pikine Icotaf 3, Tally Mbaye Gakou en Face Sandika
        </div>

        <div className="mt-2">
          +221 78 593 25 25
        </div>

        <div className="mt-1">
          galsenenergy221@gmail.com
        </div>

      </footer>

    </main>
  );
}