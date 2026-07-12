import { useState } from "react";
import { Button } from "./ui/button";
import PlatformIcon from "./PlatformIcon";
import ConfirmDialog from "./ConfirmDialog";

function LinkCard({ link, onDelete, onEdit }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-4 flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <PlatformIcon platform={link.platform} className="w-4 h-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate">{link.title}</p>
          <p className="text-xs text-muted-foreground">{link.platform}</p>
          <a href={link.url} target="_blank" rel="noreferrer" className="text-xs text-primary break-all truncate block">{link.url}</a>
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <Button variant="ghost" size="sm" onClick={() => onEdit(link._id)}>
          Edit
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setConfirmOpen(true)} className="text-destructive hover:text-destructive">
          Delete
        </Button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete link"
        description={`Are you sure you want to delete "${link.title}"? This action cannot be undone.`}
        onConfirm={() => onDelete(link._id)}
        confirmLabel="Delete"
      />
    </div>
  );
}

export default LinkCard;