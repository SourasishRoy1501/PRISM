import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { FormSection, FormInput, FormSelect, FormRadioGroup, getNestedValue, setNestedValue } from '@/components/form/FormControls'
import { UserCircleIcon, HeartIcon, ClipboardDocumentListIcon, BeakerIcon, ChartBarIcon, DocumentTextIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { MaleSexualDysfunctionInitialState } from './male_sexual_dysfunction_initial_state'
import { usePatient } from '@/hooks/PatientContext'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function MaleSexualDysfunctionCRF({ user, isFirstTime =false, selectedDate = "", isEdit=false, crfData=null, followupId='', isPreview=false }: { user: any, isFirstTime ?: boolean, selectedDate ?: string, isEdit ?: boolean, crfData ?: Object, followupId ?: string, isPreview?: boolean }) {
  const router = useRouter()
  const [form, setForm] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [tab, setTab] = useState<'demographics' | 'medical' | 'surgical' | 'lifestyle' | 'sexual' | 'semen' | 'hormonal' | 'scoring' | 'imaging' | 'treatment' | 'psychological' | 'followup' | 'physical'>('demographics')

  const { patientDetails } = usePatient()

  const allTabs = ['demographics', 'medical', 'surgical', 'lifestyle', 'physical', 'sexual', 'semen', 'hormonal', 'scoring', 'imaging', 'psychological', 'treatment', 'followup']

  const update = useCallback((path: string, value: any) => {
    setForm((prev: any) => setNestedValue(prev, path, value))
  }, [])

  useEffect(() => {
    if(patientDetails) {
      setForm(patientDetails?.crf_data)
    } else if(crfData && isEdit) {
      setForm(crfData)
    }
    else {
      setForm(MaleSexualDysfunctionInitialState)
    }
  }, [])

  useEffect(() => {
    if(crfData && !isEdit) {
      setForm(crfData)
      setSuccess(null)
    }
  }, [crfData])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)
    if(!isEdit) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/crf/male_sexual_dysfunction`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: form, user_id: user.id, is_first_time: isFirstTime, condition_type: 'male_sexual_dysfunction', selectedDate: selectedDate, patient_id: patientDetails?.patient_id })
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
    { id: 'medical', title: 'Medical History', icon: HeartIcon },
    { id: 'surgical', title: 'Surgical History', icon: ClipboardDocumentListIcon },
    { id: 'lifestyle', title: 'Lifestyle', icon: ChartBarIcon },
    { id: 'physical', title: 'Physical Exam', icon: HeartIcon },
    { id: 'sexual', title: 'Sexual Function', icon: BeakerIcon },
    { id: 'semen', title: 'Semen Analysis', icon: DocumentTextIcon },
    { id: 'hormonal', title: 'Hormonal Profile', icon: ChartBarIcon },
    { id: 'scoring', title: 'Scoring Scales', icon: ChartBarIcon },
    { id: 'imaging', title: 'Imaging & Diagnostics', icon: DocumentTextIcon },
    { id: 'psychological', title: 'Psychological', icon: HeartIcon },
    { id: 'treatment', title: 'Diagnosis & Treatment Plan', icon: ClipboardDocumentListIcon },
    { id: 'followup', title: 'Follow-up Plan', icon: ClipboardDocumentListIcon },
  ]) as { id: typeof tab; title: string; icon: any }[], [])

  const TabButton = ({ id, title, Icon }: any) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors flex items-center gap-2 ${
        tab === id ? 'border-teal-500 text-white bg-teal-500/10' : 'border-gray-700 text-gray-300 hover:text-white hover:border-gray-500'
      }`}
    >
      <Icon className="w-3 h-3" />
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
          {!isEdit && <h1 className="text-4xl font-bold text-white mb-6">Male Sexual Dysfunction Form</h1>}

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
                  <FormInput label="Full Name" value={getNestedValue(form, 'demographics.fullName')} onChange={(v) => update('demographics.fullName', v)} placeholder="Enter full name" />
                  <FormInput label="Date of Birth" value={getNestedValue(form, 'demographics.dateOfBirth')} onChange={(v) => update('demographics.dateOfBirth', v)} placeholder="mm/dd/yyyy" type='date' />
                  <FormInput label="Age (in years)" value={getNestedValue(form, 'demographics.age')} onChange={(v) => update('demographics.age', v)} type="number" />
                  <FormRadioGroup label="Gender" value={getNestedValue(form, 'demographics.gender')} onChange={(v) => update('demographics.gender', v)} options={["Male"]} />
                  <FormInput label="Date of First Visit" value={getNestedValue(form, 'demographics.firstVisit')} onChange={(v) => update('demographics.firstVisit', v)} placeholder="mm/dd/yyyy" type='date' />
                  <FormInput label="Contact Information" value={getNestedValue(form, 'demographics.contact')} onChange={(v) => update('demographics.contact', v)} placeholder="Phone/Email" />
                  <FormInput label="Address / Pin code (optional)" value={getNestedValue(form, 'demographics.address')} onChange={(v) => update('demographics.address', v)} placeholder="Full address" />
                  <FormRadioGroup label="Marital Status" value={getNestedValue(form, 'demographics.maritalStatus')} onChange={(v) => update('demographics.maritalStatus', v)} options={["Married","Unmarried","Divorced","Widowed"]} />
                  <FormInput label="Duration of Marriage (years)" value={getNestedValue(form, 'demographics.durationMarriage')} onChange={(v) => update('demographics.durationMarriage', v)} disabled={getNestedValue(form, 'demographics.maritalStatus') !== 'Married'} />
                  <FormSelect label="Education Level" value={getNestedValue(form, 'demographics.education')} onChange={(v) => update('demographics.education', v)} options={["No formal education","Primary","Secondary","Graduate","Postgraduate"]} />
                  <FormInput label="Occupation" value={getNestedValue(form, 'demographics.occupation')} onChange={(v) => update('demographics.occupation', v)} />
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput label="Weight (kg)" value={getNestedValue(form, 'demographics.weight')} onChange={(v) => update('demographics.weight', v)} type="number" />
                    <FormInput label="Height (cm)" value={getNestedValue(form, 'demographics.height')} onChange={(v) => update('demographics.height', v)} type="number" />
                    <FormInput label="BMI" value={getNestedValue(form, 'demographics.bmi')} onChange={(v) => update('demographics.bmi', v)} type="number" />
                  </div>
                </div>
              </FormSection>
            )}

            {tab === 'medical' && (
              <FormSection title="Medical History">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <span className="text-sm text-gray-300 mb-2 block">Medical Conditions</span>
                  </div>
                  <FormRadioGroup label="Diabetes Mellitus" value={getNestedValue(form, 'medical.diabetes.status')} onChange={(v) => update('medical.diabetes.status', v)} options={["Yes","No"]} />
                  <FormInput label="Comments" value={getNestedValue(form, 'medical.diabetes.comments')} onChange={(v) => update('medical.diabetes.comments', v)} disabled={getNestedValue(form, 'medical.diabetes.status') !== 'Yes'} />
                  <FormRadioGroup label="Hypertension" value={getNestedValue(form, 'medical.hypertension.status')} onChange={(v) => update('medical.hypertension.status', v)} options={["Yes","No"]} />
                  <FormInput label="Comments" value={getNestedValue(form, 'medical.hypertension.comments')} onChange={(v) => update('medical.hypertension.comments', v)} disabled={getNestedValue(form, 'medical.hypertension.status') !== 'Yes'} />
                  <FormRadioGroup label="Thyroid Disorders" value={getNestedValue(form, 'medical.thyroid.status')} onChange={(v) => update('medical.thyroid.status', v)} options={["Yes","No"]} />
                  <FormInput label="Comments" value={getNestedValue(form, 'medical.thyroid.comments')} onChange={(v) => update('medical.thyroid.comments', v)} disabled={getNestedValue(form, 'medical.thyroid.status') !== 'Yes'} />
                  <FormRadioGroup label="Cardiovascular Disease" value={getNestedValue(form, 'medical.cardiovascular.status')} onChange={(v) => update('medical.cardiovascular.status', v)} options={["Yes","No"]} />
                  <FormInput label="Comments" value={getNestedValue(form, 'medical.cardiovascular.comments')} onChange={(v) => update('medical.cardiovascular.comments', v)} disabled={getNestedValue(form, 'medical.cardiovascular.status') !== 'Yes'} />
                  <FormRadioGroup label="Neurological Disorders" value={getNestedValue(form, 'medical.neurological.status')} onChange={(v) => update('medical.neurological.status', v)} options={["Yes","No"]} />
                  <FormInput label="Comments" value={getNestedValue(form, 'medical.neurological.comments')} onChange={(v) => update('medical.neurological.comments', v)} disabled={getNestedValue(form, 'medical.neurological.status') !== 'Yes'} />
                  <FormRadioGroup label="Psychiatric Conditions" value={getNestedValue(form, 'medical.psychiatric.status')} onChange={(v) => update('medical.psychiatric.status', v)} options={["Yes","No"]} />
                  <FormInput label="Comments" value={getNestedValue(form, 'medical.psychiatric.comments')} onChange={(v) => update('medical.psychiatric.comments', v)} disabled={getNestedValue(form, 'medical.psychiatric.status') !== 'Yes'} />
                  <FormRadioGroup label="Hormonal Disorders" value={getNestedValue(form, 'medical.hormonal.status')} onChange={(v) => update('medical.hormonal.status', v)} options={["Yes","No"]} />
                  <FormInput label="Comments" value={getNestedValue(form, 'medical.hormonal.comments')} onChange={(v) => update('medical.hormonal.comments', v)} disabled={getNestedValue(form, 'medical.hormonal.status') !== 'Yes'} />
                  <FormRadioGroup label="History of STIs" value={getNestedValue(form, 'medical.stis.status')} onChange={(v) => update('medical.stis.status', v)} options={["Yes","No"]} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="Type" value={getNestedValue(form, 'medical.stis.type')} onChange={(v) => update('medical.stis.type', v)} disabled={getNestedValue(form, 'medical.stis.status') !== 'Yes'} />
                    <FormInput label="Year" value={getNestedValue(form, 'medical.stis.year')} onChange={(v) => update('medical.stis.year', v)} disabled={getNestedValue(form, 'medical.stis.status') !== 'Yes'} />
                  </div>
                  <FormRadioGroup label="Chronic Kidney Disease" value={getNestedValue(form, 'medical.kidney.status')} onChange={(v) => update('medical.kidney.status', v)} options={["Yes","No"]} />
                  <FormInput label="Comments" value={getNestedValue(form, 'medical.kidney.comments')} onChange={(v) => update('medical.kidney.comments', v)} disabled={getNestedValue(form, 'medical.kidney.status') !== 'Yes'} />
                  <FormRadioGroup label="Liver Disease" value={getNestedValue(form, 'medical.liver.status')} onChange={(v) => update('medical.liver.status', v)} options={["Yes","No"]} />
                  <FormInput label="Comments" value={getNestedValue(form, 'medical.liver.comments')} onChange={(v) => update('medical.liver.comments', v)} disabled={getNestedValue(form, 'medical.liver.status') !== 'Yes'} />
                  <FormRadioGroup label="Past/Persistent Genital Infections" value={getNestedValue(form, 'medical.genitalInfections.status')} onChange={(v) => update('medical.genitalInfections.status', v)} options={["Yes","No"]} />
                  <FormInput label="Specify" value={getNestedValue(form, 'medical.genitalInfections.specify')} onChange={(v) => update('medical.genitalInfections.specify', v)} disabled={getNestedValue(form, 'medical.genitalInfections.status') !== 'Yes'} />
                  <FormRadioGroup label="Other Chronic Illnesses" value={getNestedValue(form, 'medical.otherChronic.status')} onChange={(v) => update('medical.otherChronic.status', v)} options={["Yes","No"]} />
                  <FormInput label="Specify" value={getNestedValue(form, 'medical.otherChronic.specify')} onChange={(v) => update('medical.otherChronic.specify', v)} disabled={getNestedValue(form, 'medical.otherChronic.status') !== 'Yes'} />
                </div>
              </FormSection>
            )}

            {tab === 'surgical' && (
              <FormSection title="Surgical History">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <span className="text-sm text-gray-300 mb-2 block">Surgical Procedures</span>
                  </div>
                  <FormRadioGroup label="Varicocele" value={getNestedValue(form, 'surgical.varicocele.status')} onChange={(v) => update('surgical.varicocele.status', v)} options={["Yes","No"]} />
                  <FormInput label="Year" value={getNestedValue(form, 'surgical.varicocele.year')} onChange={(v) => update('surgical.varicocele.year', v)} disabled={getNestedValue(form, 'surgical.varicocele.status') !== 'Yes'} />
                  <FormRadioGroup label="Hernia Repair (Inguinal/Scrotal)" value={getNestedValue(form, 'surgical.hernia.status')} onChange={(v) => update('surgical.hernia.status', v)} options={["Yes","No"]} />
                  <FormInput label="Year" value={getNestedValue(form, 'surgical.hernia.year')} onChange={(v) => update('surgical.hernia.year', v)} disabled={getNestedValue(form, 'surgical.hernia.status') !== 'Yes'} />
                  <FormRadioGroup label="Prostate Surgery/TURP" value={getNestedValue(form, 'surgical.prostate.status')} onChange={(v) => update('surgical.prostate.status', v)} options={["Yes","No"]} />
                  <FormInput label="Year" value={getNestedValue(form, 'surgical.prostate.year')} onChange={(v) => update('surgical.prostate.year', v)} disabled={getNestedValue(form, 'surgical.prostate.status') !== 'Yes'} />
                  <FormRadioGroup label="Testicular Surgery" value={getNestedValue(form, 'surgical.testicular.status')} onChange={(v) => update('surgical.testicular.status', v)} options={["Yes","No"]} />
                  <FormInput label="Year" value={getNestedValue(form, 'surgical.testicular.year')} onChange={(v) => update('surgical.testicular.year', v)} disabled={getNestedValue(form, 'surgical.testicular.status') !== 'Yes'} />
                  <FormRadioGroup label="Pelvic or Genital Trauma" value={getNestedValue(form, 'surgical.trauma.status')} onChange={(v) => update('surgical.trauma.status', v)} options={["Yes","No"]} />
                  <FormInput label="Year" value={getNestedValue(form, 'surgical.trauma.year')} onChange={(v) => update('surgical.trauma.year', v)} disabled={getNestedValue(form, 'surgical.trauma.status') !== 'Yes'} />
                  <FormRadioGroup label="Vasectomy" value={getNestedValue(form, 'surgical.vasectomy.status')} onChange={(v) => update('surgical.vasectomy.status', v)} options={["Yes","No"]} />
                  <FormInput label="Year" value={getNestedValue(form, 'surgical.vasectomy.year')} onChange={(v) => update('surgical.vasectomy.year', v)} disabled={getNestedValue(form, 'surgical.vasectomy.status') !== 'Yes'} />
                  <FormRadioGroup label="Other Urogenital Surgeries" value={getNestedValue(form, 'surgical.otherUrogenital.status')} onChange={(v) => update('surgical.otherUrogenital.status', v)} options={["Yes","No"]} />
                  <FormInput label="Specify" value={getNestedValue(form, 'surgical.otherUrogenital.specify')} onChange={(v) => update('surgical.otherUrogenital.specify', v)} disabled={getNestedValue(form, 'surgical.otherUrogenital.status') !== 'Yes'} />
                  <FormRadioGroup label="Other Major Surgeries (non-urogenital)" value={getNestedValue(form, 'surgical.otherMajor.status')} onChange={(v) => update('surgical.otherMajor.status', v)} options={["Yes","No"]} />
                  <FormInput label="Specify" value={getNestedValue(form, 'surgical.otherMajor.specify')} onChange={(v) => update('surgical.otherMajor.specify', v)} disabled={getNestedValue(form, 'surgical.otherMajor.status') !== 'Yes'} />
                </div>
              </FormSection>
            )}

            {tab === 'lifestyle' && (
              <FormSection title="Lifestyle History">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <span className="text-sm text-gray-300 mb-2 block">Lifestyle Factors</span>
                  </div>
                  <FormRadioGroup label="Recreational Drug Use" value={getNestedValue(form, 'lifestyle.drugUse.status')} onChange={(v) => update('lifestyle.drugUse.status', v)} options={["Yes","No"]} />
                  <FormInput label="Specify substance" value={getNestedValue(form, 'lifestyle.drugUse.substance')} onChange={(v) => update('lifestyle.drugUse.substance', v)} disabled={getNestedValue(form, 'lifestyle.drugUse.status') !== 'Yes'} />
                  <FormRadioGroup label="Anabolic Steroid Use" value={getNestedValue(form, 'lifestyle.steroids.status')} onChange={(v) => update('lifestyle.steroids.status', v)} options={["Yes","No"]} />
                  <FormInput label="Duration/Frequency" value={getNestedValue(form, 'lifestyle.steroids.duration')} onChange={(v) => update('lifestyle.steroids.duration', v)} disabled={getNestedValue(form, 'lifestyle.steroids.status') !== 'Yes'} />
                  <FormRadioGroup label="Occupational Exposure to Heat/Radiation" value={getNestedValue(form, 'lifestyle.exposure.status')} onChange={(v) => update('lifestyle.exposure.status', v)} options={["Yes","No"]} />
                  <FormInput label="Job Role/Type of Exposure" value={getNestedValue(form, 'lifestyle.exposure.details')} onChange={(v) => update('lifestyle.exposure.details', v)} disabled={getNestedValue(form, 'lifestyle.exposure.status') !== 'Yes'} />
                  <FormRadioGroup label="Psychological Stress (Persistent/High)" value={getNestedValue(form, 'lifestyle.stress.status')} onChange={(v) => update('lifestyle.stress.status', v)} options={["Yes","No"]} />
                  <FormInput label="Details" value={getNestedValue(form, 'lifestyle.stress.details')} onChange={(v) => update('lifestyle.stress.details', v)} disabled={getNestedValue(form, 'lifestyle.stress.status') !== 'Yes'} />
                  <FormRadioGroup label="Sleep Disturbances/Disorders" value={getNestedValue(form, 'lifestyle.sleep.status')} onChange={(v) => update('lifestyle.sleep.status', v)} options={["Yes","No"]} />
                  <FormInput label="Details" value={getNestedValue(form, 'lifestyle.sleep.details')} onChange={(v) => update('lifestyle.sleep.details', v)} disabled={getNestedValue(form, 'lifestyle.sleep.status') !== 'Yes'} />
                  <FormRadioGroup label="Sedentary Lifestyle" value={getNestedValue(form, 'lifestyle.sedentary.status')} onChange={(v) => update('lifestyle.sedentary.status', v)} options={["Yes","No"]} />
                  <FormInput label="Daily physical activity" value={getNestedValue(form, 'lifestyle.sedentary.activity')} onChange={(v) => update('lifestyle.sedentary.activity', v)} disabled={getNestedValue(form, 'lifestyle.sedentary.status') !== 'Yes'} />
                  <FormRadioGroup label="Use of Sexual Enhancement Substances" value={getNestedValue(form, 'lifestyle.enhancement.status')} onChange={(v) => update('lifestyle.enhancement.status', v)} options={["Yes","No"]} />
                  <FormInput label="Type" value={getNestedValue(form, 'lifestyle.enhancement.type')} onChange={(v) => update('lifestyle.enhancement.type', v)} disabled={getNestedValue(form, 'lifestyle.enhancement.status') !== 'Yes'} />
                  <FormRadioGroup label="Pornography Addiction/Excessive Use" value={getNestedValue(form, 'lifestyle.pornography.status')} onChange={(v) => update('lifestyle.pornography.status', v)} options={["Yes","No"]} />
                  <FormInput label="Frequency or impact" value={getNestedValue(form, 'lifestyle.pornography.impact')} onChange={(v) => update('lifestyle.pornography.impact', v)} disabled={getNestedValue(form, 'lifestyle.pornography.status') !== 'Yes'} />
                </div>
              </FormSection>
            )}

            {tab === 'sexual' && (
              <>
                <FormSection title="A. Erectile Function - Current Status">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="Current erection rigidity (0-100%)" value={getNestedValue(form, 'sexual.currentRigidity')} onChange={(v) => update('sexual.currentRigidity', v)} type="number" placeholder="%" />
                    <FormInput label="Best achievable rigidity (%)" value={getNestedValue(form, 'sexual.bestRigidity')} onChange={(v) => update('sexual.bestRigidity', v)} type="number" placeholder="%" />
                    <FormInput label="Duration of erection (minutes)" value={getNestedValue(form, 'sexual.duration')} onChange={(v) => update('sexual.duration', v)} type="number" placeholder="min" />
                    <FormRadioGroup label="Do you get morning erections?" value={getNestedValue(form, 'sexual.morningErections')} onChange={(v) => update('sexual.morningErections', v)} options={["Yes","No"]} />
                    <FormRadioGroup label="Are morning erections better/longer than during intercourse?" value={getNestedValue(form, 'sexual.morningBetter')} onChange={(v) => update('sexual.morningBetter', v)} options={["Yes","No"]} />
                    <FormInput label="Date of last morning erection" value={getNestedValue(form, 'sexual.lastMorningErection')} onChange={(v) => update('sexual.lastMorningErection', v)} placeholder="mm/dd/yyyy" type='date' />
                    <FormRadioGroup label="Do you get overnight erections?" value={getNestedValue(form, 'sexual.overnightErections')} onChange={(v) => update('sexual.overnightErections', v)} options={["Yes","No"]} />
                    <FormInput label="Rigidity of overnight erections (%)" value={getNestedValue(form, 'sexual.overnightRigidity')} onChange={(v) => update('sexual.overnightRigidity', v)} type="number" placeholder="%" />
                    <FormRadioGroup label="Does erection lose rigidity during intercourse?" value={getNestedValue(form, 'sexual.losesRigidity')} onChange={(v) => update('sexual.losesRigidity', v)} options={["Yes","No"]} />
                    <FormRadioGroup label="Does it stay erect until immediately after penetration?" value={getNestedValue(form, 'sexual.staysErect')} onChange={(v) => update('sexual.staysErect', v)} options={["Yes","No"]} />
                    <FormRadioGroup label="Erection curvature" value={getNestedValue(form, 'sexual.curvature')} onChange={(v) => update('sexual.curvature', v)} options={["Straight","Curved"]} />
                    <FormRadioGroup label="Numbness or unusual penile sensation?" value={getNestedValue(form, 'sexual.numbness')} onChange={(v) => update('sexual.numbness', v)} options={["Yes","No"]} />
                    <FormInput label="Details" value={getNestedValue(form, 'sexual.numbnessDetails')} onChange={(v) => update('sexual.numbnessDetails', v)} disabled={getNestedValue(form, 'sexual.numbness') !== 'Yes'} />
                  </div>
                </FormSection>

                <FormSection title="B. Erectile Dysfunction (ED) Pattern">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormRadioGroup label="Onset of ED symptoms" value={getNestedValue(form, 'sexual.edOnset')} onChange={(v) => update('sexual.edOnset', v)} options={["Sudden","Gradual"]} />
                    <FormInput label="Duration since ED began" value={getNestedValue(form, 'sexual.edDuration')} onChange={(v) => update('sexual.edDuration', v)} placeholder="e.g., 2 years" />
                    <FormRadioGroup label="Significant event or medication change at onset?" value={getNestedValue(form, 'sexual.significantEvent')} onChange={(v) => update('sexual.significantEvent', v)} options={["Yes","No"]} />
                    <FormInput label="Details" value={getNestedValue(form, 'sexual.eventDetails')} onChange={(v) => update('sexual.eventDetails', v)} disabled={getNestedValue(form, 'sexual.significantEvent') !== 'Yes'} />
                    <FormInput label="Last time erection was normal" value={getNestedValue(form, 'sexual.lastNormalErection')} onChange={(v) => update('sexual.lastNormalErection', v)} placeholder="mm/dd/yyyy" type='date'/>
                    <FormRadioGroup label="Erections better during:" value={getNestedValue(form, 'sexual.betterDuring')} onChange={(v) => update('sexual.betterDuring', v)} options={["Masturbation","Other partner","Neither"]} />
                    <FormRadioGroup label="Rigidity during masturbation vs intercourse" value={getNestedValue(form, 'sexual.masturbationRigidity')} onChange={(v) => update('sexual.masturbationRigidity', v)} options={["Better","Same","Worse"]} />
                    <FormRadioGroup label="Problem with:" value={getNestedValue(form, 'sexual.problemType')} onChange={(v) => update('sexual.problemType', v)} options={["Rigidity","Maintenance","Both"]} />
                    <FormRadioGroup label="ED progression:" value={getNestedValue(form, 'sexual.progression')} onChange={(v) => update('sexual.progression', v)} options={["Stable","Worsening"]} />
                    <FormRadioGroup label="Daily variation in erection quality" value={getNestedValue(form, 'sexual.dailyVariation')} onChange={(v) => update('sexual.dailyVariation', v)} options={["Yes","No"]} />
                    <FormRadioGroup label="History of sexual trauma" value={getNestedValue(form, 'sexual.trauma')} onChange={(v) => update('sexual.trauma', v)} options={["Yes","No"]} />
                    <FormInput label="Details" value={getNestedValue(form, 'sexual.traumaDetails')} onChange={(v) => update('sexual.traumaDetails', v)} disabled={getNestedValue(form, 'sexual.trauma') !== 'Yes'} />
                  </div>
                </FormSection>

                <FormSection title="C. Ejaculation & Libido">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="Rigidity at the time of ejaculation (%)" value={getNestedValue(form, 'sexual.ejaculationRigidity')} onChange={(v) => update('sexual.ejaculationRigidity', v)} type="number" placeholder="%" />
                    <FormRadioGroup label="Libido Status" value={getNestedValue(form, 'sexual.libido')} onChange={(v) => update('sexual.libido', v)} options={["Normal","Low"]} />
                    <FormInput label="If ED wasn't a problem, desired intercourse frequency (per week)" value={getNestedValue(form, 'sexual.desiredFrequency')} onChange={(v) => update('sexual.desiredFrequency', v)} type="number" placeholder="times/week" />
                  </div>
                </FormSection>

                <FormSection title="D. Partner Involvement & Relationship Impact">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormRadioGroup label="Does your partner know you're seeking treatment?" value={getNestedValue(form, 'sexual.partnerKnows')} onChange={(v) => update('sexual.partnerKnows', v)} options={["Yes","No"]} />
                    <FormRadioGroup label="Is your partner supportive or encouraging?" value={getNestedValue(form, 'sexual.partnerSupportive')} onChange={(v) => update('sexual.partnerSupportive', v)} options={["Yes","No"]} />
                    <FormRadioGroup label="Would they be willing to join treatment if needed?" value={getNestedValue(form, 'sexual.partnerWilling')} onChange={(v) => update('sexual.partnerWilling', v)} options={["Yes","No"]} />
                    <FormRadioGroup label="Who usually initiates intercourse?" value={getNestedValue(form, 'sexual.initiates')} onChange={(v) => update('sexual.initiates', v)} options={["Self","Partner","Both"]} />
                    <FormInput label="Current intercourse attempts" value={getNestedValue(form, 'sexual.currentAttempts')} onChange={(v) => update('sexual.currentAttempts', v)} type="number" placeholder="times per" />
                    <FormSelect label="Frequency" value={getNestedValue(form, 'sexual.attemptsFrequency')} onChange={(v) => update('sexual.attemptsFrequency', v)} options={["week","month"]} />
                    <FormInput label="If untreated, what impact might ED have on your relationship?" value={getNestedValue(form, 'sexual.relationshipImpact')} onChange={(v) => update('sexual.relationshipImpact', v)} placeholder="Describe potential impact" />
                  </div>
                </FormSection>

                <FormSection title="E. Past Treatment & Expectations">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormRadioGroup label="Previous treatments for ED tried?" value={getNestedValue(form, 'sexual.previousTreatments')} onChange={(v) => update('sexual.previousTreatments', v)} options={["Yes","No"]} />
                    <FormInput label="Details" value={getNestedValue(form, 'sexual.treatmentDetails')} onChange={(v) => update('sexual.treatmentDetails', v)} disabled={getNestedValue(form, 'sexual.previousTreatments') !== 'Yes'} />
                    <FormSelect label="Current contraceptive method used (if any)" value={getNestedValue(form, 'sexual.contraceptive')} onChange={(v) => update('sexual.contraceptive', v)} options={["None","Condom","IUD","Partner pills","Other"]} />
                    <FormInput label="Other contraceptive method" value={getNestedValue(form, 'sexual.contraceptiveOther')} onChange={(v) => update('sexual.contraceptiveOther', v)} disabled={getNestedValue(form, 'sexual.contraceptive') !== 'Other'} />
                    <FormRadioGroup label="Would patient be satisfied with 65-75% rigidity for 10-15 min?" value={getNestedValue(form, 'sexual.satisfiedWith65')} onChange={(v) => update('sexual.satisfiedWith65', v)} options={["Yes","No"]} />
                    <FormInput label="If not, what would be considered a successful treatment outcome?" value={getNestedValue(form, 'sexual.successfulOutcome')} onChange={(v) => update('sexual.successfulOutcome', v)} disabled={getNestedValue(form, 'sexual.satisfiedWith65') !== 'No'} />
                  </div>
                </FormSection>
              </>
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

            {tab === 'semen' && (
              <FormSection title="Semen Analysis (as per WHO 2010)">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput label="Date of Collection" value={getNestedValue(form, 'semen.collectionDate')} onChange={(v) => update('semen.collectionDate', v)} placeholder="mm/dd/yyyy" type='date'/>
                  <FormInput label="Abstinence (days)" value={getNestedValue(form, 'semen.abstinence')} onChange={(v) => update('semen.abstinence', v)} type="number" />
                  <FormSelect label="Sample Status" value={getNestedValue(form, 'semen.sampleStatus')} onChange={(v) => update('semen.sampleStatus', v)} options={["Fresh","Delayed"]} />
                  <FormInput label="Time to analysis (mins)" value={getNestedValue(form, 'semen.timeToAnalysis')} onChange={(v) => update('semen.timeToAnalysis', v)} type="number" />
                  <FormInput label="Volume (mL)" value={getNestedValue(form, 'semen.volume')} onChange={(v) => update('semen.volume', v)} type="number" placeholder="1.5-7.0 mL" />
                  <FormInput label="Sperm Concentration (×10⁶/mL)" value={getNestedValue(form, 'semen.concentration')} onChange={(v) => update('semen.concentration', v)} type="number" placeholder="≥15 ×10⁶/mL" />
                  <FormInput label="Total motility (%)" value={getNestedValue(form, 'semen.motility')} onChange={(v) => update('semen.motility', v)} type="number" placeholder="≥40%" />
                  <FormInput label="Morphology normal forms (%)" value={getNestedValue(form, 'semen.morphology')} onChange={(v) => update('semen.morphology', v)} type="number" placeholder="≥4%" />
                  <FormInput label="pH (optional)" value={getNestedValue(form, 'semen.pH')} onChange={(v) => update('semen.pH', v)} type="number" placeholder="7.2-8.0" />
                  <FormInput label="Liquefication time (mins)" value={getNestedValue(form, 'semen.liquefication')} onChange={(v) => update('semen.liquefication', v)} type="number" placeholder="≤60 min" />
                </div>
              </FormSection>
            )}

            {tab === 'hormonal' && (
              <FormSection title="Hormonal Profile">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <span className="text-sm text-gray-300 mb-2 block">Hormone Tests</span>
                  </div>
                  <FormRadioGroup label="Total Testosterone" value={getNestedValue(form, 'hormonal.testosterone.done')} onChange={(v) => update('hormonal.testosterone.done', v)} options={["Yes","No"]} />
                  <FormInput label="Date of Test" value={getNestedValue(form, 'hormonal.testosterone.date')} onChange={(v) => update('hormonal.testosterone.date', v)} disabled={getNestedValue(form, 'hormonal.testosterone.done') !== 'Yes'} placeholder="mm/dd/yyyy" type='date'/>
                  <FormInput label="Patient Value" value={getNestedValue(form, 'hormonal.testosterone.value')} onChange={(v) => update('hormonal.testosterone.value', v)} disabled={getNestedValue(form, 'hormonal.testosterone.done') !== 'Yes'} placeholder="~300-1000 ng/dL" />
                  <FormSelect label="Interpretation" value={getNestedValue(form, 'hormonal.testosterone.interpretation')} onChange={(v) => update('hormonal.testosterone.interpretation', v)} options={["Normal","Low"]} disabled={getNestedValue(form, 'hormonal.testosterone.done') !== 'Yes'} />
                  <FormRadioGroup label="FSH (Follicle Stimulating Hormone)" value={getNestedValue(form, 'hormonal.fsh.done')} onChange={(v) => update('hormonal.fsh.done', v)} options={["Yes","No"]} />
                  <FormInput label="Date of Test" value={getNestedValue(form, 'hormonal.fsh.date')} onChange={(v) => update('hormonal.fsh.date', v)} disabled={getNestedValue(form, 'hormonal.fsh.done') !== 'Yes'} placeholder="mm/dd/yyyy" type='date'/>
                  <FormInput label="Patient Value" value={getNestedValue(form, 'hormonal.fsh.value')} onChange={(v) => update('hormonal.fsh.value', v)} disabled={getNestedValue(form, 'hormonal.fsh.done') !== 'Yes'} placeholder="~1.5-12.4 mIU/mL" />
                  <FormSelect label="Interpretation" value={getNestedValue(form, 'hormonal.fsh.interpretation')} onChange={(v) => update('hormonal.fsh.interpretation', v)} options={["Normal","High","Low"]} disabled={getNestedValue(form, 'hormonal.fsh.done') !== 'Yes'} />
                  <FormRadioGroup label="LH (Luteinizing Hormone)" value={getNestedValue(form, 'hormonal.lh.done')} onChange={(v) => update('hormonal.lh.done', v)} options={["Yes","No"]} />
                  <FormInput label="Date of Test" value={getNestedValue(form, 'hormonal.lh.date')} onChange={(v) => update('hormonal.lh.date', v)} disabled={getNestedValue(form, 'hormonal.lh.done') !== 'Yes'} placeholder="mm/dd/yyyy" type='date'/>
                  <FormInput label="Patient Value" value={getNestedValue(form, 'hormonal.lh.value')} onChange={(v) => update('hormonal.lh.value', v)} disabled={getNestedValue(form, 'hormonal.lh.done') !== 'Yes'} placeholder="~1.7-8.6 mIU/mL" />
                  <FormSelect label="Interpretation" value={getNestedValue(form, 'hormonal.lh.interpretation')} onChange={(v) => update('hormonal.lh.interpretation', v)} options={["Normal","High","Low"]} disabled={getNestedValue(form, 'hormonal.lh.done') !== 'Yes'} />
                  <FormRadioGroup label="Prolactin" value={getNestedValue(form, 'hormonal.prolactin.done')} onChange={(v) => update('hormonal.prolactin.done', v)} options={["Yes","No"]} />
                  <FormInput label="Date of Test" value={getNestedValue(form, 'hormonal.prolactin.date')} onChange={(v) => update('hormonal.prolactin.date', v)} disabled={getNestedValue(form, 'hormonal.prolactin.done') !== 'Yes'} placeholder="mm/dd/yyyy" type='date'/>
                  <FormInput label="Patient Value" value={getNestedValue(form, 'hormonal.prolactin.value')} onChange={(v) => update('hormonal.prolactin.value', v)} disabled={getNestedValue(form, 'hormonal.prolactin.done') !== 'Yes'} placeholder="~2-18 ng/mL" />
                  <FormSelect label="Interpretation" value={getNestedValue(form, 'hormonal.prolactin.interpretation')} onChange={(v) => update('hormonal.prolactin.interpretation', v)} options={["Normal","High"]} disabled={getNestedValue(form, 'hormonal.prolactin.done') !== 'Yes'} />
                  <FormRadioGroup label="TSH (Thyroid Stim. Hormone)" value={getNestedValue(form, 'hormonal.tsh.done')} onChange={(v) => update('hormonal.tsh.done', v)} options={["Yes","No"]} />
                  <FormInput label="Date of Test" value={getNestedValue(form, 'hormonal.tsh.date')} onChange={(v) => update('hormonal.tsh.date', v)} disabled={getNestedValue(form, 'hormonal.tsh.done') !== 'Yes'} placeholder="mm/dd/yyyy" type='date'/>
                  <FormInput label="Patient Value" value={getNestedValue(form, 'hormonal.tsh.value')} onChange={(v) => update('hormonal.tsh.value', v)} disabled={getNestedValue(form, 'hormonal.tsh.done') !== 'Yes'} placeholder="~0.4-4.0 µIU/mL" />
                  <FormSelect label="Interpretation" value={getNestedValue(form, 'hormonal.tsh.interpretation')} onChange={(v) => update('hormonal.tsh.interpretation', v)} options={["Normal","Abnormal"]} disabled={getNestedValue(form, 'hormonal.tsh.done') !== 'Yes'} />
                  <FormRadioGroup label="Estradiol (if done)" value={getNestedValue(form, 'hormonal.estradiol.done')} onChange={(v) => update('hormonal.estradiol.done', v)} options={["Yes","No"]} />
                  <FormInput label="Date of Test" value={getNestedValue(form, 'hormonal.estradiol.date')} onChange={(v) => update('hormonal.estradiol.date', v)} disabled={getNestedValue(form, 'hormonal.estradiol.done') !== 'Yes'} placeholder="mm/dd/yyyy" type='date'/>
                  <FormInput label="Patient Value" value={getNestedValue(form, 'hormonal.estradiol.value')} onChange={(v) => update('hormonal.estradiol.value', v)} disabled={getNestedValue(form, 'hormonal.estradiol.done') !== 'Yes'} placeholder="~10-40 pg/mL" />
                  <FormSelect label="Interpretation" value={getNestedValue(form, 'hormonal.estradiol.interpretation')} onChange={(v) => update('hormonal.estradiol.interpretation', v)} options={["Normal","High","Low"]} disabled={getNestedValue(form, 'hormonal.estradiol.done') !== 'Yes'} />
                  <FormRadioGroup label="SHBG (optional)" value={getNestedValue(form, 'hormonal.shbg.done')} onChange={(v) => update('hormonal.shbg.done', v)} options={["Yes","No"]} />
                  <FormInput label="Date of Test" value={getNestedValue(form, 'hormonal.shbg.date')} onChange={(v) => update('hormonal.shbg.date', v)} disabled={getNestedValue(form, 'hormonal.shbg.done') !== 'Yes'} placeholder="mm/dd/yyyy" type='date'/>
                  <FormInput label="Patient Value" value={getNestedValue(form, 'hormonal.shbg.value')} onChange={(v) => update('hormonal.shbg.value', v)} disabled={getNestedValue(form, 'hormonal.shbg.done') !== 'Yes'} placeholder="10-57 nmol/L" />
                  <FormSelect label="Interpretation" value={getNestedValue(form, 'hormonal.shbg.interpretation')} onChange={(v) => update('hormonal.shbg.interpretation', v)} options={["Normal","Abnormal"]} disabled={getNestedValue(form, 'hormonal.shbg.done') !== 'Yes'} />
                  
                  <FormRadioGroup label="17-Hydroxy Progesterone (optional)" value={getNestedValue(form, 'hormonal.hp.done')} onChange={(v) => update('hormonal.hp.done', v)} options={["Yes","No"]} />
                  <FormInput label="Date of Test" value={getNestedValue(form, 'hormonal.hp.date')} onChange={(v) => update('hormonal.hp.date', v)} disabled={getNestedValue(form, 'hormonal.hp.done') !== 'Yes'} placeholder="mm/dd/yyyy" type='date'/>
                  <FormInput label="Patient Value" value={getNestedValue(form, 'hormonal.hp.value')} onChange={(v) => update('hormonal.hp.value', v)} disabled={getNestedValue(form, 'hormonal.hp.done') !== 'Yes'} placeholder="" />
                  <FormSelect label="Interpretation" value={getNestedValue(form, 'hormonal.hp.interpretation')} onChange={(v) => update('hormonal.hp.interpretation', v)} options={["Normal","Abnormal"]} disabled={getNestedValue(form, 'hormonal.hp.done') !== 'Yes'} />
                  
                  <FormRadioGroup label="Inhibin B (optional)" value={getNestedValue(form, 'hormonal.ib.done')} onChange={(v) => update('hormonal.ib.done', v)} options={["Yes","No"]} />
                  <FormInput label="Date of Test" value={getNestedValue(form, 'hormonal.ib.date')} onChange={(v) => update('hormonal.ib.date', v)} disabled={getNestedValue(form, 'hormonal.ib.done') !== 'Yes'} placeholder="mm/dd/yyyy" type='date'/>
                  <FormInput label="Patient Value" value={getNestedValue(form, 'hormonal.ib.value')} onChange={(v) => update('hormonal.ib.value', v)} disabled={getNestedValue(form, 'hormonal.ib.done') !== 'Yes'} placeholder="" />
                  <FormSelect label="Interpretation" value={getNestedValue(form, 'hormonal.ib.interpretation')} onChange={(v) => update('hormonal.ib.interpretation', v)} options={["Normal","Abnormal"]} disabled={getNestedValue(form, 'hormonal.ib.done') !== 'Yes'} />

                  <FormRadioGroup label="AMH (optional)" value={getNestedValue(form, 'hormonal.amh.done')} onChange={(v) => update('hormonal.amh.done', v)} options={["Yes","No"]} />
                  <FormInput label="Date of Test" value={getNestedValue(form, 'hormonal.amh.date')} onChange={(v) => update('hormonal.amh.date', v)} disabled={getNestedValue(form, 'hormonal.amh.done') !== 'Yes'} placeholder="mm/dd/yyyy" type='date'/>
                  <FormInput label="Patient Value" value={getNestedValue(form, 'hormonal.amh.value')} onChange={(v) => update('hormonal.amh.value', v)} disabled={getNestedValue(form, 'hormonal.amh.done') !== 'Yes'} placeholder="" />
                  <FormSelect label="Interpretation" value={getNestedValue(form, 'hormonal.amh.interpretation')} onChange={(v) => update('hormonal.amh.interpretation', v)} options={["Normal","Abnormal"]} disabled={getNestedValue(form, 'hormonal.amh.done') !== 'Yes'} />

                </div>
              </FormSection>
            )}

            {tab === 'scoring' && (
              <>
                <FormSection title="Erection Hardness Score (EHS)">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormRadioGroup label="Score 1: Penis is larger but not hard" value={getNestedValue(form, 'scoring.ehs.score1')} onChange={(v) => update('scoring.ehs.score1', v)} options={["Selected"]} />
                    <FormRadioGroup label="Score 2: Penis is hard but not hard enough for penetration" value={getNestedValue(form, 'scoring.ehs.score2')} onChange={(v) => update('scoring.ehs.score2', v)} options={["Selected"]} />
                    <FormRadioGroup label="Score 3: Penis is hard enough for penetration but not completely hard" value={getNestedValue(form, 'scoring.ehs.score3')} onChange={(v) => update('scoring.ehs.score3', v)} options={["Selected"]} />
                    <FormRadioGroup label="Score 4: Penis is completely hard and fully rigid" value={getNestedValue(form, 'scoring.ehs.score4')} onChange={(v) => update('scoring.ehs.score4', v)} options={["Selected"]} />
                  </div>
                </FormSection>

                <FormSection title="International Index of Erectile Function (IIEF)">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormSelect label="Q1: How often were you able to get an erection during sexual activity?" value={getNestedValue(form, 'scoring.iief.q1')} onChange={(v) => update('scoring.iief.q1', v)} options={["1-Never","2-Rarely","3-Sometimes","4-Most times","5-Always"]} />
                    <FormSelect label="Q2: When you had erections with sexual stimulation, how often were your erections hard enough for penetration?" value={getNestedValue(form, 'scoring.iief.q2')} onChange={(v) => update('scoring.iief.q2', v)} options={["1-Never","2-Rarely","3-Sometimes","4-Most times","5-Always"]} />
                    <FormSelect label="Q3: When you attempted intercourse, how often were you able to penetrate (enter) your partner?" value={getNestedValue(form, 'scoring.iief.q3')} onChange={(v) => update('scoring.iief.q3', v)} options={["1-Never","2-Rarely","3-Sometimes","4-Most times","5-Always"]} />
                    <FormSelect label="Q4: During sexual intercourse, how often were you able to maintain your erection after you had penetrated (entered) your partner?" value={getNestedValue(form, 'scoring.iief.q4')} onChange={(v) => update('scoring.iief.q4', v)} options={["1-Very difficult","2-Difficult","3-Somewhat difficult","4-Slightly difficult","5-Not difficult"]} />
                    <FormSelect label="Q5: During sexual intercourse, how difficult was it to maintain your erection to completion of intercourse?" value={getNestedValue(form, 'scoring.iief.q5')} onChange={(v) => update('scoring.iief.q5', v)} options={["1-Never","2-Rarely","3-Sometimes","4-Most times","5-Always"]} />
                    <FormSelect label="Q6: How many times have you attempted sexual intercourse?" value={getNestedValue(form, 'scoring.iief.q6')} onChange={(v) => update('scoring.iief.q6', v)} options={["1-Never","2-Rarely","3-Sometimes","4-Most times","5-Always"]} />
                    <FormSelect label="Q7: When you attempted sexual intercourse, how often was it satisfactory for you?" value={getNestedValue(form, 'scoring.iief.q7')} onChange={(v) => update('scoring.iief.q7', v)} options={["1-Very dissatisfied","2-Dissatisfied","3-Somewhat satisfied","4-Satisfied","5-Very satisfied"]} />
                    <FormSelect label="Q8: How much have you enjoyed sexual intercourse?" value={getNestedValue(form, 'scoring.iief.q8')} onChange={(v) => update('scoring.iief.q8', v)} options={["1-Never","2-Rarely","3-Sometimes","4-Most times","5-Always"]} />
                    <FormSelect label="Q9: When you had sexual stimulation or intercourse, how often did you ejaculate?" value={getNestedValue(form, 'scoring.iief.q9')} onChange={(v) => update('scoring.iief.q9', v)} options={["1-Very low","2-Low","3-Moderate","4-High","5-Very high"]} />
                    <FormSelect label="Q10: When you had sexual stimulation or intercourse, how often did you have the feeling of orgasm or climax?" value={getNestedValue(form, 'scoring.iief.q10')} onChange={(v) => update('scoring.iief.q10', v)} options={["1-Very dissatisfied","2-Dissatisfied","3-Somewhat satisfied","4-Satisfied","5-Very satisfied"]} />
                    <FormSelect label="Q11: How often have you felt sexual desire?" value={getNestedValue(form, 'scoring.iief.q11')} onChange={(v) => update('scoring.iief.q11', v)} options={["1-Very dissatisfied","2-Dissatisfied","3-Somewhat satisfied","4-Satisfied","5-Very satisfied"]} />
                    <FormSelect label="Q12: How would you rate your level of sexual desire?" value={getNestedValue(form, 'scoring.iief.q12')} onChange={(v) => update('scoring.iief.q12', v)} options={["1-Never","2-Rarely","3-Sometimes","4-Most times","5-Always"]} />
                    <FormSelect label="Q13: How satisfied have you been with your overall sex life?" value={getNestedValue(form, 'scoring.iief.q13')} onChange={(v) => update('scoring.iief.q13', v)} options={["1-Very dissatisfied","2-Dissatisfied","3-Somewhat satisfied","4-Satisfied","5-Very satisfied"]} />
                    <FormSelect label="Q14: How satisfied have you been with your sexual relationship with your partner?" value={getNestedValue(form, 'scoring.iief.q14')} onChange={(v) => update('scoring.iief.q14', v)} options={["1-Never","2-Rarely","3-Sometimes","4-Most times","5-Always"]} />
                    <FormSelect label="Q15: How do you rate your confidence that you could get and keep an erection?" value={getNestedValue(form, 'scoring.iief.q15')} onChange={(v) => update('scoring.iief.q15', v)} options={["1-Never","2-Rarely","3-Sometimes","4-Most times","5-Always"]} />
                  </div>
                </FormSection>
              </>
            )}

            {tab === 'imaging' && (
              <FormSection title="Imaging & Diagnostics">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <span className="text-sm text-gray-300 mb-2 block">Investigations</span>
                  </div>
                  <FormRadioGroup label="Scrotal Ultrasound" value={getNestedValue(form, 'imaging.scrotalUltrasound.done')} onChange={(v) => update('imaging.scrotalUltrasound.done', v)} options={["Yes","No"]} />
                  <FormInput label="Date" value={getNestedValue(form, 'imaging.scrotalUltrasound.date')} onChange={(v) => update('imaging.scrotalUltrasound.date', v)} disabled={getNestedValue(form, 'imaging.scrotalUltrasound.done') !== 'Yes'} placeholder="mm/dd/yyyy" type='date' />
                  <FormInput label="Findings/Remarks" value={getNestedValue(form, 'imaging.scrotalUltrasound.findings')} onChange={(v) => update('imaging.scrotalUltrasound.findings', v)} disabled={getNestedValue(form, 'imaging.scrotalUltrasound.done') !== 'Yes'} />
                  <FormRadioGroup label="Penile Doppler (if done)" value={getNestedValue(form, 'imaging.penileDoppler.done')} onChange={(v) => update('imaging.penileDoppler.done', v)} options={["Yes","No"]} />
                  <FormInput label="Date" value={getNestedValue(form, 'imaging.penileDoppler.date')} onChange={(v) => update('imaging.penileDoppler.date', v)} disabled={getNestedValue(form, 'imaging.penileDoppler.done') !== 'Yes'} placeholder="mm/dd/yyyy" type='date' />
                  <FormInput label="Findings/Remarks" value={getNestedValue(form, 'imaging.penileDoppler.findings')} onChange={(v) => update('imaging.penileDoppler.findings', v)} disabled={getNestedValue(form, 'imaging.penileDoppler.done') !== 'Yes'} />
                  <FormRadioGroup label="Other imaging (e.g. MRI, CT)" value={getNestedValue(form, 'imaging.otherImaging.done')} onChange={(v) => update('imaging.otherImaging.done', v)} options={["Yes","No"]} />
                  <FormInput label="Type" value={getNestedValue(form, 'imaging.otherImaging.type')} onChange={(v) => update('imaging.otherImaging.type', v)} disabled={getNestedValue(form, 'imaging.otherImaging.done') !== 'Yes'} />
                  <FormInput label="Date" value={getNestedValue(form, 'imaging.otherImaging.date')} onChange={(v) => update('imaging.otherImaging.date', v)} disabled={getNestedValue(form, 'imaging.otherImaging.done') !== 'Yes'} placeholder="mm/dd/yyyy" type='date' />
                  <FormInput label="Findings" value={getNestedValue(form, 'imaging.otherImaging.findings')} onChange={(v) => update('imaging.otherImaging.findings', v)} disabled={getNestedValue(form, 'imaging.otherImaging.done') !== 'Yes'} />
                  <FormRadioGroup label="Urological Exam (if applicable)" value={getNestedValue(form, 'imaging.urologicalExam.done')} onChange={(v) => update('imaging.urologicalExam.done', v)} options={["Yes","No"]} />
                  <FormInput label="Date" value={getNestedValue(form, 'imaging.urologicalExam.date')} onChange={(v) => update('imaging.urologicalExam.date', v)} disabled={getNestedValue(form, 'imaging.urologicalExam.done') !== 'Yes'} placeholder="mm/dd/yyyy" type='date' />
                  <FormInput label="Findings/Remarks" value={getNestedValue(form, 'imaging.urologicalExam.findings')} onChange={(v) => update('imaging.urologicalExam.findings', v)} disabled={getNestedValue(form, 'imaging.urologicalExam.done') !== 'Yes'} />

                  <FormRadioGroup label="Sildenafil Office Test" value={getNestedValue(form, 'imaging.sot.done')} onChange={(v) => update('imaging.sot.done', v)} options={["Yes","No"]} />
                  <FormInput label="Date" value={getNestedValue(form, 'imaging.sot.date')} onChange={(v) => update('imaging.sot.date', v)} disabled={getNestedValue(form, 'imaging.sot.done') !== 'Yes'} placeholder="mm/dd/yyyy" type='date' />
                  <FormInput label="Findings/Remarks" value={getNestedValue(form, 'imaging.sot.findings')} onChange={(v) => update('imaging.sot.findings', v)} disabled={getNestedValue(form, 'imaging.sot.done') !== 'Yes'} />

                  <FormRadioGroup label="ICI Test" value={getNestedValue(form, 'imaging.ici.done')} onChange={(v) => update('imaging.ici.done', v)} options={["Yes","No"]} />
                  <FormInput label="Date" value={getNestedValue(form, 'imaging.ici.date')} onChange={(v) => update('imaging.ici.date', v)} disabled={getNestedValue(form, 'imaging.ici.done') !== 'Yes'} placeholder="mm/dd/yyyy" type='date' />
                  <FormInput label="Findings/Remarks" value={getNestedValue(form, 'imaging.ici.findings')} onChange={(v) => update('imaging.ici.findings', v)} disabled={getNestedValue(form, 'imaging.ici.done') !== 'Yes'} />

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

            {tab === 'psychological' && (
              <FormSection title="Psychological Screening">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput label="PHQ-9 (Patient Health Questionnaire-9 item scale) Depression screening" value={getNestedValue(form, 'psychological.phq9.score')} onChange={(v) => update('psychological.phq9.score', v)} type="number" placeholder="/27" />
                  <FormSelect label="PHQ-9 Interpretation" value={getNestedValue(form, 'psychological.phq9.interpretation')} onChange={(v) => update('psychological.phq9.interpretation', v)} options={["Normal","Mild","Moderate","Severe"]} />
                  <FormInput label="GAD-7 Score (Generalized Anxiety Disorder-7 Item scale) Anxiety Screening" value={getNestedValue(form, 'psychological.gad7.score')} onChange={(v) => update('psychological.gad7.score', v)} type="number" placeholder="/21" />
                  <FormSelect label="GAD-7 Interpretation" value={getNestedValue(form, 'psychological.gad7.interpretation')} onChange={(v) => update('psychological.gad7.interpretation', v)} options={["Normal","Mild","Moderate","Severe"]} />
                  <FormSelect label="Perceived Stress Level" value={getNestedValue(form, 'psychological.stressLevel')} onChange={(v) => update('psychological.stressLevel', v)} options={["Low","Moderate","High"]} />
                  <FormRadioGroup label="Emotional issues related to infertility or ED?" value={getNestedValue(form, 'psychological.emotionalIssues')} onChange={(v) => update('psychological.emotionalIssues', v)} options={["Yes","No"]} />
                  <FormInput label="If yes, specify" value={getNestedValue(form, 'psychological.emotionalIssuesDetails')} onChange={(v) => update('psychological.emotionalIssuesDetails', v)} disabled={getNestedValue(form, 'psychological.emotionalIssues') !== 'Yes'} />
                  <FormSelect label="Referral to mental health professional?" value={getNestedValue(form, 'psychological.referral')} onChange={(v) => update('psychological.referral', v)} options={["Yes","No"]} />
                  <FormSelect label="Referral Status" value={getNestedValue(form, 'psychological.referralStatus')} onChange={(v) => update('psychological.referralStatus', v)} options={["Referred","Declined","Already under care"]} disabled={getNestedValue(form, 'psychological.referral') !== 'Yes'} />
                </div>
              </FormSection>
            )}

            {tab === 'followup' && (
              <>
                <FormSection title="Follow-up Plan">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="Next Scheduled Visit" value={getNestedValue(form, 'followup.nextVisit')} onChange={(v) => update('followup.nextVisit', v)} placeholder="mm/dd/yyyy" type='date' />
                    <FormSelect label="Referral Advised" value={getNestedValue(form, 'followup.referral')} onChange={(v) => update('followup.referral', v)} options={["Urologist","Andrologist","Psychiatrist","Other"]} />
                    <FormSelect label="Further Investigations Planned" value={getNestedValue(form, 'followup.investigations')} onChange={(v) => update('followup.investigations', v)} options={["Hormonal Panel","Imaging","Semen Analysis","Other"]} />
                    <FormSelect label="Patient Compliance and Motivation" value={getNestedValue(form, 'followup.compliance')} onChange={(v) => update('followup.compliance', v)} options={["Good","Fair","Poor"]} />
                    <FormInput label="General Remarks" value={getNestedValue(form, 'followup.remarks')} onChange={(v) => update('followup.remarks', v)} placeholder="Additional notes" />
                  </div>
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
                disabled={tab === 'followup'}
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
