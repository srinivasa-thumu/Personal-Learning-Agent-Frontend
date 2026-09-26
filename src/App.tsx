import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Dashboard } from './components/Dashboard'
import { NewJourney } from './components/NewJourney'
import { LearnSession } from './components/LearnSession'
import { ProfileDetail } from './components/ProfileDetail'
import { LLMStats } from './components/LLMStats'
import { ReviewSchedule } from './components/ReviewSchedule'
import { SourceIngestion } from './components/SourceIngestion'
import { LearningRules } from './components/LearningRules'
import { OutcomeIntelligence } from './components/OutcomeIntelligence'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/new" element={<NewJourney />} />
        <Route path="/learn/:planId/:nodeId" element={<LearnSession />} />
        <Route path="/profile" element={<ProfileDetail />} />
        <Route path="/stats" element={<LLMStats />} />
        <Route path="/reviews" element={<ReviewSchedule />} />
        <Route path="/sources" element={<SourceIngestion />} />
        <Route path="/rules" element={<LearningRules />} />
        <Route path="/outcomes" element={<OutcomeIntelligence />} />
      </Routes>
    </BrowserRouter>
  )
}
