import { useState } from "react";
import { Button } from "./ui/button";
import PlatformIcon from "./PlatformIcon";
import ConfirmDialog from "./ConfirmDialog";
import { toggleLinkVisibility, toggleLinkPin } from "../services/linkServices";

function LinkCard({ link, onDelete, onEdit, onRefresh }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hidden, setHidden] = useState(link.isHidden || false);
  const [pinned, setPinned] = useState(link.isPinned || false);

  const handleToggleHidden = async () => {
    try {
      await toggleLinkVisibility(link._id, !hidden);
      setHidden(!hidden);
      if (onRefresh) onRefresh();
    } catch { /* silent */ }
  };

  const handleTogglePin = async () => {
    try {
      await toggleLinkPin(link._id, !pinned);
      setPinned(!pinned);
      if (onRefresh) onRefresh();
    } catch { /* silent */ }
  };

  return (
    <div className={`bg-card rounded-lg shadow-sm border p-4 flex items-center justify-between transition-all duration-200 ${hidden ? "opacity-40 border-dashed" : "border-border"} ${pinned ? "ring-1 ring-primary/30" : ""}`}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <PlatformIcon platform={link.platform} className="w-4 h-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-foreground truncate">{link.title}</p>
            {pinned && <span className="text-xs">📌</span>}
            {hidden && <span className="text-xs text-muted-foreground">(hidden)</span>}
            {link.category && link.category !== "Others" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{link.category}</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{link.platform}</p>
          <a href={link.url} target="_blank" rel="noreferrer" className="text-xs text-primary break-all truncate block">{link.url}</a>
        </div>
      </div>
      <div className="flex gap-1 shrink-0 items-center">
        <button onClick={handleTogglePin} className="p-1.5 rounded-md hover:bg-muted transition-colors text-sm" title={pinned ? "Unpin" : "Pin"}>
          {pinned ? "📌" : "📍"}
        </button>
        <button onClick={handleToggleHidden} className="p-1.5 rounded-md hover:bg-muted transition-colors text-sm" title={hidden ? "Show" : "Hide"}>
          {hidden ? "👁️" : "🙈"}
        </button>
        <Button variant="ghost" size="sm" onClick={() => onEdit(link._id)}>Edit</Button>
        <Button variant="ghost" size="sm" onClick={() => setConfirmOpen(true)} className="text-destructive hover:text-destructive">Delete</Button>
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