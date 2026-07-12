import { useState, useEffect } from "react";
import { useToast } from "../context/toastContext";
import { getUserDetails, updateUserStatus, deleteUser } from "../services/adminServices";
import { Button } from "./ui/button";
import EditUserModal from "./EditUserModal";
import ConfirmDialog from "./ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export default function UserDetailModal({ open, onOpenChange, userId, onRefresh }) {
  const toast = useToast();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [suspendConfirm, setSuspendConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await getUserDetails(userId);
      setDetails(data);
    } catch (err) {
      console.error("Failed to fetch user details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && userId) {
      fetchDetails();
    }
  }, [open, userId]);

  const handleSuspend = async () => {
    await updateUserStatus(userId, "suspended");
    toast.success("User suspended");
    fetchDetails();
    if (onRefresh) onRefresh();
  };

  const handleActivate = async () => {
    await updateUserStatus(userId, "active");
    toast.success("User activated");
    fetchDetails();
    if (onRefresh) onRefresh();
  };

  const handleDelete = async () => {
    await deleteUser(userId);
    toast.success("User deleted");
    onOpenChange(false);
    if (onRefresh) onRefresh();
  };

  const targetUser = details?.user;
  const links = details?.links || [];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Detail</DialogTitle>
          </DialogHeader>

          {loading ? (
            <p className="text-muted-foreground text-sm py-4">Loading...</p>
          ) : !targetUser ? (
            <p className="text-destructive text-sm py-4">User not found.</p>
          ) : (
            <div className="space-y-5">
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

              <div className="flex gap-3">
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

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Links ({links.length})</h3>
                {links.length === 0 ? (
                  <p className="text-muted-foreground text-xs">No links added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {links.map((link) => (
                      <div key={link._id} className="bg-muted/50 rounded-md border border-border p-2 text-sm">
                        <p className="font-medium text-foreground">{link.title}</p>
                        <p className="text-muted-foreground text-xs truncate">{link.url}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <EditUserModal
        open={editOpen}
        onOpenChange={(val) => {
          setEditOpen(val);
          if (!val) fetchDetails();
          if (!val && onRefresh) onRefresh();
        }}
        userId={userId}
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
    </>
  );
}
