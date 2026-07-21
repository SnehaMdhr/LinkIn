import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import api from "../services/api";
import PlatformIcon from "../components/PlatformIcon";
import { trackProfileView, trackLinkClick, trackQrScan } from "../services/analyticsServices";
import { DEFAULT_CUSTOMIZATION, getGradientCSS, getBlurValue } from "../config/customization";
import { loadFont, getFontFamily } from "../utils/fonts";

function getAvatarClasses(shape) {
  if (shape === "rounded") return "rounded-2xl";
  if (shape === "square") return "rounded-none";
  return "rounded-full";
}

function getButtonClasses(style, width, animation, btnTextColor) {
  const widthMap = {
    auto: "w-auto px-8",
    medium: "w-3/4",
    large: "w-5/6",
    full: "w-full",
  };

  const tc = btnTextColor || "#000000";

  const base = `py-3.5 px-6 text-sm font-semibold transition-all duration-200 ${
    widthMap[width] || "w-full"
  }`;

  const animClass =
    animation === "lift"
      ? "hover:-translate-y-1 hover:shadow-lg"
      : animation === "scale"
      ? "hover:scale-105"
      : animation === "glow"
      ? "hover:shadow-lg hover:shadow-primary/20"
      : "";

  const styleMap = {
    pill: `${base} rounded-full ${animClass}`,
    rounded: `${base} rounded-xl ${animClass}`,
    square: `${base} rounded-md ${animClass}`,
    outline: `${base} rounded-full border-2 bg-transparent ${animClass}`,
    soft: `${base} rounded-xl shadow-md ${animClass}`,
    glass: `${base} rounded-xl backdrop-blur-sm bg-white/10 border border-white/20 ${animClass}`,
  };

  return styleMap[style] || styleMap.pill;
}

