import * as XLSX from "xlsx";
// import {PDFParse} from 'pdf-parse';
import { maleInfertilityMapping, maleSexualDysfunctionMapping } from "./fieldMapping";


const parseDrugsString = (drugString: string) => {
  if (!drugString || typeof drugString !== 'string') return [];
  
  // Split by "||" to separate individual drugs
  const drugEntries = drugString.split('||').filter(entry => entry.trim());
  
  const drugs = drugEntries.map(entry => {
    // Extract drug name
    const nameMatch = entry.match(/Name:\s*([^|]+)/i);
    const drugName = nameMatch ? nameMatch[1].trim() : '';
    
    // Extract dose
    const doseMatch = entry.match(/Dose:\s*([^|]+)/i);
    const dose = doseMatch ? doseMatch[1].trim() : '';
    
    // Extract regimen
    const regimenMatch = entry.match(/Regimen:\s*([^|]+)/i);
    const regimen = regimenMatch ? regimenMatch[1].trim() : '';
    
    return { drugName, dose, regimen };
  }).filter(drug => drug.drugName || drug.dose || drug.regimen); // Filter out empty drugs
  
  return drugs.length > 0 ? drugs : [{drugName: '', dose: '', regimen: ''}];
};

// Convert Excel rows to CRF JSON
export const parseExcelToCRF = (
  file: File,
  type: "male_infertility" | "male_sexual_dysfunction"
): Promise<Record<string, any>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(ws);

				const crfType = Object.values(rows?.[0]).some(
					(value) => value.includes("USG Findings")
				);

        const mapping =
					crfType 
            ? maleInfertilityMapping
            : maleSexualDysfunctionMapping;
				

        const transformed = rows.map((row, idx) => {
           if(idx>0) {
            const crfObj: Record<string, any> = {};
            Object.entries(row).forEach(([header, value]) => {
              const field = mapping[rows[0]?.[header]];
              if (field) {
                // support dot notation assignment
                if(field === 'treatment.drugs') {
                  value = parseDrugsString(value)
                }
                const parts = field.split(".");
                let current = crfObj;
                parts.forEach((p, idx) => {
                  if (idx === parts.length - 1) {
                    current[p] = value;
                  } else {
                    current[p] = current[p] || {};
                    current = current[p];
                  }
                });
              }
            });
            console.log(crfObj)
            return {crfType, ...crfObj};
           } 
        });

        resolve(transformed);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsBinaryString(file);
  });
};



// /**
//  * Helper function to set nested object values using dot notation path
//  */
// const setNestedValue = (obj, path, value) => {
//   const keys = path.split('.');
//   let current = obj;
  
//   for (let i = 0; i < keys.length - 1; i++) {
//     if (!current[keys[i]]) {
//       current[keys[i]] = {};
//     }
//     current = current[keys[i]];
//   }
  
//   current[keys[keys.length - 1]] = value;
// };

// /**
//  * Parse PDF buffer and extract text content
//  */
// const parsePDFBuffer = async (pdfBuffer) => {
//   const parser = new PDFParse(pdfBuffer);
//   const result = await parser.getText();
//   console.log("result", result)
//   return result.text;
// };

// /**
//  * Extract field values from PDF text using pattern matching
//  */
// const extractFieldFromPDF = (pdfText, fieldName) => {
//   // Create regex pattern to match field name and its value
//   const pattern = new RegExp(`${fieldName}[:\\s]+(.*?)(?=\\n|$)`, 'i');
//   const match = pdfText.match(pattern);
  
//   if (match && match[1]) {
//     return match[1].trim();
//   }
  
//   return null;
// };

// /**
//  * Transform PDF data to CRF format
//  */
// export const transformPDFtoCRF = async (pdfBuffer, patientId, scheduledDate) => {
//   try {
//     // Parse PDF
//     const pdfText = await parsePDFBuffer(pdfBuffer);
//     console.log("pdfText", pdfText)
    
//     // Initialize CRF data object
//     const crfData = {};
    
//     // Add patient details and scheduled date
//     const reversedMapping = {};
//     for (const [label, path] of Object.entries(maleInfertilityMapping)) {
//       reversedMapping[label] = path;
//     }

//     console.log(reversedMapping)
    
//     // Set patient ID and scheduled date
//     setNestedValue(crfData, 'patientDetails', patientId);
//     setNestedValue(crfData, 'scheduledDate', scheduledDate);
    
//     // Extract and map all fields from PDF
//     for (const [fieldLabel, crfPath] of Object.entries(maleInfertilityMapping)) {
//       // Skip special fields
//       if (fieldLabel === 'Id' || fieldLabel === 'Scheduled Date') continue;
      
//       // Extract value from PDF
//       const value = extractFieldFromPDF(pdfText, fieldLabel);
      
//       if (value) {
//         setNestedValue(crfData, crfPath, value);
//       }
//     }
    
//     return {
//       success: true,
//       data: crfData
//     };
    
//   } catch (error) {
//     return {
//       success: false,
//       error: error.message
//     };
//   }
// };

// /**
//  * Sample output based on the provided PDF
//  */
// export const sampleCRFOutput = {
//   "patientDetails": "P001",
//   "scheduledDate": "2025-03-12",
//   "demographics": {
//     "firstVisit": "03/12/2025",
//     "fullName": "Jatu",
//     "age": "24",
//     "sex": "Male",
//     "maritalStatus": "Married",
//     "durationMarriage": "2",
//     "occupation": "Student",
//     "education": "Graduate",
//     "bmi": {
//       "height": "180",
//       "weight": "84",
//       "value": "76"
//     },
//     "smoking": {
//       "status": "Never",
//       "cigarettesPerDay": null
//     },
//     "alcohol": {
//       "status": "Never",
//       "unitsPerWeek": null
//     },
//     "substance": "None",
//     "substanceDetails": null,
//     "congenital": {
//       "status": "None",
//       "details": null
//     },
//     "medicalHistory": "None",
//     "medicalHistoryDetails": null,
//     "surgery": {
//       "status": "None",
//       "details": null
//     },
//     "previousFertility": {
//       "status": "None",
//       "details": null
//     }
//   },
//   "physical": {
//     "generalAppearance": "Normal",
//     "secondarySex": "Normal",
//     "penis": "Normal",
//     "gynecomastia": {
//       "status": "Absent",
//       "side": null
//     },
//     "testes": {
//       "right": {
//         "volume": null,
//         "consistency": "Normal"
//       },
//       "left": {
//         "volume": null,
//         "consistency": "Normal"
//       }
//     },
//     "epididymis": "Normal",
//     "vas": {
//       "right": "Present",
//       "left": "Present"
//     },
//     "spermaticCords": {
//       "status": "Normal",
//       "grade": null
//     },
//     "scars": {
//       "status": "None",
//       "location": null
//     },
//     "rectal": {
//       "status": "Not done",
//       "findings": null
//     }
//   },
//   "history": {
//     "duration": null,
//     "consanguinity": "No",
//     "contraception": "Never used",
//     "contraceptionMethod": null,
//     "lubricants": {
//       "status": "None",
//       "type": null
//     },
//     "frequency": null,
//     "regularity": "Regular",
//     "ovulatoryKnowledge": "No",
//     "ejaculateVolume": "Normal",
//     "erectileDysfunction": {
//       "status": "No",
//       "details": null
//     },
//     "ejaculatoryDysfunction": "None",
//     "std": {
//       "status": "No",
//       "details": null
//     },
//     "febrile": {
//       "status": "No",
//       "details": null
//     },
//     "chronicConditions": "None",
//     "therapy": {
//       "type": "None",
//       "details": null
//     },
//     "testicular": {
//       "status": "No",
//       "details": null
//     },
//     "surgery": {
//       "type": "None"
//     },
//     "congenitalSelf": "None",
//     "family": "None",
//     "environment": "None",
//     "lifestyle": "None"
//   },
//   "semen": {
//     "pre": {
//       "abstinenceDays": null,
//       "collectedAtLab": "Yes",
//       "completeCollection": {
//         "status": "Yes",
//         "missing": null
//       },
//       "collectionTime": null,
//       "deliveryTime": null,
//       "infection": "No",
//       "medications": "No",
//       "medicationDetails": null
//     },
//     "macro": {
//       "volume": null,
//       "appearance": "Normal",
//       "viscosity": "Normal",
//       "liquefaction": "Normal",
//       "treatment": null,
//       "ph": null,
//       "agglutination": "None"
//     },
//     "micro": {
//       "concentration": null,
//       "totalCount": null,
//       "countingError": null,
//       "motility": {
//         "a": null,
//         "b": null,
//         "c": null,
//         "d": null
//       },
//       "totalMotile": null,
//       "progressive": null,
//       "vitality": null
//     },
//     "morphology": {
//       "normal": null,
//       "abnormalHeads": null,
//       "abnormalMid": null,
//       "abnormalTails": null,
//       "erc": null,
//       "tzi": null
//     },
//     "cells": {
//       "wbcs": null
//     },
//     "glands": {
//       "zinc": null,
//       "fructose": null,
//       "glucosidase": null
//     },
//     "timing": {
//       "begun": null,
//       "toExam": null
//     }
//   },
//   "investigations": {
//     "fsh": {
//       "value": null
//     },
//     "lh": {
//       "value": null
//     },
//     "testosterone": {
//       "value": null
//     },
//     "estradiol": {
//       "value": null
//     },
//     "te": {
//       "value": null
//     },
//     "prolactin": {
//       "value": null
//     },
//     "urineCulture": {
//       "result": null
//     },
//     "semenCulture": {
//       "result": null
//     },
//     "prostaticFluid": {
//       "result": null
//     },
//     "asa": {
//       "result": null
//     },
//     "viability": {
//       "result": null
//     },
//     "spermFunction": {
//       "result": null
//     },
//     "usg": {
//       "findings": null
//     },
//     "trus": {
//       "findings": null
//     },
//     "biopsy": {
//       "histology": null
//     }
//   },
//   "final": {
//     "notes": null,
//     "approvedBy": null
//   }
// };

// // Usage example:
// /*
// import fs from 'fs';

// // Read PDF file
// const pdfBuffer = fs.readFileSync('sample_infertility.pdf');

// // Transform to CRF format
// const result = await transformPDFtoCRF(
//   pdfBuffer, 
//   'P001', 
//   '2025-03-12'
// );

// if (result.success) {
//   console.log('CRF Data:', JSON.stringify(result.data, null, 2));
  
//   // Now you can save to database
//   const { data, insertError } = await createPatient({
//     patient_id: result.data.patientDetails,
//     doctor_id: 'doctor_id_here',
//     condition_type: 'male_infertility',
//     full_name: result.data.demographics.fullName,
//     age: parseInt(result.data.demographics.age),
//     first_visit_date: result.data.demographics.firstVisit,
//     crf_data: result.data
//   });
// } else {
//   console.error('Error:', result.error);
// }
// */
