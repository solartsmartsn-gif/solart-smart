import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Link,
} from "@react-pdf/renderer";

// Logo principal du site.
// Ce chemin correspond à : public/logo.png
import logoFile from "../../public/logo.png";

/* =========================================================
   COULEURS
========================================================= */

const COLORS = {
  primary: "#1e3a8a",
  primaryDark: "#172554",
  orange: "#f97316",
  orangeLight: "#fff7ed",

  dark: "#1f2937",
  gray: "#6b7280",
  grayLight: "#f8fafc",
  lightGray: "#f1f5f9",

  border: "#cbd5e1",
  borderDark: "#94a3b8",

  white: "#ffffff",

  green: "#166534",
  greenBg: "#dcfce7",

  red: "#991b1b",
  redBg: "#fee2e2",

  blueBg: "#dbeafe",
};

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 80,
    paddingHorizontal: 36,
    fontSize: 8.5,
    fontFamily: "Helvetica",
    color: COLORS.dark,
    backgroundColor: COLORS.white,
  },

  /* =======================================================
     HEADER
  ======================================================= */

  header: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingBottom: 10,
    marginBottom: 12,
  },

  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  logo: {
    width: 92,
    height: 52,
    marginRight: 12,
    objectFit: "contain",
  },

  logoPlaceholder: {
    width: 48,
    height: 48,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.lightGray,
  },

  companyName: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 2,
  },

  companyLegal: {
    fontSize: 7.5,
    color: COLORS.gray,
  },

  companyLine: {
    fontSize: 7.5,
    color: COLORS.dark,
    lineHeight: 1.45,
  },

  contactLine: {
    marginTop: 6,
    fontSize: 7.5,
    color: COLORS.gray,
  },

  /* =======================================================
     TITRE
  ======================================================= */

  titleBox: {
    alignItems: "center",
    marginTop: 14,
    marginBottom: 14,
  },

  titleBadge: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },

  titleText: {
    fontSize: 13,
    fontWeight: "bold",
    color: COLORS.white,
  },

  /* =======================================================
     CLIENT
  ======================================================= */

  infoBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    padding: 9,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 5,
    backgroundColor: COLORS.grayLight,
  },

  infoColumn: {
    width: "48%",
  },

  infoLeft: {
    fontSize: 8.5,
    lineHeight: 1.5,
  },

  infoRight: {
    fontSize: 8.5,
    textAlign: "right",
    lineHeight: 1.5,
  },

  bold: {
    fontWeight: "bold",
  },

  /* =======================================================
     TABLEAU
  ======================================================= */

  table: {
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    borderRadius: 3,
    overflow: "hidden",
  },

  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
  },

  tableHeaderCell: {
    fontSize: 7.2,
    fontWeight: "bold",
    color: COLORS.white,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRightWidth: 1,
    borderRightColor: "#ffffff",
  },

  rowAlt: {
    flexDirection: "row",
    backgroundColor: COLORS.orangeLight,
  },

  rowNormal: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
  },

  cell: {
    fontSize: 7.5,
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderRightColor: COLORS.border,
    borderBottomColor: COLORS.border,
  },

  colDesignation: {
    width: "48%",
  },

  colQte: {
    width: "10%",
    textAlign: "center",
  },

  colPU: {
    width: "20%",
    textAlign: "right",
  },

  colMontant: {
    width: "22%",
    textAlign: "right",
  },

  /* =======================================================
     NOM DU KIT
  ======================================================= */

  kitNameRow: {
    flexDirection: "row",
    backgroundColor: "#dbeafe",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  kitNameCell: {
    width: "100%",
    paddingVertical: 7,
    paddingHorizontal: 7,
    fontSize: 9,
    fontWeight: "bold",
    color: COLORS.primary,
  },

  /* =======================================================
     TOTAL
  ======================================================= */

  totalsBox: {
    marginLeft: "60%",
    width: "40%",
  },

  totalRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: COLORS.border,
  },

  totalLabelCell: {
    width: "50%",
    paddingVertical: 7,
    paddingHorizontal: 7,
    fontSize: 8.5,
    fontWeight: "bold",
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },

  totalValueCell: {
    width: "50%",
    paddingVertical: 7,
    paddingHorizontal: 7,
    fontSize: 8.5,
    textAlign: "right",
  },

  netRow: {
    backgroundColor: COLORS.orange,
    borderColor: COLORS.orange,
  },

  netLabel: {
    color: COLORS.white,
    fontWeight: "bold",
  },

  netValue: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 9,
  },

  arrete: {
    marginTop: 9,
    fontSize: 7.8,
    textAlign: "center",
    lineHeight: 1.4,
  },

  /* =======================================================
     AVANTAGES
  ======================================================= */

  ecoTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.primary,
    marginTop: 18,
    marginBottom: 7,
  },

  ecoRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    overflow: "hidden",
  },

  ecoCol: {
    flex: 1,
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },

  ecoColLast: {
    flex: 1,
    padding: 8,
  },

  ecoHeader: {
    fontSize: 7,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
    color: COLORS.dark,
  },

  ecoValue: {
    fontSize: 11.5,
    fontWeight: "bold",
    textAlign: "center",
    color: COLORS.primary,
  },

  ecoSub: {
    fontSize: 6.7,
    textAlign: "center",
    marginTop: 3,
    color: COLORS.gray,
    lineHeight: 1.3,
  },

  /* =======================================================
     PAGE 2
  ======================================================= */

  condTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 10,
  },

  condTable: {
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    borderRadius: 4,
    overflow: "hidden",
  },

  condRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  condRowFirst: {
    flexDirection: "row",
  },

  condLabel: {
    width: "22%",
    padding: 7,
    fontSize: 8,
    fontWeight: "bold",
    color: COLORS.primary,
    backgroundColor: COLORS.grayLight,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },

  condValue: {
    width: "78%",
    padding: 7,
    fontSize: 7.7,
    lineHeight: 1.5,
  },

  noteBox: {
    marginTop: 10,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.orange,
    backgroundColor: COLORS.orangeLight,
  },

  note: {
    fontSize: 6.8,
    lineHeight: 1.45,
    color: COLORS.dark,
  },

  twoCol: {
    flexDirection: "row",
    marginTop: 12,
  },

  colBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    padding: 8,
    marginRight: 6,
    backgroundColor: COLORS.grayLight,
  },

  colBoxLast: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    padding: 8,
    backgroundColor: COLORS.grayLight,
  },

  colTitle: {
    fontWeight: "bold",
    fontSize: 8.5,
    color: COLORS.primary,
    marginBottom: 5,
  },

  colText: {
    fontSize: 7.3,
    lineHeight: 1.45,
  },

  signBox: {
    marginTop: 28,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  signColumn: {
    width: "42%",
  },

  signCell: {
    fontSize: 9,
    fontWeight: "bold",
    color: COLORS.primary,
  },

  signLine: {
    marginTop: 35,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDark,
  },

  /* =======================================================
     PIED DE PAGE
  ======================================================= */

  footer: {
    position: "absolute",
    bottom: 10,
    left: 36,
    right: 36,
    paddingTop: 7,
    borderTopWidth: 2,
    borderTopColor: "#000000",
  },

  footerRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
    flexWrap: "wrap",
  },

  footerText: {
    fontSize: 7.3,
    lineHeight: 1.25,
    color: COLORS.dark,
    textAlign: "center",
  },

  footerEmail: {
    fontSize: 8,
    lineHeight: 1.25,
    color: COLORS.dark,
    textAlign: "center",
  },

  footerBold: {
    fontWeight: "bold",
    color: COLORS.dark,
  },

  footerSeparator: {
    fontSize: 7.3,
    color: COLORS.gray,
    marginHorizontal: 4,
  },
});

