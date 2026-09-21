import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { useProfile } from './hooks/useProfile'
import { History } from './pages/History'
import { Home } from './pages/Home'
import { Onboarding } from './pages/Onboarding'
import { Plan } from './pages/Plan'
import { Progress } from './pages/Progress'
import { Rules } from './pages/Rules'
import { Settings } from './pages/Settings'
import { Competition } from './pages/workout/Competition'
import { PracticeHold } from './pages/workout/PracticeHold'
import { Strength } from './pages/workout/Strength'
import { TrainingHold } from './pages/workout/TrainingHold'

function RequireProfile({ children }: { children: React.ReactNode }) {
  const { profile } = useProfile()
  if (!profile) return <Navigate to="/onboarding" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/workout/practice" element={<RequireProfile><PracticeHold /></RequireProfile>} />
      <Route path="/workout/training" element={<RequireProfile><TrainingHold /></RequireProfile>} />
      <Route path="/workout/strength" element={<RequireProfile><Strength /></RequireProfile>} />
      <Route path="/workout/competition" element={<RequireProfile><Competition /></RequireProfile>} />
      <Route element={<RequireProfile><Layout /></RequireProfile>}>
        <Route path="/home" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}
