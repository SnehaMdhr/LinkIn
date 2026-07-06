import { QRCodeCanvas } from "qrcode.react";

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
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
      <h3 className="text-sm font-bold text-gray-700 mb-3">Your QR Code</h3>
      <QRCodeCanvas id="qr-canvas" value={profileUrl} size={140} />
      <p className="text-xs text-gray-400 mt-3 break-all text-center">{profileUrl}</p>
      <button
        onClick={handleDownload}
        className="mt-3 text-xs bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
      >
        Download QR
      </button>
    </div>
  );
}

export default QrCard;