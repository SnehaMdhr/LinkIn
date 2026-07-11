import { Link } from "react-router-dom";

function UserTable({ users, onSuspend, onActivate, onDelete }) {
  if (users.length === 0) {
    return <p className="text-muted-foreground text-sm mt-4">No users found.</p>;
  }

  return (
    <div className="overflow-x-auto mt-4">
      <table className="min-w-full bg-card rounded-lg shadow-sm border border-border">
        <thead>
          <tr className="text-left text-xs text-muted-foreground border-b border-border">
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Username</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id} className="border-b border-border/50 text-sm">
              <td className="px-4 py-3 text-foreground">{u.name}</td>
              <td className="px-4 py-3 text-muted-foreground">@{u.username}</td>
              <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
              <td className="px-4 py-3 text-foreground">{u.role}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  u.status === "active"
                    ? "bg-primary/10 text-primary"
                    : "bg-accent/10 text-accent-foreground"
                }`}>
                  {u.status}
                </span>
              </td>
              <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                <Link to={`/admin/users/${u._id}`} className="text-primary hover:underline text-xs">View</Link>
                {u.status === "active" ? (
                  <button onClick={() => onSuspend(u._id)} className="text-accent-foreground hover:underline text-xs">Suspend</button>
                ) : (
                  <button onClick={() => onActivate(u._id)} className="text-primary hover:underline text-xs">Activate</button>
                )}
                <button onClick={() => onDelete(u._id)} className="text-destructive hover:underline text-xs">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserTable;