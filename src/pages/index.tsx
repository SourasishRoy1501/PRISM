import Navbar from '@/components/common/Navbar'

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="container-page py-8">
        <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
        <p className="text-slate-600">Welcome to the RWE Platform.</p>
      </main>
    </>
  )
}
