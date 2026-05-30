export const TAX_YEAR = 2026;

export const PAY_FREQUENCIES = {
  weekly: { label: "Weekly", periods: 52 },
  biweekly: { label: "Biweekly", periods: 26 },
  semimonthly: { label: "Semimonthly", periods: 24 },
  monthly: { label: "Monthly", periods: 12 },
};

export const FILING_STATUSES = {
  single: "Single",
  marriedJoint: "Married filing jointly",
  marriedSeparate: "Married filing separately",
  headOfHousehold: "Head of household",
};

export const FEDERAL_2026 = {
  source:
    "IRS Rev. Proc. 2025-32 / IRB 2025-45. This app estimates annual income tax before credits, then divides by pay periods.",
  standardDeduction: {
    single: 16100,
    marriedJoint: 32200,
    marriedSeparate: 16100,
    headOfHousehold: 24150,
  },
  brackets: {
    single: [
      { min: 0, max: 12400, rate: 0.1, base: 0 },
      { min: 12400, max: 50400, rate: 0.12, base: 1240 },
      { min: 50400, max: 105700, rate: 0.22, base: 5800 },
      { min: 105700, max: 201775, rate: 0.24, base: 17966 },
      { min: 201775, max: 256225, rate: 0.32, base: 41024 },
      { min: 256225, max: 640600, rate: 0.35, base: 58448 },
      { min: 640600, max: Infinity, rate: 0.37, base: 192979.25 },
    ],
    marriedJoint: [
      { min: 0, max: 24800, rate: 0.1, base: 0 },
      { min: 24800, max: 100800, rate: 0.12, base: 2480 },
      { min: 100800, max: 211400, rate: 0.22, base: 11600 },
      { min: 211400, max: 403550, rate: 0.24, base: 35932 },
      { min: 403550, max: 512450, rate: 0.32, base: 82048 },
      { min: 512450, max: 768700, rate: 0.35, base: 116896 },
      { min: 768700, max: Infinity, rate: 0.37, base: 206583.5 },
    ],
    marriedSeparate: [
      { min: 0, max: 12400, rate: 0.1, base: 0 },
      { min: 12400, max: 50400, rate: 0.12, base: 1240 },
      { min: 50400, max: 105700, rate: 0.22, base: 5800 },
      { min: 105700, max: 201775, rate: 0.24, base: 17966 },
      { min: 201775, max: 256225, rate: 0.32, base: 41024 },
      { min: 256225, max: 384350, rate: 0.35, base: 58448 },
      { min: 384350, max: Infinity, rate: 0.37, base: 103291.75 },
    ],
    headOfHousehold: [
      { min: 0, max: 17700, rate: 0.1, base: 0 },
      { min: 17700, max: 67450, rate: 0.12, base: 1770 },
      { min: 67450, max: 105700, rate: 0.22, base: 7740 },
      { min: 105700, max: 201750, rate: 0.24, base: 16155 },
      { min: 201750, max: 256200, rate: 0.32, base: 39207 },
      { min: 256200, max: 640600, rate: 0.35, base: 56631 },
      { min: 640600, max: Infinity, rate: 0.37, base: 191171 },
    ],
  },
};

export const FICA_2026 = {
  source: "SSA 2026 contribution and benefit base.",
  socialSecurityRate: 0.062,
  socialSecurityWageBase: 184500,
  medicareRate: 0.0145,
  additionalMedicareRate: 0.009,
  additionalMedicareThresholds: {
    single: 200000,
    marriedJoint: 250000,
    marriedSeparate: 125000,
    headOfHousehold: 200000,
  },
};

export const STATE_TAX = {
  none: {
    label: "No state estimate",
    standardDeduction: {},
    brackets: {},
  },
  ca: {
    label: "California",
    source:
      "California EDD 2026 Method B annual tables and FTB 2026 Form 540-ES worksheet. This simplified estimate uses annual resident taxable wages, standard deduction, and no credits.",
    standardDeduction: {
      single: 5706,
      marriedJoint: 11412,
      marriedSeparate: 5706,
      headOfHousehold: 11412,
    },
    // California's 1% Mental Health Services Tax is represented in the top 14.63% table row.
    brackets: {
      single: [
        { min: 0, max: 11079, rate: 0.011, base: 0 },
        { min: 11079, max: 26264, rate: 0.022, base: 121.87 },
        { min: 26264, max: 41452, rate: 0.044, base: 455.94 },
        { min: 41452, max: 57542, rate: 0.066, base: 1124.21 },
        { min: 57542, max: 72724, rate: 0.088, base: 2186.15 },
        { min: 72724, max: 371479, rate: 0.1023, base: 3522.17 },
        { min: 371479, max: 445771, rate: 0.1133, base: 34084.81 },
        { min: 445771, max: 742953, rate: 0.1243, base: 42502.09 },
        { min: 742953, max: 1000000, rate: 0.1353, base: 79441.81 },
        { min: 1000000, max: Infinity, rate: 0.1463, base: 114220.27 },
      ],
      marriedJoint: [
        { min: 0, max: 22158, rate: 0.011, base: 0 },
        { min: 22158, max: 52528, rate: 0.022, base: 243.74 },
        { min: 52528, max: 82904, rate: 0.044, base: 911.88 },
        { min: 82904, max: 115084, rate: 0.066, base: 2248.42 },
        { min: 115084, max: 145448, rate: 0.088, base: 4372.3 },
        { min: 145448, max: 742958, rate: 0.1023, base: 7044.33 },
        { min: 742958, max: 891542, rate: 0.1133, base: 68169.6 },
        { min: 891542, max: 1000000, rate: 0.1243, base: 85004.17 },
        { min: 1000000, max: 1485906, rate: 0.1353, base: 98485.5 },
        { min: 1485906, max: Infinity, rate: 0.1463, base: 164228.58 },
      ],
      marriedSeparate: [
        { min: 0, max: 11079, rate: 0.011, base: 0 },
        { min: 11079, max: 26264, rate: 0.022, base: 121.87 },
        { min: 26264, max: 41452, rate: 0.044, base: 455.94 },
        { min: 41452, max: 57542, rate: 0.066, base: 1124.21 },
        { min: 57542, max: 72724, rate: 0.088, base: 2186.15 },
        { min: 72724, max: 371479, rate: 0.1023, base: 3522.17 },
        { min: 371479, max: 445771, rate: 0.1133, base: 34084.81 },
        { min: 445771, max: 742953, rate: 0.1243, base: 42502.09 },
        { min: 742953, max: 1000000, rate: 0.1353, base: 79441.81 },
        { min: 1000000, max: Infinity, rate: 0.1463, base: 114220.27 },
      ],
      headOfHousehold: [
        { min: 0, max: 22173, rate: 0.011, base: 0 },
        { min: 22173, max: 52530, rate: 0.022, base: 243.9 },
        { min: 52530, max: 67716, rate: 0.044, base: 911.75 },
        { min: 67716, max: 83805, rate: 0.066, base: 1579.93 },
        { min: 83805, max: 98990, rate: 0.088, base: 2641.8 },
        { min: 98990, max: 505208, rate: 0.1023, base: 3978.08 },
        { min: 505208, max: 606251, rate: 0.1133, base: 45534.18 },
        { min: 606251, max: 1000000, rate: 0.1243, base: 56982.35 },
        { min: 1000000, max: 1010417, rate: 0.1353, base: 105925.35 },
        { min: 1010417, max: Infinity, rate: 0.1463, base: 107334.77 },
      ],
    },
  },
};

export const TAX_DISCLAIMER = "Estimate only. Not tax, payroll, legal, or financial advice.";
