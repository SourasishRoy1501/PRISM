import React from 'react'

export type ChangeHandler = (value: any) => void

export const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-6">
    <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
    {children}
  </section>
)

export const FormInput = React.memo(function FormInput({ label, value, onChange, type = 'text', placeholder = '', disabled = false }: { label: string; value: any; onChange: ChangeHandler; type?: string; placeholder?: string; disabled?: boolean }) {
  return (
    <div>
      <label className="block text-sm text-gray-300 mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-3 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''} ${type === 'date' || type === 'time' ? '[::-webkit-calendar-picker-indicator]:invert' : ''}
        `}
      />
    </div>
  )
})

export const FormSelect = React.memo(function FormSelect({ label, value, onChange, options, disabled = false }: { label: string; value: any; onChange: ChangeHandler; options: string[]; disabled?: boolean }) {
  return (
    <div>
      <label className="block text-sm text-gray-300 mb-1">{label}</label>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-3 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <option value="">Select</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )
})

export const FormRadioGroup = React.memo(function FormRadioGroup({ label, value, onChange, options, disabled = false }: { label: string; value: any; onChange: ChangeHandler; options: string[]; disabled?: boolean }) {
  return (
    <div>
      <span className="block text-sm text-gray-300 mb-2">{label}</span>
      <div className={`flex flex-wrap gap-4 ${disabled ? 'opacity-50' : ''}`}>
        {options.map((opt) => (
          <label key={opt} className="inline-flex items-center gap-2 text-gray-200">
            <input 
              type="radio" 
              name={label} 
              checked={value === opt} 
              onChange={() => onChange(opt)} 
              disabled={disabled}
              className="accent-teal-500" 
            /> {opt}
          </label>
        ))}
      </div>
    </div>
  )
})

export const getNestedValue = (obj: any, path: string, fallback: any = ''): any => {
  return path.split('.').reduce((acc: any, key: string) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj) ?? fallback
}

export const setNestedValue = (obj: any, path: string, value: any): any => {
  const parts = path.split('.')
  const clone: any = Array.isArray(obj) ? [...obj] : { ...obj }
  let cur: any = clone
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]
    const next = cur[key]
    cur[key] = Array.isArray(next) ? [...next] : { ...(next || {}) }
    cur = cur[key]
  }
  cur[parts[parts.length - 1]] = value
  return clone
}
