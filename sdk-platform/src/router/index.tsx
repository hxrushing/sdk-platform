// src/router/index.tsx
import { createBrowserRouter } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import EventAnalysis from '@/pages/EventAnalysis';
import FunnelAnalysis from '@/pages/FunnelAnalysis';
import Settings from '@/pages/Settings';
import EventManagement from '@/pages/EventManagement';
import App from '@/App';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Dashboard />,
      },
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
      {
        path: '/events',
        element: <EventAnalysis />,
      },
      {
        path: '/funnel',
        element: <FunnelAnalysis />,
      },
      {
        path: '/settings',
        element: <Settings />,
      },
      {
        path: '/event-management',
        element: <EventManagement />,
      },
    ],
  },
]);

export default router;