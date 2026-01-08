import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from './contexts/ThemeContext'
import { OfflineProvider } from './contexts/OfflineContext'
import { createOfflineQueryClient } from './lib/queryClient'
import App from './App.tsx'
import './index.css'
import './i18n'

// Create QueryClient with offline support
const queryClient = createOfflineQueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <OfflineProvider>
        <ThemeProvider>
          <App />
          <ReactQueryDevtools initialIsOpen={false} />
        </ThemeProvider>
      </OfflineProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
