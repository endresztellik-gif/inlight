import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

function App() {
  const { t } = useTranslation()

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-primary">{t('app.title')}</h1>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<div>{t('app.welcome')}</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
