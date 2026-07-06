import { useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/authContext";

function AdminDashboardPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        <Link
          to="/admin/users"
          className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition"
        >
          <h2 className="text-lg font-bold text-gray-900">Manage Users</h2>
          <p className="text-sm text-gray-500 mt-1">
            View, search, suspend, activate, or delete users.
          </p>
        </Link>
      </div>
    </div>
  );
}

export default AdminDashboardPage;