import { useState, useEffect, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import { useToast } from "../context/toastContext";
import { getLinks, deleteLink } from "../services/linkServices";
import { getUserStats } from "../services/analyticsServices";
import { Button } from "../components/ui/button";
import ThemeDropdown from "../components/ThemeDropdown";
import ProfileEditModal from "../components/ProfileEditModal";
import AddLinkModal from "../components/AddLinkModal";
import ActivityLogDialog from "../components/ActivityLogDialog";
import EditLinkModal from "../components/EditLinkModal";
import ConfirmDialog from "../components/ConfirmDialog";
import ProfileCard from "../components/profileCard";
import StatisticsCard from "../components/statisticsCard";
import LinkCard from "../components/linkCard";
import QrCard from "../components/qrCard";
import SearchBar from "../components/searchBar";
import Skeleton from "../components/Skeleton";
import logo from "../assets/logo.png";

function DashboardPage() {
  const { user, loading: authLoading, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();

  const [links, setLinks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [addLinkOpen, setAddLinkOpen] = useState(false);
  const [editLinkId, setEditLinkId] = useState(null);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [activityLogOpen, setActivityLogOpen] = useState(false);

  const filteredLinks = useMemo(() => {
    if (!search.trim()) return links;
    const q = search.toLowerCase();
    return links.filter((l) =>
      l.title?.toLowerCase().includes(q) ||
      l.platform?.toLowerCase().includes(q) ||
      l.url?.toLowerCase().includes(q) ||
      l.category?.toLowerCase().includes(q)
    );
  }, [links, search]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/");
      return;
    }
    fetchLinks();
    fetchStats();
  }, [user, authLoading]);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const data = await getLinks();
      setLinks(data);
    } catch (err) {
      toast.error("Failed to load links.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getUserStats(user.id);
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const handleDelete = async (linkId) => {
    try {
      await deleteLink(linkId);
      setLinks(links.filter((link) => link._id !== linkId));
      toast.success("Link deleted");
    } catch (err) {
      toast.error("Failed to delete link.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="/dashboard" className="flex items-center">
            <img src={logo} alt="LinkIn" className="h-10 w-auto object-contain" />
          </a>
          <div className="flex items-center gap-3">
            <ThemeDropdown />
            <Button variant="outline" size="sm" onClick={() => setProfileOpen(true)}>
              Edit Profile
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/customize-profile")}>
              Customize Profile
            </Button>
            <Button variant="outline" size="sm" onClick={() => setActivityLogOpen(true)}>
              Activity Log
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setLogoutConfirm(true)} className="text-destructive hover:text-destructive">
              Logout
            </Button>
          </div>
        </nav>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-4">
            <ProfileCard user={user} />
            <StatisticsCard linkCount={links.length} />
          </div>
          <QrCard username={user.username} />
        </div>

        {/* Analytics Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{stats.profileViews}</p>
              <p className="text-xs text-muted-foreground mt-1">Profile Views</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{stats.linkClicks}</p>
              <p className="text-xs text-muted-foreground mt-1">Link Clicks</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{stats.qrScans}</p>
              <p className="text-xs text-muted-foreground mt-1">QR Scans</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{stats.totalLinks}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Links</p>
            </div>
          </div>
        )}

        {/* Most Clicked Link */}
        {stats?.mostClickedLink && (
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">Most Clicked Link</p>
            <p className="font-medium text-foreground truncate">{stats.mostClickedLink.title}</p>
            <p className="text-xs text-muted-foreground truncate">{stats.mostClickedLink.url}</p>
          </div>
        )}

        {/* Recent Links */}
        {stats?.recentLinks?.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-foreground mb-2">Recent Links</h3>
            <div className="space-y-2">
              {stats.recentLinks.map((link) => (
                <div key={link._id} className="bg-card border border-border rounded-lg p-3 text-sm flex justify-between items-center">
                  <span className="truncate font-medium text-foreground">{link.title}</span>
                  <span className="text-xs text-muted-foreground shrink-0 ml-2">{link.platform}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-foreground">Your Links</h2>
            <Button onClick={() => setAddLinkOpen(true)}>
              + Add Link
            </Button>
          </div>

          {links.length > 0 && (
            <div className="mb-4">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search links by title, platform, or category..."
              />
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map((i) => <Skeleton key={i} variant="card" />)}
            </div>
          ) : filteredLinks.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {search ? "No links match your search." : 'You haven\'t added any links yet. Click "+ Add Link" to get started.'}
            </p>
          ) : (
            <div className="space-y-3">
              {filteredLinks.map((link) => (
                <LinkCard
                  key={link._id}
                  link={link}
                  onDelete={handleDelete}
                  onEdit={(id) => setEditLinkId(id)}
                  onRefresh={fetchLinks}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ProfileEditModal key={user?.id || "guest"} open={profileOpen} onOpenChange={setProfileOpen} />
      <ActivityLogDialog open={activityLogOpen} onOpenChange={setActivityLogOpen} />
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
