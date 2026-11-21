/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext.tsx';
import { AppShell } from './components/AppShell.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { CustomersView } from './components/CustomersView.tsx';
import { CustomerResponsesView } from './components/CustomerResponsesView.tsx';
import { ChatbotView } from './components/ChatbotView.tsx';
import { AnalyticsView } from './components/AnalyticsView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { AssignmentsView } from './components/AssignmentsView.tsx';
import { AnnouncementsView } from './components/AnnouncementsView.tsx';
import { StudyHubView } from './components/StudyHubView.tsx';
import { FacultyView } from './components/FacultyView.tsx';

function MainRouter() {
  const { activeNav } = useWorkspace();

  return (
    <AppShell>
      {activeNav === 'dashboard' && <DashboardView />}
      {activeNav === 'customers' && <CustomersView />}
      {activeNav === 'responses' && <CustomerResponsesView />}
      {(activeNav === 'chatbot' || activeNav === 'ai-assistant') && <ChatbotView />}
      {activeNav === 'analytics' && <AnalyticsView />}
      {activeNav === 'settings' && <SettingsView />}
      {activeNav === 'assignments' && <AssignmentsView />}
      {activeNav === 'announcements' && <AnnouncementsView />}
      {activeNav === 'study-hub' && <StudyHubView />}
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
