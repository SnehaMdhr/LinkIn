import { useState } from "react";
import { Button } from "./ui/button";
import PlatformIcon from "./PlatformIcon";
import ConfirmDialog from "./ConfirmDialog";
import { useToast } from "../context/toastContext";
import { toggleLinkVisibility, toggleLinkPin } from "../services/linkServices";

function LinkCard({ link, onDelete, onEdit, onRefresh }) {
  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hidden, setHidden] = useState(link.isHidden || false);
  const [pinned, setPinned] = useState(link.isPinned || false);

  const handleToggleHidden = async () => {
    try {
      await toggleLinkVisibility(link._id, !hidden);
      setHidden(!hidden);
      toast.success(hidden ? "Link is now visible" : "Link hidden from profile");
      if (onRefresh) onRefresh();
    } catch { /* silent */ }
  };

  const handleTogglePin = async () => {
    try {
      await toggleLinkPin(link._id, !pinned);
      setPinned(!pinned);
      toast.success(pinned ? "Link unpinned" : "Link pinned to top");
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
        <button
          onClick={handleToggleHidden}
          className={`relative w-9 h-5 rounded-full transition-colors ${hidden ? "bg-muted" : "bg-primary"}`}
          title={hidden ? "Show" : "Hide"}
        >
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${hidden ? "translate-x-0" : "translate-x-4"}`} />
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