import { useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import ThemeDropdown from "../../components/ThemeDropdown";

function AdminDashboardPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  if (!user || user.role !== "admin") {
    navigate("/dashboard");
    return null;
  }
  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <ThemeDropdown />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        <Link to="/admin/users" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle>Manage Users</CardTitle>
              <CardDescription>
                View, search, suspend, activate, or delete users.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}

export default AdminDashboardPage;