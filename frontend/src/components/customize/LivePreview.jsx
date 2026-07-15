import { QRCodeCanvas } from "qrcode.react";
import { getGradientCSS, getBlurValue } from "../../config/customization";
import { loadFont, getFontFamily } from "../../utils/fonts";
import PlatformIcon from "../PlatformIcon";

function getAvatarClasses(shape) {
  if (shape === "rounded") return "rounded-2xl";
  if (shape === "square") return "rounded-none";
  return "rounded-full";
}

function getButtonClasses(style, width, animation, accentColor, btnTextColor) {
  const widthMap = {
    auto: "w-auto px-6",
    medium: "w-3/4",
    large: "w-5/6",
    full: "w-full",
  };

  const tc = btnTextColor || "#000000";

  const base = `block py-3 px-5 text-sm font-semibold transition-all duration-200 ${
    widthMap[width] || "w-full"
  }`;

  const animClass =
    animation === "lift"
      ? "hover:-translate-y-1 hover:shadow-lg"
      : animation === "scale"
      ? "hover:scale-105"
      : animation === "glow"
      ? "hover:shadow-lg"
      : "";

  const styleMap = {
    pill: `${base} rounded-full ${animClass}`,
    rounded: `${base} rounded-xl ${animClass}`,
    square: `${base} rounded-md ${animClass}`,
    outline: `${base} rounded-full border-2 bg-transparent ${animClass}`,
    soft: `${base} rounded-xl shadow-md ${animClass}`,
    glass: `${base} rounded-xl backdrop-blur-sm bg-white/10 border border-white/20 ${animClass}`,
  };

  const outlineStyle =
    style === "outline"
      ? { borderColor: accentColor, color: tc }
      : style === "glass"
      ? { color: tc }
      : { backgroundColor: accentColor, color: tc };

  return { className: styleMap[style] || styleMap.pill, style: outlineStyle };
}

export default function LivePreview({ customization, user, links }) {
  const c = customization;
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
      className="w-full min-h-[500px] rounded-2xl overflow-hidden relative"
      style={{ ...backgroundStyle, fontFamily: getFontFamily(c.font) }}
    >
      <div className="min-h-[500px] flex flex-col items-center px-4 py-10 relative z-10">
        <div
          className={`w-full max-w-sm text-center ${animClass}`}
          style={cardStyle}
        >
          <div className="p-6">
            {/* Layout: side-by-side */}
            {c.layout === "side-by-side" ? (
              <div className="flex items-center gap-4 mb-3">
                {c.showProfilePicture && (
                  <div
                    className={`w-16 h-16 shrink-0 flex items-center justify-center text-xl font-bold overflow-hidden ${getAvatarClasses(
                      c.avatarShape
                    )}`}
                    style={{ backgroundColor: `${c.accentColor}33`, color: c.accentColor }}
                  >
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt={user?.name} className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.charAt(0).toUpperCase() || "U"
                    )}
                  </div>
                )}
                <div className="text-left">
                  <h1 className="text-lg font-bold" style={{ color: tc }}>{user?.name || "Your Name"}</h1>
                  <p className="text-xs" style={{ color: tcs }}>@{user?.username || "username"}</p>
                </div>
              </div>
            ) : c.layout === "banner" ? (
              <div className="mb-4">
                <div
                  className="w-full h-20 rounded-t-lg -mx-6 -mt-6 mb-3"
                  style={{ background: `linear-gradient(135deg, ${c.accentColor}44, ${c.accentColor}11)` }}
                />
                {c.showProfilePicture && (
                  <div
                    className={`w-16 h-16 mx-auto -mt-10 relative flex items-center justify-center text-xl font-bold overflow-hidden ring-4 ring-white/30 ${getAvatarClasses(
                      c.avatarShape
                    )}`}
                    style={{ backgroundColor: `${c.accentColor}33`, color: c.accentColor }}
                  >
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt={user?.name} className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.charAt(0).toUpperCase() || "U"
                    )}
                  </div>
                )}
                <h1 className="text-lg font-bold mt-2" style={{ color: tc }}>{user?.name || "Your Name"}</h1>
                <p className="text-xs" style={{ color: tcs }}>@{user?.username || "username"}</p>
              </div>
            ) : (
              /* Classic */
              <>
                {c.showProfilePicture && (
                  <div
                    className={`w-20 h-20 mx-auto flex items-center justify-center text-2xl font-bold overflow-hidden ring-4 mb-3 ${getAvatarClasses(
                      c.avatarShape
                    )}`}
                    style={{ backgroundColor: `${c.accentColor}33`, color: c.accentColor }}
                  >
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt={user?.name} className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.charAt(0).toUpperCase() || "U"
                    )}
                  </div>
                )}
                <h1 className="text-lg font-bold" style={{ color: tc }}>{user?.name || "Your Name"}</h1>
                <p className="text-xs" style={{ color: tcs }}>@{user?.username || "username"}</p>
              </>
            )}

            {/* Bio */}
            {c.showBio && user?.bio && (
              <p className="mt-2 text-xs leading-relaxed max-w-[240px] mx-auto" style={{ color: tcs }}>
                {user.bio}
              </p>
            )}

            {/* Links */}
            <div
              className={`mt-4 space-y-2 ${
                c.linkAlignment === "left" ? "text-left" : "text-center"
              }`}
            >
              {(links || []).slice(0, 5).map((link) => {
                const { className, style } = getButtonClasses(
                  c.buttonStyle,
                  c.buttonWidth,
                  c.buttonAnimation,
                  c.accentColor,
                  c.buttonTextColor
                );
                return (
                  <a
                    key={link._id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className={className}
                    style={style}
                  >
                    <div className={`flex items-center gap-3 ${c.linkAlignment === "left" ? "" : "justify-center"}`}>
                      {c.showIcons && (
                        <PlatformIcon platform={link.platform} className="w-4 h-4" style={{ color: c.buttonTextColor || "#000000" }} />
                      )}
                      <span>{link.title}</span>
                    </div>
                  </a>
                );
              })}
              {(!links || links.length === 0) && (
                <div className="py-4 text-xs" style={{ color: `${tcs}88` }}>No links yet</div>
              )}
            </div>

            {/* QR Code */}
            {c.showQr && (
              <div
                className={`mt-4 ${
                  c.qrPosition === "floating"
                    ? "absolute bottom-3 right-3"
                    : ""
                }`}
              >
                <div className="inline-flex flex-col items-center bg-white/80 rounded-lg p-2">
                  <p className="text-[10px] mb-2 uppercase tracking-wider" style={{ color: tcs }}>Scan to share</p>
                  <QRCodeCanvas
                    value={`${window.location.origin}/${user?.username || "username"}`}
                    size={48}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="mt-4 text-[10px] text-white/40">Powered by LinkIn</p>
      </div>
    </div>
  );
}
