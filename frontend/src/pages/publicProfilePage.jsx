import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

function PublicProfilePage() {
  const { username } = useParams();

  const [profile, setProfile] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        const response = await api.get(`/user/${username}`);
        setProfile(response.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400">Loading profile...</p>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <h1 className="text-2xl font-bold text-gray-900">Profile not found</h1>
        <p className="text-gray-500 mt-2">
          No user exists with the username "{username}".
        </p>
      </div>
    );
  }

  const { user, links } = profile;

  const themeClasses = {
    light: "bg-white text-gray-900",
    dark: "bg-gray-900 text-white",
    colorful: "bg-gradient-to-b from-purple-100 to-pink-50 text-gray-900",
    minimal: "bg-gray-50 text-gray-800",
  };

  return (
    <div className={`min-h-screen flex flex-col items-center px-4 py-12 ${themeClasses[user.theme] || themeClasses.light}`}>
      <div className="w-full max-w-sm text-center">
        <div className="w-24 h-24 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600 overflow-hidden">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            user.name?.charAt(0).toUpperCase() || "U"
          )}
        </div>

        <h1 className="text-2xl font-bold mt-4">{user.name}</h1>
        <p className="opacity-70 text-sm">@{user.username}</p>

        {user.bio && <p className="mt-3 text-sm opacity-80">{user.bio}</p>}

        <div className="mt-8 space-y-3">
          {links.length === 0 ? (
            <p className="text-sm opacity-50">No links added yet.</p>
          ) : (
            links.map((link) => (
              <a
                key={link._id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="block w-full bg-black/5 hover:bg-black/10 rounded-lg py-3 px-4 font-medium transition"
              >
                {link.title}
                <span className="block text-xs opacity-60">{link.platform}</span>
              </a>
            ))
          )}
        </div>

        <p className="mt-10 text-xs opacity-40">Powered by LinkIn</p>
      </div>
    </div>
  );
}

export default PublicProfilePage;