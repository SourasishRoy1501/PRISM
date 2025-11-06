import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { FormSection, FormInput, FormSelect, FormRadioGroup, getNestedValue, setNestedValue } from '@/components/form/FormControls'
import { UserCircleIcon, HeartIcon, ClipboardDocumentListIcon, BeakerIcon, CheckBadgeIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { MaleInfertilityInitialState } from './male_infertility_initial_state'
import { usePatient } from '@/hooks/PatientContext'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function MaleInfertilityCRF({ user, isFirstTime=false, selectedDate="", isEdit=false, crfData=null, followupId="", isPreview=false}: { user: any, isFirstTime ?: boolean, selectedDate ?: string, isEdit ?: boolean, crfData ?: Object, followupId ?: string | undefined, isPreview?: boolean }) {
  const router = useRouter()
  const [form, setForm] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [tab, setTab] = useState<'demographics' | 'physical' | 'history' | 'semen' | 'investigations' | 'treatment' | 'final'>('demographics')

  const { patientDetails } = usePatient()

  const allTabs = ['demographics', 'physical', 'history', 'semen', 'investigations', 'treatment', 'final']

  useEffect(() => {
    if(patientDetails) {
      setForm(patientDetails?.crf_data)
    } else if(crfData && isEdit) {
      setForm(crfData)
    }
    else {
      setForm(MaleInfertilityInitialState)
    }
  }, [])

  useEffect(() => {
    if(crfData && !isEdit) {
      setForm(crfData)
      setSuccess(null)
    }
  }, [crfData])

  const update = useCallback((path: string, value: any) => {
    setForm((prev: any) => setNestedValue(prev, path, value))
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)
    if(!isEdit) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/crf/male_infertility`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: form, user_id: user.id, is_first_time: isFirstTime, condition_type: 'male_infertility', selectedDate: selectedDate, patient_id: patientDetails?.patient_id })
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || 'Failed to save')
        setSuccess('Saved successfully')
        if(!isPreview) {
          router.push('/patients')
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setSaving(false)
      }
    }
    else {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/crf/edit`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ crf_data: form, followupId: followupId })
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || 'Failed to edit')
        setSuccess('Edited successfully')
        window.location.reload();
      } catch (err: any) {
        setError(err.message)
      } finally {
        setSaving(false)
      }
    }
  }

  const tabs = useMemo(() => ([
    { id: 'demographics', title: 'Demographics', icon: UserCircleIcon },
    { id: 'physical', title: 'Physical Exam', icon: HeartIcon },
    { id: 'history', title: 'Medical & Reproductive', icon: ClipboardDocumentListIcon },
    { id: 'semen', title: 'Semen Analysis', icon: BeakerIcon },
    { id: 'investigations', title: 'Optional Investigations', icon: BeakerIcon },
    { id: 'treatment', title: 'Diagnosis & Treatment Plan', icon: ClipboardDocumentListIcon },
    { id: 'final', title: 'Final Notes', icon: CheckBadgeIcon },
  ]) as { id: typeof tab; title: string; icon: any }[], [])

  const TabButton = ({ id, title, Icon }: any) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors flex items-center gap-2 ${
        tab === id ? 'border-teal-500 text-white bg-teal-500/10' : 'border-gray-700 text-gray-300 hover:text-white hover:border-gray-500'
      }`}
    >
      <Icon className="w-4 h-4" />
      {title}
    </button>
  )

  const handlePrev = () => {
    const idx = allTabs.indexOf(tab)
    if(idx>0) {
      setTab(allTabs?.[idx-1])
    }
  }

  const handleNext = () => {
    const idx = allTabs.indexOf(tab)
    if(idx<allTabs.length-1) {
      setTab(allTabs?.[idx+1])
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <main className={`${isEdit ? '' : 'container-page py-8'}`}>
        <div className="max-w-6xl mx-auto">
        {!isEdit && <h1 className="text-4xl font-bold text-white mb-6">Male Infertility Form</h1>}

          {/* Tabs */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {tabs.map(t => (
                <TabButton key={t.id} id={t.id} title={t.title} Icon={t.icon} />
              ))}
            </div>
          </div>

          {error && <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400 text-sm">{error}</div>}
          {success && <div className="mb-4 p-3 bg-emerald-900/20 border border-emerald-500/50 rounded-lg text-emerald-400 text-sm">{success}</div>}

          <form onSubmit={submit} className="space-y-6">
            {tab === 'demographics' && (
              <FormSection title="Patient Demographics">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput label="Date of First Visit" value={getNestedValue(form, 'demographics.firstVisit')} onChange={(v) => update('demographics.firstVisit', v)} placeholder="mm/dd/yyyy" type='date' />
                  <FormInput label="Full Name" value={getNestedValue(form, 'demographics.fullName')} onChange={(v) => update('demographics.fullName', v)} placeholder="Enter full name" />
                  <FormInput label="Age (years)" value={getNestedValue(form, 'demographics.age')} onChange={(v) => update('demographics.age', v)} type="number" />
                  <FormRadioGroup label="Sex" value={getNestedValue(form, 'demographics.sex')} onChange={(v) => update('demographics.sex', v)} options={["Male"]} />
                  <FormRadioGroup label="Marital Status" value={getNestedValue(form, 'demographics.maritalStatus')} onChange={(v) => update('demographics.maritalStatus', v)} options={["Married","Unmarried","Divorced","Widowed"]} />
                  <FormInput label="Duration of Marriage (years)" value={getNestedValue(form, 'demographics.durationMarriage')} onChange={(v) => update('demographics.durationMarriage', v)} />
                  <FormInput label="Occupation" value={getNestedValue(form, 'demographics.occupation')} onChange={(v) => update('demographics.occupation', v)} />
                  <FormSelect label="Education Level" value={getNestedValue(form, 'demographics.education')} onChange={(v) => update('demographics.education', v)} options={["No formal education","Primary","Secondary","Graduate","Postgraduate"]} />
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput label="Weight (kg)" value={getNestedValue(form, 'demographics.bmi.weight')} onChange={(v) => update('demographics.bmi.weight', v)} />
                    <FormInput label="Height (cm)" value={getNestedValue(form, 'demographics.bmi.height')} onChange={(v) => update('demographics.bmi.height', v)} />
                    <FormInput label="BMI" value={getNestedValue(form, 'demographics.bmi.value')} onChange={(v) => update('demographics.bmi.value', v)} />
                  </div>
                  <FormRadioGroup label="Smoking Status" value={getNestedValue(form, 'demographics.smoking.status')} onChange={(v) => update('demographics.smoking.status', v)} options={["Never","Former Smoker","Current Smoker"]} />
                  <FormInput 
                    label="If smoking, cigarettes/day" 
                    value={getNestedValue(form, 'demographics.smoking.cigarettesPerDay')} 
                    onChange={(v) => update('demographics.smoking.cigarettesPerDay', v)} 
                    disabled={!['Former Smoker', 'Current Smoker'].includes(getNestedValue(form, 'demographics.smoking.status'))}
                  />
                  <FormRadioGroup label="Alcohol Intake" value={getNestedValue(form, 'demographics.alcohol.status')} onChange={(v) => update('demographics.alcohol.status', v)} options={["Never","Occasionally","Regularly"]} />
                  <FormInput 
                    label="If alcohol, units/week" 
                    value={getNestedValue(form, 'demographics.alcohol.unitsPerWeek')} 
                    onChange={(v) => update('demographics.alcohol.unitsPerWeek', v)} 
                    disabled={!['Occasionally', 'Regularly'].includes(getNestedValue(form, 'demographics.alcohol.status'))}
                  />
                  <FormSelect label="Substance Use / Drugs" value={getNestedValue(form, 'demographics.substance')} onChange={(v) => update('demographics.substance', v)} options={["None","Recreational drugs","Steroids"]} />
                  <FormInput 
                    label="Substance details" 
                    value={getNestedValue(form, 'demographics.substanceDetails')} 
                    onChange={(v) => update('demographics.substanceDetails', v)} 
                    disabled={getNestedValue(form, 'demographics.substance') === 'None' || !getNestedValue(form, 'demographics.substance')}
                  />
                  <FormRadioGroup label="Known Congenital Abnormalities" value={getNestedValue(form, 'demographics.congenital.status')} onChange={(v) => update('demographics.congenital.status', v)} options={["None","Yes"]} />
                  <FormInput 
                    label="If yes, specify" 
                    value={getNestedValue(form, 'demographics.congenital.details')} 
                    onChange={(v) => update('demographics.congenital.details', v)} 
                    disabled={getNestedValue(form, 'demographics.congenital.status') !== 'Yes'}
                  />
                  <FormSelect label="Medical History" value={getNestedValue(form, 'demographics.medicalHistory')} onChange={(v) => update('demographics.medicalHistory', v)} options={["Hypertension","Diabetes","Thyroid disorder","Other"]} />
                  <FormInput 
                    label="Medical History Details" 
                    value={getNestedValue(form, 'demographics.medicalHistoryDetails')} 
                    onChange={(v) => update('demographics.medicalHistoryDetails', v)} 
                    disabled={!getNestedValue(form, 'demographics.medicalHistory')}
                  />
                  <FormRadioGroup label="History of Surgery" value={getNestedValue(form, 'demographics.surgery.status')} onChange={(v) => update('demographics.surgery.status', v)} options={["None","Yes"]} />
                  <FormInput 
                    label="Surgery Details" 
                    value={getNestedValue(form, 'demographics.surgery.details')} 
                    onChange={(v) => update('demographics.surgery.details', v)} 
                    disabled={getNestedValue(form, 'demographics.surgery.status') !== 'Yes'}
                  />
                  <FormRadioGroup label="Previous Fertility Evaluation/Treatment" value={getNestedValue(form, 'demographics.previousFertility.status')} onChange={(v) => update('demographics.previousFertility.status', v)} options={["None","Yes"]} />
                  <FormInput 
                    label="Previous Fertility Details" 
                    value={getNestedValue(form, 'demographics.previousFertility.details')} 
                    onChange={(v) => update('demographics.previousFertility.details', v)} 
                    disabled={getNestedValue(form, 'demographics.previousFertility.status') !== 'Yes'}
                  />
                </div>
              </FormSection>
            )}
 
            {tab === 'physical' && (
              <FormSection title="Physical Examination">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormSelect label="General Appearance" value={getNestedValue(form, 'physical.generalAppearance')} onChange={(v) => update('physical.generalAppearance', v)} options={["Normal","Obese","Tall with small testes","Other"]} />
                  <FormSelect label="Secondary Sexual Characteristics" value={getNestedValue(form, 'physical.secondarySex')} onChange={(v) => update('physical.secondarySex', v)} options={["Normal","Decreased body hair","Sparse facial hair","Other"]} />
                  <FormRadioGroup label="Gynecomastia" value={getNestedValue(form, 'physical.gynecomastia.status')} onChange={(v) => update('physical.gynecomastia.status', v)} options={["Absent","Present"]} />
                  <FormSelect 
                    label="Gynecomastia Side" 
                    value={getNestedValue(form, 'physical.gynecomastia.side')} 
                    onChange={(v) => update('physical.gynecomastia.side', v)} 
                    options={["Unilateral","Bilateral"]} 
                    disabled={getNestedValue(form, 'physical.gynecomastia.status') !== 'Present'}
                  />
                  <FormSelect label="Penis" value={getNestedValue(form, 'physical.penis')} onChange={(v) => update('physical.penis', v)} options={["Normal","Hypospadias","Epispadias","Chordee","Other"]} />
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="Testes – Right Volume (cc)" value={getNestedValue(form, 'physical.testes.right.volume')} onChange={(v) => update('physical.testes.right.volume', v)} />
                    <FormSelect label="Right Consistency" value={getNestedValue(form, 'physical.testes.right.consistency')} onChange={(v) => update('physical.testes.right.consistency', v)} options={["Normal","Soft","Firm","Small","Mass Present"]} />
                    <FormInput label="Testes – Left Volume (cc)" value={getNestedValue(form, 'physical.testes.left.volume')} onChange={(v) => update('physical.testes.left.volume', v)} />
                    <FormSelect label="Left Consistency" value={getNestedValue(form, 'physical.testes.left.consistency')} onChange={(v) => update('physical.testes.left.consistency', v)} options={["Normal","Soft","Firm","Small","Mass Present"]} />
                  </div>
                  <FormSelect label="Epididymis" value={getNestedValue(form, 'physical.epididymis')} onChange={(v) => update('physical.epididymis', v)} options={["Normal","Flat","Turgid","Nodular"]} />
                  <FormSelect label="Vas Deferens (Right)" value={getNestedValue(form, 'physical.vas.right')} onChange={(v) => update('physical.vas.right', v)} options={["Present","Absent","Thickened","Beaded"]} />
                  <FormSelect label="Vas Deferens (Left)" value={getNestedValue(form, 'physical.vas.left')} onChange={(v) => update('physical.vas.left', v)} options={["Present","Absent","Thickened","Beaded"]} />
                  <FormSelect label="Spermatic Cords" value={getNestedValue(form, 'physical.spermaticCords.status')} onChange={(v) => update('physical.spermaticCords.status', v)} options={["Normal","Varicocele Present"]} />
                  <FormSelect 
                    label="Varicocele Grade" 
                    value={getNestedValue(form, 'physical.spermaticCords.grade')} 
                    onChange={(v) => update('physical.spermaticCords.grade', v)} 
                    options={["I","II","III"]} 
                    disabled={getNestedValue(form, 'physical.spermaticCords.status') !== 'Varicocele Present'}
                  />
                  <FormRadioGroup label="Scars (Inguinal/Scrotal)" value={getNestedValue(form, 'physical.scars.status')} onChange={(v) => update('physical.scars.status', v)} options={["None","Present"]} />
                  <FormInput 
                    label="Scar Location" 
                    value={getNestedValue(form, 'physical.scars.location')} 
                    onChange={(v) => update('physical.scars.location', v)} 
                    disabled={getNestedValue(form, 'physical.scars.status') !== 'Present'}
                  />
                  <FormSelect label="Rectal Examination" value={getNestedValue(form, 'physical.rectal.status')} onChange={(v) => update('physical.rectal.status', v)} options={["Not done","Done"]} />
                  <FormSelect 
                    label="Rectal Findings" 
                    value={getNestedValue(form, 'physical.rectal.findings')} 
                    onChange={(v) => update('physical.rectal.findings', v)} 
                    options={["Normal","Cyst","Dilated Seminal Vesicles","Other"]} 
                    disabled={getNestedValue(form, 'physical.rectal.status') !== 'Done'}
                  />
                </div>
              </FormSection>
            )}

            {tab === 'history' && (
              <FormSection title="Medical and Reproductive History">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput label="Duration of Infertility" value={getNestedValue(form, 'history.duration')} onChange={(v) => update('history.duration', v)} />
                  <FormRadioGroup label="Consanguinity in Marriage" value={getNestedValue(form, 'history.consanguinity')} onChange={(v) => update('history.consanguinity', v)} options={["No","Yes"]} />
                  <FormSelect label="Use of Contraception" value={getNestedValue(form, 'history.contraception')} onChange={(v) => update('history.contraception', v)} options={["Never used","Currently using","Used previously"]} />
                  <FormInput 
                    label="Contraception Method" 
                    value={getNestedValue(form, 'history.contraceptionMethod')} 
                    onChange={(v) => update('history.contraceptionMethod', v)} 
                    disabled={!['Currently using', 'Used previously'].includes(getNestedValue(form, 'history.contraception'))}
                  />
                  <FormSelect label="Use of Lubricants" value={getNestedValue(form, 'history.lubricants.status')} onChange={(v) => update('history.lubricants.status', v)} options={["None","Occasionally","Regularly"]} />
                  <FormInput 
                    label="Lubricant Type" 
                    value={getNestedValue(form, 'history.lubricants.type')} 
                    onChange={(v) => update('history.lubricants.type', v)} 
                    disabled={!['Occasionally', 'Regularly'].includes(getNestedValue(form, 'history.lubricants.status'))}
                  />
                  <FormInput label="Frequency of Sexual Intercourse (times/week)" value={getNestedValue(form, 'history.frequency')} onChange={(v) => update('history.frequency', v)} />
                  <FormRadioGroup label="Regularity" value={getNestedValue(form, 'history.regularity')} onChange={(v) => update('history.regularity', v)} options={["Regular","Irregular"]} />
                  <FormRadioGroup label="Knowledge of Ovulatory Cycle" value={getNestedValue(form, 'history.ovulatoryKnowledge')} onChange={(v) => update('history.ovulatoryKnowledge', v)} options={["Yes","No","Not applicable"]} />
                  <FormSelect label="Ejaculate Volume (Patient reported)" value={getNestedValue(form, 'history.ejaculateVolume')} onChange={(v) => update('history.ejaculateVolume', v)} options={["Normal","Decreased","Absent","Not sure"]} />
                  <FormRadioGroup label="Erectile Dysfunction" value={getNestedValue(form, 'history.erectileDysfunction.status')} onChange={(v) => update('history.erectileDysfunction.status', v)} options={["No","Yes"]} />
                  <FormInput 
                    label="Erectile Dysfunction Details" 
                    value={getNestedValue(form, 'history.erectileDysfunction.details')} 
                    onChange={(v) => update('history.erectileDysfunction.details', v)} 
                    disabled={getNestedValue(form, 'history.erectileDysfunction.status') !== 'Yes'}
                  />
                  <FormSelect label="Ejaculatory Dysfunction" value={getNestedValue(form, 'history.ejaculatoryDysfunction')} onChange={(v) => update('history.ejaculatoryDysfunction', v)} options={["None","Premature","Delayed","Retrograde","Anejaculation"]} />
                  <FormRadioGroup label="Any History of STD / UTI" value={getNestedValue(form, 'history.std.status')} onChange={(v) => update('history.std.status', v)} options={["No","Yes"]} />
                  <FormInput 
                    label="STD/UTI Specify" 
                    value={getNestedValue(form, 'history.std.details')} 
                    onChange={(v) => update('history.std.details', v)} 
                    disabled={getNestedValue(form, 'history.std.status') !== 'Yes'}
                  />
                  <FormRadioGroup label="Past Febrile Illness (e.g. Mumps)" value={getNestedValue(form, 'history.febrile.status')} onChange={(v) => update('history.febrile.status', v)} options={["No","Yes"]} />
                  <FormInput 
                    label="Febrile illness specify" 
                    value={getNestedValue(form, 'history.febrile.details')} 
                    onChange={(v) => update('history.febrile.details', v)} 
                    disabled={getNestedValue(form, 'history.febrile.status') !== 'Yes'}
                  />
                  <FormSelect label="Chronic Medical Conditions" value={getNestedValue(form, 'history.chronicConditions')} onChange={(v) => update('history.chronicConditions', v)} options={["Diabetes Mellitus","Chronic Bronchitis","Tuberculosis","Other"]} />
                  <FormRadioGroup label="History of Chemotherapy / Radiotherapy" value={getNestedValue(form, 'history.therapy.type')} onChange={(v) => update('history.therapy.type', v)} options={["None","Chemotherapy","Radiotherapy"]} />
                  <FormInput 
                    label="When & Why" 
                    value={getNestedValue(form, 'history.therapy.details')} 
                    onChange={(v) => update('history.therapy.details', v)} 
                    disabled={!['Chemotherapy', 'Radiotherapy'].includes(getNestedValue(form, 'history.therapy.type'))}
                  />
                  <FormRadioGroup label="Testicular Torsion / Trauma / Swelling" value={getNestedValue(form, 'history.testicular.status')} onChange={(v) => update('history.testicular.status', v)} options={["No","Yes"]} />
                  <FormInput 
                    label="Testicular history details" 
                    value={getNestedValue(form, 'history.testicular.details')} 
                    onChange={(v) => update('history.testicular.details', v)} 
                    disabled={getNestedValue(form, 'history.testicular.status') !== 'Yes'}
                  />
                  <FormSelect label="History of Surgery" value={getNestedValue(form, 'history.surgery.type')} onChange={(v) => update('history.surgery.type', v)} options={["None","Hernia repair","Orchiopexy","Retroperitoneal surgery","Other"]} />
                  <FormSelect label="Congenital Anomalies (Self)" value={getNestedValue(form, 'history.congenitalSelf')} onChange={(v) => update('history.congenitalSelf', v)} options={["None","Cryptorchidism","Hypospadias","Chordee","Other"]} />
                  <FormSelect label="Family History" value={getNestedValue(form, 'history.family')} onChange={(v) => update('history.family', v)} options={["Infertility","Genetic Disorders","Consanguinity","None"]} />
                  <FormSelect label="Environmental Toxin Exposure" value={getNestedValue(form, 'history.environment')} onChange={(v) => update('history.environment', v)} options={["None","Pesticides","Herbicides","Chronic Heat","Radiation","Other"]} />
                  <FormSelect label="Lifestyle Factors" value={getNestedValue(form, 'history.lifestyle')} onChange={(v) => update('history.lifestyle', v)} options={["Tight undergarments","Frequent sauna use","Laptop on lap","Mobile phone near groin"]} />
                </div>
              </FormSection>
            )}

            {tab === 'semen' && (
              <>
                <FormSection title="Semen Analysis - Pre-Analytical Information">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="Abstinence Period (days)" value={getNestedValue(form, 'semen.pre.abstinenceDays')} onChange={(v) => update('semen.pre.abstinenceDays', v)} />
                    <FormRadioGroup label="Collected at Lab?" value={getNestedValue(form, 'semen.pre.collectedAtLab')} onChange={(v) => update('semen.pre.collectedAtLab', v)} options={["Yes","No"]} />
                    <FormRadioGroup label="Complete Collection?" value={getNestedValue(form, 'semen.pre.completeCollection.status')} onChange={(v) => update('semen.pre.completeCollection.status', v)} options={["Yes","No"]} />
                    <FormInput 
                      label="What was missing" 
                      value={getNestedValue(form, 'semen.pre.completeCollection.missing')} 
                      onChange={(v) => update('semen.pre.completeCollection.missing', v)} 
                      disabled={getNestedValue(form, 'semen.pre.completeCollection.status') !== 'No'}
                    />
                    <FormInput label="Collection Time (hh:mm)" value={getNestedValue(form, 'semen.pre.collectionTime')} onChange={(v) => update('semen.pre.collectionTime', v)} type='time' />
                    <FormInput label="Sample Delivery Time (hh:mm)" value={getNestedValue(form, 'semen.pre.deliveryTime')} onChange={(v) => update('semen.pre.deliveryTime', v)} type='time' />
                    <FormRadioGroup label="Severe Infection/Inflammation in Last 6 Months?" value={getNestedValue(form, 'semen.pre.infection')} onChange={(v) => update('semen.pre.infection', v)} options={["No","Yes"]} />
                    <FormRadioGroup label="Current Medications for Severe/Chronic Disease?" value={getNestedValue(form, 'semen.pre.medications')} onChange={(v) => update('semen.pre.medications', v)} options={["No","Yes"]} />
                    <FormInput 
                      label="Medication Details" 
                      value={getNestedValue(form, 'semen.pre.medicationDetails')} 
                      onChange={(v) => update('semen.pre.medicationDetails', v)} 
                      disabled={getNestedValue(form, 'semen.pre.medications') !== 'Yes'}
                    />
                  </div>
                </FormSection>

                <FormSection title="Semen Analysis - Macroscopic Examination">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="Ejaculate Volume (mL)" value={getNestedValue(form, 'semen.macro.volume')} onChange={(v) => update('semen.macro.volume', v)} />
                    <FormSelect label="Appearance" value={getNestedValue(form, 'semen.macro.appearance')} onChange={(v) => update('semen.macro.appearance', v)} options={["Normal (1)","Abnormal (2)"]} />
                    <FormSelect label="Viscosity" value={getNestedValue(form, 'semen.macro.viscosity')} onChange={(v) => update('semen.macro.viscosity', v)} options={["Normal (1)","Abnormal (2)"]} />
                    <FormSelect label="Liquefaction" value={getNestedValue(form, 'semen.macro.liquefaction')} onChange={(v) => update('semen.macro.liquefaction', v)} options={["Normal (1)","Abnormal/Incomplete (2)"]} />
                    <FormInput label="Treatment to Induce Liquefaction" value={getNestedValue(form, 'semen.macro.treatment')} onChange={(v) => update('semen.macro.treatment', v)} />
                    <FormInput label="pH" value={getNestedValue(form, 'semen.macro.ph')} onChange={(v) => update('semen.macro.ph', v)} />
                    <FormSelect label="Agglutination" value={getNestedValue(form, 'semen.macro.agglutination')} onChange={(v) => update('semen.macro.agglutination', v)} options={["None","1 (few)","2 (some)","3 (plenty)"]} />
                  </div>
                </FormSection>

                <FormSection title="Semen Analysis - Microscopic Examination">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="Sperm Concentration (10^6/mL)" value={getNestedValue(form, 'semen.micro.concentration')} onChange={(v) => update('semen.micro.concentration', v)} />
                    <FormInput label="Total Sperm Count (10^6/ejaculate)" value={getNestedValue(form, 'semen.micro.totalCount')} onChange={(v) => update('semen.micro.totalCount', v)} />
                    <FormInput label="Counting Error (%)" value={getNestedValue(form, 'semen.micro.countingError')} onChange={(v) => update('semen.micro.countingError', v)} />
                    <FormInput label="Rapid Progressive (a) %" value={getNestedValue(form, 'semen.micro.motility.a')} onChange={(v) => update('semen.micro.motility.a', v)} />
                    <FormInput label="Slow Progressive (b) %" value={getNestedValue(form, 'semen.micro.motility.b')} onChange={(v) => update('semen.micro.motility.b', v)} />
                    <FormInput label="Non-Progressive (c) %" value={getNestedValue(form, 'semen.micro.motility.c')} onChange={(v) => update('semen.micro.motility.c', v)} />
                    <FormInput label="Immotile (d) %" value={getNestedValue(form, 'semen.micro.motility.d')} onChange={(v) => update('semen.micro.motility.d', v)} />
                    <FormInput label="Total Motile (a+b+c) %" value={getNestedValue(form, 'semen.micro.totalMotile')} onChange={(v) => update('semen.micro.totalMotile', v)} />
                    <FormInput label="All Progressive (a+b) %" value={getNestedValue(form, 'semen.micro.progressive')} onChange={(v) => update('semen.micro.progressive', v)} />
                    <FormInput label="Vitality (% live sperm)" value={getNestedValue(form, 'semen.micro.vitality')} onChange={(v) => update('semen.micro.vitality', v)} />
                  </div>
                </FormSection>

                <FormSection title="Semen Analysis - Morphology">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="Normal Forms %" value={getNestedValue(form, 'semen.morphology.normal')} onChange={(v) => update('semen.morphology.normal', v)} />
                    <FormInput label="Abnormal Heads %" value={getNestedValue(form, 'semen.morphology.abnormalHeads')} onChange={(v) => update('semen.morphology.abnormalHeads', v)} />
                    <FormInput label="Abnormal Midpieces %" value={getNestedValue(form, 'semen.morphology.abnormalMid')} onChange={(v) => update('semen.morphology.abnormalMid', v)} />
                    <FormInput label="Abnormal Tails %" value={getNestedValue(form, 'semen.morphology.abnormalTails')} onChange={(v) => update('semen.morphology.abnormalTails', v)} />
                    <FormInput label="Excess Residual Cytoplasm %" value={getNestedValue(form, 'semen.morphology.erc')} onChange={(v) => update('semen.morphology.erc', v)} />
                    <FormInput label="Teratozoospermia Index (TZI)" value={getNestedValue(form, 'semen.morphology.tzi')} onChange={(v) => update('semen.morphology.tzi', v)} />
                  </div>
                </FormSection>

                <FormSection title="Semen Analysis - Non-Sperm Cells">
                  <FormInput label="Peroxidase-Positive Cells (WBCs) ×10^6/mL" value={getNestedValue(form, 'semen.cells.wbcs')} onChange={(v) => update('semen.cells.wbcs', v)} />
                </FormSection>

                <FormSection title="Accessory Gland Function (Optional)">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput label="Zinc (µmol/ejaculate)" value={getNestedValue(form, 'semen.glands.zinc')} onChange={(v) => update('semen.glands.zinc', v)} />
                    <FormInput label="Fructose (µmol/ejaculate)" value={getNestedValue(form, 'semen.glands.fructose')} onChange={(v) => update('semen.glands.fructose', v)} />
                    <FormInput label="α-Glucosidase (mU/ejaculate)" value={getNestedValue(form, 'semen.glands.glucosidase')} onChange={(v) => update('semen.glands.glucosidase', v)} />
                  </div>
                </FormSection>

                <FormSection title="Analysis Timing">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="Examination Begun (hh:mm)" value={getNestedValue(form, 'semen.timing.begun')} onChange={(v) => update('semen.timing.begun', v)} type='time' />
                    <FormInput label="Time to Examination (post-collection)" value={getNestedValue(form, 'semen.timing.toExam')} onChange={(v) => update('semen.timing.toExam', v)} />
                  </div>
                </FormSection>
              </>
            )}

            {tab === 'investigations' && (
              <FormSection title="Optional Investigations">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormRadioGroup label="Hormonal Assay - FSH done?" value={getNestedValue(form, 'investigations.fsh.done')} onChange={(v) => update('investigations.fsh.done', v)} options={["Yes","No"]} />
                  <FormInput label="FSH (mIU/mL)" value={getNestedValue(form, 'investigations.fsh.value')} onChange={(v) => update('investigations.fsh.value', v)} />
                  <FormRadioGroup label="LH done?" value={getNestedValue(form, 'investigations.lh.done')} onChange={(v) => update('investigations.lh.done', v)} options={["Yes","No"]} />
                  <FormInput label="LH (mIU/mL)" value={getNestedValue(form, 'investigations.lh.value')} onChange={(v) => update('investigations.lh.value', v)} />
                  <FormRadioGroup label="Prolactin done?" value={getNestedValue(form, 'investigations.prolactin.done')} onChange={(v) => update('investigations.prolactin.done', v)} options={["Yes","No"]} />
                  <FormInput label="Prolactin (ng/mL)" value={getNestedValue(form, 'investigations.prolactin.value')} onChange={(v) => update('investigations.prolactin.value', v)} />
                  <FormRadioGroup label="Testosterone done?" value={getNestedValue(form, 'investigations.testosterone.done')} onChange={(v) => update('investigations.testosterone.done', v)} options={["Yes","No"]} />
                  <FormInput label="Testosterone (ng/dL)" value={getNestedValue(form, 'investigations.testosterone.value')} onChange={(v) => update('investigations.testosterone.value', v)} />
                  <FormRadioGroup label="Estradiol done?" value={getNestedValue(form, 'investigations.estradiol.done')} onChange={(v) => update('investigations.estradiol.done', v)} options={["Yes","No"]} />
                  <FormInput label="Estradiol (pg/mL)" value={getNestedValue(form, 'investigations.estradiol.value')} onChange={(v) => update('investigations.estradiol.value', v)} />
                  <FormRadioGroup label="T/E Ratio done?" value={getNestedValue(form, 'investigations.te.done')} onChange={(v) => update('investigations.te.done', v)} options={["Yes","No"]} />
                  <FormInput label="T/E Ratio" value={getNestedValue(form, 'investigations.te.value')} onChange={(v) => update('investigations.te.value', v)} />
                  <FormRadioGroup label="Urine Culture done?" value={getNestedValue(form, 'investigations.urineCulture.done')} onChange={(v) => update('investigations.urineCulture.done', v)} options={["Yes","No"]} />
                  <FormInput label="Urine Culture Result" value={getNestedValue(form, 'investigations.urineCulture.result')} onChange={(v) => update('investigations.urineCulture.result', v)} />
                  <FormRadioGroup label="Semen Culture done?" value={getNestedValue(form, 'investigations.semenCulture.done')} onChange={(v) => update('investigations.semenCulture.done', v)} options={["Yes","No"]} />
                  <FormInput label="Semen Culture Result" value={getNestedValue(form, 'investigations.semenCulture.result')} onChange={(v) => update('investigations.semenCulture.result', v)} />
                  <FormRadioGroup label="Prostatic Fluid Culture done?" value={getNestedValue(form, 'investigations.prostaticFluid.done')} onChange={(v) => update('investigations.prostaticFluid.done', v)} options={["Yes","No"]} />
                  <FormInput label="Prostatic Fluid Result" value={getNestedValue(form, 'investigations.prostaticFluid.result')} onChange={(v) => update('investigations.prostaticFluid.result', v)} />
                  <FormRadioGroup label="Anti-sperm Antibody Testing done?" value={getNestedValue(form, 'investigations.asa.done')} onChange={(v) => update('investigations.asa.done', v)} options={["Yes","No"]} />
                  <FormInput label="ASA Result" value={getNestedValue(form, 'investigations.asa.result')} onChange={(v) => update('investigations.asa.result', v)} />
                  <FormRadioGroup label="Viability Assay done?" value={getNestedValue(form, 'investigations.viability.done')} onChange={(v) => update('investigations.viability.done', v)} options={["Yes","No"]} />
                  <FormInput label="Viability Result" value={getNestedValue(form, 'investigations.viability.result')} onChange={(v) => update('investigations.viability.result', v)} />
                  <FormRadioGroup label="Sperm Function Tests done?" value={getNestedValue(form, 'investigations.spermFunction.done')} onChange={(v) => update('investigations.spermFunction.done', v)} options={["Yes","No"]} />
                  <FormInput label="Sperm Function Result" value={getNestedValue(form, 'investigations.spermFunction.result')} onChange={(v) => update('investigations.spermFunction.result', v)} />
                  <FormRadioGroup label="Scrotal USG & Doppler done?" value={getNestedValue(form, 'investigations.usg.done')} onChange={(v) => update('investigations.usg.done', v)} options={["Yes","No"]} />
                  <FormInput label="USG Findings" value={getNestedValue(form, 'investigations.usg.findings')} onChange={(v) => update('investigations.usg.findings', v)} />
                  <FormRadioGroup label="Transrectal Ultrasonography (TRUS) done?" value={getNestedValue(form, 'investigations.trus.done')} onChange={(v) => update('investigations.trus.done', v)} options={["Yes","No"]} />
                  <FormInput label="TRUS Findings" value={getNestedValue(form, 'investigations.trus.findings')} onChange={(v) => update('investigations.trus.findings', v)} />
                  <FormRadioGroup label="Testicular Biopsy done?" value={getNestedValue(form, 'investigations.biopsy.done')} onChange={(v) => update('investigations.biopsy.done', v)} options={["Yes","No"]} />
                  <FormInput label="Biopsy Histology" value={getNestedValue(form, 'investigations.biopsy.histology')} onChange={(v) => update('investigations.biopsy.histology', v)} />

                  <FormRadioGroup label="17-Hydroxy Progesterone (optional)" value={getNestedValue(form, 'investigations.hp.done')} onChange={(v) => update('investigations.hp.done', v)} options={["Yes","No"]} />
                  <FormInput label="17-Hydroxy Progesterone Value" value={getNestedValue(form, 'investigations.hp.histology')} onChange={(v) => update('investigations.hp.histology', v)} />
                  
                  <FormRadioGroup label="Inhibin B" value={getNestedValue(form, 'investigations.ib.done')} onChange={(v) => update('investigations.ib.done', v)} options={["Yes","No"]} />
                  <FormInput label="Inhibin B Value" value={getNestedValue(form, 'investigations.ib.histology')} onChange={(v) => update('investigations.ib.histology', v)} />
                  
                  <FormRadioGroup label="AMH" value={getNestedValue(form, 'investigations.amh.done')} onChange={(v) => update('investigations.amh.done', v)} options={["Yes","No"]} />
                  <FormInput label="AMH Value" value={getNestedValue(form, 'investigations.amh.histology')} onChange={(v) => update('investigations.amh.histology', v)} />

                
                </div>
              </FormSection>
            )}

            {tab === 'treatment' && (
              <>
                <FormSection title='Diagnosis & Treatment Plan'>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput 
                      label="Final Diagnosis" 
                      value={getNestedValue(form, 'treatment.final')} 
                      onChange={(v) => update('treatment.final', v)} 
                    />
                    <FormInput 
                      label="Lifestyle Modifications" 
                      value={getNestedValue(form, 'treatment.lifestyleModifications')} 
                      onChange={(v) => update('treatment.lifestyleModifications', v)}
                    />
                    <FormInput 
                      label="Treatment Duration" 
                      value={getNestedValue(form, 'treatment.duration')} 
                      onChange={(v) => update('treatment.duration', v)}
                    />
                    <FormInput 
                      label="Further Investigations Planned" 
                      value={getNestedValue(form, 'treatment.investigations')} 
                      onChange={(v) => update('treatment.investigations', v)} 
                    />
                  </div>
                </FormSection>

                <FormSection title="Treatment Regimen">
                  <div className="space-y-4">
                    {(getNestedValue(form, 'treatment.drugs') || [{ drugName: '', dose: '', regimen: '' }]).map((drug: any, index: number) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                        <div className="md:col-span-3 flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-300">Drug #{index + 1}</span>
                          {(getNestedValue(form, 'treatment.drugs') || []).length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const drugs = [...(getNestedValue(form, 'treatment.drugs') || [])];
                                drugs.splice(index, 1);
                                update('treatment.drugs', drugs);
                              }}
                              className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1 transition-colors"
                            >
                              <XMarkIcon className="w-4 h-4" />
                              Remove
                            </button>
                          )}
                        </div>

                        <FormInput 
                          label="Drug Name" 
                          value={drug.drugName || ''} 
                          onChange={(v) => {
                            const drugs = [...(getNestedValue(form, 'treatment.drugs') || [])];
                            drugs[index] = { ...drugs[index], drugName: v };
                            update('treatment.drugs', drugs);
                          }}
                          placeholder="e.g., Sildenafil"
                        />

                        <FormInput 
                          label="Dose" 
                          value={drug.dose || ''} 
                          onChange={(v) => {
                            const drugs = [...(getNestedValue(form, 'treatment.drugs') || [])];
                            drugs[index] = { ...drugs[index], dose: v };
                            update('treatment.drugs', drugs);
                          }}
                          placeholder="e.g., 50mg"
                        />

                        <FormSelect 
                          label="Dosing Regimen" 
                          value={drug.regimen || ''} 
                          onChange={(v) => {
                            const drugs = [...(getNestedValue(form, 'treatment.drugs') || [])];
                            drugs[index] = { ...drugs[index], regimen: v };
                            update('treatment.drugs', drugs);
                          }}
                          options={["OID","BID","TID","QID", "Once Weekly", "Once Monthly","Once Quarterly", "Once Annually"]}
                        />
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        const drugs = [...(getNestedValue(form, 'treatment.drugs') || [{ drugName: '', dose: '', regimen: '' }])];
                        drugs.push({ drugName: '', dose: '', regimen: '' });
                        update('treatment.drugs', drugs);
                      }}
                      className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <PlusIcon className="w-5 h-5" />
                      Add Another Drug
                    </button>
                  </div>
                </FormSection>
              </>
            )}

            {tab === 'final' && (
              <>
                <FormSection title="Final Notes">
                  <FormInput label="Any Additional Comments" value={getNestedValue(form, 'final.notes')} onChange={(v) => update('final.notes', v)} />
                  <FormInput label="Approved By (Name/Signature/Date)" value={getNestedValue(form, 'final.approvedBy')} onChange={(v) => update('final.approvedBy', v)} />
                </FormSection>
                <div className="flex justify-end">
                  <button type="submit" disabled={saving} className="bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-medium transition-colors">
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </>
            )}
          </form>

          {/* Footer with Navigation */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl px-6 py-4 mt-6">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrev}
                disabled={tab === 'demographics'}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
                  tab === 'demographics'
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                Previous Tab
              </button>

              <button
                onClick={handleNext}
                disabled={tab === 'final'}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
                  tab === 'final'
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-teal-600 text-white hover:bg-teal-700 hover:shadow-lg'
                }`}
              >
                Next Tab
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
