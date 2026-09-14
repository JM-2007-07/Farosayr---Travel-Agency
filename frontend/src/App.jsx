import { lazy, Suspense, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, useLocation, Outlet } from 'react-router';
import Layout from './layout/Layout';
import AdminLayout from './layout/AdminLayout';
import AdminGuard from './components/admin/AdminGuard';
import Loading from './components/Loading';
import { AuthProvider } from './context/AuthContext';

const Home = lazy(() => import('./pages/Home'));
const Tours = lazy(() => import('./pages/Tours'));
const TourDetails = lazy(() => import('./pages/TourDetails'));
const Destinations = lazy(() => import('./pages/Destinations'));
const DestinationDetails = lazy(() => import('./pages/DestinationDetails'));
const Deals = lazy(() => import('./pages/Deals'));
const DealDetails = lazy(() => import('./pages/DealDetails'));
const About = lazy(() => import('./pages/About'));
const Reviews = lazy(() => import('./pages/Reviews'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Contact = lazy(() => import('./pages/Contact'));
const Booking = lazy(() => import('./pages/Booking'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const Bookings = lazy(() => import('./pages/Bookings'));
const Favorites = lazy(() => import('./pages/Favorites'));
const NotFound = lazy(() => import('./pages/NotFound'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminTours = lazy(() => import('./pages/admin/AdminTours'));
const AdminTourDetails = lazy(() => import('./pages/admin/AdminTourDetails'));
const AdminDestinations = lazy(() => import('./pages/admin/AdminDestinations'));
const AdminDeals = lazy(() => import('./pages/admin/AdminDeals'));
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages'));

function withSuspense(Page) {
  return (
    <Suspense fallback={<Loading />}>
      <Page />
    </Suspense>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function RootShell() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}

function AdminShell() {
  return (
    <AdminGuard>
      <AdminLayout />
    </AdminGuard>
  );
}

const router = createBrowserRouter([
  {
    // Pathless layout route: only holds the cross-cutting ScrollToTop
    // behavior, shared by both the public site and the admin panel below
    // — everything else about the two shells is intentionally separate
    // (AdminLayout has its own sidebar, no public Header/Footer).
    Component: RootShell,
    children: [
      {
        path: '/',
        element: <Layout />,
        children: [
          { index: true, element: withSuspense(Home) },
          { path: 'tours', element: withSuspense(Tours) },
          { path: 'tours/:id', element: withSuspense(TourDetails) },
          { path: 'destinations', element: withSuspense(Destinations) },
          { path: 'destinations/:id', element: withSuspense(DestinationDetails) },
          { path: 'deals', element: withSuspense(Deals) },
          { path: 'deals/:id', element: withSuspense(DealDetails) },
          { path: 'about', element: withSuspense(About) },
          { path: 'reviews', element: withSuspense(Reviews) },
          { path: 'gallery', element: withSuspense(Gallery) },
          { path: 'contact', element: withSuspense(Contact) },
          { path: 'booking', element: withSuspense(Booking) },
          { path: 'login', element: withSuspense(Login) },
          { path: 'register', element: withSuspense(Register) },
          { path: 'profile', element: withSuspense(Profile) },
          { path: 'bookings', element: withSuspense(Bookings) },
          { path: 'favorites', element: withSuspense(Favorites) },
        ],
      },
      {
        // Separate top-level branch, deliberately NOT nested under the
        // public Layout. AdminGuard (frontend UX only — the backend
        // independently enforces requireAuth + requireRole('ADMIN') on
        // every /api/admin/* route regardless) gates the whole branch:
        // redirects unauthenticated to /login, shows a 403 message for
        // authenticated non-admins, and only then renders AdminLayout.
        path: 'admin',
        element: <AdminShell />,
        children: [
          { index: true, element: withSuspense(AdminDashboard) },
          { path: 'tours', element: withSuspense(AdminTours) },
          { path: 'tours/:id', element: withSuspense(AdminTourDetails) },
          { path: 'destinations', element: withSuspense(AdminDestinations) },
          { path: 'deals', element: withSuspense(AdminDeals) },
          { path: 'bookings', element: withSuspense(AdminBookings) },
          { path: 'users', element: withSuspense(AdminUsers) },
          { path: 'reviews', element: withSuspense(AdminReviews) },
          { path: 'messages', element: withSuspense(AdminMessages) },
          { path: '*', element: withSuspense(NotFound) },
        ],
      },
      { path: '*', element: withSuspense(NotFound) },
    ],
  },
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
