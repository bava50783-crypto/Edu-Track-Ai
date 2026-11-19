/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext.tsx';
import { AppShell } from './components/AppShell.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { AssignmentsView } from './components/AssignmentsView.tsx';
import { AnnouncementsView } from './components/AnnouncementsView.tsx';
import { StudyHubView } from './components/StudyHubView.tsx';
import { AIAssistantView } from './components/AIAssistantView.tsx';
import { FacultyView } from './components/FacultyView.tsx';

function MainRouter() {
  const { activeNav } = useWorkspace();

  return (
    <AppShell>
      {activeNav === 'dashboard' && <DashboardView />}
      {activeNav === 'assignments' && <AssignmentsView />}
      {activeNav === 'announcements' && <AnnouncementsView />}
      {activeNav === 'study-hub' && <StudyHubView />}
      {activeNav === 'ai-assistant' && <AIAssistantView />}
      {activeNav === 'faculty' && <FacultyView />}
    </AppShell>
  );
}

export default function App() {
  return (
    <WorkspaceProvider>
      <MainRouter />
    </WorkspaceProvider>
  );
}
