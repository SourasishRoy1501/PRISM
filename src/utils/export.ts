import * as XLSX from 'xlsx';

const maleInfertilityFieldConfig = {
    demographics: {
      title: "Demographics",
      fields: {
        "demographics.firstVisit": "Date of First Visit",
        "demographics.fullName": "Full Name",
        "demographics.age": "Age",
        "demographics.sex": "Gender",
        "demographics.maritalStatus": "Marital Status",
        "demographics.durationMarriage": "Duration of Marriage",
        "demographics.previousFertility.status": "Previous Fertility",
        "demographics.previousFertility.details": "Previous Fertility Details",
        "demographics.occupation": "Occupation",
        "demographics.education": "Education",
        "demographics.medicalHistory": "Medical History",
        "demographics.medicalHistoryDetails": "Medical History Details",
        "demographics.surgery.status": "Surgery",
        "demographics.surgery.details": "Surgery Details",
        "demographics.congenital.status": "Congenital",
        "demographics.congenital.details": "Congenital Details",
        "demographics.substance": "Substance Use",
        "demographics.substanceDetails": "Substance Use Details",
        "demographics.smoking.status": "Smoking Status",
        "demographics.smoking.cigarettesPerDay": "Cigarettes Per Day",
        "demographics.alcohol.status": "Alcohol Status",
        "demographics.alcohol.unitsPerWeek": "Units per Week",
        "demographics.bmi.height": "Height",
        "demographics.bmi.weight": "Weight",
        "demographics.bmi.value": "BMI",
      },
    },
    history: {
      title: "History",
      fields: {
        "history.family": "Family History",
        "history.consanguinity": "Consanguinity",
        "history.std.status": "STD",
        "history.std.details": "STD Details",
        "history.febrile.status": "Febrile",
        "history.febrile.details": "Febrile Details",
        "history.testicular.status": "Testicular Problem",
        "history.testicular.details": "Testicular Problem Details",
        "history.surgery.type": "Surgery Type",
        "history.therapy.type": "Therapy Type",
        "history.therapy.details": "Therapy Details",
        "history.lubricants.type": "Lubricant Type",
        "history.lubricants.status": "Lubricant Use",
        "history.environment": "Environment",
        "history.lifestyle": "Lifestyle",
        "history.duration": "Duration of Infertility (years)",
        "history.frequency": "Frequency of Intercourse (per week)",
        "history.regularity": "Regularity of Intercourse",
        "history.contraception": "Contraception",
        "history.contraceptionMethod": "Contraception Method",
        "history.ovulatoryKnowledge": "Knowledge of Ovulatory Period",
        "history.erectileDysfunction.status": "Erectile Dysfunction",
        "history.erectileDysfunction.details": "Erectile Dysfunction Details",
        "history.ejaculatoryDysfunction": "Ejaculatory Dysfunction",
        "history.congenitalSelf": "Congenital Self",
        "history.chronicConditions": "Chronic Conditions",
        "history.ejaculateVolume": "Ejaculate Volume",
      },
    },
    semen: {
      title: "Semen Analysis",
      fields: {
        "semen.pre.infection": "Infection",
        "semen.pre.medications": "Medications",
        "semen.pre.medicationDetails": "Medication Details",
        "semen.pre.collectedAtLab": "Collected at Lab",
        "semen.pre.collectionTime": "Collection Time",
        "semen.pre.deliveryTime": "Delivery Time",
        "semen.pre.abstinenceDays": "Abstinence Days",
        "semen.pre.completeCollection.status": "Complete Collection",
        "semen.pre.completeCollection.missing": "Missing",
        "semen.macro.volume": "Volume",
        "semen.macro.ph": "pH",
        "semen.macro.appearance": "Appearance",
        "semen.macro.viscosity": "Viscosity",
        "semen.macro.liquefaction": "Liquefaction",
        "semen.macro.treatment": "Treatment",
        "semen.macro.agglutination": "Agglutination",
        "semen.micro.totalCount": "Total Count",
        "semen.micro.concentration": "Concentration",
        "semen.micro.progressive": "Progressive Motility",
        "semen.micro.totalMotile": "Total Motile",
        "semen.micro.vitality": "Vitality",
        "semen.micro.motility.a": "Motility A",
        "semen.micro.motility.b": "Motility B",
        "semen.micro.motility.c": "Motility C",
        "semen.micro.motility.d": "Motility D",
        "semen.micro.countingError": "Counting Error",
        "semen.cells.wbcs": "WBCs",
        "semen.glands.fructose": "Fructose",
        "semen.glands.zinc": "Zinc",
        "semen.glands.glucosidase": "Glucosidase",
        "semen.timing.begun": "Begun Time",
        "semen.timing.toExam": "Time to Examination",
        "semen.morphology.normal": "Normal Morphology",
        "semen.morphology.abnormalHeads": "Abnormal Heads",
        "semen.morphology.abnormalMid": "Abnormal Mid",
        "semen.morphology.abnormalTails": "Abnormal Tails",
        "semen.morphology.erc": "ERC",
        "semen.morphology.tzi": "TZI",
      },
    },
    physical: {
      title: "Physical Examination",
      fields: {
        "physical.generalAppearance": "General Appearance",
        "physical.secondarySex": "Secondary Sexual Characteristics",
        "physical.penis": "Penis",
        "physical.gynecomastia.status": "Gynecomastia",
        "physical.gynecomastia.side": "Gynecomastia Side",
        "physical.scars.status": "Scars",
        "physical.scars.location": "Scar Location",
        "physical.vas.left": "Vas Left",
        "physical.vas.right": "Vas Right",
        "physical.testes.left.volume": "Left Testis Volume",
        "physical.testes.left.consistency": "Left Testis Consistency",
        "physical.testes.right.volume": "Right Testis Volume",
        "physical.testes.right.consistency": "Right Testis Consistency",
        "physical.epididymis": "Epididymis",
        "physical.spermaticCords.status": "Spermatic Cord",
        "physical.spermaticCords.grade": "Spermatic Cord Grade",
        "physical.rectal.status": "Rectal Exam",
        "physical.rectal.findings": "Rectal Findings",
      },
    },
    investigations: {
      title: "Investigations",
      fields: {
        "investigations.fsh.done": "FSH done?",
        "investigations.fsh.value": "FSH value",
        "investigations.lh.done": "LH done?",
        "investigations.lh.value": "LH value",
        "investigations.te.value": "TE",
        "investigations.testosterone.value": "Testosterone",
        "investigations.estradiol.value": "Estradiol",
        "investigations.prolactin.done": "Prolactin done?",
        "investigations.prolactin.value": "Prolactin value",
        "investigations.asa.result": "ASA",
        "investigations.viability.result": "Viability",
        "investigations.spermFunction.result": "Sperm Function",
        "investigations.prostaticFluid.result": "Prostatic Fluid",
        "investigations.semenCulture.result": "Semen Culture",
        "investigations.urineCulture.result": "Urine Culture",
        "investigations.usg.findings": "USG Findings",
        "investigations.trus.findings": "TRUS Findings",
        "investigations.biopsy.histology": "Biopsy Histology",
        "investigations.hp.done": "17-Hydroxy Progesterone",
        "investigations.hp.value": "17-Hydroxy Progesterone Value",
        "investigations.ib.done": "1Inhibin B",
        "investigations.ib.value": "Inhibin B Value",
        "investigations.amh.done": "AMH",
        "investigations.amh.value": "AMH Value",
      },
    },
    treatment: {
      title: "Diagnosis & Treatment Plan",
      fields: {
        "treatment.final": "Final Diagnosis",
        "treatment.lifestyleModifications": "Lifestyle Modifications",
        "treatment.duration": "Treatment Duration",
        "treatment.investigations": "Further Investigations Planned",
        "treatment.drugs": "Drugs",
      },
    },
    final: {
      title: "Final",
      fields: {
        "final.notes": "Notes",
        "final.approvedBy": "Approved By",
      },
    },
  };

  const maleSexualDysfunctionFieldConfig = {
    demographics: {
      title: "Patient Demographics",
      fields: {
        "demographics.fullName": "Full Name",
        "demographics.dateOfBirth": "Date of Birth",
        "demographics.age": "Age (in years)",
        "demographics.gender": "Gender",
        "demographics.firstVisit": "Date of First Visit",
        "demographics.contact": "Contact Information",
        "demographics.address": "Address / Pin code (optional)",
        "demographics.maritalStatus": "Marital Status",
        "demographics.durationMarriage": "Duration of Marriage (years)",
        "demographics.education": "Education Level",
        "demographics.occupation": "Occupation",
        "demographics.weight": "Weight (kg)",
        "demographics.height": "Height (cm)",
        "demographics.bmi": "BMI",
      },
    },
    physical: {
      title: "Physical Examination",
      fields: {
        "physical.generalAppearance": "General Appearance",
        "physical.secondarySex": "Secondary Sexual Characteristics",
        "physical.penis": "Penis",
        "physical.gynecomastia.status": "Gynecomastia",
        "physical.gynecomastia.side": "Gynecomastia Side",
        "physical.scars.status": "Scars",
        "physical.scars.location": "Scar Location",
        "physical.vas.left": "Vas Left",
        "physical.vas.right": "Vas Right",
        "physical.testes.left.volume": "Left Testis Volume",
        "physical.testes.left.consistency": "Left Testis Consistency",
        "physical.testes.right.volume": "Right Testis Volume",
        "physical.testes.right.consistency": "Right Testis Consistency",
        "physical.epididymis": "Epididymis",
        "physical.spermaticCords.status": "Spermatic Cord",
        "physical.spermaticCords.grade": "Spermatic Cord Grade",
        "physical.rectal.status": "Rectal Exam",
        "physical.rectal.findings": "Rectal Findings",
      },
    },
    medical: {
      title: "Medical History",
      fields: {
        "medical.diabetes.status": "Diabetes Mellitus",
        "medical.diabetes.comments": "Diabetes Comments",
        "medical.hypertension.status": "Hypertension",
        "medical.hypertension.comments": "Hypertension Comments",
        "medical.thyroid.status": "Thyroid Disorders",
        "medical.thyroid.comments": "Thyroid Comments",
        "medical.cardiovascular.status": "Cardiovascular Disease",
        "medical.cardiovascular.comments": "Cardiovascular Comments",
        "medical.neurological.status": "Neurological Disorders",
        "medical.neurological.comments": "Neurological Comments",
        "medical.psychiatric.status": "Psychiatric Conditions",
        "medical.psychiatric.comments": "Psychiatric Comments",
        "medical.hormonal.status": "Hormonal Disorders",
        "medical.hormonal.comments": "Hormonal Comments",
        "medical.stis.status": "History of STIs",
        "medical.stis.type": "STI Type",
        "medical.stis.year": "STI Year",
        "medical.kidney.status": "Chronic Kidney Disease",
        "medical.kidney.comments": "Kidney Comments",
        "medical.liver.status": "Liver Disease",
        "medical.liver.comments": "Liver Comments",
        "medical.genitalInfections.status": "Past/Persistent Genital Infections",
        "medical.genitalInfections.specify": "Genital Infections Specify",
        "medical.otherChronic.status": "Other Chronic Illnesses",
        "medical.otherChronic.specify": "Other Chronic Specify",
      },
    },
    surgical: {
      title: "Surgical History",
      fields: {
        "surgical.varicocele.status": "Varicocele",
        "surgical.varicocele.year": "Varicocele Year",
        "surgical.hernia.status": "Hernia Repair (Inguinal/Scrotal)",
        "surgical.hernia.year": "Hernia Year",
        "surgical.prostate.status": "Prostate Surgery/TURP",
        "surgical.prostate.year": "Prostate Year",
        "surgical.testicular.status": "Testicular Surgery",
        "surgical.testicular.year": "Testicular Year",
        "surgical.trauma.status": "Pelvic or Genital Trauma",
        "surgical.trauma.year": "Trauma Year",
        "surgical.vasectomy.status": "Vasectomy",
        "surgical.vasectomy.year": "Vasectomy Year",
        "surgical.otherUrogenital.status": "Other Urogenital Surgeries",
        "surgical.otherUrogenital.specify": "Other Urogenital Specify",
        "surgical.otherMajor.status": "Other Major Surgeries (non-urogenital)",
        "surgical.otherMajor.specify": "Other Major Specify",
      },
    },
    lifestyle: {
      title: "Lifestyle History",
      fields: {
        "lifestyle.drugUse.status": "Recreational Drug Use",
        "lifestyle.drugUse.substance": "Drug Use Substance",
        "lifestyle.steroids.status": "Anabolic Steroid Use",
        "lifestyle.steroids.duration": "Steroid Duration/Frequency",
        "lifestyle.exposure.status": "Occupational Exposure to Heat/Radiation",
        "lifestyle.exposure.details": "Exposure Job Role/Type",
        "lifestyle.stress.status": "Psychological Stress (Persistent/High)",
        "lifestyle.stress.details": "Stress Details",
        "lifestyle.sleep.status": "Sleep Disturbances/Disorders",
        "lifestyle.sleep.details": "Sleep Details",
        "lifestyle.sedentary.status": "Sedentary Lifestyle",
        "lifestyle.sedentary.activity": "Daily Physical Activity",
        "lifestyle.enhancement.status": "Use of Sexual Enhancement Substances",
        "lifestyle.enhancement.type": "Enhancement Type",
        "lifestyle.pornography.status": "Pornography Addiction/Excessive Use",
        "lifestyle.pornography.impact": "Pornography Frequency or Impact",
      },
    },
    sexual: {
      title: "Sexual Function",
      fields: {
        "sexual.currentRigidity": "Current erection rigidity (0-100%)",
        "sexual.bestRigidity": "Best achievable rigidity (%)",
        "sexual.duration": "Duration of erection (minutes)",
        "sexual.morningErections": "Do you get morning erections?",
        "sexual.morningBetter": "Are morning erections better/longer than during intercourse?",
        "sexual.lastMorningErection": "Date of last morning erection",
        "sexual.overnightErections": "Do you get overnight erections?",
        "sexual.overnightRigidity": "Rigidity of overnight erections (%)",
        "sexual.losesRigidity": "Does erection lose rigidity during intercourse?",
        "sexual.staysErect": "Does it stay erect until immediately after penetration?",
        "sexual.curvature": "Erection curvature",
        "sexual.numbness": "Numbness or unusual penile sensation?",
        "sexual.numbnessDetails": "Numbness Details",
        "sexual.edOnset": "Onset of ED symptoms",
        "sexual.edDuration": "Duration since ED began",
        "sexual.significantEvent": "Significant event or medication change at onset?",
        "sexual.eventDetails": "Event Details",
        "sexual.lastNormalErection": "Last time erection was normal",
        "sexual.betterDuring": "Erections better during:",
        "sexual.masturbationRigidity": "Rigidity during masturbation vs intercourse",
        "sexual.problemType": "Problem with:",
        "sexual.progression": "ED progression:",
        "sexual.dailyVariation": "Daily variation in erection quality",
        "sexual.trauma": "History of sexual trauma",
        "sexual.traumaDetails": "Trauma Details",
        "sexual.ejaculationRigidity": "Rigidity at the time of ejaculation (%)",
        "sexual.libido": "Libido Status",
        "sexual.desiredFrequency": "If ED wasn't a problem, desired intercourse frequency (per week)",
        "sexual.partnerKnows": "Does your partner know you're seeking treatment?",
        "sexual.partnerSupportive": "Is your partner supportive or encouraging?",
        "sexual.partnerWilling": "Would they be willing to join treatment if needed?",
        "sexual.initiates": "Who usually initiates intercourse?",
        "sexual.currentAttempts": "Current intercourse attempts",
        "sexual.attemptsFrequency": "Attempts Frequency",
        "sexual.relationshipImpact": "If untreated, what impact might ED have on your relationship?",
        "sexual.previousTreatments": "Previous treatments for ED tried?",
        "sexual.treatmentDetails": "Treatment Details",
        "sexual.contraceptive": "Current contraceptive method used (if any)",
        "sexual.contraceptiveOther": "Other contraceptive method",
        "sexual.satisfiedWith65": "Would patient be satisfied with 65-75% rigidity for 10-15 min?",
        "sexual.successfulOutcome": "If not, what would be considered a successful treatment outcome?",
      },
    },
    semen: {
      title: "Semen Analysis (as per WHO 2010)",
      fields: {
        "semen.collectionDate": "Date of Collection",
        "semen.abstinence": "Abstinence (days)",
        "semen.sampleStatus": "Sample Status",
        "semen.timeToAnalysis": "Time to analysis (mins)",
        "semen.volume": "Volume (mL)",
        "semen.concentration": "Sperm Concentration (×10⁶/mL)",
        "semen.motility": "Total motility (%)",
        "semen.morphology": "Morphology normal forms (%)",
        "semen.pH": "pH (optional)",
        "semen.liquefication": "Liquefication time (mins)",
      },
    },
    hormonal: {
      title: "Hormonal Profile",
      fields: {
        "hormonal.testosterone.done": "Total Testosterone",
        "hormonal.testosterone.date": "Testosterone Date of Test",
        "hormonal.testosterone.value": "Testosterone Patient Value",
        "hormonal.testosterone.interpretation": "Testosterone Interpretation",
        "hormonal.fsh.done": "FSH (Follicle Stimulating Hormone)",
        "hormonal.fsh.date": "FSH Date of Test",
        "hormonal.fsh.value": "FSH Patient Value",
        "hormonal.fsh.interpretation": "FSH Interpretation",
        "hormonal.lh.done": "LH (Luteinizing Hormone)",
        "hormonal.lh.date": "LH Date of Test",
        "hormonal.lh.value": "LH Patient Value",
        "hormonal.lh.interpretation": "LH Interpretation",
        "hormonal.prolactin.done": "Prolactin",
        "hormonal.prolactin.date": "Prolactin Date of Test",
        "hormonal.prolactin.value": "Prolactin Patient Value",
        "hormonal.prolactin.interpretation": "Prolactin Interpretation",
        "hormonal.tsh.done": "TSH (Thyroid Stim. Hormone)",
        "hormonal.tsh.date": "TSH Date of Test",
        "hormonal.tsh.value": "TSH Patient Value",
        "hormonal.tsh.interpretation": "TSH Interpretation",
        "hormonal.estradiol.done": "Estradiol (if done)",
        "hormonal.estradiol.date": "Estradiol Date of Test",
        "hormonal.estradiol.value": "Estradiol Patient Value",
        "hormonal.estradiol.interpretation": "Estradiol Interpretation",
        "hormonal.shbg.done": "SHBG (optional)",
        "hormonal.shbg.date": "SHBG Date of Test",
        "hormonal.shbg.value": "SHBG Patient Value",
        "hormonal.shbg.interpretation": "SHBG Interpretation",
        "hormonal.hp.done": "17-Hydroxy Progesterone (optional)",
        "hormonal.hp.date": "17-Hydroxy Progesterone Date of Test",
        "hormonal.hp.value": "17-Hydroxy Progesterone Patient Value",
        "hormonal.hp.interpretation": "17-Hydroxy Progesterone Interpretation",
        "hormonal.ib.done": "Inhibin B (optional)",
        "hormonal.ib.date": "Inhibin B Date of Test",
        "hormonal.ib.value": "Inhibin B Patient Value",
        "hormonal.ib.interpretation": "Inhibin B Interpretation",
        "hormonal.amh.done": "AMH (optional)",
        "hormonal.amh.date": "AMH Date of Test",
        "hormonal.amh.value": "AMH Patient Value",
        "hormonal.amh.interpretation": "AMH Interpretation",
      },
    },
    scoring: {
      title: "Scoring Scales",
      fields: {
        "scoring.ehs.score1": "Erection Hardness Score 1: Penis is larger but not hard",
        "scoring.ehs.score2": "Erection Hardness Score 2: Penis is hard but not hard enough for penetration",
        "scoring.ehs.score3": "Erection Hardness Score 3: Penis is hard enough for penetration but not completely hard",
        "scoring.ehs.score4": "Erection Hardness Score 4: Penis is completely hard and fully rigid",
        "scoring.iief.q1": "IIEF Q1: How often were you able to get an erection during sexual activity?",
        "scoring.iief.q2": "IIEF Q2: When you had erections with sexual stimulation, how often were your erections hard enough for penetration?",
        "scoring.iief.q3": "IIEF Q3: When you attempted intercourse, how often were you able to penetrate (enter) your partner?",
        "scoring.iief.q4": "IIEF Q4: During sexual intercourse, how often were you able to maintain your erection after you had penetrated (entered) your partner?",
        "scoring.iief.q5": "IIEF Q5: During sexual intercourse, how difficult was it to maintain your erection to completion of intercourse?",
        "scoring.iief.q6": "IIEF Q6: How many times have you attempted sexual intercourse?",
        "scoring.iief.q7": "IIEF Q7: When you attempted sexual intercourse, how often was it satisfactory for you?",
        "scoring.iief.q8": "IIEF Q8: How much have you enjoyed sexual intercourse?",
        "scoring.iief.q9": "IIEF Q9: When you had sexual stimulation or intercourse, how often did you ejaculate?",
        "scoring.iief.q10": "IIEF Q10: When you had sexual stimulation or intercourse, how often did you have the feeling of orgasm or climax?",
        "scoring.iief.q11": "IIEF Q11: How often have you felt sexual desire?",
        "scoring.iief.q12": "IIEF Q12: How would you rate your level of sexual desire?",
        "scoring.iief.q13": "IIEF Q13: How satisfied have you been with your overall sex life?",
        "scoring.iief.q14": "IIEF Q14: How satisfied have you been with your sexual relationship with your partner?",
        "scoring.iief.q15": "IIEF Q15: How do you rate your confidence that you could get and keep an erection?",
      },
    },
    imaging: {
      title: "Imaging & Diagnostics",
      fields: {
        "imaging.scrotalUltrasound.done": "Scrotal Ultrasound",
        "imaging.scrotalUltrasound.date": "Scrotal Ultrasound Date",
        "imaging.scrotalUltrasound.findings": "Scrotal Ultrasound Findings/Remarks",
        "imaging.penileDoppler.done": "Penile Doppler (if done)",
        "imaging.penileDoppler.date": "Penile Doppler Date",
        "imaging.penileDoppler.findings": "Penile Doppler Findings/Remarks",
        "imaging.otherImaging.done": "Other imaging (e.g. MRI, CT)",
        "imaging.otherImaging.type": "Other Imaging Type",
        "imaging.otherImaging.date": "Other Imaging Date",
        "imaging.otherImaging.findings": "Other Imaging Findings",
        "imaging.urologicalExam.done": "Urological Exam (if applicable)",
        "imaging.urologicalExam.date": "Urological Exam Date",
        "imaging.urologicalExam.findings": "Urological Exam Findings/Remarks",
        "imaging.sot.done": "Sildenafil Office Test",
        "imaging.sot.date": "Sildenafil Office Test Date",
        "imaging.sot.findings": "Sildenafil Office Test Findings/Remarks",
        "imaging.ici.done": "ICI Test",
        "imaging.ici.date": "ICI Test Date",
        "imaging.ici.findings": "ICI Test Findings/Remarks",
      },
    },
    psychological: {
      title: "Psychological Screening",
      fields: {
        "psychological.phq9.score": "PHQ-9 (Patient Health Questionnaire-9 item scale) Depression screening",
        "psychological.phq9.interpretation": "PHQ-9 Interpretation",
        "psychological.gad7.score": "GAD-7 Score (Generalized Anxiety Disorder-7 Item scale) Anxiety Screening",
        "psychological.gad7.interpretation": "GAD-7 Interpretation",
        "psychological.stressLevel": "Perceived Stress Level",
        "psychological.emotionalIssues": "Emotional issues related to infertility or ED?",
        "psychological.emotionalIssuesDetails": "If yes, specify",
        "psychological.referral": "Referral to mental health professional?",
        "psychological.referralStatus": "Referral Status",
      },
    },
    treatment: {
      title: "Diagnosis & Treatment Plan",
      fields: {
        "treatment.final": "Final Diagnosis",
        "treatment.lifestyleModifications": "Lifestyle Modifications",
        "treatment.duration": "Treatment Duration",
        "treatment.investigations": "Further Investigations Planned",
        "treatment.drugs": "Drugs",
      },
    },
    followup: {
      title: "Follow-up Plan",
      fields: {
        "followup.nextVisit": "Next Scheduled Visit",
        "followup.referral": "Referral Advised",
        "followup.compliance": "Patient Compliance and Motivation",
        "followup.remarks": "General Remarks",
      },
    },
  };

