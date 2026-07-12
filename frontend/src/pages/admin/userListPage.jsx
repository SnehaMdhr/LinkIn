import { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { getAllUsers, deleteUser } from "../../services/adminServices";
import { Button } from "../../components/ui/button";
import ThemeDropdown from "../../components/ThemeDropdown";
import SearchBar from "../../components/searchBar";
import UserTable from "../../components/userTable";
import CreateUserModal from "../../components/CreateUserModal";
import ConfirmDialog from "../../components/ConfirmDialog";

function UsersListPage() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const fetchUsers = async (searchTerm = "") => {
    try {
      setLoading(true);
      const data = await getAllUsers(searchTerm);
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    fetchUsers();
  }, [user, navigate]);

  const handleSearchChange = (value) => {
    setSearch(value);
    fetchUsers(value);
  };

  const handleDelete = async (id) => {
    await deleteUser(id);
    fetchUsers(search);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button variant="link" asChild className="px-0">
            <Link to="/admin">&larr; Admin</Link>
          </Button>
          <h1 className="text-xl font-bold text-foreground">All Users</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeDropdown />
          <Button variant="ghost" size="sm" onClick={() => setLogoutConfirm(true)} className="text-destructive hover:text-destructive">
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <SearchBar
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by name, email, or username..."
          />
          <Button onClick={() => setCreateOpen(true)}>+ Add User</Button>
        </div>

        {loading ? (
          <p className="text-muted-foreground text-sm mt-4">Loading users...</p>
        ) : (
          <UserTable
            users={users}
            onDelete={handleDelete}
          />
        )}
      </div>

      <CreateUserModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onUserCreated={() => fetchUsers(search)}
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

export default UsersListPage;