/* =========================================================
   LOGO
========================================================= */

const LOGO_SRC =
  typeof logoFile === "string"
    ? logoFile
    : logoFile?.src || "/logo.png";

/* =========================================================
   ENTREPRISE
========================================================= */

const COMPANY = {
  nom: "Solart Smart",

  legal:
    "Solart Smart — Energie Solaire Avenir Durable",

  adresse:
    "Pikine Icotaf 3, Tally Mbaye Gakou, en face marché Sandika",

  tel:
    "+221 78 711 07 07",

  email:
    "solartsmart.sn@gmail.com",

  rc:
    "RC SN.DKR.2018.A.30070",

  ninea:
    "N.I.N.E.A 007098925",

  banque:
    "CORIS BANK — Code banque : SN213 — Code guichet : 01008",

  compte:
    "001964824301",

  rib:
    "56",

  iban:
    "SN21 3010 0800 1964 8243 0156",

  swift:
    "CORISNDA",

  wave:
    "https://pay.wave.com/m/M_ES4izrqZb1EQ/c/sn/",

  chequeAuNom:
    "Aly SOUMARE",
};

/* =========================================================
   SENELEC
========================================================= */

const SENELEC = {
  tranche1: {
    max: 150,
    tarif: 82,
  },

  tranche2: {
    max: 250,
    tarif: 136.49,
  },

  tarifTranche3: 159.36,

  redevanceMensuelle: 1155,
};

