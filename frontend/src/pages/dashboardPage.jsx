import { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import { getLinks, deleteLink } from "../services/linkServices";
import ProfileCard from "../components/profileCard";
import StatisticsCard from "../components/statisticsCard";
import LinkCard from "../components/linkCard";
import QrCard from "../components/qrCard";

function DashboardPage() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect to login if no user in context (functional guard, not real auth yet)
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchLinks();
  }, [user]);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const data = await getLinks(user.id);
      setLinks(data);
    } catch (err) {
      console.error("Failed to fetch links:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (linkId) => {
    try {
      await deleteLink(linkId);
      setLinks(links.filter((link) => link._id !== linkId));
    } catch (err) {
      console.error("Failed to delete link:", err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null; // avoid flashing content before redirect

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">LinkIn Dashboard</h1>
        <div className="flex gap-3">
          <Link
            to="/profile"
            className="text-sm text-gray-600 hover:text-blue-600 px-4 py-2 rounded-md border border-gray-200"
          >
            Edit Profile
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-700 px-4 py-2 rounded-md border border-red-100"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Profile + Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-4">
            <ProfileCard user={user} />
            <StatisticsCard linkCount={links.length} />
          </div>
          <QrCard username={user.username} />
        </div>

        {/* Links section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Your Links</h2>
            <Link
              to="/links/add"
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              + Add Link
            </Link>
          </div>

          {loading ? (
            <p className="text-gray-400 text-sm">Loading links...</p>
          ) : links.length === 0 ? (
            <p className="text-gray-400 text-sm">
              You haven't added any links yet. Click "+ Add Link" to get
              started.
            </p>
          ) : (
            <div className="space-y-3">
              {links.map((link) => (
                <LinkCard key={link._id} link={link} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
