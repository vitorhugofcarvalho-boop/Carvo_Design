import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/lib/auth'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/ui/Layout'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { LeadsPage } from '@/pages/LeadsPage'
import { LeadDetailPage } from '@/pages/LeadDetailPage'
import { PipelinePage } from '@/pages/PipelinePage'
import { FollowUpsPage } from '@/pages/FollowUpsPage'
import { DailyRoutinePage } from '@/pages/DailyRoutinePage'
import { NewLeadPage } from '@/pages/NewLeadPage'
import { TemplatesPage } from '@/pages/TemplatesPage'
import { WeeklyAnalysisPage } from '@/pages/WeeklyAnalysisPage'
import { SettingsPage } from '@/pages/SettingsPage'

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="leads" element={<LeadsPage />} />
              <Route path="leads/new" element={<NewLeadPage />} />
              <Route path="leads/:id" element={<LeadDetailPage />} />
              <Route path="pipeline" element={<PipelinePage />} />
              <Route path="followups" element={<FollowUpsPage />} />
              <Route path="rotina" element={<DailyRoutinePage />} />
              <Route path="templates" element={<TemplatesPage />} />
              <Route path="analise" element={<WeeklyAnalysisPage />} />
              <Route path="configuracoes" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
