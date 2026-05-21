import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthGuard } from '../components/guards/AuthGuard';
import { RoleGuard } from '../components/guards/RoleGuard';
import { PublicGuard } from '../components/guards/PublicGuard';
import { AuthLayout } from '../components/layouts/AuthLayout';
import { CreatorLayout } from '../components/layouts/CreatorLayout';
import { FollowerLayout } from '../components/layouts/FollowerLayout';
import { LoginForm } from '../features/auth/components/LoginForm';
import { RegisterForm } from '../features/auth/components/RegisterForm';

// Creator pages
import { CreatorDashboard } from '../features/creator/pages/CreatorDashboard';
import { CreatorPosts } from '../features/creator/pages/CreatorPosts';
import { CreatorGoals } from '../features/creator/pages/CreatorGoals';
import { CreatorReports } from '../features/creator/pages/CreatorReports';

// Follower pages
import { FollowerFeed } from '../features/follower/pages/FollowerFeed';
import { CreatorsList } from '../features/follower/pages/CreatorsList';
import { CreatorProfile } from '../features/follower/pages/CreatorProfile';
import { FollowerFavorites } from '../features/follower/pages/FollowerFavorites';
import { FollowerDonations } from '../features/follower/pages/FollowerDonations';

export const router = createBrowserRouter([
  {
    element: <PublicGuard />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginForm /> },
          { path: '/register', element: <RegisterForm /> },
        ],
      },
    ],
  },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <RoleGuard allowedRole="creator" />,
        children: [
          {
            element: <CreatorLayout />,
            children: [
              { path: '/creator/dashboard', element: <CreatorDashboard /> },
              { path: '/creator/posts', element: <CreatorPosts /> },
              { path: '/creator/goals', element: <CreatorGoals /> },
              { path: '/creator/reports', element: <CreatorReports /> },
            ],
          },
        ],
      },
      {
        element: <RoleGuard allowedRole="follower" />,
        children: [
          {
            element: <FollowerLayout />,
            children: [
              { path: '/feed', element: <FollowerFeed /> },
              { path: '/creators', element: <CreatorsList /> },
              { path: '/creators/:id', element: <CreatorProfile /> },
              { path: '/favorites', element: <FollowerFavorites /> },
              { path: '/donations', element: <FollowerDonations /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '*',
    element: (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <span className="text-6xl mb-4">🍮</span>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-gray-600">Página no encontrada</p>
      </div>
    ),
  },
]);