import type { RouteObject } from 'react-router';
import AppLayout from './appLayout';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import AccountSearch from './pages/AccountSearch';
import AccountObjectDetail from './pages/AccountObjectDetailPage';
import PipelineDashboard from './pages/PipelineDashboard';
import OpportunitiesPage from './pages/OpportunitiesPage';
import AccountsWithOpportunitiesPage from './pages/AccountsWithOpportunitiesPage';
import QuickClosePage from './pages/QuickClosePage';

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
        path: 'opportunities',
        element: <OpportunitiesPage />,
        handle: { showInNavigation: true, label: 'Opportunities' }
      },
      {
        path: 'accounts-with-opps',
        element: <AccountsWithOpportunitiesPage />,
        handle: { showInNavigation: true, label: 'Accounts & Opps' }
      },
      {
        path: 'quick-close',
        element: <QuickClosePage />,
        handle: { showInNavigation: true, label: 'Quick Close' }
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
];
