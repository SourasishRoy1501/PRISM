import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { supabase } from '@/utils/supabaseClient'

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/patients', label: 'Patients' },
  { href: '/appointments', label: 'Appointments' },
]

export default function Navbar() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
  if (error) console.error('Logout error:', error.message);
  else window.location.reload();
  }

  return (
    <nav className="bg-slate-900 border-b border-slate-700 sticky top-0 z-40">
      <div className="container-page h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-slate-300 hover:bg-slate-800"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-teal-500 transform rotate-45 flex items-center justify-center">
              <div className="w-3 h-3 bg-white transform -rotate-45"></div>
            </div>
            <span className="text-2xl font-bold text-white">PRISM</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`text-white hover:text-teal-400 transition-colors ${
                router.pathname.startsWith(item.href) && item.href !== '/' 
                  ? 'text-teal-400' 
                  : router.pathname === '/' && item.href === '/' 
                    ? 'text-teal-400' 
                    : ''
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* <div className="hidden md:flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">U</span>
          </div>
        </div> */}

        <button className="hidden md:flex items-center gap-3" onClick={handleLogout}>
          <span className="text-white text-sm font-medium hover:text-teal-400">Logout</span>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-700 bg-slate-900">
          <div className="container-page py-3 flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="py-2 text-white hover:text-teal-400"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
