import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/ui/Layout'
import { DashboardPage } from '@/pages/DashboardPage'
import { LeadsPage } from '@/pages/LeadsPage'
import { LeadDetailPage } from '@/pages/LeadDetailPage'
import { PipelinePage } from '@/pages/PipelinePage'
import { FollowUpsPage } from '@/pages/FollowUpsPage'
import { DailyRoutinePage } from '@/pages/DailyRoutinePage'
import { TemplatesPage } from '@/pages/TemplatesPage'
import { WeeklyAnalysisPage } from '@/pages/WeeklyAnalysisPage'
import { SettingsPage } from '@/pages/SettingsPage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="leads/:id" element={<LeadDetailPage />} />
          <Route path="pipeline" element={<PipelinePage />} />
          <Route path="followups" element={<FollowUpsPage />} />
          <Route path="rotina" element={<DailyRoutinePage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="analise" element={<WeeklyAnalysisPage />} />
          <Route path="configuracoes" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
