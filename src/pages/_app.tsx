import type { AppProps } from 'next/app'
import '@/styles/globals.css'
import { AuthProvider } from '../hooks/AuthContext';
import { PatientProvider } from '@/hooks/PatientContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';


export default function App({ Component, pageProps }: AppProps) {

  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PatientProvider>
        <Component {...pageProps} />
        </PatientProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
