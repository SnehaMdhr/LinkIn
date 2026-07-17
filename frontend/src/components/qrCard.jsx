import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useToast } from "../context/toastContext";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

function QrCard({ username }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const profileUrl = `${window.location.origin}/${username}`;
  const qrUrl = `${profileUrl}?qr=1`;

  const handleDownload = () => {
    const canvas = document.getElementById("qr-canvas");
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `linkin-${username}-qr.png`;
    link.click();
    toast.success("QR code downloaded!");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success("Profile link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = profileUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      toast.success("Profile link copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "My LinkIn Profile", url: profileUrl });
        toast.success("Shared successfully!");
      } catch { /* user cancelled */ }
    }
  };

  return (
    <Card>
      <CardContent className="p-6 flex flex-col items-center">
        <h3 className="text-sm font-bold text-foreground mb-3">Your QR Code</h3>
        <QRCodeCanvas id="qr-canvas" value={qrUrl} size={140} />
        <p className="text-xs text-muted-foreground mt-3 break-all text-center">{profileUrl}</p>
        <div className="flex gap-2 mt-3 w-full">
          <Button onClick={handleCopyLink} className="flex-1" size="sm" variant={copied ? "default" : "outline"}>
            {copied ? "Copied!" : "Copy Link"}
          </Button>
          <Button onClick={handleDownload} className="flex-1" size="sm">
            Download QR
          </Button>
        </div>
        {navigator.share && (
          <Button onClick={handleShare} variant="ghost" size="sm" className="mt-2 w-full">
            Share Profile
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default QrCard;