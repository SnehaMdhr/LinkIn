import { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { getAllUsers, updateUserStatus, deleteUser } from "../../services/adminServices";
import { Button } from "../../components/ui/button";
import ThemeDropdown from "../../components/ThemeDropdown";
import SearchBar from "../../components/searchBar";
import UserTable from "../../components/userTable";

function UsersListPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    fetchUsers();
  }, [user]);

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

  const handleSearchChange = (value) => {
    setSearch(value);
    fetchUsers(value);
  };

  const handleSuspend = async (id) => {
    await updateUserStatus(id, "suspended");
    fetchUsers(search);
  };

  const handleActivate = async (id) => {
    await updateUserStatus(id, "active");
    fetchUsers(search);
  };

  const handleDelete = async (id) => {
    await deleteUser(id);
    fetchUsers(search);
  };

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">All Users</h1>
        <div className="flex items-center gap-3">
          <ThemeDropdown />
          <Button variant="link" asChild>
            <Link to="/admin">← Back to Admin Dashboard</Link>
          </Button>
        </div>
      </div>

      <SearchBar value={search} onChange={handleSearchChange}
        placeholder="Search by name, email, or username..." />

      {loading ? (
        <p className="text-muted-foreground text-sm mt-4">Loading users...</p>
      ) : (
        <UserTable users={users} onSuspend={handleSuspend} onActivate={handleActivate} onDelete={handleDelete} />
      )}
    </div>
  );
}

export default UsersListPage;