// Utility: safely access nested value
const getValueByPath = (obj: any, path: string) => {
  return path.split(".").reduce((acc, key) => acc?.[key], obj) ?? "";
};

export const exportdatatoCSV = (patients: any[], condition: string | undefined) => {
  const fieldConfig = condition === 'male_infertility' 
    ? maleInfertilityFieldConfig 
    : maleSexualDysfunctionFieldConfig;
    
  if (!patients || patients.length === 0) {
    alert("No patient data available to export.");
    return;
  }

  // Prepare data array
  const data: any[][] = [];

  // Row 1: Section titles
  const sectionTitles: any[] = [];
  const merges: any[] = [];
  let colIndex = 0;

  sectionTitles.push("Patient Details");
  // No merge needed for single column, but we'll track it
  colIndex += 2;

  merges.push({
    s: { r: 0, c: 0 },  // start
    e: { r: 0, c: 1 }  // end
  });

  for (let i = 1; i < 2; i++) {
    sectionTitles.push("");
  }

  Object.values(fieldConfig).forEach((section: any) => {
    const fieldCount = Object.keys(section.fields).length;
    sectionTitles.push(section.title);
    
    // Add merge range for this section title
    if (fieldCount > 1) {
      merges.push({
        s: { r: 0, c: colIndex },  // start
        e: { r: 0, c: colIndex + fieldCount - 1 }  // end
      });
    }
    
    // Add empty cells for remaining columns in this section
    for (let i = 1; i < fieldCount; i++) {
      sectionTitles.push("");
    }
    
    colIndex += fieldCount;
  });
  data.push(sectionTitles);

  // Row 2: Field labels
  const headers: any[] = [];
  headers.push("Id");
  headers.push("Scheduled Date")
  Object.values(fieldConfig).forEach((section: any) => {
    Object.values(section.fields).forEach((label: any) => {
      headers.push(label);
    });
  });
  data.push(headers);

  // Row 3+: Patient data
  patients.forEach((patient: any) => {
    console.log(patient);
    const row: any[] = [];
    row.push(patient?.fullName + " - " + patient?.title);
    row.push(patient?.scheduled_date)
    Object.values(fieldConfig).forEach((section: any) => {
      Object.keys(section.fields).forEach((path) => {
        const value = getValueByPath(patient?.crf_data, path);
        if(path === 'treatment.drugs') {
            let rowString = ''
            value?.forEach((v: any, index: any) => {
              rowString += `Drug ${index+1} - Name: ${v?.drugName} | Dose: ${v?.dose} | Regimen: ${v?.regimen} || `
            })
            row.push(rowString)
        }
        else {
          row.push(value === "" ? "" : value);
        }
      });
    });
    data.push(row);
  });

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Apply merges
  ws['!merges'] = merges;

  // Style the section title row (center align, bold, background color)
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!ws[cellAddress]) continue;
    
    ws[cellAddress].s = {
      alignment: { horizontal: 'center', vertical: 'center' },
      font: { bold: true, sz: 12 },
      fill: { fgColor: { rgb: "D3D3D3" } }
    };
  }

  // Style the header row (center align, bold)
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({ r: 1, c: C });
    if (!ws[cellAddress]) continue;
    
    ws[cellAddress].s = {
      alignment: { horizontal: 'center', vertical: 'center' },
      font: { bold: true }
    };
  }

  // Set column widths
  const colWidths = headers.map(() => ({ wch: 15 }));
  ws['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Patient Data');

  // Generate Excel file and trigger download
  XLSX.writeFile(wb, `patients_data_${condition || 'export'}.xlsx`);
};