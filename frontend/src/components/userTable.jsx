import { useState } from "react";
import { Button } from "./ui/button";
import ConfirmDialog from "./ConfirmDialog";

function UserTable({ users, onView, onDelete }) {
  const [deleteTarget, setDeleteTarget] = useState(null);

  if (users.length === 0) {
    return <p className="text-muted-foreground text-sm mt-4">No users found.</p>;
  }

  return (
    <>
      <div className="space-y-3 mt-4">
        {users.map((u) => (
          <div
            key={u._id}
            className="bg-card rounded-lg shadow-sm border border-border p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                {u.profileImage ? (
                  <img src={u.profileImage} alt={u.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-primary">
                    {u.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-foreground truncate">{u.name}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.role === "admin"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {u.role}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.status === "active"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}>
                    {u.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  @{u.username} &middot; {u.email}
                </p>
              </div>
            </div>

            <div className="flex gap-1 shrink-0">
              <Button variant="ghost" size="sm" onClick={() => onView(u._id)}>
                View
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteTarget(u)}
                className="text-destructive hover:text-destructive"
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete user"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This will also remove all their links. This action cannot be undone.`}
        onConfirm={() => { if (deleteTarget) { onDelete(deleteTarget._id); setDeleteTarget(null); } }}
        confirmLabel="Delete"
      />
    </>
  );
}

export default UserTable;
