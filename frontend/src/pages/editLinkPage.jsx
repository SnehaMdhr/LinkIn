import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { updateLink } from "../services/linkServices";

const PLATFORM_OPTIONS = [
  "GitHub", "LinkedIn", "Instagram", "Facebook",
  "TikTok", "YouTube", "Portfolio", "Website", "Other",
];

function EditLinkPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    platform: "GitHub",
    title: "",
    url: "",
    position: 0,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Fetch existing link data on mount
  useEffect(() => {
    const fetchLink = async () => {
      try {
        // NOTE: no single-link-by-id GET route exists yet, so we fetch
        // all links for the user is not possible here (no userId in URL).
        // Simplest Day 1 approach: add a lightweight direct fetch by id.
        const response = await api.get(`/links/single/${id}`);
        const link = response.data;
        setFormData({
          platform: link.platform,
          title: link.title,
          url: link.url,
          position: link.position,
        });
      } catch (err) {
        setError("Could not load link details.");
      } finally {
        setFetching(false);
      }
    };
    fetchLink();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await updateLink(id, formData);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update link.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400">Loading link...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Link</h1>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-md px-4 py-2 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
            <select
              name="platform"
              value={formData.platform}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PLATFORM_OPTIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
            <input
              type="text"
              name="url"
              value={formData.url}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position (display order)
            </label>
            <input
              type="number"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <Link
              to="/dashboard"
              className="flex-1 text-center border border-gray-300 text-gray-700 py-2 rounded-md font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditLinkPage;