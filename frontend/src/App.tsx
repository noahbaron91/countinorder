import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { GoogleAuth } from './GoogleAuth';
import { GuestAuth } from './GuestAuth';
import { UserProvider } from './context/User';
import { Home } from './Home';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { GoogleAuthCallback } from './GoogleAuthCallback';
import { FailedAuth } from './FailedAuth';
import { Logout } from './Logout';
import { useEffect } from 'react';
import { updateColors } from './utils/updateColors';
import { Toaster } from 'react-hot-toast';
import { GameOver } from './GameOver';
import DisableDevtool from 'disable-devtool';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <UserProvider>
        <Home />
      </UserProvider>
    ),
  },
  {
    path: '/auth/guest',
    element: <GuestAuth />,
  },
  {
    path: '/auth/google/callback',
    element: <GoogleAuthCallback />,
  },
  {
    path: '/auth/google',
    element: <GoogleAuth />,
  },
  {
    path: '/auth/failed',
    element: <FailedAuth />,
  },
  {
    path: '/logout',
    element: <Logout />,
  },
  {
    path: '/game-over',
    element: <GameOver />,
  },
]);

export function App() {
  useEffect(() => {
    updateColors();
  }, []);

  useEffect(() => {
    DisableDevtool();
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}
