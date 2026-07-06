import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { getUserDetails, updateUserStatus, deleteUser } from "../../services/adminServices";

function UserDetailsPage() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    fetchDetails();
  }, [user, id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await getUserDetails(id);
      setDetails(data);
    } catch (err) {
      console.error("Failed to fetch user details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async () => {
    await updateUserStatus(id, "suspended");
    fetchDetails();
  };

  const handleActivate = async () => {
    await updateUserStatus(id, "active");
    fetchDetails();
  };

  const handleDelete = async () => {
    await deleteUser(id);
    navigate("/admin/users");
  };

  if (!user || user.role !== "admin") return null;
  if (loading) return <p className="p-10 text-gray-400">Loading...</p>;
  if (!details) return <p className="p-10 text-red-500">User not found.</p>;

  const { user: targetUser, links } = details;

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <Link to="/admin/users" className="text-sm text-blue-600 hover:underline">
        ← Back to Users
      </Link>

      <div className="bg-white shadow-md rounded-lg p-6 mt-4 max-w-xl">
        <h1 className="text-xl font-bold text-gray-900">{targetUser.name}</h1>
        <p className="text-sm text-gray-500">@{targetUser.username}</p>
        <p className="text-sm text-gray-500">{targetUser.email}</p>

        <div className="flex gap-4 mt-3 text-xs text-gray-400">
          <span>Role: {targetUser.role}</span>
          <span>Status: {targetUser.status}</span>
          <span>Joined: {new Date(targetUser.createdAt).toLocaleDateString()}</span>
        </div>

        <div className="flex gap-3 mt-6">
          {targetUser.status === "active" ? (
            <button
              onClick={handleSuspend}
              className="text-sm px-4 py-2 rounded-md border border-yellow-200 text-yellow-600 hover:bg-yellow-50"
            >
              Suspend User
            </button>
          ) : (
            <button
              onClick={handleActivate}
              className="text-sm px-4 py-2 rounded-md border border-green-200 text-green-600 hover:bg-green-50"
            >
              Activate User
            </button>
          )}
          <button
            onClick={handleDelete}
            className="text-sm px-4 py-2 rounded-md border border-red-200 text-red-600 hover:bg-red-50"
          >
            Delete User
          </button>
        </div>
      </div>

      <div className="mt-6 max-w-xl">
        <h2 className="text-lg font-bold text-gray-900 mb-3">
          Links ({links.length})
        </h2>
        {links.length === 0 ? (
          <p className="text-gray-400 text-sm">This user hasn't added any links.</p>
        ) : (
          <div className="space-y-2">
            {links.map((link) => (
              <div
                key={link._id}
                className="bg-white rounded-md border border-gray-100 p-3 text-sm"
              >
                <p className="font-medium">{link.title}</p>
                <p className="text-gray-400 text-xs">{link.url}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDetailsPage;