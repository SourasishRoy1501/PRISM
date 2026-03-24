export const MaleSexualDysfunctionInitialState = {
  demographics: {
    fullName: "",
    dateOfBirth: "",
    age: "",
    gender: "",
    firstVisit: "",
    contact: "",
    address: "",
    maritalStatus: "",
    durationMarriage: "",
    education: "",
    occupation: "",
    weight: "",
    height: "",
    bmi: ""
  },
  physical: {
    vas: {
      left: "",
      right: ""
    },
    penis: "",
    scars: {
      status: "",
      location: ""
    },
    rectal: {
      status: "",
      findings: ""
    },
    testes: {
      left: {
        volume: "",
        consistency: ""
      },
      right: {
        volume: "",
        consistency: ""
      }
    },
    epididymis: "",
    gynecomastia: {
      side: "",
      status: ""
    },
    secondarySex: "",
    spermaticCords: {
      grade: "",
      status: ""
    },
    generalAppearance: ""
  },
  medical: {
    diabetes: { status: "", comments: "" },
    hypertension: { status: "", comments: "" },
    thyroid: { status: "", comments: "" },
    cardiovascular: { status: "", comments: "" },
    neurological: { status: "", comments: "" },
    psychiatric: { status: "", comments: "" },
    hormonal: { status: "", comments: "" },
    stis: { status: "", type: "", year: "" },
    kidney: { status: "", comments: "" },
    liver: { status: "", comments: "" },
    genitalInfections: { status: "", specify: "" },
    otherChronic: { status: "", specify: "" }
  },
  surgical: {
    varicocele: { status: "", year: "" },
    hernia: { status: "", year: "" },
    prostate: { status: "", year: "" },
    testicular: { status: "", year: "" },
    trauma: { status: "", year: "" },
    vasectomy: { status: "", year: "" },
    otherUrogenital: { status: "", specify: "" },
    otherMajor: { status: "", specify: "" }
  },
  lifestyle: {
    drugUse: { status: "", substance: "" },
    steroids: { status: "", duration: "" },
    exposure: { status: "", details: "" },
    stress: { status: "", details: "" },
    sleep: { status: "", details: "" },
    sedentary: { status: "", activity: "" },
    enhancement: { status: "", type: "" },
    pornography: { status: "", impact: "" }
  },
  sexual: {
    currentRigidity: "",
    bestRigidity: "",
    duration: "",
    morningErections: "",
    morningBetter: "",
    lastMorningErection: "",
    overnightErections: "",
    overnightRigidity: "",
    losesRigidity: "",
    staysErect: "",
    curvature: "",
    numbness: "",
    numbnessDetails: "",
    edOnset: "",
    edDuration: "",
    significantEvent: "",
    eventDetails: "",
    lastNormalErection: "",
    betterDuring: "",
    masturbationRigidity: "",
    problemType: "",
    progression: "",
    dailyVariation: "",
    trauma: "",
    traumaDetails: "",
    ejaculationRigidity: "",
    libido: "",
    desiredFrequency: "",
    partnerKnows: "",
    partnerSupportive: "",
    partnerWilling: "",
    initiates: "",
    currentAttempts: "",
    attemptsFrequency: "",
    relationshipImpact: "",
    previousTreatments: "",
    treatmentDetails: "",
    contraceptive: "",
    contraceptiveOther: "",
    satisfiedWith65: "",
    successfulOutcome: ""
  },
  semen: {
    collectionDate: "",
    abstinence: "",
    sampleStatus: "",
    timeToAnalysis: "",
    volume: "",
    concentration: "",
    motility: "",
    morphology: "",
    pH: "",
    liquefication: ""
  },
  hormonal: {
    testosterone: { done: "", date: "", value: "", interpretation: "" },
    fsh: { done: "", date: "", value: "", interpretation: "" },
    lh: { done: "", date: "", value: "", interpretation: "" },
    prolactin: { done: "", date: "", value: "", interpretation: "" },
    tsh: { done: "", date: "", value: "", interpretation: "" },
    estradiol: { done: "", date: "", value: "", interpretation: "" },
    shbg: { done: "", date: "", value: "", interpretation: "" }
  },
  scoring: {
    ehs: { score1: "", score2: "", score3: "", score4: "" },
    iief: {
      q1: "", q2: "", q3: "", q4: "", q5: "",
      q6: "", q7: "", q8: "", q9: "", q10: "",
      q11: "", q12: "", q13: "", q14: "", q15: ""
    }
  },
  imaging: {
    scrotalUltrasound: { done: "", date: "", findings: "" },
    penileDoppler: { done: "", date: "", findings: "" },
    otherImaging: { done: "", type: "", date: "", findings: "" },
    urologicalExam: { done: "", date: "", findings: "" }
  },
  psychological: {
    phq9: { score: "", interpretation: "" },
    gad7: { score: "", interpretation: "" },
    stressLevel: "",
    emotionalIssues: "",
    emotionalIssuesDetails: "",
    referral: "",
    referralStatus: ""
  },
  followup: {
    nextVisit: "",
    lifestyleModifications: "",
    referral: "",
    investigations: "",
    compliance: "",
    remarks: ""
  }
}


