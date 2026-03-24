import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { ChevronUpIcon, ChevronDownIcon, PencilIcon, PlusIcon, Bars3Icon, XMarkIcon, UserCircleIcon, HeartIcon, ClipboardDocumentListIcon, BeakerIcon, CheckBadgeIcon, ChartBarIcon, DocumentTextIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Navbar from '@/components/common/Navbar'
import { useAuth } from '@/hooks/AuthContext'
import { getNestedValue } from '@/components/form/FormControls'
import { exportdatatoCSV } from '@/utils/export'
import { usePatient } from '@/hooks/PatientContext'
import MaleInfertilityCRF from '@/components/crf/male_infertility'
import MaleSexualDysfunctionCRF from '@/components/crf/male_sexual_dysfunction'

type PatientSummary = {
  patient_id: string
  doctor_id: string
  condition_type: 'male_infertility' | 'male_sexual_dysfunction'
  first_visit_date: string
  last_visit_date: string | null
  full_name: string
  age?: number
}

type FollowupItem = { id: string; date: string; title: string; status: 'upcoming' | 'completed' | 'missed' | 'rescheduled'; is_initial?: boolean; crf_data?: any }

export default function CRFPage() {
  const router = useRouter()
  const { user } = useAuth()
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  const { setPatientDetails } = usePatient();

  const patientId = typeof router.query?.patient_id === 'string' ? router.query.patient_id : ''

  const [patient, setPatient] = useState<PatientSummary | null>(null)
  const [timeline, setTimeline] = useState<FollowupItem[]>([])
  const [activeFollowupId, setActiveFollowupId] = useState<string | null>(null)
  const [followupDetails, setFollowupDetails] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEdit, setIsEdit] = useState(false)

  const [expandedSections, setExpandedSections] = useState({
    treatment: true,
    laboratoryResults: false,
    newObservations: false
  })

  const [tab, setTab] = useState<string>('demographics')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const fetchPatient = async () => {
    if (!user?.id || !patientId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${apiBase}/api/patients/${patientId}?doctor_id=${user.id}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to load patient')
      setPatient(json)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchFollowups = async () => {
    if (!user?.id || !patientId) return
    try {
      const res = await fetch(`${apiBase}/api/patients/${patientId}/followups?doctor_id=${user.id}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to load followups')
      const items: FollowupItem[] = json.items || []
      setTimeline(items)
      if (!activeFollowupId && items.length) {
        setActiveFollowupId(items[0].id)
        if (items[0]?.crf_data) setFollowupDetails({ crf_data: items[0].crf_data, scheduled_date: items[0].date })
      }
    } catch (e) {
      // surface on UI if needed via banner
    }
  }

  useEffect(() => {
    if (user?.id && patientId) {
      fetchPatient()
      fetchFollowups()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, patientId])


  useEffect(() => {
    const followup = timeline.find(t => t.id === activeFollowupId)
    setFollowupDetails({ crf_data: followup?.crf_data, scheduled_date: followup?.date })
  }, [activeFollowupId])

  // Get available tabs based on condition type
  const getAvailableTabs = () => {
    if (patient?.condition_type === 'male_sexual_dysfunction') {
      return [
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
      ]
    } else {
      return [
        { id: 'demographics', title: 'Demographics', icon: UserCircleIcon },
        { id: 'physical', title: 'Physical Exam', icon: HeartIcon },
        { id: 'history', title: 'Medical & Reproductive', icon: ClipboardDocumentListIcon },
        { id: 'semen', title: 'Semen Analysis', icon: BeakerIcon },
        { id: 'investigations', title: 'Optional Investigations', icon: BeakerIcon },
        { id: 'treatment', title: 'Diagnosis & Treatment Plan', icon: ClipboardDocumentListIcon },
        { id: 'final', title: 'Final Notes', icon: CheckBadgeIcon }
      ]
    }
  }

  // Helper function to format empty values
  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === '') return '—'
    return String(value)
  }

  const handleNewFollowUp = () => {
    setPatientDetails({condition: patient?.condition_type, crf_data: followupDetails?.crf_data, patient_id: patientId});
    router.push('/patients/add');
  }

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

  const checkUpcomingStatus = () => {
    const timeLine = timeline.filter((t) => t.id === activeFollowupId);
    return timeLine?.[0]?.status === 'upcoming';
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="flex max-w-7xl mx-auto min-h-screen">
          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Left Sidebar */}
          <div
            className={`w-80 bg-slate-800 border-r border-slate-700 min-h-screen transition-transform duration-300 ease-in-out ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } lg:translate-x-0 fixed lg:relative z-50 lg:z-auto`}
          >
            {/* Patient Info */}
            <div className="p-6 border-b border-slate-700">
              <h1 className="text-2xl font-bold text-white mb-2">
                {patient?.full_name || "—"}
              </h1>
              <div className="space-y-1 text-sm text-slate-400">
                <div>Patient ID: {patient?.patient_id?.slice(0, 8) || "—"}</div>
                <div>First Visit: {patient?.first_visit_date || "—"}</div>
                <div>
                  Age:{" "}
                  {followupDetails?.crf_data?.demographics?.age ??
                    patient?.age ??
                    "—"}
                </div>
                <div>
                  Sex:{" "}
                  {followupDetails?.crf_data?.demographics?.sex ||
                    followupDetails?.crf_data?.demographics?.gender ||
                    "Male"}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <button
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  onClick={handleNewFollowUp}
                >
                  <PlusIcon className="w-4 h-4" />
                  New Follow-up
                </button>
                <button
                  className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  onClick={() =>
                    exportdatatoCSV(
                      timeline.map((t) => {
                        return {
                          crf_data: t?.crf_data,
                          title: t?.title,
                          fullName: patient?.full_name,
                          scheduled_date: t?.date,
                        };
                      }),
                      patient?.condition_type
                    )
                  }
                >
                  <PencilIcon className="w-4 h-4" />
                  Export Data as CSV
                </button>
              </div>
            </div>

            {/* Follow-up Timeline */}
            <div className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Follow-up Timeline
              </h2>
              <div className="space-y-4">
                {timeline.map((item, index) => (
                  <div key={item.id} className="relative">
                    {/* Timeline line */}
                    {index < timeline.length - 1 && (
                      <div className="absolute left-3 top-8 w-0.5 h-12 bg-slate-600"></div>
                    )}

                    <div className="flex items-start gap-3">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          item.id === activeFollowupId
                            ? "bg-green-500 border-green-500"
                            : "bg-slate-700 border-slate-600"
                        }`}
                      >
                        {item.id === activeFollowupId && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>

                      <div
                        className={`flex-1 p-3 rounded-lg ${
                          item.id === activeFollowupId
                            ? "bg-slate-700 border border-slate-600"
                            : "bg-slate-800/50"
                        }`}
                      >
                        <button
                          onClick={() => setActiveFollowupId(item.id)}
                          className={`font-medium ${
                            item.id === activeFollowupId
                              ? "text-white"
                              : "text-slate-300"
                          }`}
                        >
                          {item.title}
                        </button>
                        <div className="text-sm text-slate-400 mt-1">
                          {item.date}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Status: {item.status}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-4 lg:p-8">
            <div className="max-w-4xl">
              {/* Mobile menu button */}
              <div className="lg:hidden mb-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="flex items-center gap-2 text-slate-300 hover:text-white"
                >
                  <Bars3Icon className="w-6 h-6" />
                  <span>Patient Info</span>
                </button>
              </div>

              {timeline.length > 0 && <div className="mb-6 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl lg:text-3xl font-bold text-white">
                    {timeline.find((t) => t.id === activeFollowupId)?.title ||
                      "Follow-up"}{" "}
                    CRF Data
                  </h1>
                  <p className="text-slate-400 mt-1">
                    Date:{" "}
                    {timeline.find((t) => t.id === activeFollowupId)?.date ||
                      "—"}
                  </p>
                </div>
                {isEdit ? (
                  <button
                    className="flex items-center gap-2 bg-green-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                    onClick={() => setIsEdit(false)}
                  >
                    <PencilIcon className="w-4 h-4" />
                    Back
                  </button>
                ) : checkUpcomingStatus() ? (
                  <button
                    className="flex items-center gap-2 bg-green-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                    onClick={() => setIsEdit(true)}
                  >
                    <PencilIcon className="w-4 h-4" />
                    Add Follow Up Details
                  </button>
                ) : (
                  <button
                    className="flex items-center gap-2 bg-green-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                    onClick={() => setIsEdit(true)}
                  >
                    <PencilIcon className="w-4 h-4" />
                    Edit Follow Up
                  </button>
                )}
              </div>}

              {timeline.length === 0 ? (
                <div className="flex flex-col items-center gap-3">
                  <ClipboardDocumentIcon className="w-10 h-10 text-slate-600" />
                  <div className="text-slate-300">
                    No appointment found for this patient.
                  </div>
                  <button
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    onClick={handleNewFollowUp}
                  >
                    <PlusIcon className="w-4 h-4" />
                    New Follow-up
                  </button>{" "}
                </div>
              ) : (
                <>
                  {isEdit ? (
                    patient?.condition_type === "male_infertility" ? (
                      <MaleInfertilityCRF
                        user={user}
                        isFirstTime={false}
                        selectedDate=""
                        isEdit
                        crfData={followupDetails?.crf_data}
                        followupId={activeFollowupId}
                      />
                    ) : (
                      <MaleSexualDysfunctionCRF
                        user={user}
                        isFirstTime={false}
                        selectedDate=""
                        isEdit
                        crfData={followupDetails?.crf_data}
                        followupId={activeFollowupId}
                      />
                    )
                  ) : (
                    <div className="space-y-4">
                      {/* Tabs */}
                      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                        <div className="flex flex-wrap gap-2">
                          {getAvailableTabs().map((t: any) => (
                            <TabButton
                              key={t.id}
                              id={t.id}
                              title={t.title}
                              Icon={t.icon}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Dynamic CRF Data Display */}
                      {patient?.condition_type === "male_infertility" ? (
                        // Male Infertility CRF Display
                        <>
                          {tab === "demographics" && (
                            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 lg:p-6">
                              <h3 className="text-lg font-semibold text-white mb-4">
                                Patient Demographics
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-200">
                                <Field
                                  label="Date of First Visit"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.firstVisit",
                                      patient?.first_visit_date
                                    )
                                  )}
                                />
                                <Field
                                  label="Full Name"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.fullName",
                                      patient?.full_name
                                    )
                                  )}
                                />
                                <Field
                                  label="Age (years)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.age",
                                      patient?.age
                                    )
                                  )}
                                />
                                <Field
                                  label="Sex"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.sex"
                                    )
                                  )}
                                />
                                <Field
                                  label="Marital Status"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.maritalStatus"
                                    )
                                  )}
                                />
                                <Field
                                  label="Duration of Marriage (years)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.durationMarriage"
                                    )
                                  )}
                                />
                                <Field
                                  label="Occupation"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.occupation"
                                    )
                                  )}
                                />
                                <Field
                                  label="Education Level"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.education"
                                    )
                                  )}
                                />
                                <Field
                                  label="Weight (kg)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.bmi.weight"
                                    )
                                  )}
                                />
                                <Field
                                  label="Height (cm)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.bmi.height"
                                    )
                                  )}
                                />
                                <Field
                                  label="BMI"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.bmi.value"
                                    )
                                  )}
                                />
                                <Field
                                  label="Smoking Status"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.smoking.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="If smoking, cigarettes/day"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.smoking.cigarettesPerDay"
                                    )
                                  )}
                                />
                                <Field
                                  label="Alcohol Intake"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.alcohol.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="If alcohol, units/week"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.alcohol.unitsPerWeek"
                                    )
                                  )}
                                />
                                <Field
                                  label="Substance Use / Drugs"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.substance"
                                    )
                                  )}
                                />
                                <Field
                                  label="Substance details"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.substanceDetails"
                                    )
                                  )}
                                />
                                <Field
                                  label="Known Congenital Abnormalities"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.congenital.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="If yes, specify"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.congenital.details"
                                    )
                                  )}
                                />
                                <Field
                                  label="Medical History"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.medicalHistory"
                                    )
                                  )}
                                />
                                <Field
                                  label="Medical History Details"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.medicalHistoryDetails"
                                    )
                                  )}
                                />
                                <Field
                                  label="History of Surgery"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.surgery.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Surgery Details"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.surgery.details"
                                    )
                                  )}
                                />
                                <Field
                                  label="Previous Fertility Evaluation/Treatment"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.previousFertility.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Previous Fertility Details"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.previousFertility.details"
                                    )
                                  )}
                                />
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        // Male Sexual Dysfunction CRF Display
                        <>
                          {tab === "demographics" && (
                            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 lg:p-6">
                              <h3 className="text-lg font-semibold text-white mb-4">
                                Patient Demographics
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-200">
                                <Field
                                  label="Full Name"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.fullName",
                                      patient?.full_name
                                    )
                                  )}
                                />
                                <Field
                                  label="Date of Birth"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.dateOfBirth"
                                    )
                                  )}
                                />
                                <Field
                                  label="Age (in years)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.age",
                                      patient?.age
                                    )
                                  )}
                                />
                                <Field
                                  label="Gender"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.gender"
                                    )
                                  )}
                                />
                                <Field
                                  label="Date of First Visit"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.firstVisit",
                                      patient?.first_visit_date
                                    )
                                  )}
                                />
                                <Field
                                  label="Contact Information"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.contact"
                                    )
                                  )}
                                />
                                <Field
                                  label="Address / Pin code (optional)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.address"
                                    )
                                  )}
                                />
                                <Field
                                  label="Marital Status"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.maritalStatus"
                                    )
                                  )}
                                />
                                <Field
                                  label="Duration of Marriage (years)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.durationMarriage"
                                    )
                                  )}
                                />
                                <Field
                                  label="Education Level"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.education"
                                    )
                                  )}
                                />
                                <Field
                                  label="Occupation"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.occupation"
                                    )
                                  )}
                                />
                                <Field
                                  label="Weight (kg)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.weight"
                                    )
                                  )}
                                />
                                <Field
                                  label="Height (cm)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.height"
                                    )
                                  )}
                                />
                                <Field
                                  label="BMI"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "demographics.bmi"
                                    )
                                  )}
                                />
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Continue with remaining tabs for Male Infertility */}
                      {patient?.condition_type === "male_infertility" && (
                        <>
                          {tab === "physical" && (
                            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 lg:p-6">
                              <h3 className="text-lg font-semibold text-white mb-4">
                                Physical Examination
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-200">
                                <Field
                                  label="General Appearance"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "physical.generalAppearance"
                                    )
                                  )}
                                />
                                <Field
                                  label="Secondary Sexual Characteristics"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "physical.secondarySex"
                                    )
                                  )}
                                />
                                <Field
                                  label="Gynecomastia"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "physical.gynecomastia.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Gynecomastia Side"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "physical.gynecomastia.side"
                                    )
                                  )}
                                />
                                <Field
                                  label="Penis"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "physical.penis"
                                    )
                                  )}
                                />
                                <Field
                                  label="Testes – Right Volume (cc)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "physical.testes.right.volume"
                                    )
                                  )}
                                />
                                <Field
                                  label="Right Consistency"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "physical.testes.right.consistency"
                                    )
                                  )}
                                />
                                <Field
                                  label="Testes – Left Volume (cc)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "physical.testes.left.volume"
                                    )
                                  )}
                                />
                                <Field
                                  label="Left Consistency"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "physical.testes.left.consistency"
                                    )
                                  )}
                                />
                                <Field
                                  label="Epididymis"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "physical.epididymis"
                                    )
                                  )}
                                />
                                <Field
                                  label="Vas Deferens (Right)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "physical.vas.right"
                                    )
                                  )}
                                />
                                <Field
                                  label="Vas Deferens (Left)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "physical.vas.left"
                                    )
                                  )}
                                />
                                <Field
                                  label="Spermatic Cords"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "physical.spermaticCords.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Varicocele Grade"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "physical.spermaticCords.grade"
                                    )
                                  )}
                                />
                                <Field
                                  label="Scars (Inguinal/Scrotal)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "physical.scars.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Scar Location"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "physical.scars.location"
                                    )
                                  )}
                                />
                                <Field
                                  label="Rectal Examination"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "physical.rectal.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Rectal Findings"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "physical.rectal.findings"
                                    )
                                  )}
                                />
                              </div>
                            </div>
                          )}

                          {tab === "history" && (
                            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 lg:p-6">
                              <h3 className="text-lg font-semibold text-white mb-4">
                                Medical and Reproductive History
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-200">
                                <Field
                                  label="Duration of Infertility"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "history.duration"
                                    )
                                  )}
                                />
                                <Field
                                  label="Consanguinity in Marriage"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "history.consanguinity"
                                    )
                                  )}
                                />
                                <Field
                                  label="Use of Contraception"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "history.contraception"
                                    )
                                  )}
                                />
                                <Field
                                  label="Contraception Method"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "history.contraceptionMethod"
                                    )
                                  )}
                                />
                                <Field
                                  label="Use of Lubricants"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "history.lubricants.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Lubricant Type"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "history.lubricants.type"
                                    )
                                  )}
                                />
                                <Field
                                  label="Frequency of Sexual Intercourse (times/week)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "history.frequency"
                                    )
                                  )}
                                />
                                <Field
                                  label="Regularity"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "history.regularity"
                                    )
                                  )}
                                />
                                <Field
                                  label="Knowledge of Ovulatory Cycle"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "history.ovulatoryKnowledge"
                                    )
                                  )}
                                />
                                <Field
                                  label="Ejaculate Volume (Patient reported)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "history.ejaculateVolume"
                                    )
                                  )}
                                />
                                <Field
                                  label="Erectile Dysfunction"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "history.erectileDysfunction.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Erectile Dysfunction Details"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "history.erectileDysfunction.details"
                                    )
                                  )}
                                />
                                <Field
                                  label="Ejaculatory Dysfunction"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "history.ejaculatoryDysfunction"
                                    )
                                  )}
                                />
                                <Field
                                  label="Any History of STD / UTI"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "history.std.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="STD/UTI Specify"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "history.std.details"
                                    )
                                  )}
                                />
                                <Field
                                  label="Past Febrile Illness (e.g. Mumps)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "history.febrile.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Febrile illness specify"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "history.febrile.details"
                                    )
                                  )}
                                />
                                <Field
                                  label="Chronic Medical Conditions"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "history.chronicConditions"
                                    )
                                  )}
                                />
                                <Field
                                  label="History of Chemotherapy / Radiotherapy"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "history.therapy.type"
                                    )
                                  )}
                                />
                                <Field
                                  label="When & Why"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "history.therapy.details"
                                    )
                                  )}
                                />
                                <Field
                                  label="Testicular Torsion / Trauma / Swelling"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "history.testicular.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Testicular history details"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "history.testicular.details"
                                    )
                                  )}
                                />
                                <Field
                                  label="History of Surgery"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "history.surgery.type"
                                    )
                                  )}
                                />
                                <Field
                                  label="Congenital Anomalies (Self)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "history.congenitalSelf"
                                    )
                                  )}
                                />
                                <Field
                                  label="Family History"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "history.family"
                                    )
                                  )}
                                />
                                <Field
                                  label="Environmental Toxin Exposure"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "history.environment"
                                    )
                                  )}
                                />
                                <Field
                                  label="Lifestyle Factors"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "history.lifestyle"
                                    )
                                  )}
                                />
                              </div>
                            </div>
                          )}

                          {tab === "semen" && (
                            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 lg:p-6">
                              <h3 className="text-lg font-semibold text-white mb-4">
                                Semen Analysis
                              </h3>

                              <div className="mb-6">
                                <h4 className="text-slate-300 font-semibold mb-3">
                                  Pre-Analytical Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-200">
                                  <Field
                                    label="Abstinence Period (days)"
                                    value={formatValue(
                                      getNestedValue(
                                        followupDetails?.crf_data,
                                        "semen.pre.abstinenceDays"
                                      )
                                    )}
                                  />
                                  <Field
                                    label="Collected at Lab?"
                                    value={formatValue(
                                      getNestedValue(
                                        followupDetails?.crf_data,
                                        "semen.pre.collectedAtLab"
                                      )
                                    )}
                                  />
                                  <Field
                                    label="Complete Collection?"
                                    value={formatValue(
                                      getNestedValue(
                                        followupDetails?.crf_data,
                                        "semen.pre.completeCollection.status"
                                      )
                                    )}
                                  />
                                  <Field
                                    label="What was missing"
                                    value={formatValue(
                                      getNestedValue(
                                        followupDetails?.crf_data,
                                        "semen.pre.completeCollection.missing"
                                      )
                                    )}
                                  />
                                  <Field
                                    label="Collection Time (hh:mm)"
                                    value={formatValue(
                                      getNestedValue(
                                        followupDetails?.crf_data,
                                        "semen.pre.collectionTime"
                                      )
                                    )}
                                  />
                                  <Field
                                    label="Sample Delivery Time (hh:mm)"
                                    value={formatValue(
                                      getNestedValue(
                                        followupDetails?.crf_data,
                                        "semen.pre.deliveryTime"
                                      )
                                    )}
                                  />
                                  <Field
                                    label="Severe Infection/Inflammation in Last 6 Months?"
                                    value={formatValue(
                                      getNestedValue(
                                        followupDetails?.crf_data,
                                        "semen.pre.infection"
                                      )
                                    )}
                                  />
                                  <Field
                                    label="Current Medications for Severe/Chronic Disease?"
                                    value={formatValue(
                                      getNestedValue(
                                        followupDetails?.crf_data,
                                        "semen.pre.medications"
                                      )
                                    )}
                                  />
                                  <Field
                                    label="Medication Details"
                                    value={formatValue(
                                      getNestedValue(
                                        followupDetails?.crf_data,
                                        "semen.pre.medicationDetails"
                                      )
                                    )}
                                  />
                                </div>
                              </div>

                              <div className="mb-6">
                                <h4 className="text-slate-300 font-semibold mb-3">
                                  Macroscopic Examination
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-200">
                                  <Field
                                    label="Ejaculate Volume (mL)"
                                    value={formatValue(
                                      getNestedValue(
                                        followupDetails?.crf_data,
                                        "semen.macro.volume"
                                      )
                                    )}
                                  />
                                  <Field
                                    label="Appearance"
                                    value={formatValue(
                                      getNestedValue(
                                        followupDetails?.crf_data,
                                        "semen.macro.appearance"
                                      )
                                    )}
                                  />
                                  <Field
                                    label="Viscosity"
                                    value={formatValue(
                                      getNestedValue(
                                        followupDetails?.crf_data,
                                        "semen.macro.viscosity"
                                      )
                                    )}
                                  />
                                  <Field
                                    label="Liquefaction"
                                    value={formatValue(
                                      getNestedValue(
                                        followupDetails?.crf_data,
                                        "semen.macro.liquefaction"
                                      )
                                    )}
                                  />
                                  <Field
                                    label="Treatment to Induce Liquefaction"
                                    value={formatValue(
                                      getNestedValue(
                                        followupDetails?.crf_data,
                                        "semen.macro.treatment"
                                      )
                                    )}
                                  />
                                  <Field
                                    label="pH"
                                    value={formatValue(
                                      getNestedValue(
                                        followupDetails?.crf_data,
                                        "semen.macro.ph"
                                      )
                                    )}
                                  />
                                  <Field
                                    label="Agglutination"
                                    value={formatValue(
                                      getNestedValue(
                                        followupDetails?.crf_data,
                                        "semen.macro.agglutination"
                                      )
                                    )}
                                  />
                                </div>
                              </div>

                              <div className="mb-6">
                                <h4 className="text-slate-300 font-semibold mb-3">
                                  Microscopic Examination
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-200">
                                  <Field
                                    label="Sperm Concentration (10^6/mL)"
                                    value={formatValue(
                                      getNestedValue(
                                        followupDetails?.crf_data,
                                        "semen.micro.concentration"
                                      )
                                    )}
                                  />
                                  <Field
                                    label="Total Sperm Count (10^6/ejaculate)"
                                    value={formatValue(
                                      getNestedValue(
                                        followupDetails?.crf_data,
                                        "semen.micro.totalCount"
                                      )
                                    )}
                                  />
                                  <Field
                                    label="Counting Error (%)"
                                    value={formatValue(
                                      getNestedValue(
                                        followupDetails?.crf_data,
                                        "semen.micro.countingError"
                                      )
                                    )}
                                  />
                                  <Field
                                    label="Rapid Progressive (a) %"
                                    value={formatValue(
                                      getNestedValue(
                                        followupDetails?.crf_data,
                                        "semen.micro.motility.a"
                                      )
                                    )}
                                  />
                                  <Field
                                    label="Slow Progressive (b) %"
                                    value={formatValue(
                                      getNestedValue(
                                        followupDetails?.crf_data,
                                        "semen.micro.motility.b"
                                      )
                                    )}
                                  />
                                  <Field
                                    label="Non-Progressive (c) %"
                                    value={formatValue(
                                      getNestedValue(
                                        followupDetails?.crf_data,
                                        "semen.micro.motility.c"
                                      )
                                    )}
                                  />
                                  <Field
                                    label="Immotile (d) %"
                                    value={formatValue(
                                      getNestedValue(
                                        followupDetails?.crf_data,
                                        "semen.micro.motility.d"
                                      )
                                    )}
                                  />
                                  <Field
                                    label="Total Motile (a+b+c) %"
                                    value={formatValue(
                                      getNestedValue(
                                        followupDetails?.crf_data,
                                        "semen.micro.totalMotile"
                                      )
                                    )}
                                  />
                                  <Field
                                    label="All Progressive (a+b) %"
                                    value={formatValue(
                                      getNestedValue(
                                        followupDetails?.crf_data,
                                        "semen.micro.progressive"
                                      )
                                    )}
                                  />
                                  <Field
                                    label="Vitality (% live sperm)"
                                    value={formatValue(
                                      getNestedValue(
                                        followupDetails?.crf_data,
                                        "semen.micro.vitality"
                                      )
                                    )}
                                  />
                                </div>
                              </div>

                              <div className="mb-6">
                                <h4 className="text-slate-300 font-semibold mb-3">
                                  Morphology
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-200">
                                  <Field
                                    label="Normal Forms %"
                                    value={formatValue(
                                      getNestedValue(
                                        followupDetails?.crf_data,
                                        "semen.morphology.normal"
                                      )
                                    )}
                                  />
                                  <Field
                                    label="Abnormal Heads %"
                                    value={formatValue(
                                      getNestedValue(
                                        followupDetails?.crf_data,
                                        "semen.morphology.abnormalHeads"
                                      )
                                    )}
                                  />
                                  <Field
                                    label="Abnormal Midpieces %"
                                    value={formatValue(
                                      getNestedValue(
                                        followupDetails?.crf_data,
                                        "semen.morphology.abnormalMid"
                                      )
                                    )}
                                  />
                                  <Field
                                    label="Abnormal Tails %"
                                    value={formatValue(
                                      getNestedValue(
                                        followupDetails?.crf_data,
                                        "semen.morphology.abnormalTails"
                                      )
                                    )}
                                  />
                                  <Field
                                    label="Excess Residual Cytoplasm %"
                                    value={formatValue(
                                      getNestedValue(
                                        followupDetails?.crf_data,
                                        "semen.morphology.erc"
                                      )
                                    )}
                                  />
                                  <Field
                                    label="Teratozoospermia Index (TZI)"
                                    value={formatValue(
                                      getNestedValue(
                                        followupDetails?.crf_data,
                                        "semen.morphology.tzi"
                                      )
                                    )}
                                  />
                                </div>
                              </div>

                              <div className="mb-6">
                                <h4 className="text-slate-300 font-semibold mb-3">
                                  Non-Sperm Cells
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-200">
                                  <Field
                                    label="Peroxidase-Positive Cells (WBCs) ×10^6/mL"
                                    value={formatValue(
                                      getNestedValue(
                                        followupDetails?.crf_data,
                                        "semen.cells.wbcs"
                                      )
                                    )}
                                  />
                                </div>
                              </div>

                              <div className="mb-6">
                                <h4 className="text-slate-300 font-semibold mb-3">
                                  Accessory Gland Function (Optional)
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-200">
                                  <Field
                                    label="Zinc (µmol/ejaculate)"
                                    value={formatValue(
                                      getNestedValue(
                                        followupDetails?.crf_data,
                                        "semen.glands.zinc"
                                      )
                                    )}
                                  />
                                  <Field
                                    label="Fructose (µmol/ejaculate)"
                                    value={formatValue(
                                      getNestedValue(
                                        followupDetails?.crf_data,
                                        "semen.glands.fructose"
                                      )
                                    )}
                                  />
                                  <Field
                                    label="α-Glucosidase (mU/ejaculate)"
                                    value={formatValue(
                                      getNestedValue(
                                        followupDetails?.crf_data,
                                        "semen.glands.glucosidase"
                                      )
                                    )}
                                  />
                                </div>
                              </div>

                              <div>
                                <h4 className="text-slate-300 font-semibold mb-3">
                                  Analysis Timing
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-200">
                                  <Field
                                    label="Examination Begun (hh:mm)"
                                    value={formatValue(
                                      getNestedValue(
                                        followupDetails?.crf_data,
                                        "semen.timing.begun"
                                      )
                                    )}
                                  />
                                  <Field
                                    label="Time to Examination (post-collection)"
                                    value={formatValue(
                                      getNestedValue(
                                        followupDetails?.crf_data,
                                        "semen.timing.toExam"
                                      )
                                    )}
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {tab === "investigations" && (
                            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 lg:p-6">
                              <h3 className="text-lg font-semibold text-white mb-4">
                                Optional Investigations
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-200">
                                <Field
                                  label="Hormonal Assay - FSH done?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "investigations.fsh.done"
                                    )
                                  )}
                                />
                                <Field
                                  label="FSH (mIU/mL)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "investigations.fsh.value"
                                    )
                                  )}
                                />
                                <Field
                                  label="LH done?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "investigations.lh.done"
                                    )
                                  )}
                                />
                                <Field
                                  label="LH (mIU/mL)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "investigations.lh.value"
                                    )
                                  )}
                                />
                                <Field
                                  label="Prolactin done?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "investigations.prolactin.done"
                                    )
                                  )}
                                />
                                <Field
                                  label="Prolactin (ng/mL)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "investigations.prolactin.value"
                                    )
                                  )}
                                />
                                <Field
                                  label="Testosterone done?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "investigations.testosterone.done"
                                    )
                                  )}
                                />
                                <Field
                                  label="Testosterone (ng/dL)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "investigations.testosterone.value"
                                    )
                                  )}
                                />
                                <Field
                                  label="Estradiol done?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "investigations.estradiol.done"
                                    )
                                  )}
                                />
                                <Field
                                  label="Estradiol (pg/mL)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "investigations.estradiol.value"
                                    )
                                  )}
                                />
                                <Field
                                  label="T/E Ratio done?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "investigations.te.done"
                                    )
                                  )}
                                />
                                <Field
                                  label="T/E Ratio"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "investigations.te.value"
                                    )
                                  )}
                                />
                                <Field
                                  label="Urine Culture done?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "investigations.urineCulture.done"
                                    )
                                  )}
                                />
                                <Field
                                  label="Urine Culture Result"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "investigations.urineCulture.result"
                                    )
                                  )}
                                />
                                <Field
                                  label="Semen Culture done?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "investigations.semenCulture.done"
                                    )
                                  )}
                                />
                                <Field
                                  label="Semen Culture Result"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "investigations.semenCulture.result"
                                    )
                                  )}
                                />
                                <Field
                                  label="Prostatic Fluid Culture done?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "investigations.prostaticFluid.done"
                                    )
                                  )}
                                />
                                <Field
                                  label="Prostatic Fluid Result"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "investigations.prostaticFluid.result"
                                    )
                                  )}
                                />
                                <Field
                                  label="Anti-sperm Antibody Testing done?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "investigations.asa.done"
                                    )
                                  )}
                                />
                                <Field
                                  label="ASA Result"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "investigations.asa.result"
                                    )
                                  )}
                                />
                                <Field
                                  label="Viability Assay done?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "investigations.viability.done"
                                    )
                                  )}
                                />
                                <Field
                                  label="Viability Result"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "investigations.viability.result"
                                    )
                                  )}
                                />
                                <Field
                                  label="Sperm Function Tests done?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "investigations.spermFunction.done"
                                    )
                                  )}
                                />
                                <Field
                                  label="Sperm Function Result"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "investigations.spermFunction.result"
                                    )
                                  )}
                                />
                                <Field
                                  label="Scrotal USG & Doppler done?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "investigations.usg.done"
                                    )
                                  )}
                                />
                                <Field
                                  label="USG Findings"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "investigations.usg.findings"
                                    )
                                  )}
                                />
                                <Field
                                  label="Transrectal Ultrasonography (TRUS) done?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "investigations.trus.done"
                                    )
                                  )}
                                />
                                <Field
                                  label="TRUS Findings"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "investigations.trus.findings"
                                    )
                                  )}
                                />
                                <Field
                                  label="Testicular Biopsy done?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "investigations.biopsy.done"
                                    )
                                  )}
                                />
                                <Field
                                  label="Biopsy Histology"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "investigations.biopsy.histology"
                                    )
                                  )}
                                />
                                <Field
                                  label="17-Hydroxy Progesterone"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "investigations.hp.done"
                                    )
                                  )}
                                />
                                <Field
                                  label="17-Hydroxy Progesterone Value"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "investigations.hp.histology"
                                    )
                                  )}
                                />
                                <Field
                                  label="Inhibin B"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "investigations.ib.done"
                                    )
                                  )}
                                />
                                <Field
                                  label="Inhibin B Value"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "investigations.ib.histology"
                                    )
                                  )}
                                />
                                <Field
                                  label="AMH"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "investigations.amh.done"
                                    )
                                  )}
                                />
                                <Field
                                  label="AMH"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "investigations.amh.histology"
                                    )
                                  )}
                                />
                              </div>
                            </div>
                          )}

                          {tab === 'treatment' && (<>
                            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 lg:p-6">
                              <h3 className="text-lg font-semibold text-white mb-4">
                                Diagnosis & Treatment Plan
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-200">
                                <Field
                                  label="Final Diagnosis"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "treatment.final"
                                    )
                                  )}
                                />
                                <Field
                                  label="Lifestyle Modifications"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "treatment.lifestyleModifications"
                                    )
                                  )}
                                />
                                <Field
                                  label="Treatment Duration"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "treatment.duration"
                                    )
                                  )}
                                />
                                <Field
                                  label="Further Investigations Planned"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "treatment.investigations"
                                    )
                                  )}
                                />
                              </div>
                            </div>
                            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 lg:p-6">
                              <h3 className="text-lg font-semibold text-white mb-4">
                                Treatment Regimen
                              </h3>
                              {(getNestedValue(followupDetails?.crf_data, 'treatment.drugs') || [{ drugName: '', dose: '', regimen: '' }]).map((drug: any, index: number) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700 mb-4">
                                  <div className="md:col-span-3 flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-slate-300">Drug #{index + 1}</span>
                                  </div>
                      
                                  <Field 
                                    label="Drug Name" 
                                    value={drug.drugName}
                                  />
                      
                                  <Field 
                                    label="Dose" 
                                    value={drug.dose} 
                                  />
                      
                                  <Field 
                                    label="Dosing Regimen" 
                                    value={drug.regimen || ''}
                                  />
                                </div>
                              ))}
                            </div>
                          </>
                          )}

                          {tab === "final" && (
                            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 lg:p-6">
                              <h3 className="text-lg font-semibold text-white mb-4">
                                Final Notes
                              </h3>
                              <div className="grid grid-cols-1 gap-4 text-slate-200">
                                <Field
                                  label="Any Additional Comments"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "final.notes"
                                    )
                                  )}
                                />
                                <Field
                                  label="Approved By (Name/Signature/Date)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "final.approvedBy"
                                    )
                                  )}
                                />
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Male Sexual Dysfunction remaining tabs */}
                      {patient?.condition_type ===
                        "male_sexual_dysfunction" && (
                        <>
                          {tab === "medical" && (
                            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 lg:p-6">
                              <h3 className="text-lg font-semibold text-white mb-4">
                                Medical History
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-200">
                                <Field
                                  label="Diabetes Mellitus"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "medical.diabetes.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Diabetes Comments"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "medical.diabetes.comments"
                                    )
                                  )}
                                />
                                <Field
                                  label="Hypertension"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "medical.hypertension.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Hypertension Comments"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "medical.hypertension.comments"
                                    )
                                  )}
                                />
                                <Field
                                  label="Thyroid Disorders"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "medical.thyroid.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Thyroid Comments"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "medical.thyroid.comments"
                                    )
                                  )}
                                />
                                <Field
                                  label="Cardiovascular Disease"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "medical.cardiovascular.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Cardiovascular Comments"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "medical.cardiovascular.comments"
                                    )
                                  )}
                                />
                                <Field
                                  label="Neurological Disorders"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "medical.neurological.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Neurological Comments"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "medical.neurological.comments"
                                    )
                                  )}
                                />
                                <Field
                                  label="Psychiatric Conditions"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "medical.psychiatric.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Psychiatric Comments"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "medical.psychiatric.comments"
                                    )
                                  )}
                                />
                                <Field
                                  label="Hormonal Disorders"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "medical.hormonal.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Hormonal Comments"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "medical.hormonal.comments"
                                    )
                                  )}
                                />
                                <Field
                                  label="History of STIs"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "medical.stis.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="STI Type"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "medical.stis.type"
                                    )
                                  )}
                                />
                                <Field
                                  label="STI Year"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "medical.stis.year"
                                    )
                                  )}
                                />
                                <Field
                                  label="Chronic Kidney Disease"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "medical.kidney.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Kidney Comments"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "medical.kidney.comments"
                                    )
                                  )}
                                />
                                <Field
                                  label="Liver Disease"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "medical.liver.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Liver Comments"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "medical.liver.comments"
                                    )
                                  )}
                                />
                                <Field
                                  label="Past/Persistent Genital Infections"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "medical.genitalInfections.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Genital Infections Specify"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "medical.genitalInfections.specify"
                                    )
                                  )}
                                />
                                <Field
                                  label="Other Chronic Illnesses"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "medical.otherChronic.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Other Chronic Specify"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "medical.otherChronic.specify"
                                    )
                                  )}
                                />
                              </div>
                            </div>
                          )}

                          {tab === "physical" && (
                            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 lg:p-6">
                              <h3 className="text-lg font-semibold text-white mb-4">
                                Physical Examination
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-200">
                                <Field
                                  label="General Appearance"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "physical.generalAppearance"
                                    )
                                  )}
                                />
                                <Field
                                  label="Secondary Sexual Characteristics"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "physical.secondarySex"
                                    )
                                  )}
                                />
                                <Field
                                  label="Gynecomastia"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "physical.gynecomastia.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Gynecomastia Side"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "physical.gynecomastia.side"
                                    )
                                  )}
                                />
                                <Field
                                  label="Penis"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "physical.penis"
                                    )
                                  )}
                                />
                                <Field
                                  label="Testes – Right Volume (cc)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "physical.testes.right.volume"
                                    )
                                  )}
                                />
                                <Field
                                  label="Right Consistency"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "physical.testes.right.consistency"
                                    )
                                  )}
                                />
                                <Field
                                  label="Testes – Left Volume (cc)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "physical.testes.left.volume"
                                    )
                                  )}
                                />
                                <Field
                                  label="Left Consistency"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "physical.testes.left.consistency"
                                    )
                                  )}
                                />
                                <Field
                                  label="Epididymis"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "physical.epididymis"
                                    )
                                  )}
                                />
                                <Field
                                  label="Vas Deferens (Right)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "physical.vas.right"
                                    )
                                  )}
                                />
                                <Field
                                  label="Vas Deferens (Left)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "physical.vas.left"
                                    )
                                  )}
                                />
                                <Field
                                  label="Spermatic Cords"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "physical.spermaticCords.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Varicocele Grade"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "physical.spermaticCords.grade"
                                    )
                                  )}
                                />
                                <Field
                                  label="Scars (Inguinal/Scrotal)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "physical.scars.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Scar Location"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "physical.scars.location"
                                    )
                                  )}
                                />
                                <Field
                                  label="Rectal Examination"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "physical.rectal.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Rectal Findings"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "physical.rectal.findings"
                                    )
                                  )}
                                />
                              </div>
                            </div>
                          )}

                          {tab === "surgical" && (
                            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 lg:p-6">
                              <h3 className="text-lg font-semibold text-white mb-4">
                                Surgical History
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-200">
                                <Field
                                  label="Varicocele"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "surgical.varicocele.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Varicocele Year"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "surgical.varicocele.year"
                                    )
                                  )}
                                />
                                <Field
                                  label="Hernia Repair (Inguinal/Scrotal)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "surgical.hernia.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Hernia Year"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "surgical.hernia.year"
                                    )
                                  )}
                                />
                                <Field
                                  label="Prostate Surgery/TURP"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "surgical.prostate.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Prostate Year"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "surgical.prostate.year"
                                    )
                                  )}
                                />
                                <Field
                                  label="Testicular Surgery"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "surgical.testicular.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Testicular Year"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "surgical.testicular.year"
                                    )
                                  )}
                                />
                                <Field
                                  label="Pelvic or Genital Trauma"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "surgical.trauma.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Trauma Year"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "surgical.trauma.year"
                                    )
                                  )}
                                />
                                <Field
                                  label="Vasectomy"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "surgical.vasectomy.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Vasectomy Year"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "surgical.vasectomy.year"
                                    )
                                  )}
                                />
                                <Field
                                  label="Other Urogenital Surgeries"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "surgical.otherUrogenital.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Other Urogenital Specify"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "surgical.otherUrogenital.specify"
                                    )
                                  )}
                                />
                                <Field
                                  label="Other Major Surgeries (non-urogenital)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "surgical.otherMajor.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Other Major Specify"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "surgical.otherMajor.specify"
                                    )
                                  )}
                                />
                              </div>
                            </div>
                          )}

                          {tab === "lifestyle" && (
                            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 lg:p-6">
                              <h3 className="text-lg font-semibold text-white mb-4">
                                Lifestyle History
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-200">
                                <Field
                                  label="Recreational Drug Use"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "lifestyle.drugUse.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Drug Use Substance"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "lifestyle.drugUse.substance"
                                    )
                                  )}
                                />
                                <Field
                                  label="Anabolic Steroid Use"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "lifestyle.steroids.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Steroid Duration/Frequency"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "lifestyle.steroids.duration"
                                    )
                                  )}
                                />
                                <Field
                                  label="Occupational Exposure to Heat/Radiation"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "lifestyle.exposure.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Exposure Job Role/Type"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "lifestyle.exposure.details"
                                    )
                                  )}
                                />
                                <Field
                                  label="Psychological Stress (Persistent/High)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "lifestyle.stress.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Stress Details"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "lifestyle.stress.details"
                                    )
                                  )}
                                />
                                <Field
                                  label="Sleep Disturbances/Disorders"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "lifestyle.sleep.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Sleep Details"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "lifestyle.sleep.details"
                                    )
                                  )}
                                />
                                <Field
                                  label="Sedentary Lifestyle"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "lifestyle.sedentary.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Daily Physical Activity"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "lifestyle.sedentary.activity"
                                    )
                                  )}
                                />
                                <Field
                                  label="Use of Sexual Enhancement Substances"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "lifestyle.enhancement.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Enhancement Type"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "lifestyle.enhancement.type"
                                    )
                                  )}
                                />
                                <Field
                                  label="Pornography Addiction/Excessive Use"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "lifestyle.pornography.status"
                                    )
                                  )}
                                />
                                <Field
                                  label="Pornography Frequency or Impact"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "lifestyle.pornography.impact"
                                    )
                                  )}
                                />
                              </div>
                            </div>
                          )}

                          {tab === "sexual" && (
                            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 lg:p-6">
                              <h3 className="text-lg font-semibold text-white mb-4">
                                Sexual Function
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-200">
                                <Field
                                  label="Current erection rigidity (0-100%)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.currentRigidity"
                                    )
                                  )}
                                />
                                <Field
                                  label="Best achievable rigidity (%)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.bestRigidity"
                                    )
                                  )}
                                />
                                <Field
                                  label="Duration of erection (minutes)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.duration"
                                    )
                                  )}
                                />
                                <Field
                                  label="Do you get morning erections?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.morningErections"
                                    )
                                  )}
                                />
                                <Field
                                  label="Are morning erections better/longer than during intercourse?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.morningBetter"
                                    )
                                  )}
                                />
                                <Field
                                  label="Date of last morning erection"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.lastMorningErection"
                                    )
                                  )}
                                />
                                <Field
                                  label="Do you get overnight erections?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.overnightErections"
                                    )
                                  )}
                                />
                                <Field
                                  label="Rigidity of overnight erections (%)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.overnightRigidity"
                                    )
                                  )}
                                />
                                <Field
                                  label="Does erection lose rigidity during intercourse?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.losesRigidity"
                                    )
                                  )}
                                />
                                <Field
                                  label="Does it stay erect until immediately after penetration?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.staysErect"
                                    )
                                  )}
                                />
                                <Field
                                  label="Erection curvature"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.curvature"
                                    )
                                  )}
                                />
                                <Field
                                  label="Numbness or unusual penile sensation?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.numbness"
                                    )
                                  )}
                                />
                                <Field
                                  label="Numbness Details"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.numbnessDetails"
                                    )
                                  )}
                                />
                                <Field
                                  label="Onset of ED symptoms"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.edOnset"
                                    )
                                  )}
                                />
                                <Field
                                  label="Duration since ED began"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.edDuration"
                                    )
                                  )}
                                />
                                <Field
                                  label="Significant event or medication change at onset?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.significantEvent"
                                    )
                                  )}
                                />
                                <Field
                                  label="Event Details"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.eventDetails"
                                    )
                                  )}
                                />
                                <Field
                                  label="Last time erection was normal"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.lastNormalErection"
                                    )
                                  )}
                                />
                                <Field
                                  label="Erections better during:"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.betterDuring"
                                    )
                                  )}
                                />
                                <Field
                                  label="Rigidity during masturbation vs intercourse"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.masturbationRigidity"
                                    )
                                  )}
                                />
                                <Field
                                  label="Problem with:"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.problemType"
                                    )
                                  )}
                                />
                                <Field
                                  label="ED progression:"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.progression"
                                    )
                                  )}
                                />
                                <Field
                                  label="Daily variation in erection quality"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.dailyVariation"
                                    )
                                  )}
                                />
                                <Field
                                  label="History of sexual trauma"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.trauma"
                                    )
                                  )}
                                />
                                <Field
                                  label="Trauma Details"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.traumaDetails"
                                    )
                                  )}
                                />
                                <Field
                                  label="Rigidity at the time of ejaculation (%)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.ejaculationRigidity"
                                    )
                                  )}
                                />
                                <Field
                                  label="Libido Status"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.libido"
                                    )
                                  )}
                                />
                                <Field
                                  label="If ED wasn't a problem, desired intercourse frequency (per week)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.desiredFrequency"
                                    )
                                  )}
                                />
                                <Field
                                  label="Does your partner know you're seeking treatment?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.partnerKnows"
                                    )
                                  )}
                                />
                                <Field
                                  label="Is your partner supportive or encouraging?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.partnerSupportive"
                                    )
                                  )}
                                />
                                <Field
                                  label="Would they be willing to join treatment if needed?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.partnerWilling"
                                    )
                                  )}
                                />
                                <Field
                                  label="Who usually initiates intercourse?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.initiates"
                                    )
                                  )}
                                />
                                <Field
                                  label="Current intercourse attempts"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.currentAttempts"
                                    )
                                  )}
                                />
                                <Field
                                  label="Attempts Frequency"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.attemptsFrequency"
                                    )
                                  )}
                                />
                                <Field
                                  label="If untreated, what impact might ED have on your relationship?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.relationshipImpact"
                                    )
                                  )}
                                />
                                <Field
                                  label="Previous treatments for ED tried?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.previousTreatments"
                                    )
                                  )}
                                />
                                <Field
                                  label="Treatment Details"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.treatmentDetails"
                                    )
                                  )}
                                />
                                <Field
                                  label="Current contraceptive method used (if any)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.contraceptive"
                                    )
                                  )}
                                />
                                <Field
                                  label="Other contraceptive method"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.contraceptiveOther"
                                    )
                                  )}
                                />
                                <Field
                                  label="Would patient be satisfied with 65-75% rigidity for 10-15 min?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.satisfiedWith65"
                                    )
                                  )}
                                />
                                <Field
                                  label="If not, what would be considered a successful treatment outcome?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "sexual.successfulOutcome"
                                    )
                                  )}
                                />
                              </div>
                            </div>
                          )}

                          {tab === "semen" && (
                            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 lg:p-6">
                              <h3 className="text-lg font-semibold text-white mb-4">
                                Semen Analysis (as per WHO 2010)
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-200">
                                <Field
                                  label="Date of Collection"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "semen.collectionDate"
                                    )
                                  )}
                                />
                                <Field
                                  label="Abstinence (days)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "semen.abstinence"
                                    )
                                  )}
                                />
                                <Field
                                  label="Sample Status"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "semen.sampleStatus"
                                    )
                                  )}
                                />
                                <Field
                                  label="Time to analysis (mins)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "semen.timeToAnalysis"
                                    )
                                  )}
                                />
                                <Field
                                  label="Volume (mL)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "semen.volume"
                                    )
                                  )}
                                />
                                <Field
                                  label="Sperm Concentration (×10⁶/mL)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "semen.concentration"
                                    )
                                  )}
                                />
                                <Field
                                  label="Total motility (%)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "semen.motility"
                                    )
                                  )}
                                />
                                <Field
                                  label="Morphology normal forms (%)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "semen.morphology"
                                    )
                                  )}
                                />
                                <Field
                                  label="pH (optional)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "semen.pH"
                                    )
                                  )}
                                />
                                <Field
                                  label="Liquefication time (mins)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "semen.liquefication"
                                    )
                                  )}
                                />
                              </div>
                            </div>
                          )}

                          {tab === "hormonal" && (
                            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 lg:p-6">
                              <h3 className="text-lg font-semibold text-white mb-4">
                                Hormonal Profile
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-200">
                                <Field
                                  label="Total Testosterone"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.testosterone.done"
                                    )
                                  )}
                                />
                                <Field
                                  label="Testosterone Date of Test"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.testosterone.date"
                                    )
                                  )}
                                />
                                <Field
                                  label="Testosterone Patient Value"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.testosterone.value"
                                    )
                                  )}
                                />
                                <Field
                                  label="Testosterone Interpretation"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.testosterone.interpretation"
                                    )
                                  )}
                                />
                                <Field
                                  label="FSH (Follicle Stimulating Hormone)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.fsh.done"
                                    )
                                  )}
                                />
                                <Field
                                  label="FSH Date of Test"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.fsh.date"
                                    )
                                  )}
                                />
                                <Field
                                  label="FSH Patient Value"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.fsh.value"
                                    )
                                  )}
                                />
                                <Field
                                  label="FSH Interpretation"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.fsh.interpretation"
                                    )
                                  )}
                                />
                                <Field
                                  label="LH (Luteinizing Hormone)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.lh.done"
                                    )
                                  )}
                                />
                                <Field
                                  label="LH Date of Test"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.lh.date"
                                    )
                                  )}
                                />
                                <Field
                                  label="LH Patient Value"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.lh.value"
                                    )
                                  )}
                                />
                                <Field
                                  label="LH Interpretation"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.lh.interpretation"
                                    )
                                  )}
                                />
                                <Field
                                  label="Prolactin"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.prolactin.done"
                                    )
                                  )}
                                />
                                <Field
                                  label="Prolactin Date of Test"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.prolactin.date"
                                    )
                                  )}
                                />
                                <Field
                                  label="Prolactin Patient Value"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.prolactin.value"
                                    )
                                  )}
                                />
                                <Field
                                  label="Prolactin Interpretation"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.prolactin.interpretation"
                                    )
                                  )}
                                />
                                <Field
                                  label="TSH (Thyroid Stim. Hormone)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.tsh.done"
                                    )
                                  )}
                                />
                                <Field
                                  label="TSH Date of Test"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.tsh.date"
                                    )
                                  )}
                                />
                                <Field
                                  label="TSH Patient Value"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.tsh.value"
                                    )
                                  )}
                                />
                                <Field
                                  label="TSH Interpretation"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.tsh.interpretation"
                                    )
                                  )}
                                />
                                <Field
                                  label="Estradiol (if done)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.estradiol.done"
                                    )
                                  )}
                                />
                                <Field
                                  label="Estradiol Date of Test"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.estradiol.date"
                                    )
                                  )}
                                />
                                <Field
                                  label="Estradiol Patient Value"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.estradiol.value"
                                    )
                                  )}
                                />
                                <Field
                                  label="Estradiol Interpretation"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.estradiol.interpretation"
                                    )
                                  )}
                                />
                                <Field
                                  label="SHBG (optional)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.shbg.done"
                                    )
                                  )}
                                />
                                <Field
                                  label="SHBG Date of Test"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.shbg.date"
                                    )
                                  )}
                                />
                                <Field
                                  label="SHBG Patient Value"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.shbg.value"
                                    )
                                  )}
                                />
                                <Field
                                  label="SHBG Interpretation"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.shbg.interpretation"
                                    )
                                  )}
                                />

                                <Field
                                  label="17-Hydroxy Progesterone"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.hp.done"
                                    )
                                  )}
                                />
                                <Field
                                  label="17-Hydroxy Progesterone Date of Test"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.hp.date"
                                    )
                                  )}
                                />
                                <Field
                                  label="17-Hydroxy Progesterone Patient Value"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.hp.value"
                                    )
                                  )}
                                />
                                <Field
                                  label="17-Hydroxy Progesterone Interpretation"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.hp.interpretation"
                                    )
                                  )}
                                />

                                <Field
                                  label="Inhibin B"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.ib.done"
                                    )
                                  )}
                                />
                                <Field
                                  label="Inhibin B Date of Test"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.ib.date"
                                    )
                                  )}
                                />
                                <Field
                                  label="Inhibin B Patient Value"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.ib.value"
                                    )
                                  )}
                                />
                                <Field
                                  label="Inhibin B Interpretation"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.ib.interpretation"
                                    )
                                  )}
                                />

                                <Field
                                  label="AMH"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.amh.done"
                                    )
                                  )}
                                />
                                <Field
                                  label="AMH Date of Test"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.amh.date"
                                    )
                                  )}
                                />
                                <Field
                                  label="AMH Patient Value"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.amh.value"
                                    )
                                  )}
                                />
                                <Field
                                  label="AMH Interpretation"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "hormonal.amh.interpretation"
                                    )
                                  )}
                                />
                              </div>
                            </div>
                          )}

                          {tab === "scoring" && (
                            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 lg:p-6">
                              <h3 className="text-lg font-semibold text-white mb-4">
                                Scoring Scales
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-200">
                                <Field
                                  label="Erection Hardness Score 1: Penis is larger but not hard"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "scoring.ehs.score1"
                                    )
                                  )}
                                />
                                <Field
                                  label="Erection Hardness Score 2: Penis is hard but not hard enough for penetration"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "scoring.ehs.score2"
                                    )
                                  )}
                                />
                                <Field
                                  label="Erection Hardness Score 3: Penis is hard enough for penetration but not completely hard"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "scoring.ehs.score3"
                                    )
                                  )}
                                />
                                <Field
                                  label="Erection Hardness Score 4: Penis is completely hard and fully rigid"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "scoring.ehs.score4"
                                    )
                                  )}
                                />
                                <Field
                                  label="IIEF Q1: How often were you able to get an erection during sexual activity?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "scoring.iief.q1"
                                    )
                                  )}
                                />
                                <Field
                                  label="IIEF Q2: When you had erections with sexual stimulation, how often were your erections hard enough for penetration?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "scoring.iief.q2"
                                    )
                                  )}
                                />
                                <Field
                                  label="IIEF Q3: When you attempted intercourse, how often were you able to penetrate (enter) your partner?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "scoring.iief.q3"
                                    )
                                  )}
                                />
                                <Field
                                  label="IIEF Q4: During sexual intercourse, how often were you able to maintain your erection after you had penetrated (entered) your partner?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "scoring.iief.q4"
                                    )
                                  )}
                                />
                                <Field
                                  label="IIEF Q5: During sexual intercourse, how difficult was it to maintain your erection to completion of intercourse?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "scoring.iief.q5"
                                    )
                                  )}
                                />
                                <Field
                                  label="IIEF Q6: How many times have you attempted sexual intercourse?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "scoring.iief.q6"
                                    )
                                  )}
                                />
                                <Field
                                  label="IIEF Q7: When you attempted sexual intercourse, how often was it satisfactory for you?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "scoring.iief.q7"
                                    )
                                  )}
                                />
                                <Field
                                  label="IIEF Q8: How much have you enjoyed sexual intercourse?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "scoring.iief.q8"
                                    )
                                  )}
                                />
                                <Field
                                  label="IIEF Q9: When you had sexual stimulation or intercourse, how often did you ejaculate?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "scoring.iief.q9"
                                    )
                                  )}
                                />
                                <Field
                                  label="IIEF Q10: When you had sexual stimulation or intercourse, how often did you have the feeling of orgasm or climax?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "scoring.iief.q10"
                                    )
                                  )}
                                />
                                <Field
                                  label="IIEF Q11: How often have you felt sexual desire?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "scoring.iief.q11"
                                    )
                                  )}
                                />
                                <Field
                                  label="IIEF Q12: How would you rate your level of sexual desire?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "scoring.iief.q12"
                                    )
                                  )}
                                />
                                <Field
                                  label="IIEF Q13: How satisfied have you been with your overall sex life?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "scoring.iief.q13"
                                    )
                                  )}
                                />
                                <Field
                                  label="IIEF Q14: How satisfied have you been with your sexual relationship with your partner?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "scoring.iief.q14"
                                    )
                                  )}
                                />
                                <Field
                                  label="IIEF Q15: How do you rate your confidence that you could get and keep an erection?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "scoring.iief.q15"
                                    )
                                  )}
                                />
                              </div>
                            </div>
                          )}

                          {tab === "imaging" && (
                            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 lg:p-6">
                              <h3 className="text-lg font-semibold text-white mb-4">
                                Imaging & Diagnostics
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-200">
                                <Field
                                  label="Scrotal Ultrasound"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "imaging.scrotalUltrasound.done"
                                    )
                                  )}
                                />
                                <Field
                                  label="Scrotal Ultrasound Date"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "imaging.scrotalUltrasound.date"
                                    )
                                  )}
                                />
                                <Field
                                  label="Scrotal Ultrasound Findings/Remarks"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "imaging.scrotalUltrasound.findings"
                                    )
                                  )}
                                />
                                <Field
                                  label="Penile Doppler (if done)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "imaging.penileDoppler.done"
                                    )
                                  )}
                                />
                                <Field
                                  label="Penile Doppler Date"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "imaging.penileDoppler.date"
                                    )
                                  )}
                                />
                                <Field
                                  label="Penile Doppler Findings/Remarks"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "imaging.penileDoppler.findings"
                                    )
                                  )}
                                />
                                <Field
                                  label="Other imaging (e.g. MRI, CT)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "imaging.otherImaging.done"
                                    )
                                  )}
                                />
                                <Field
                                  label="Other Imaging Type"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "imaging.otherImaging.type"
                                    )
                                  )}
                                />
                                <Field
                                  label="Other Imaging Date"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "imaging.otherImaging.date"
                                    )
                                  )}
                                />
                                <Field
                                  label="Other Imaging Findings"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "imaging.otherImaging.findings"
                                    )
                                  )}
                                />
                                <Field
                                  label="Urological Exam (if applicable)"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "imaging.urologicalExam.done"
                                    )
                                  )}
                                />
                                <Field
                                  label="Urological Exam Date"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "imaging.urologicalExam.date"
                                    )
                                  )}
                                />
                                <Field
                                  label="Urological Exam Findings/Remarks"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "imaging.urologicalExam.findings"
                                    )
                                  )}
                                />

                                <Field
                                  label="Sildenafil Office Test"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "imaging.sot.done"
                                    )
                                  )}
                                />
                                <Field
                                  label="Sildenafil Office Test Date"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "imaging.sot.date"
                                    )
                                  )}
                                />
                                <Field
                                  label="Sildenafil Office Test Findings/Remarks"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "imaging.sot.findings"
                                    )
                                  )}
                                />

                                <Field
                                  label="ICI Test"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "imaging.ici.done"
                                    )
                                  )}
                                />
                                <Field
                                  label="ICI Test Date"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "imaging.ici.date"
                                    )
                                  )}
                                />
                                <Field
                                  label="ICI Test Findings/Remarks"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "imaging.ici.findings"
                                    )
                                  )}
                                />
                              </div>
                            </div>
                          )}

                          {tab === "psychological" && (
                            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 lg:p-6">
                              <h3 className="text-lg font-semibold text-white mb-4">
                                Psychological Screening
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-200">
                                <Field
                                  label="PHQ-9 (Patient Health Questionnaire-9 item scale) Depression screening"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "psychological.phq9.score"
                                    )
                                  )}
                                />
                                <Field
                                  label="PHQ-9 Interpretation"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "psychological.phq9.interpretation"
                                    )
                                  )}
                                />
                                <Field
                                  label="GAD-7 Score (Generalized Anxiety Disorder-7 Item scale) Anxiety Screening"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "psychological.gad7.score"
                                    )
                                  )}
                                />
                                <Field
                                  label="GAD-7 Interpretation"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "psychological.gad7.interpretation"
                                    )
                                  )}
                                />
                                <Field
                                  label="Perceived Stress Level"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "psychological.stressLevel"
                                    )
                                  )}
                                />
                                <Field
                                  label="Emotional issues related to infertility or ED?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "psychological.emotionalIssues"
                                    )
                                  )}
                                />
                                <Field
                                  label="If yes, specify"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "psychological.emotionalIssuesDetails"
                                    )
                                  )}
                                />
                                <Field
                                  label="Referral to mental health professional?"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "psychological.referral"
                                    )
                                  )}
                                />
                                <Field
                                  label="Referral Status"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "psychological.referralStatus"
                                    )
                                  )}
                                />
                              </div>
                            </div>
                          )}

                          {tab === 'treatment' && (<>
                            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 lg:p-6">
                              <h3 className="text-lg font-semibold text-white mb-4">
                                Diagnosis & Treatment Plan
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-200">
                                <Field
                                  label="Final Diagnosis"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "treatment.final"
                                    )
                                  )}
                                />
                                <Field
                                  label="Lifestyle Modifications"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "treatment.lifestyleModifications"
                                    )
                                  )}
                                />
                                <Field
                                  label="Treatment Duration"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "treatment.duration"
                                    )
                                  )}
                                />
                                <Field
                                  label="Further Investigations Planned"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "treatment.investigations"
                                    )
                                  )}
                                />
                              </div>
                            </div>
                            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 lg:p-6">
                              <h3 className="text-lg font-semibold text-white mb-4">
                                Treatment Regimen
                              </h3>
                              {(getNestedValue(followupDetails?.crf_data, 'treatment.drugs') || [{ drugName: '', dose: '', regimen: '' }]).map((drug: any, index: number) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700 mb-4">
                                  <div className="md:col-span-3 flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-slate-300">Drug #{index + 1}</span>
                                  </div>
                      
                                  <Field 
                                    label="Drug Name" 
                                    value={drug.drugName}
                                  />
                      
                                  <Field 
                                    label="Dose" 
                                    value={drug.dose} 
                                  />
                      
                                  <Field 
                                    label="Dosing Regimen" 
                                    value={drug.regimen || ''}
                                  />
                                </div>
                              ))}
                            </div>
                          </>
                          )}

                          {tab === "followup" && (
                            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 lg:p-6">
                              <h3 className="text-lg font-semibold text-white mb-4">
                                Follow-up Plan
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-200">
                                <Field
                                  label="Next Scheduled Visit"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "followup.nextVisit"
                                    )
                                  )}
                                />
                                <Field
                                  label="Lifestyle Modifications Reinforced"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "followup.lifestyleModifications"
                                    )
                                  )}
                                />
                                <Field
                                  label="Referral Advised"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "followup.referral"
                                    )
                                  )}
                                />
                                <Field
                                  label="Further Investigations Planned"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "followup.investigations"
                                    )
                                  )}
                                />
                                <Field
                                  label="Patient Compliance and Motivation"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "followup.compliance"
                                    )
                                  )}
                                />
                                <Field
                                  label="General Remarks"
                                  value={formatValue(
                                    getNestedValue(
                                      followupDetails?.crf_data,
                                      "followup.remarks"
                                    )
                                  )}
                                />
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function Field({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <div className="text-slate-400 text-sm">{label}</div>
      <div className="text-slate-200">{value ?? '—'}</div>
    </div>
  )
}