function calculerFactureSenelec(kwhMois) {
  if (kwhMois <= 0) {
    return 0;
  }

  const t1 =
    Math.min(
      kwhMois,
      SENELEC.tranche1.max
    ) *
    SENELEC.tranche1.tarif;

  const kwhT2 = Math.max(
    0,
    Math.min(
      kwhMois,
      SENELEC.tranche2.max
    ) -
      SENELEC.tranche1.max
  );

  const t2 =
    kwhT2 *
    SENELEC.tranche2.tarif;

  const kwhT3 = Math.max(
    0,
    kwhMois -
      SENELEC.tranche2.max
  );

  const t3 =
    kwhT3 *
    SENELEC.tarifTranche3;

  return (
    t1 +
    t2 +
    t3 +
    SENELEC.redevanceMensuelle
  );
}

/* =========================================================
   OUTILS
========================================================= */

function number(value) {
  const n = Number(value);

  return Number.isFinite(n)
    ? n
    : 0;
}

function formatNumber(value) {
  const n = Math.round(
    number(value)
  );

  return Math.abs(n)
    .toString()
    .replace(
      /\B(?=(\d{3})+(?!\d))/g,
      " "
    );
}

function formatFCFA(value) {
  return `${formatNumber(value)} FCFA`;
}

/* =========================================================
   RÉCUPÉRER LES COMPOSANTS DU KIT
========================================================= */

function recupererComposants(kit) {
  if (
    Array.isArray(kit.composants)
  ) {
    return kit.composants;
  }

  if (
    Array.isArray(kit.components)
  ) {
    return kit.components;
  }

  if (
    Array.isArray(kit.items)
  ) {
    return kit.items;
  }

  return [];
}

/* =========================================================
   DOCUMENT
========================================================= */

