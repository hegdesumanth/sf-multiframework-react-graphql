import type { RouteObject } from 'react-router';
import AppLayout from './appLayout';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import AccountSearch from './pages/AccountSearch';
import AccountObjectDetail from './pages/AccountObjectDetailPage';
import PipelineDashboard from './pages/PipelineDashboard';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Home />,
        handle: { showInNavigation: true, label: 'Home' }
      },
      {
        path: 'accounts/:recordId',
        element: <AccountObjectDetail />
      },
      {
        path: 'accounts',
        element: <AccountSearch />
      },
      {
        path: 'pipeline',
        element: <PipelineDashboard />,
        handle: { showInNavigation: true, label: 'Pipeline' }
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
];
