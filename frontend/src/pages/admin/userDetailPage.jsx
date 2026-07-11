import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { getUserDetails, updateUserStatus, deleteUser } from "../../services/adminServices";
import { Button } from "../../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import ThemeDropdown from "../../components/ThemeDropdown";

function UserDetailsPage() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    fetchDetails();
  }, [user, id]);

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
    navigate("/admin/users");
  };

  if (!user || user.role !== "admin") return null;
  if (loading) return <p className="p-10 text-muted-foreground">Loading...</p>;
  if (!details) return <p className="p-10 text-destructive">User not found.</p>;

  const { user: targetUser, links } = details;

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="flex justify-between items-center mb-4">
        <Button variant="link" asChild>
          <Link to="/admin/users">← Back to Users</Link>
        </Button>
        <ThemeDropdown />
      </div>

      <Card className="mt-4 max-w-xl">
        <CardHeader>
          <CardTitle>{targetUser.name}</CardTitle>
          <p className="text-sm text-muted-foreground">@{targetUser.username} — {targetUser.email}</p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 text-xs text-muted-foreground mb-6">
            <span>Role: {targetUser.role}</span>
            <span>Status: {targetUser.status}</span>
            <span>Joined: {new Date(targetUser.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="flex gap-3">
            {targetUser.status === "active" ? (
              <Button variant="secondary" onClick={handleSuspend}>
                Suspend User
              </Button>
            ) : (
              <Button variant="outline" onClick={handleActivate}>
                Activate User
              </Button>
            )}
            <Button variant="destructive" onClick={handleDelete}>
              Delete User
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 max-w-xl">
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
    </div>
  );
}

export default UserDetailsPage;