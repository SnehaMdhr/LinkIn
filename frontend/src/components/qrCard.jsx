import { QRCodeCanvas } from "qrcode.react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

function QrCard({ username }) {
  const profileUrl = `${window.location.origin}/${username}`;

  const handleDownload = () => {
    const canvas = document.getElementById("qr-canvas");
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `linkin-${username}-qr.png`;
    link.click();
  };

  return (
    <Card>
      <CardContent className="p-6 flex flex-col items-center">
        <h3 className="text-sm font-bold text-foreground mb-3">Your QR Code</h3>
        <QRCodeCanvas id="qr-canvas" value={profileUrl} size={140} />
        <p className="text-xs text-muted-foreground mt-3 break-all text-center">{profileUrl}</p>
        <Button onClick={handleDownload} className="mt-3" size="sm">
          Download QR
        </Button>
      </CardContent>
    </Card>
  );
}

export default QrCard;