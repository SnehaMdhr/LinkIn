import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import PlatformIcon from "../components/PlatformIcon";

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <h1 className="text-2xl font-bold text-foreground">Profile not found</h1>
        <p className="text-muted-foreground mt-2">
          No user exists with the username "{username}".
        </p>
      </div>
    );
  }

  const { user, links } = profile;

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 bg-background">
      <div className="w-full max-w-sm text-center">
        <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary overflow-hidden">
          {user.profileImage ? (
            <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            user.name?.charAt(0).toUpperCase() || "U"
          )}
        </div>

        <h1 className="text-2xl font-bold text-foreground mt-4">{user.name}</h1>
        <p className="text-muted-foreground text-sm">@{user.username}</p>

        {user.bio && <p className="mt-3 text-sm text-muted-foreground/80">{user.bio}</p>}

        <div className="mt-8 space-y-3">
          {links.length === 0 ? (
            <p className="text-sm text-muted-foreground/50">No links added yet.</p>
          ) : (
            links.map((link) => (
              <a key={link._id} href={link.url} target="_blank" rel="noreferrer"
                className="block w-full bg-card border border-border hover:bg-muted rounded-lg py-3 px-4 font-medium transition text-foreground">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <PlatformIcon platform={link.platform} className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="truncate">{link.title}</p>
                    <span className="block text-xs text-muted-foreground/60">{link.platform}</span>
                  </div>
                </div>
              </a>
            ))
          )}
        </div>

        <p className="mt-10 text-xs text-muted-foreground/40">Powered by LinkIn</p>
      </div>
    </div>
  );
}

export default PublicProfilePage;