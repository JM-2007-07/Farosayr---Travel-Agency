import { Navigate } from 'react-router';

// Tour editing happens via a dialog on the /admin/tours list page (see
// AdminTours.jsx) rather than a separate detail route — simpler, and
// consistent with how destinations/deals are managed. This route still
// resolves (rather than 404ing) for anyone following an old /admin/tours/:id
// link, but redirects straight to the list.
export default function AdminTourDetails() {
  return <Navigate to="/admin/tours" replace />;
}