function PublicProfilePage() {
  const { username } = useParams();
  const [searchParams] = useSearchParams();
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
        if (response.data?.user?._id) {
          trackProfileView(response.data.user._id).catch(() => {});
          if (searchParams.get("qr") === "1") {
            trackQrScan(response.data.user._id).catch(() => {});
          }
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
  }, [username, searchParams]);

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
  const c = { ...DEFAULT_CUSTOMIZATION, ...(user.profileCustomization || {}) };

  loadFont(c.font);

  const tc = c.textColor || "#000000";
  const tcs = c.textColorSecondary || "#6b7280";

  const backgroundStyle = (() => {
    if (c.backgroundType === "solid") return { backgroundColor: c.backgroundColor };
    if (c.backgroundType === "gradient") return { background: getGradientCSS(c.backgroundGradient, c.customGradientFrom, c.customGradientTo) };
    if (c.backgroundType === "image" && c.backgroundImage)
      return {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${c.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      };
    return { background: getGradientCSS("lime-emerald") };
  })();

  const cardStyle = {
    background: `rgba(255,255,255,${c.cardOpacity / 100})`,
    backdropFilter: `blur(${getBlurValue(c.cardBlur)})`,
    WebkitBackdropFilter: `blur(${getBlurValue(c.cardBlur)})`,
    border: `${c.cardBorderWidth || "1px"} solid ${c.cardBorderColor || "#ffffff"}`,
  };

  const animClass =
    c.animation === "fade"
      ? "animate-md-fade-in"
      : c.animation === "slide"
      ? "animate-[slide-up_500ms_ease-out]"
      : "";

  return (
    <div
      className="relative min-h-screen flex flex-col items-center px-4 py-12 overflow-hidden"
      style={{ ...backgroundStyle, fontFamily: getFontFamily(c.font) }}
    >
      <div className="relative z-10 w-full max-w-sm text-center">

        {/* ---- PROFILE CARD ---- */}
        <div className={`rounded-2xl shadow-lg shadow-black/5 p-8 mb-6 transition-shadow duration-300 hover:shadow-xl hover:shadow-black/5 ${animClass}`} style={cardStyle}>

          {/* Banner layout extra header */}
          {c.layout === "banner" && (
            <div
              className="w-full h-24 -mx-8 -mt-8 mb-4 rounded-t-2xl"
              style={{ background: `linear-gradient(135deg, ${c.accentColor}44, ${c.accentColor}11)` }}
            />
          )}

          {/* Classic & Banner: centered avatar */}
          {(c.layout === "classic" || c.layout === "banner") && c.showProfilePicture && (
            <div
              className={`w-24 h-24 mx-auto flex items-center justify-center text-3xl font-bold overflow-hidden ring-4 transition-transform duration-300 hover:scale-105 ${getAvatarClasses(
                c.avatarShape
              )}`}
              style={{ backgroundColor: `${c.accentColor}33`, color: c.accentColor }}
            >
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name?.charAt(0).toUpperCase() || "U"
              )}
            </div>
          )}

          {/* Side-by-side layout */}
          {c.layout === "side-by-side" && (
            <div className="flex items-center gap-4 mb-2">
              {c.showProfilePicture && (
                <div
                  className={`w-16 h-16 shrink-0 flex items-center justify-center text-2xl font-bold overflow-hidden ${getAvatarClasses(
                    c.avatarShape
                  )}`}
                  style={{ backgroundColor: `${c.accentColor}33`, color: c.accentColor }}
                >
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name?.charAt(0).toUpperCase() || "U"
                  )}
                </div>
              )}
              <div className="text-left">
                <h1 className="text-2xl font-bold" style={{ color: tc }}>{user.name}</h1>
                <p className="text-sm" style={{ color: tcs }}>@{user.username}</p>
              </div>
            </div>
          )}

          {/* Classic & Banner: name below avatar */}
          {(c.layout === "classic" || c.layout === "banner") && (
            <>
              <h1 className="text-2xl font-bold mt-5" style={{ color: tc }}>{user.name}</h1>
              <p className="text-sm" style={{ color: tcs }}>@{user.username}</p>
            </>
          )}

          {/* Bio */}
          {c.showBio && user.bio && (
            <p className="mt-3 text-sm leading-relaxed max-w-xs mx-auto" style={{ color: tcs }}>
              {user.bio}
            </p>
          )}

        </div>

        {/* ---- LINKS SECTION ---- */}
        <div className={`space-y-3 ${c.linkAlignment === "left" ? "text-left" : ""}`}>
          {links.length === 0 ? (
            <div className="backdrop-blur-sm border border-white/20 rounded-xl py-8 px-4" style={{ background: `rgba(255,255,255,${c.cardOpacity / 100})` }}>
              <p className="text-sm" style={{ color: `${tcs}88` }}>No links added yet.</p>
            </div>
          ) : (
            links.map((link, index) => (
              <a
                key={link._id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  if (user?._id) {
                    trackLinkClick(user._id, link._id).catch(() => {});
                  }
                }}
                className={`block font-medium transition-all duration-200 py-4 px-5 ${getButtonClasses(
                  c.buttonStyle,
                  c.buttonWidth,
                  c.buttonAnimation,
                  c.buttonTextColor
                )}`}
                style={{
                  backgroundColor: c.buttonStyle === "outline" ? "transparent" : c.buttonStyle === "glass" ? "rgba(255,255,255,0.1)" : c.accentColor,
                  borderColor: c.buttonStyle === "outline" ? c.accentColor : undefined,
                  color: c.buttonTextColor || "#000000",
                  animationDelay: `${index * 60}ms`,
                  ...(c.buttonStyle === "glass" ? { backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" } : {}),
                }}
              >
                <div className={`flex items-center gap-4 ${c.linkAlignment === "left" ? "" : "justify-center"}`}>
                  {c.showIcons && (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                      style={{ backgroundColor: `${c.accentColor}22` }}
                    >
                      <PlatformIcon platform={link.platform} className="w-5 h-5" style={{ color: c.buttonTextColor || "#000000" }} />
                    </div>
                  )}
                  <div className={`text-left min-w-0 flex-1 ${c.linkAlignment === "center" ? "text-center" : ""}`}>
                    <p className="truncate font-semibold">{link.title}</p>
                    <span className="block text-xs mt-0.5 capitalize" style={{ color: `${tcs}99` }}>
                      {link.platform || "link"}
                    </span>
                  </div>
                  <svg
                    className="w-4 h-4 transition-all duration-200 group-hover:translate-x-0.5"
                    style={{ color: `${tcs}66` }}
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
        {c.showQr && (
          <div
            className={`mt-8 ${
              c.qrPosition === "floating"
                ? "fixed bottom-6 right-6"
                : ""
            }`}
          >
            <div className="backdrop-blur-sm border border-white/20 rounded-xl p-4 inline-flex flex-col items-center" style={{ background: `rgba(255,255,255,${c.cardOpacity / 100})` }}>
              <p className="text-[10px] mb-2 uppercase tracking-wider" style={{ color: tcs }}>Scan to share</p>
              <QRCodeCanvas value={`${window.location.origin}/${username}?qr=1`} size={80} />
            </div>
          </div>
        )}

        {/* ---- FOOTER ---- */}
        <p className="mt-8 text-xs text-muted-foreground/30 transition-colors duration-200 hover:text-muted-foreground/60">
          Powered by LinkIn
        </p>
      </div>
    </div>
  );
}

export default PublicProfilePage;
