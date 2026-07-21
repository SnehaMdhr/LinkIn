import { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { useToast } from "../../context/toastContext";
import { getAllUsers, deleteUser } from "../../services/adminServices";
import { Button } from "../../components/ui/button";
import ThemeDropdown from "../../components/ThemeDropdown";
import ProfileEditModal from "../../components/ProfileEditModal";
import SearchBar from "../../components/searchBar";
import UserTable from "../../components/userTable";
import CreateUserModal from "../../components/CreateUserModal";
import UserDetailModal from "../../components/UserDetailModal";
import ConfirmDialog from "../../components/ConfirmDialog";
import AdminAuditLogDialog from "../../components/AdminAuditLogDialog";
import logo from "../../assets/logo.png";

function AdminDashboardPage() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailUserId, setDetailUserId] = useState(null);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [auditLogOpen, setAuditLogOpen] = useState(false);
  const toast = useToast();
  const LIMIT = 10;

  const fetchUsers = async (searchTerm = "", pageNum = 1) => {
    try {
      setLoading(true);
      const data = await getAllUsers(searchTerm, pageNum, LIMIT);
      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
      setPage(data.page || 1);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== "admin") {
      return;
    }
    fetchUsers();
  }, [user, navigate]);

  const handleSearchChange = (value) => {
    setSearch(value);
    fetchUsers(value, 1);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    fetchUsers(search, newPage);
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      toast.success("User deleted");
      fetchUsers(search, page);
    } catch (err) {
      toast.error("Failed to delete user.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user || user.role !== "admin") return null;

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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLogoutConfirm(true)}
              className="text-destructive hover:text-destructive"
            >
              Logout
            </Button>
          </div>
        </nav>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <SearchBar
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by name, email, or username..."
          />
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setAuditLogOpen(true)}>
              Audit Logs
            </Button>
            <Button onClick={() => setCreateOpen(true)}>+ Add User</Button>
          </div>
        </div>

        {loading ? (
          <p className="text-muted-foreground text-sm mt-4">Loading users...</p>
        ) : (
          <>
            <UserTable
              users={users}
              onView={(id) => setDetailUserId(id)}
              onDelete={handleDelete}
            />

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    &larr; Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    Next &rarr;
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <AdminAuditLogDialog open={auditLogOpen} onOpenChange={setAuditLogOpen} />

      <CreateUserModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onUserCreated={() => fetchUsers(search)}
      />

      <ProfileEditModal key={user?.id || "guest"} open={profileOpen} onOpenChange={setProfileOpen} />
      <UserDetailModal
        open={detailUserId !== null}
        onOpenChange={(val) => {
          if (!val) setDetailUserId(null);
        }}
        userId={detailUserId}
        onRefresh={() => fetchUsers(search)}
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

export default AdminDashboardPage;
