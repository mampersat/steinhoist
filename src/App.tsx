import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { useProfile } from './hooks/useProfile'
import { History } from './pages/History'
import { Home } from './pages/Home'
import { Onboarding } from './pages/Onboarding'
import { Progress } from './pages/Progress'
import { PracticeHold } from './pages/workout/PracticeHold'
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
      <Route element={<RequireProfile><Layout /></RequireProfile>}>
        <Route path="/home" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/progress" element={<Progress />} />
      </Route>
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}
