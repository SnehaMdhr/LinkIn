import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { getUserDetails, updateUserStatus, deleteUser } from "../../services/adminServices";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import ThemeDropdown from "../../components/ThemeDropdown";
import EditUserModal from "../../components/EditUserModal";
import ConfirmDialog from "../../components/ConfirmDialog";

function UserDetailsPage() {
  const { id } = useParams();
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [suspendConfirm, setSuspendConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

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

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    fetchDetails();
  }, [user, id, navigate]);

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
    navigate("/admin");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user || user.role !== "admin") return null;

  const targetUser = details?.user;
  const links = details?.links || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button variant="link" asChild className="px-0">
            <Link to="/admin">&larr; Admin</Link>
          </Button>
          <h1 className="text-xl font-bold text-foreground">User Detail</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeDropdown />
          <Button variant="ghost" size="sm" onClick={() => setLogoutConfirm(true)} className="text-destructive hover:text-destructive">
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : !targetUser ? (
          <p className="text-destructive text-sm">User not found.</p>
        ) : (
          <>
            <Card>
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                    {targetUser.profileImage ? (
                      <img src={targetUser.profileImage} alt={targetUser.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold text-primary">
                        {targetUser.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-bold text-foreground">{targetUser.name}</h2>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        targetUser.role === "admin"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {targetUser.role}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        targetUser.status === "active"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                        {targetUser.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      @{targetUser.username} &middot; {targetUser.email}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Joined {new Date(targetUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                    Edit
                  </Button>
                  {targetUser.status === "active" ? (
                    <Button variant="secondary" size="sm" onClick={() => setSuspendConfirm(true)}>
                      Suspend
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={handleActivate}>
                      Activate
                    </Button>
                  )}
                  <Button variant="destructive" size="sm" onClick={() => setDeleteConfirm(true)}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div>
              <h2 className="text-lg font-bold text-foreground mb-3">Links ({links.length})</h2>
              {links.length === 0 ? (
                <p className="text-muted-foreground text-sm">This user hasn't added any links.</p>
              ) : (
                <div className="space-y-2">
                  {links.map((link) => (
                    <div key={link._id} className="bg-card rounded-md border border-border p-3 text-sm">
                      <p className="font-medium text-foreground">{link.title}</p>
                      <p className="text-muted-foreground text-xs">{link.url}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <EditUserModal
        open={editOpen}
        onOpenChange={(val) => {
          setEditOpen(val);
          if (!val) fetchDetails();
        }}
        userId={id}
        onUserUpdated={fetchDetails}
      />

      <ConfirmDialog
        open={suspendConfirm}
        onOpenChange={setSuspendConfirm}
        title="Suspend user"
        description={`Are you sure you want to suspend "${targetUser?.name}"? They will lose access to their account.`}
        onConfirm={handleSuspend}
        confirmLabel="Suspend"
      />

      <ConfirmDialog
        open={deleteConfirm}
        onOpenChange={setDeleteConfirm}
        title="Delete user"
        description={`Are you sure you want to delete "${targetUser?.name}"? This will also remove all their links. This action cannot be undone.`}
        onConfirm={handleDelete}
        confirmLabel="Delete"
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

export default UserDetailsPage;
