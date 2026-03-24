import { useEffect, useMemo, useState } from 'react'
import Navbar from '@/components/common/Navbar'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/hooks/AuthContext'
import { FormInput, FormSelect } from '@/components/form/FormControls'
import { MagnifyingGlassIcon, FunnelIcon, PlusIcon, EyeIcon, ClipboardDocumentIcon, ArrowPathIcon, TrashIcon, CloudArrowDownIcon } from '@heroicons/react/24/outline'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isWithinInterval,
  startOfMonth,
} from 'date-fns'

type PatientRow = {
  patient_id: string
  doctor_id: string
  condition_type: 'male_infertility' | 'male_sexual_dysfunction'
  first_visit_date: string
  last_visit_date: string | null
  full_name: string
  age?: number
}

const CONDITION_BADGE: Record<string, string> = {
  male_infertility: 'bg-indigo-900/40 text-indigo-300 border border-indigo-700',
  male_sexual_dysfunction: 'bg-purple-900/40 text-purple-300 border border-purple-700',
}

export default function PatientsPage() {
  const { user } = useAuth()

  const [q, setQ] = useState('')
  const [condition, setCondition] = useState('')
  const [firstFrom, setFirstFrom] = useState('')
  const [firstTo, setFirstTo] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [allRows, setAllRows] = useState<PatientRow[]>([])
  const [rows, setRows] = useState<PatientRow[]>([])
  const [total, setTotal] = useState(0)
  const [minAge, setMinAge] = useState('')
  const [maxAge, setMaxAge] = useState('')
  const [totalPages, setTotalPages] = useState(0)
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  const fetchPatients = async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('doctor_id', user.id)
      // fetch once with a high page size; frontend handles filtering
      params.set('page', '1')
      params.set('page_size', '10000')

      const res = await fetch(`${apiBase}/api/patients?${params.toString()}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to load')
      // map to include convenient full_name for filtering
      const items: PatientRow[] = (json.items || []).map((it: any) => {
        const fullName = it.full_name || it.crf_data_json?.demographics?.fullName || ''
        let age: number | undefined = it.age
        return {
          patient_id: it.patient_id,
          doctor_id: it.doctor_id,
          condition_type: it.condition_type,
          first_visit_date: it.first_visit_date,
          last_visit_date: it.last_visit_date,
          full_name: fullName,
          age,
        }
      })
      setTotalPages((Math.ceil(items.length/10)))
      setAllRows(items)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) {
      fetchPatients()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // Debounce search input
  const [debouncedQ, setDebouncedQ] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim().toLowerCase()), 300)
    return () => clearTimeout(t)
  }, [q])

  // Compute filtered rows on the client
  const filtered = useMemo(() => {
    let list = allRows
    setPage(1)
    if (debouncedQ) {
      list = list.filter((r) =>
        (r.full_name || '').toLowerCase().includes(debouncedQ) || r.patient_id.toLowerCase().includes(debouncedQ)
      )
    }
    if (condition) {
      list = list.filter((r) => r.condition_type === condition)
    }
    if (firstFrom) {
      const d = new Date(firstFrom)
      list = list.filter((r) => new Date(r.first_visit_date) >= d)
    }
    if (firstTo) {
      const d = new Date(firstTo)
      list = list.filter((r) => new Date(r.first_visit_date) <= d)
    }
    if (minAge) {
      const a = parseInt(minAge, 10)
      if (!isNaN(a)) list = list.filter((r) => (r.age ?? 0) >= a)
    }
    if (maxAge) {
      const a = parseInt(maxAge, 10)
      if (!isNaN(a)) list = list.filter((r) => (r.age ?? 0) <= a)
    }
    setTotalPages(Math.ceil(list.length/10))
    console.log(list)
    return list
  }, [allRows, debouncedQ, condition, firstFrom, firstTo, maxAge, minAge])

  // Pagination applied to filtered result
  useEffect(() => {
    const from = (page - 1) * pageSize
    const to = from + pageSize
    setRows(filtered.slice(from, to))
    setTotal(filtered.length)
  }, [filtered, page, pageSize])

  const applyFilters = () => {
    setPage(1)
  }

  const handlePatientDelete = async (patientId: string) => {
    console.log(patientId)
    try {
      await fetch(`${apiBase}/api/patients`, {
        method: "DELETE",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: patientId })
      })
      window.location.reload();
    } catch {
      setError("Error while deleting the patient")
      console.log("Error deleting patient")
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <main className="container-page py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">Patients</h1>
                <p className="text-slate-400 text-sm mt-1">Search, filter and manage your patient records</p>
              </div>
              <div className="nline-flex items-center justify-center gap-2">
                <a href="/patients/add" className="inline-flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 mx-2 rounded-lg text-sm font-semibold transition-colors">
                  <PlusIcon className="w-4 h-4" /> Add Patient
                </a>
                {/* <button className="inline-flex items-center justify-center gap-2 bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                  <CloudArrowDownIcon className="w-4 h-4" /> Export
                </button> */}
              </div>
              
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <StatCard title="Total on page" value={rows.length} />
              <StatCard title="Infertility" value={rows.filter(r => r.condition_type==='male_infertility').length} color="indigo" />
              <StatCard title="Sexual Dysfunction" value={rows.filter(r => r.condition_type==='male_sexual_dysfunction').length} color="purple" />
            </div>

            {/* Filters */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 mb-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative md:flex-1">
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search by name or patient ID..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={applyFilters} className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"><FunnelIcon className="w-4 h-4"/>Apply</button>
                    <button onClick={() => { setQ(''); setCondition(''); setFirstFrom(''); setFirstTo(''); setPage(1); fetchPatients(); }} className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm"><ArrowPathIcon className="w-4 h-4"/>Reset</button>
                  </div>
                </div>
                <div className="flex flex-wrap items-end gap-3">
                  <div className="flex gap-2">
                    <FilterPill label="All" active={condition===''} onClick={() => {
                      setCondition('')
                      setPage(1)
                      }
                    } />
                    <FilterPill label="Infertility" active={condition==='male_infertility'} onClick={() => {
                      setCondition('male_infertility')
                      setPage(1)
                      }
                    } color="indigo" />
                    <FilterPill label="Sexual Dysfunction" active={condition==='male_sexual_dysfunction'} onClick={() => {
                      setCondition('male_sexual_dysfunction')
                      setPage(1)
                      }
                    } color="purple" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                    <DateRangeInput
                      label="First visit"
                      from={firstFrom}
                      to={firstTo}
                      onChange={(f, t) => { setFirstFrom(f); setFirstTo(t) }}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <FormInput label="Min Age" value={minAge} onChange={setMinAge} placeholder="e.g. 18" />
                      <FormInput label="Max Age" value={maxAge} onChange={setMaxAge} placeholder="e.g. 65" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {error && <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400 text-sm">{error}</div>}
                    
            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {loading ? (
                <div className="rounded-xl border border-slate-700 p-4 bg-slate-900/40">
                  <div className="h-5 w-40 bg-slate-800 rounded animate-pulse mb-2" />
                  <div className="h-4 w-24 bg-slate-800 rounded animate-pulse mb-2" />
                  <div className="h-4 w-28 bg-slate-800 rounded animate-pulse" />
                </div>
              ) : rows.length === 0 ? (
                <div className="rounded-xl border border-slate-700 p-6 text-center text-slate-300">No patients found</div>
              ) : (
                rows.map((row) => {
                  const name = row.full_name || '—'
                  return (
                    <div key={row.patient_id} className="rounded-xl border border-slate-700 p-4 bg-slate-900/40">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-200">
                            {typeof name === 'string' ? name.split(' ').map(s => s[0]).slice(0,2).join('') : 'PT'}
                          </div>
                          <div>
                            <div className="text-slate-100 font-medium">{name}</div>
                            <div className="text-slate-400 text-xs">{row.patient_id.slice(0,8)}</div>
                          </div>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full ${CONDITION_BADGE[row.condition_type]}`}>
                          {row.condition_type === 'male_infertility' ? 'Infertility' : 'Sexual Dysfunction'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300 text-sm">
                        <div>First: {row.first_visit_date}</div>
                        <div>Last: {row.last_visit_date || '—'}</div>
                      </div>
                      <div className="mt-3 flex justify-end gap-2">
                          <a title="Open CRF" href={`/patient?patient_id=${row.patient_id}`} className="p-2 rounded-lg border border-slate-700 text-slate-300 hover:text-green-300 hover:border-green-500">
                          <EyeIcon className="w-4 h-4" />
                        </a>
                        <button title="Copy ID" className="p-2 rounded-lg border border-slate-700 text-slate-300 hover:text-green-300 hover:border-green-500" onClick={() => navigator.clipboard.writeText(row.patient_id)}>
                          <ClipboardDocumentIcon className="w-4 h-4" />
                        </button>
                        <button title="Copy ID" className="p-2 rounded-lg border border-slate-700 text-slate-300 hover:text-red-300 hover:border-red-500" onClick={async() => await handlePatientDelete(row?.patient_id)}>
                                <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Table (md+) */}
            <div className="overflow-x-auto rounded-xl border border-slate-700 hidden md:block">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-800/70 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300">Patient ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300">Age</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300">First Visit</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300">Last Visit</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300">Condition</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                  {loading ? (
                    <SkeletonRows />
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <ClipboardDocumentIcon className="w-10 h-10 text-slate-600" />
                          <div className="text-slate-300">No patients found</div>
                          <a href="/patients/add" className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"><PlusIcon className="w-4 h-4"/>Add your first patient</a>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => {
                      const name = row.full_name || '—'
                      return (
                        <tr key={row.patient_id} className="hover:bg-slate-800/40">
                          <td className="px-4 py-3 text-slate-200">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-200">
                                {typeof name === 'string' ? name.split(' ').map(s => s[0]).slice(0,2).join('') : 'PT'}
                              </div>
                              <span>{name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-300">{row.patient_id.slice(0, 8)}</td>
                          <td className="px-4 py-3 text-slate-300">{row.age}</td>
                          <td className="px-4 py-3 text-slate-300">{row.first_visit_date}</td>
                          <td className="px-4 py-3 text-slate-300">{row.last_visit_date || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-3 py-1 rounded-full ${CONDITION_BADGE[row.condition_type]}`}>
                              {row.condition_type === 'male_infertility' ? 'Infertility' : 'Sexual Dysfunction'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="inline-flex gap-2">
                              <a title="Open CRF" href={`/patient?patient_id=${row.patient_id}`} className="p-2 rounded-lg border border-slate-700 text-slate-300 hover:text-green-300 hover:border-green-500">
                                <EyeIcon className="w-4 h-4" />
                              </a>
                              <button title="Copy ID" className="p-2 rounded-lg border border-slate-700 text-slate-300 hover:text-green-300 hover:border-green-500" onClick={() => navigator.clipboard.writeText(row.patient_id)}>
                                <ClipboardDocumentIcon className="w-4 h-4" />
                              </button>
                              <button title="Copy ID" className="p-2 rounded-lg border border-slate-700 text-slate-300 hover:text-red-300 hover:border-red-500" onClick={async () => await handlePatientDelete(row.patient_id)}>
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-slate-400">Page {page} of {totalPages}</div>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-2 rounded-lg border border-slate-700 text-slate-300 disabled:opacity-50">Prev</button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-2 rounded-lg border border-slate-700 text-slate-300 disabled:opacity-50">Next</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

function StatCard({ title, value, color }: { title: string; value: number | string; color?: 'indigo' | 'purple' }) {
  const colorMap: any = {
    indigo: 'bg-indigo-900/30 border-indigo-700 text-indigo-300',
    purple: 'bg-purple-900/30 border-purple-700 text-purple-300',
    default: 'bg-slate-800/40 border-slate-700 text-slate-300',
  }
  const cls = color ? colorMap[color] : colorMap.default
  return (
    <div className={`rounded-xl border p-4 ${cls}`}>
      <div className="text-xs uppercase tracking-wide opacity-80">{title}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  )
}

function FilterPill({ label, active, onClick, color }: { label: string; active: boolean; onClick: () => void; color?: 'indigo' | 'purple' }) {
  const activeCls = color === 'indigo'
    ? 'bg-indigo-900/40 text-indigo-300 border-indigo-700'
    : color === 'purple'
      ? 'bg-purple-900/40 text-purple-300 border-purple-700'
      : 'bg-teal-900/30 text-teal-300 border-teal-700'
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-full text-xs border transition-colors ${active ? activeCls : 'text-slate-300 border-slate-700 hover:border-slate-500'}`}
    >
      {label}
    </button>
  )
}

function SkeletonRows() {
  const rows = Array.from({ length: 6 })
  return (
    <>
      {rows.map((_, i) => (
        <tr key={i}>
          <td className="px-4 py-3"><div className="h-4 w-40 bg-slate-800 rounded animate-pulse" /></td>
          <td className="px-4 py-3"><div className="h-4 w-24 bg-slate-800 rounded animate-pulse" /></td>
          <td className="px-4 py-3"><div className="h-4 w-28 bg-slate-800 rounded animate-pulse" /></td>
          <td className="px-4 py-3"><div className="h-4 w-28 bg-slate-800 rounded animate-pulse" /></td>
          <td className="px-4 py-3"><div className="h-5 w-32 bg-slate-800 rounded-full animate-pulse" /></td>
          <td className="px-4 py-3 text-right"><div className="h-8 w-16 bg-slate-800 rounded-lg ml-auto animate-pulse" /></td>
        </tr>
      ))}
    </>
  )
}

function DateRangePicker({ label, from, to, onChange }: { label: string; from: string; to: string; onChange: (from: string, to: string) => void }) {
  const [currentMonth, setCurrentMonth] = useState<Date>(from ? new Date(from) : new Date())
  const start = startOfMonth(currentMonth)
  const end = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start, end })

  const isSelected = (d: Date) => {
    if (!from && !to) return false
    const f = from ? new Date(from) : null
    const t = to ? new Date(to) : null
    if (f && t) return isWithinInterval(d, { start: f, end: t })
    if (f && isSameDay(d, f)) return true
    return false
  }

  const clickDay = (d: Date) => {
    if (!from || (from && to)) {
      onChange(format(d, 'yyyy-MM-dd'), '')
      return
    }
    const f = new Date(from)
    if (isBefore(d, f)) {
      onChange(format(d, 'yyyy-MM-dd'), format(f, 'yyyy-MM-dd'))
    } else {
      onChange(from, format(d, 'yyyy-MM-dd'))
    }
  }

  return (
    <div className="space-y-2">
      <div className="text-sm text-slate-300">{label} (from – to)</div>
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <button type="button" className="px-2 py-1 text-slate-300 hover:text-white" onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}>{'<'}</button>
          <div className="text-slate-200 font-medium">{format(currentMonth, 'MMMM yyyy')}</div>
          <button type="button" className="px-2 py-1 text-slate-300 hover:text-white" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>{'>'}</button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400 mb-1">
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((d) => (
            <button
              key={format(d, 'yyyy-MM-dd')}
              type="button"
              onClick={() => clickDay(d)}
              className={`py-2 rounded ${isSelected(d) ? 'bg-teal-600 text-white' : 'text-slate-200 hover:bg-slate-800'}`}
            >
              {format(d, 'd')}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-slate-300">
          <div>From: {from || '—'}</div>
          <div>To: {to || '—'}</div>
          <button type="button" className="px-2 py-1 border border-slate-600 rounded hover:border-slate-500" onClick={() => onChange('', '')}>Clear</button>
        </div>
      </div>
    </div>
  )
}

function DateRangeInput({ label, from, to, onChange }: { label: string; from: string; to: string; onChange: (from: string, to: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <div className="text-sm text-slate-300 mb-1">{label}</div>
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full text-left pl-3 pr-8 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500">
        {from && to ? `${from} → ${to}` : 'Select date range'}
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
      </button>
      {open && (
        <div className="absolute z-20 mt-2 w-full sm:w-auto">
          <DateRangePicker label={label} from={from} to={to} onChange={(f, t) => { onChange(f, t); }} />
          <div className="flex justify-end mt-2">
            <button type="button" className="px-3 py-2 bg-teal-600 text-white rounded-lg" onClick={() => setOpen(false)}>Done</button>
          </div>
        </div>
      )}
    </div>
  )
}


