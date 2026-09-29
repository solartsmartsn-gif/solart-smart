import { NextResponse } from "next/server";

const PVGIS_BASE =
  "https://re.jrc.ec.europa.eu/api/v5_3";

function nombre(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

async function recupererJson(url) {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 30000);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
      signal: controller.signal,
    });

    const texte = await response.text();

    if (!response.ok) {
      throw new Error(
        `PVGIS HTTP ${response.status}: ${texte.slice(
          0,
          800
        )}`
      );
    }

    let data;

    try {
      data = JSON.parse(texte);
    } catch {
      throw new Error(
        "PVGIS a retourné une réponse qui n'est pas du JSON."
      );
    }

    return data;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const latitude = nombre(body.latitude, NaN);
    const longitude = nombre(body.longitude, NaN);

    const angle = nombre(body.angle, 15);
    const aspect = nombre(body.aspect, 0);
    const pertes = nombre(body.pertes, 14);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Latitude ou longitude invalide.",
        },
        { status: 400 }
      );
    }

    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Les coordonnées géographiques sont invalides.",
        },
        { status: 400 }
      );
    }

    if (angle < 0 || angle > 90) {
      return NextResponse.json(
        {
          success: false,
          error:
            "L'inclinaison doit être comprise entre 0° et 90°.",
        },
        { status: 400 }
      );
    }

    if (aspect < -180 || aspect > 180) {
      return NextResponse.json(
        {
          success: false,
          error:
            "L'orientation doit être comprise entre -180° et 180°.",
        },
        { status: 400 }
      );
    }

    if (pertes < 0 || pertes >= 100) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Les pertes doivent être comprises entre 0 % et moins de 100 %.",
        },
        { status: 400 }
      );
    }

    /*
     * ---------------------------------------------------------
     * 1. PVGIS PVcalc
     * ---------------------------------------------------------
     *
     * Cette requête donne :
     * - production annuelle
     * - production mensuelle
     * - production journalière moyenne
     *
     * pour une installation de référence de 1 kWc.
     */

    const paramsPV = new URLSearchParams({
      lat: String(latitude),
      lon: String(longitude),

      peakpower: "1",

      loss: String(pertes),

      fixed: "1",

      angle: String(angle),

      aspect: String(aspect),

      optimalinclination: "0",

      optimalangles: "0",

      pvtechchoice: "crystSi",

      mountingplace: "building",

      raddatabase: "PVGIS-SARAH3",

      outputformat: "json",
    });

    /*
     * ---------------------------------------------------------
     * 2. PVGIS seriescalc
     * ---------------------------------------------------------
     *
     * On récupère une année complète heure par heure.
     *
     * 2023 est la dernière année complète disponible
     * dans SARAH-3 selon les données PVGIS 5.3.
     *
     * localtime=1 :
     * on demande les heures locales afin de pouvoir comparer
     * directement la production solaire avec le profil
     * de consommation du client.
     */

    const paramsHourly = new URLSearchParams({
      lat: String(latitude),
      lon: String(longitude),

      startyear: "2023",

      endyear: "2023",

      pvcalculation: "1",

      peakpower: "1",

      loss: String(pertes),

      pvtechchoice: "crystSi",

      mountingplace: "building",

      angle: String(angle),

      aspect: String(aspect),

      optimalinclination: "0",

      optimalangles: "0",

      trackingtype: "0",

      raddatabase: "PVGIS-SARAH3",

      localtime: "1",

      outputformat: "json",
    });

    const urlPV =
      `${PVGIS_BASE}/PVcalc?${paramsPV.toString()}`;

    const urlHourly =
      `${PVGIS_BASE}/seriescalc?${paramsHourly.toString()}`;

    /*
     * Les deux requêtes peuvent être exécutées en parallèle.
     */
    const [dataPV, dataHourly] =
      await Promise.all([
        recupererJson(urlPV),
        recupererJson(urlHourly),
      ]);

    /*
     * ---------------------------------------------------------
     * Vérification PVcalc
     * ---------------------------------------------------------
     */

    const fixedMonthly =
      dataPV?.outputs?.monthly?.fixed;

    const fixedTotals =
      dataPV?.outputs?.totals?.fixed;

    if (
      !Array.isArray(fixedMonthly) ||
      fixedMonthly.length !== 12
    ) {
      console.error(
        "PVGIS monthly.fixed invalide:",
        dataPV
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "PVGIS n'a pas retourné les 12 mois de production.",
        },
        { status: 502 }
      );
    }

    if (!fixedTotals) {
      console.error(
        "PVGIS totals.fixed absent:",
        dataPV
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "PVGIS n'a pas retourné les totaux de production.",
        },
        { status: 502 }
      );
    }

    const annualKWhPerKWp =
      nombre(fixedTotals.E_y, 0);

    if (
      !Number.isFinite(annualKWhPerKWp) ||
      annualKWhPerKWp <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "La production annuelle PVGIS est invalide.",
        },
        { status: 502 }
      );
    }

    const monthlyKWhPerKWp =
      fixedMonthly.map((item) =>
        nombre(item?.E_m, 0)
      );

    const monthlyDailyKWhPerKWp =
      fixedMonthly.map((item) =>
        nombre(item?.E_d, 0)
      );

    const monthlyVariationKWh =
      fixedMonthly.map((item) =>
        nombre(item?.SD_m, 0)
      );

    const dailyAverageKWhPerKWp =
      annualKWhPerKWp / 365;

    /*
     * ---------------------------------------------------------
     * Vérification données horaires
     * ---------------------------------------------------------
     */

    const hourlyRaw =
      dataHourly?.outputs?.hourly;

    if (!Array.isArray(hourlyRaw)) {
      console.error(
        "PVGIS hourly absent:",
        dataHourly
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "PVGIS n'a pas retourné les données horaires nécessaires au calcul.",
        },
        { status: 502 }
      );
    }

    /*
     * PVGIS peut retourner plusieurs champs.
     *
     * Nous gardons uniquement :
     * - time
     * - P
     *
     * P = puissance PV horaire pour 1 kWc.
     *
     * On convertit en kW.
     */

    const hourly = hourlyRaw
      .map((item) => {
        const puissanceW =
          nombre(item?.P, 0);

        return {
          time: item?.time || "",
          powerKW: puissanceW / 1000,
        };
      })
      .filter(
        (item) =>
          item.time &&
          Number.isFinite(item.powerKW)
      );

    /*
     * Une année normale doit contenir environ
     * 8760 heures.
     *
     * On accepte une petite variation pour éviter
     * de bloquer inutilement l'application si PVGIS
     * modifie légèrement son format.
     */

    if (hourly.length < 8500) {
      console.error(
        "PVGIS hourly trop court:",
        hourly.length
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Les données horaires PVGIS sont incomplètes.",
          heuresRecues: hourly.length,
        },
        { status: 502 }
      );
    }

    /*
     * Vérification de cohérence.
     *
     * La somme des données horaires devrait être
     * proche de la production annuelle PVcalc.
     *
     * Il peut exister une petite différence de méthode
     * ou d'arrondi.
     */

    const sommeHoraire =
      hourly.reduce(
        (total, item) =>
          total + item.powerKW,
        0
      );

    return NextResponse.json({
      success: true,

      source: "PVGIS 5.3",

      database:
        dataPV?.inputs?.meteo_data?.radiation_db ||
        "PVGIS-SARAH3",

      location: {
        latitude,
        longitude,
      },

      system: {
        peakpower: 1,
        losses: pertes,
        angle,
        aspect,
        technology: "crystSi",
        mountingplace: "building",
      },

      annualKWhPerKWp,

      dailyAverageKWhPerKWp,

      monthlyKWhPerKWp,

      monthlyDailyKWhPerKWp,

      monthlyVariationKWh,

      /*
       * Production horaire d'un système de 1 kWc.
       * Chaque valeur est en kWh sur l'heure.
       *
       * Comme la période est d'une heure :
       * kW × 1 h = kWh.
       */
      hourly,

      /*
       * Information de contrôle.
       */
      hourlyAnnualKWhPerKWp:
        sommeHoraire,

      totals: fixedTotals,

      monthly: fixedMonthly,

      hourlyCount: hourly.length,
    });
  } catch (error) {
    console.error(
      "ERREUR API ESTIMATION SOLAIRE:",
      error
    );

    const message =
      error?.name === "AbortError"
        ? "PVGIS met trop de temps à répondre. Réessayez dans quelques secondes."
        : error?.message ||
          "Erreur interne pendant le calcul solaire.";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}