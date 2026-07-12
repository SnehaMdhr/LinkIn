import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import { getLinks, deleteLink } from "../services/linkServices";
import { Button } from "../components/ui/button";
import ThemeDropdown from "../components/ThemeDropdown";
import ProfileEditModal from "../components/ProfileEditModal";
import AddLinkModal from "../components/AddLinkModal";
import EditLinkModal from "../components/EditLinkModal";
import ConfirmDialog from "../components/ConfirmDialog";
import ProfileCard from "../components/profileCard";
import StatisticsCard from "../components/statisticsCard";
import LinkCard from "../components/linkCard";
import QrCard from "../components/qrCard";

function DashboardPage() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [addLinkOpen, setAddLinkOpen] = useState(false);
  const [editLinkId, setEditLinkId] = useState(null);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/");
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
    navigate("/");
  };

  if (!user) return null; 

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="bg-card border-b border-border px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-foreground">LinkIn Dashboard</h1>
        <div className="flex items-center gap-2">
          <ThemeDropdown />
          <Button variant="outline" size="sm" onClick={() => setProfileOpen(true)}>
            Edit Profile
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setLogoutConfirm(true)} className="text-destructive hover:text-destructive">
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-4">
            <ProfileCard user={user} />
            <StatisticsCard linkCount={links.length} />
          </div>
          <QrCard username={user.username} />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-foreground">Your Links</h2>
            <Button onClick={() => setAddLinkOpen(true)}>
              + Add Link
            </Button>
          </div>

          {loading ? (
            <p className="text-muted-foreground text-sm">Loading links...</p>
          ) : links.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              You haven't added any links yet. Click "+ Add Link" to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {links.map((link) => (
                <LinkCard
                  key={link._id}
                  link={link}
                  onDelete={handleDelete}
                  onEdit={(id) => setEditLinkId(id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ProfileEditModal key={user?.id || "guest"} open={profileOpen} onOpenChange={setProfileOpen} />
      <AddLinkModal open={addLinkOpen} onOpenChange={setAddLinkOpen} onLinkAdded={fetchLinks} />
      <EditLinkModal
        open={editLinkId !== null}
        onOpenChange={(val) => { if (!val) setEditLinkId(null); }}
        linkId={editLinkId}
        onLinkUpdated={fetchLinks}
      />
      <ConfirmDialog
        open={logoutConfirm}
        onOpenChange={setLogoutConfirm}
        title="Logout"
        description="Are you sure you want to logout? You will need to sign in again."
        onConfirm={handleLogout}
        confirmLabel="Logout"
      />
    </div>
  );
}

export default DashboardPage;