export default function DevisDocument({
  numeroDevis,
  date,
  nom,
  telephone,
  produits = [],
  logoBase64,
}) {
  const logoSrc = logoBase64 || LOGO_SRC;

  const lignes = [];

  produits.forEach((kit) => {
    const nomKit =
      kit.nom ||
      kit.name ||
      kit.titre ||
      kit.title ||
      "Kit solaire";

    const composants =
      recupererComposants(kit);

    const quantiteKit =
      number(
        kit.quantite ??
          kit.quantity
      ) || 1;

    lignes.push({
      type: "kit",
      nom: nomKit,
    });

    if (composants.length > 0) {
      composants.forEach(
        (composant) => {
          const quantiteComposant =
            number(
              composant.quantite ??
                composant.quantity
            ) || 1;

          const quantiteTotale =
            quantiteComposant *
            quantiteKit;

          const prixUnitaire =
            number(
              composant.prix ??
                composant.pu ??
                composant.price
            );

          const montantHT =
            quantiteTotale *
            prixUnitaire;

          lignes.push({
            type: "composant",

            nom:
              composant.nom ||
              composant.name ||
              composant.designation ||
              "Composant",

            qte: quantiteTotale,

            pu: prixUnitaire,

            montantHT: montantHT,
          });
        }
      );
    }
  });

  /* =======================================================
     TOTAL HT
  ======================================================= */

  const totalHT =
    lignes
      .filter(
        (ligne) =>
          ligne.type ===
          "composant"
      )
      .reduce(
        (total, ligne) =>
          total +
          ligne.montantHT,
        0
      );

  /* =======================================================
     TOTAL À PAYER
  ======================================================= */

  const totalAPayer =
    totalHT;

  /* =======================================================
     PAIEMENT
  ======================================================= */

  const acompte = Math.round(
    totalAPayer * 0.8
  );

  const solde =
    totalAPayer -
    acompte;

  /* =======================================================
     PRODUCTION
  ======================================================= */

  const productionJour =
    produits.reduce(
      (total, kit) => {
        const production =
          number(
            kit.kwh_jour ??
              kit.productionJour ??
              kit.production
          );

        const quantite =
          number(
            kit.quantite ??
              kit.quantity
          ) || 1;

        return (
          total +
          production *
            quantite
        );
      },
      0
    );

  const productionMensuelle =
    productionJour * 30;

  const factureMensuelle =
    calculerFactureSenelec(
      productionMensuelle
    );

  const factureAnnuelle =
    factureMensuelle * 12;

  const retourMois =
    factureMensuelle > 0
      ? Math.round(
          totalAPayer /
            factureMensuelle
        )
      : null;

  return (
    <Document
      title={`Devis ${
        numeroDevis || ""
      }`}
      author="Solart Smart"
      subject="Devis installation solaire"
    >

      {/* =================================================
          PAGE 1
      ================================================= */}

      <Page
        size="A4"
        style={styles.page}
      >

        <View style={styles.header}>

          <View
            style={styles.logoRow}
          >

            <Image
              src={logoSrc}
              style={styles.logo}
              cache={false}
            />

            <View>

              <Text
                style={
                  styles.companyName
                }
              >
                {COMPANY.nom}
              </Text>

              <Text
                style={
                  styles.companyLegal
                }
              >
                {COMPANY.legal}
              </Text>

            </View>

          </View>

          <Text
            style={[
              styles.companyLine,
              {
                marginTop: 6,
              },
            ]}
          >
            {COMPANY.adresse}
          </Text>

          <Text
            style={
              styles.contactLine
            }
          >
            Tél / WhatsApp :{" "}
            {COMPANY.tel}
          </Text>

        </View>

        {/* =================================================
            TITRE
        ================================================= */}

        <View
          style={styles.titleBox}
        >

          <View
            style={styles.titleBadge}
          >

            <Text
              style={styles.titleText}
            >
              DEVIS N°{" "}
              {numeroDevis || "—"}
            </Text>

          </View>

        </View>

        {/* =================================================
            CLIENT
        ================================================= */}

        <View
          style={styles.infoBox}
        >

          <View
            style={styles.infoColumn}
          >

            <Text
              style={styles.infoLeft}
            >
              <Text
                style={styles.bold}
              >
                CLIENT :{" "}
              </Text>

              {nom || "Client"}
            </Text>

            {telephone ? (
              <Text
                style={
                  styles.infoLeft
                }
              >
                <Text
                  style={
                    styles.bold
                  }
                >
                  TÉL :{" "}
                </Text>

                {telephone}
              </Text>
            ) : null}

          </View>

          <View
            style={styles.infoColumn}
          >

            <Text
              style={
                styles.infoRight
              }
            >
              <Text
                style={styles.bold}
              >
                DATE :{" "}
              </Text>

              {date || "—"}
            </Text>

            <Text
              style={
                styles.infoRight
              }
            >
              <Text
                style={styles.bold}
              >
                VALIDITÉ :{" "}
              </Text>

              30 jours
            </Text>

          </View>

        </View>

        {/* =================================================
            TABLEAU
        ================================================= */}

        <View
          style={styles.table}
        >

          <View
            style={
              styles.tableHeaderRow
            }
          >

            <Text
              style={[
                styles.tableHeaderCell,
                styles.colDesignation,
              ]}
            >
              Désignation
            </Text>

            <Text
              style={[
                styles.tableHeaderCell,
                styles.colQte,
              ]}
            >
              Qté
            </Text>

            <Text
              style={[
                styles.tableHeaderCell,
                styles.colPU,
              ]}
            >
              P.U. HT
            </Text>

            <Text
              style={[
                styles.tableHeaderCell,
                styles.colMontant,
                {
                  borderRightWidth: 0,
                },
              ]}
            >
              Montant HT
            </Text>

          </View>

          {lignes.map(
            (ligne, index) => {

              if (
                ligne.type ===
                "kit"
              ) {
                return (
                  <View
                    key={`kit-${index}`}
                    wrap={false}
                    style={
                      styles.kitNameRow
                    }
                  >

                    <Text
                      style={
                        styles.kitNameCell
                      }
                    >
                      {ligne.nom}
                    </Text>

                  </View>
                );
              }

              return (
                <View
                  key={`ligne-${index}`}
                  wrap={false}
                  style={
                    index % 2 === 0
                      ? styles.rowAlt
                      : styles.rowNormal
                  }
                >

                  <Text
                    style={[
                      styles.cell,
                      styles.colDesignation,
                    ]}
                  >
                    {ligne.nom}
                  </Text>

                  <Text
                    style={[
                      styles.cell,
                      styles.colQte,
                    ]}
                  >
                    {formatNumber(
                      ligne.qte
                    )}
                  </Text>

                  <Text
                    style={[
                      styles.cell,
                      styles.colPU,
                    ]}
                  >
                    {formatFCFA(
                      ligne.pu
                    )}
                  </Text>

                  <Text
                    style={[
                      styles.cell,
                      styles.colMontant,
                      {
                        borderRightWidth: 0,
                      },
                    ]}
                  >
                    {formatFCFA(
                      ligne.montantHT
                    )}
                  </Text>

                </View>
              );
            }
          )}

        </View>

        {/* =================================================
            TOTAL
        ================================================= */}

        <View
          style={styles.totalsBox}
        >

          <View
            style={[
              styles.totalRow,
              styles.netRow,
            ]}
          >

            <Text
              style={[
                styles.totalLabelCell,
                styles.netLabel,
              ]}
            >
              TOTAL À PAYER
            </Text>

            <Text
              style={[
                styles.totalValueCell,
                styles.netValue,
              ]}
            >
              {formatFCFA(
                totalAPayer
              )}
            </Text>

          </View>

        </View>

        {/* =================================================
            ARRÊTÉ
        ================================================= */}

        <Text
          style={styles.arrete}
        >
          Arrêté le présent devis à
          la somme totale de{" "}

          <Text
            style={styles.bold}
          >
            {formatFCFA(
              totalAPayer
            )}
          </Text>
          .
        </Text>

        {/* =================================================
            AVANTAGES
        ================================================= */}

        {productionJour > 0 && (
          <View wrap={false}>

            <Text
              style={styles.ecoTitle}
            >
              Avantages
              éco-énergétiques
            </Text>

            <View
              style={styles.ecoRow}
            >

              <View
                style={[
                  styles.ecoCol,
                  {
                    backgroundColor:
                      COLORS.greenBg,
                  },
                ]}
              >

                <Text
                  style={
                    styles.ecoHeader
                  }
                >
                  Production
                  journalière
                </Text>

                <Text
                  style={
                    styles.ecoValue
                  }
                >
                  {formatNumber(
                    productionJour
                  )}{" "}
                  kWh/j
                </Text>

                <Text
                  style={
                    styles.ecoSub
                  }
                >
                  soit{" "}
                  {formatNumber(
                    productionMensuelle
                  )}{" "}
                  kWh / mois
                </Text>

              </View>

              <View
                style={[
                  styles.ecoCol,
                  {
                    backgroundColor:
                      COLORS.redBg,
                  },
                ]}
              >

                <Text
                  style={
                    styles.ecoHeader
                  }
                >
                  Équivalent facture
                  Senelec
                </Text>

                <Text
                  style={
                    styles.ecoValue
                  }
                >
                  {formatFCFA(
                    factureMensuelle
                  )}
                </Text>

                <Text
                  style={
                    styles.ecoSub
                  }
                >
                  par mois
                </Text>

                <Text
                  style={
                    styles.ecoSub
                  }
                >
                  soit{" "}
                  {formatFCFA(
                    factureAnnuelle
                  )}{" "}
                  / an
                </Text>

              </View>

              <View
                style={[
                  styles.ecoColLast,
                  {
                    backgroundColor:
                      COLORS.blueBg,
                  },
                ]}
              >

                <Text
                  style={
                    styles.ecoHeader
                  }
                >
                  Retour estimatif
                </Text>

                <Text
                  style={
                    styles.ecoValue
                  }
                >
                  {retourMois !==
                  null
                    ? `${retourMois} mois`
                    : "—"}
                </Text>

                <Text
                  style={
                    styles.ecoSub
                  }
                >
                  estimation indicative
                </Text>

              </View>

            </View>

            <Text
              style={{
                fontSize: 6,
                color:
                  COLORS.gray,
                marginTop: 4,
                lineHeight: 1.3,
              }}
            >
              Base : grille tarifaire
              Senelec 2026 (usage
              domestique petite
              puissance) — 82 FCFA/kWh
              (0-150 kWh), 136,49
              FCFA/kWh (151-250 kWh),
              159,36 FCFA/kWh au-delà
              de 250 kWh, redevance
              mensuelle 1 155 FCFA.
              Estimation indicative,
              hors abonnement
              moyenne/haute puissance.
            </Text>

          </View>
        )}

        {/* =================================================
            FOOTER PAGE 1
        ================================================= */}

        <View style={styles.footer}>

          <View style={styles.footerRow}>
            <Text style={styles.footerEmail}>
              <Text style={styles.footerBold}>
                E-mail :
              </Text>{" "}
              {COMPANY.email}
            </Text>
          </View>

          <View style={styles.footerRow}>

            <Text style={styles.footerText}>
              <Text style={styles.footerBold}>
                Tél :
              </Text>{" "}
              {COMPANY.tel}
            </Text>

            <Text style={styles.footerSeparator}>
              •
            </Text>

            <Text style={styles.footerText}>
              <Text style={styles.footerBold}>
                RC :
              </Text>{" "}
              {COMPANY.rc}
            </Text>

            <Text style={styles.footerSeparator}>
              •
            </Text>

            <Text style={styles.footerText}>
              <Text style={styles.footerBold}>
                N.I.N.E.A :
              </Text>{" "}
              {COMPANY.ninea}
            </Text>

          </View>

          <View style={styles.footerRow}>

            <Text style={styles.footerText}>
              <Text style={styles.footerBold}>
                Banque :
              </Text>{" "}
              CORIS BANK
            </Text>

            <Text style={styles.footerSeparator}>
              •
            </Text>

            <Text style={styles.footerText}>
              <Text style={styles.footerBold}>
                Code banque :
              </Text>{" "}
              SN213
            </Text>

            <Text style={styles.footerSeparator}>
              •
            </Text>

            <Text style={styles.footerText}>
              <Text style={styles.footerBold}>
                Code guichet :
              </Text>{" "}
              01008
            </Text>

          </View>

          <View style={styles.footerRow}>

            <Text style={styles.footerText}>
              <Text style={styles.footerBold}>
                Numéro de Compte :
              </Text>{" "}
              {COMPANY.compte}
            </Text>

            <Text style={styles.footerSeparator}>
              •
            </Text>

            <Text style={styles.footerText}>
              <Text style={styles.footerBold}>
                Clé RIB :
              </Text>{" "}
              {COMPANY.rib}
            </Text>

            <Text style={styles.footerSeparator}>
              •
            </Text>

            <Text style={styles.footerText}>
              <Text style={styles.footerBold}>
                Domiciliation :
              </Text>{" "}
              Dakar
            </Text>

          </View>

          <View style={styles.footerRow}>

            <Text style={styles.footerText}>
              <Text style={styles.footerBold}>
                IBAN :
              </Text>{" "}
              {COMPANY.iban}
            </Text>

            <Text style={styles.footerSeparator}>
              •
            </Text>

            <Text style={styles.footerText}>
              <Text style={styles.footerBold}>
                SWIFT :
              </Text>{" "}
              {COMPANY.swift}
            </Text>

          </View>

        </View>

      </Page>

      {/* ===================================================
          PAGE 2
      =================================================== */}

      <Page
        size="A4"
        style={styles.page}
      >

        {/* =================================================
            HEADER PAGE 2
        ================================================= */}

        <View style={styles.header}>

          <View
            style={styles.logoRow}
          >

            <Image
              src={logoSrc}
              style={styles.logo}
              cache={false}
            />

            <View>

              <Text
                style={
                  styles.companyName
                }
              >
                {COMPANY.nom}
              </Text>

              <Text
                style={
                  styles.companyLegal
                }
              >
                {COMPANY.legal}
              </Text>

            </View>

          </View>

          <Text
            style={[
              styles.companyLine,
              {
                marginTop: 6,
              },
            ]}
          >
            {COMPANY.adresse}
          </Text>

          <Text
            style={
              styles.contactLine
            }
          >
            Tél / WhatsApp :{" "}
            {COMPANY.tel}
          </Text>

        </View>

        {/* =================================================
            CONDITIONS
        ================================================= */}

        <Text
          style={styles.condTitle}
        >
          Conditions générales
        </Text>

        <View
          style={styles.condTable}
        >

          {/* RÈGLEMENT */}

          <View
            style={
              styles.condRowFirst
            }
          >

            <Text
              style={styles.condLabel}
            >
              Règlement
            </Text>

            <View
              style={styles.condValue}
            >

              <Text>
                80 % à la commande :{" "}

                <Text
                  style={styles.bold}
                >
                  {formatFCFA(
                    acompte
                  )}
                </Text>
              </Text>

              <Text>
                20 % après installation
                et mise en service :{" "}

                <Text
                  style={styles.bold}
                >
                  {formatFCFA(
                    solde
                  )}
                </Text>
              </Text>

              <Text
                style={{
                  marginTop: 5,
                  fontWeight: "bold",
                }}
              >
                Par virement bancaire :
              </Text>

              <Text>
                Banque :{" "}
                {COMPANY.banque}
              </Text>

              <Text>
                Compte :{" "}
                {COMPANY.compte} — RIB :{" "}
                {COMPANY.rib}
              </Text>

              <Text>
                IBAN :{" "}
                {COMPANY.iban} — SWIFT :{" "}
                {COMPANY.swift}
              </Text>

              <Text
                style={{
                  marginTop: 5,
                }}
              >
                Par chèque : au nom de{" "}

                <Text
                  style={styles.bold}
                >
                  {COMPANY.chequeAuNom}
                </Text>
              </Text>

              <Text
                style={{
                  marginTop: 5,
                  fontWeight: "bold",
                }}
              >
                Paiement par Wave :
              </Text>

              <Link
                src={COMPANY.wave}
                style={{
                  color: "#2563eb",
                  fontSize: 7.2,
                }}
              >
                Lien de paiement Wave
              </Link>

            </View>

          </View>

          {/* LIVRAISON */}

          <View
            style={styles.condRow}
          >

            <Text
              style={styles.condLabel}
            >
              Délai de livraison
            </Text>

            <Text
              style={styles.condValue}
            >
              7 à 10 jours ouvrés
              après réception de
              l&apos;acompte, sous réserve
              de disponibilité du
              matériel.
            </Text>

          </View>

          {/* TRAVAUX */}

          <View
            style={styles.condRow}
          >

            <Text
              style={styles.condLabel}
            >
              Durée des travaux
            </Text>

            <Text
              style={styles.condValue}
            >
              15 jours
            </Text>

          </View>

          {/* GARANTIES */}

          <View
            style={styles.condRow}
          >

            <Text
              style={styles.condLabel}
            >
              Garanties
            </Text>

            <View
              style={styles.condValue}
            >

              <Text
                style={styles.bold}
              >
                Garanties constructeur :
              </Text>

              <Text>
                • Panneaux : 20 ans
              </Text>

              <Text>
                • Onduleur : 10 ans
              </Text>

              <Text>
                • Batterie : 10 ans
              </Text>

              <Text>
                • Installation par{" "}
                {COMPANY.nom} :{" "}

                <Text
                  style={styles.bold}
                >
                  3 ans
                </Text>
              </Text>

            </View>

          </View>

          {/* MISE EN SERVICE */}

          <View
            style={[
              styles.condRow,
              {
                borderBottomWidth: 0,
              },
            ]}
          >

            <Text
              style={styles.condLabel}
            >
              Mise en service
            </Text>

            <Text
              style={styles.condValue}
            >
              Essais de production,
              contrôle des protections,
              mesure de terre et
              formation à l&apos;usage.
            </Text>

          </View>

        </View>

        {/* =================================================
            NOTE
        ================================================= */}

        <View
          style={styles.noteBox}
        >

          <Text
            style={styles.note}
          >
            Toute marchandise livrée
            conforme à la commande
            n&apos;est ni reprise ni
            échangée. Toute commande
            validée et payée ne peut
            plus être modifiée ; tout
            changement fait l&apos;objet
            d&apos;un avenant chiffré.
            Les réserves concernant
            un matériel défectueux,
            non conforme ou manquant
            sont à signaler dans les
            72 heures suivant la mise
            en service.
          </Text>

        </View>

        {/* =================================================
            COMPRIS / NON COMPRIS
        ================================================= */}

        <View style={styles.twoCol}>

          <View
            style={styles.colBox}
          >

            <Text
              style={styles.colTitle}
            >
              Compris dans le prix
            </Text>

            <Text
              style={styles.colText}
            >
              Étude et dimensionnement ·
              fourniture du matériel listé ·
              supports et fixations ·
              câblage DC et AC ·
              protections et mise à la
              terre · pose et raccordement ·
              essais et mise en service ·
              formation à l&apos;usage.
            </Text>

          </View>

          <View
            style={styles.colBoxLast}
          >

            <Text
              style={styles.colTitle}
            >
              Non compris
            </Text>

            <Text
              style={styles.colText}
            >
              Génie civil, tranchées et
              reprise de maçonnerie ·
              mise en conformité de
              l&apos;installation électrique
              existante · groupe
              électrogène et son
              inverseur · abonnement ou
              modification du contrat
              Senelec.
            </Text>

          </View>

        </View>

        {/* =================================================
            SIGNATURES
        ================================================= */}

        <View
          style={styles.signBox}
        >

          <View
            style={styles.signColumn}
          >

            <Text
              style={styles.signCell}
            >
              LE CLIENT
            </Text>

            <View
              style={styles.signLine}
            />

          </View>

          <View
            style={styles.signColumn}
          >

            <Text
              style={styles.signCell}
            >
              {COMPANY.nom.toUpperCase()}
            </Text>

            <View
              style={styles.signLine}
            />

          </View>

        </View>

        {/* =================================================
            FOOTER PAGE 2
        ================================================= */}

        <View style={styles.footer}>

          <View style={styles.footerRow}>
            <Text style={styles.footerEmail}>
              <Text style={styles.footerBold}>
                E-mail :
              </Text>{" "}
              {COMPANY.email}
            </Text>
          </View>

          <View style={styles.footerRow}>

            <Text style={styles.footerText}>
              <Text style={styles.footerBold}>
                Tél :
              </Text>{" "}
              {COMPANY.tel}
            </Text>

            <Text style={styles.footerSeparator}>
              •
            </Text>

            <Text style={styles.footerText}>
              <Text style={styles.footerBold}>
                RC :
              </Text>{" "}
              {COMPANY.rc}
            </Text>

            <Text style={styles.footerSeparator}>
              •
            </Text>

            <Text style={styles.footerText}>
              <Text style={styles.footerBold}>
                N.I.N.E.A :
              </Text>{" "}
              {COMPANY.ninea}
            </Text>

          </View>

          <View style={styles.footerRow}>

            <Text style={styles.footerText}>
              <Text style={styles.footerBold}>
                Banque :
              </Text>{" "}
              CORIS BANK
            </Text>

            <Text style={styles.footerSeparator}>
              •
            </Text>

            <Text style={styles.footerText}>
              <Text style={styles.footerBold}>
                Code banque :
              </Text>{" "}
              SN213
            </Text>

            <Text style={styles.footerSeparator}>
              •
            </Text>

            <Text style={styles.footerText}>
              <Text style={styles.footerBold}>
                Code guichet :
              </Text>{" "}
              01008
            </Text>

          </View>

          <View style={styles.footerRow}>

            <Text style={styles.footerText}>
              <Text style={styles.footerBold}>
                Numéro de Compte :
              </Text>{" "}
              {COMPANY.compte}
            </Text>

            <Text style={styles.footerSeparator}>
              •
            </Text>

            <Text style={styles.footerText}>
              <Text style={styles.footerBold}>
                Clé RIB :
              </Text>{" "}
              {COMPANY.rib}
            </Text>

            <Text style={styles.footerSeparator}>
              •
            </Text>

            <Text style={styles.footerText}>
              <Text style={styles.footerBold}>
                Domiciliation :
              </Text>{" "}
              Dakar
            </Text>

          </View>

          <View style={styles.footerRow}>

            <Text style={styles.footerText}>
              <Text style={styles.footerBold}>
                IBAN :
              </Text>{" "}
              {COMPANY.iban}
            </Text>

            <Text style={styles.footerSeparator}>
              •
            </Text>

            <Text style={styles.footerText}>
              <Text style={styles.footerBold}>
                SWIFT :
              </Text>{" "}
              {COMPANY.swift}
            </Text>

          </View>

        </View>

      </Page>

    </Document>
  );
}