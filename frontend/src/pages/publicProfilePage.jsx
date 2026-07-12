import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import api from "../services/api";
import PlatformIcon from "../components/PlatformIcon";
import { trackProfileView } from "../services/analyticsServices";

function PublicProfilePage() {
  const { username } = useParams();

  const [profile, setProfile] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        const response = await api.get(`/user/${username}`);
        setProfile(response.data);
        // Track profile view
        if (response.data?.user?._id) {
          trackProfileView(response.data.user._id).catch(() => {});
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  // --- Loading state ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  // --- Not found state ---
  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950 px-4">
        <div className="text-center animate-md-fade-in">
          <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.712 4.33a9.027 9.027 0 011.652 1.306c.51.51.944 1.064 1.306 1.652M16.712 4.33l-3.448 4.138m3.448-4.138a9.014 9.014 0 00-9.424 0M19.67 7.288l-4.138 3.448m4.138-3.448a9.014 9.014 0 010 9.424m-4.138-5.976a3.736 3.736 0 00-.88-1.388 3.737 3.737 0 00-1.388-.88m2.268 2.268a3.765 3.765 0 010 2.528m-2.268-4.796l-3.448 4.138m0 0a3.736 3.736 0 00-.88 1.388 3.765 3.765 0 000 2.528m.88-3.916l-4.138 3.448m0 0a9.027 9.027 0 01-1.306 1.652 9.027 9.027 0 01-1.652 1.306m2.958-2.958l-3.448 4.138m3.448-4.138a9.014 9.014 0 019.424 0" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Profile not found</h1>
          <p className="text-muted-foreground mt-2">
            No user exists with the username "{username}".
          </p>
        </div>
      </div>
    );
  }

  const { user, links } = profile;

  return (
    <div className="relative min-h-screen flex flex-col items-center px-4 py-12 overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950">

      {/* ANIMATED BACKGROUND DECORATIVE BLOBS */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
        {/* Top-left large blob */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl animate-md-drift"
          style={{ background: "radial-gradient(circle, rgba(175,243,62,0.5) 0%, rgba(16,185,129,0.3) 50%, transparent 70%)" }}
        />
        {/* Top-right medium blob */}
        <div
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-15 blur-3xl animate-md-drift-slow"
          style={{ background: "radial-gradient(circle, rgba(52,211,153,0.5) 0%, rgba(5,150,105,0.2) 50%, transparent 70%)" }}
        />
        {/* Bottom-left small blob */}
        <div
          className="absolute -bottom-16 left-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl animate-md-drift"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 70%)", animationDelay: "-3s" }}
        />
        {/* Bottom-right accent blob */}
        <div
          className="absolute -bottom-24 -right-16 w-72 h-72 rounded-full opacity-15 blur-3xl animate-md-drift-slow"
          style={{ background: "radial-gradient(circle, rgba(175,243,62,0.3) 0%, transparent 70%)", animationDelay: "-7s" }}
        />
        {/* Center subtle glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.04] blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(175,243,62,1) 0%, transparent 70%)" }}
        />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 w-full max-w-sm text-center animate-md-fade-in">

        {/* ---- PROFILE CARD ---- */}
        <div className="bg-card/70 backdrop-blur-xl border border-border/50 rounded-2xl shadow-lg shadow-black/5 p-8 mb-6 transition-shadow duration-300 hover:shadow-xl hover:shadow-black/5">

          {/* Avatar */}
          <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary overflow-hidden ring-4 ring-primary/20 transition-transform duration-300 hover:scale-105">
            {user.profileImage ? (
              <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user.name?.charAt(0).toUpperCase() || "U"
            )}
          </div>

          {/* Name & username */}
          <h1 className="text-2xl font-bold text-foreground mt-5">{user.name}</h1>
          <p className="text-muted-foreground text-sm">@{user.username}</p>

          {/* Bio */}
          {user.bio && (
            <p className="mt-3 text-sm text-muted-foreground/80 leading-relaxed max-w-xs mx-auto">
              {user.bio}
            </p>
          )}

          {/* Badge row */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-primary/10 text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              Available
            </span>
          </div>
        </div>

        {/* ---- LINKS SECTION ---- */}
        <div className="space-y-3">
          {links.length === 0 ? (
            <div className="bg-card/40 backdrop-blur-sm border border-border/30 rounded-xl py-8 px-4">
              <p className="text-sm text-muted-foreground/50">No links added yet.</p>
            </div>
          ) : (
            links.map((link, index) => (
              <a
                key={link._id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="group block w-full bg-card/70 backdrop-blur-xl border border-border/50 rounded-xl py-4 px-5 font-medium transition-all duration-200 text-foreground hover:bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 active:translate-y-0"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:bg-primary/20">
                    <PlatformIcon platform={link.platform} className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <p className="truncate font-semibold">{link.title}</p>
                    <span className="block text-xs text-muted-foreground/60 mt-0.5 capitalize">
                      {link.platform || "link"}
                    </span>
                  </div>
                  <svg
                    className="w-4 h-4 text-muted-foreground/40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </a>
            ))
          )}
        </div>

        {/* ---- QR CODE ---- */}
        <div className="mt-8">
          <div className="bg-card/40 backdrop-blur-sm border border-border/30 rounded-xl p-4 inline-flex flex-col items-center">
            <p className="text-[10px] text-muted-foreground/50 mb-2 uppercase tracking-wider">Scan to share</p>
            <QRCodeCanvas value={`${window.location.origin}/${username}`} size={80} />
          </div>
        </div>

        {/* ---- FOOTER ---- */}
        <p className="mt-8 text-xs text-muted-foreground/30 transition-colors duration-200 hover:text-muted-foreground/60">
          Powered by LinkIn
        </p>
      </div>
    </div>
  );
}

export default PublicProfilePage;