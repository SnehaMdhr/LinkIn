import { motion } from "framer-motion";
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
      ? "hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20"
      : animation === "scale"
      ? "hover:scale-105"
      : animation === "glow"
      ? "hover:shadow-lg hover:shadow-black/20"
      : "";

  const styleMap = {
    pill: `${base} rounded-full ${animClass}`,
    rounded: `${base} rounded-xl ${animClass}`,
    square: `${base} rounded-md ${animClass}`,
    outline: `${base} rounded-full border-2 bg-transparent ${animClass}`,
    soft: `${base} rounded-xl shadow-lg shadow-black/10 ${animClass}`,
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

export default function LivePreview({ customization, user, links, isMobile }) {
  const c = customization;
  loadFont(c.font);

  const tc = c.textColor || "#000000";
  const tcs = c.textColorSecondary || "#6b7280";

  const backgroundStyle = (() => {
    if (c.backgroundType === "solid") return { backgroundColor: c.backgroundColor };
    if (c.backgroundType === "gradient")
      return {
        background: getGradientCSS(c.backgroundGradient, c.customGradientFrom, c.customGradientTo),
      };
    if (c.backgroundType === "image" && c.backgroundImage)
      return {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url(${c.backgroundImage})`,
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

  const containerClass = isMobile
    ? "w-full h-full"
    : "w-full h-full rounded-2xl";

  return (
    <motion.div
      className={`${containerClass} overflow-hidden relative`}
      style={{ ...backgroundStyle, fontFamily: getFontFamily(c.font) }}
      layout
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Subtle pattern overlay for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:20px_20px] pointer-events-none" />

      {/* Centered container — fills the preview area while card auto-heights */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 py-10">
        {/* Profile card — height is auto, determined by content */}
        {/* `overflow-hidden` clips the banner layout's negative margins to the
            card's rounded corners WITHOUT hiding the border (border is on the
            border-box, while overflow clips the padding-box). */}
        <motion.div
          className="w-full max-w-[420px] rounded-2xl shadow-2xl shadow-black/20 overflow-hidden p-8"
          style={cardStyle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex flex-col gap-2">
            {/* ─── Profile Header ─── */}
            {c.layout === "side-by-side" ? (
              <div className="flex items-center gap-5">
                {c.showProfilePicture && (
                  <div
                    className={`w-20 h-20 shrink-0 flex items-center justify-center text-2xl font-bold overflow-hidden ring-4 ring-white/20 ${getAvatarClasses(c.avatarShape)}`}
                    style={{ backgroundColor: `${c.accentColor}33`, color: c.accentColor }}
                  >
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt={user?.name} className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.charAt(0).toUpperCase() || "U"
                    )}
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <h1 className="text-xl font-bold" style={{ color: tc }}>
                    {user?.name || "Your Name"}
                  </h1>
                  {c.showUsername !== false && (
                    <p className="text-sm" style={{ color: tcs }}>
                      @{user?.username || "username"}
                    </p>
                  )}
                </div>
              </div>
            ) : c.layout === "banner" ? (
              <div className="flex flex-col items-center">
                <div
                  className="w-full h-24 rounded-t-2xl -mx-8 -mt-8 mb-0"
                  style={{ background: `linear-gradient(135deg, ${c.accentColor}55, ${c.accentColor}22)` }}
                />
                {c.showProfilePicture && (
                  <div
                    className={`w-20 h-20 -mt-14 relative z-10 flex items-center justify-center text-2xl font-bold overflow-hidden ring-4 ring-white/30 shadow-lg ${getAvatarClasses(c.avatarShape)}`}
                    style={{ backgroundColor: `${c.accentColor}33`, color: c.accentColor }}
                  >
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt={user?.name} className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.charAt(0).toUpperCase() || "U"
                    )}
                  </div>
                )}
                <div className="flex flex-col gap-1 items-center mt-2">
                  <h1 className="text-xl font-bold" style={{ color: tc }}>
                    {user?.name || "Your Name"}
                  </h1>
                  {c.showUsername !== false && (
                    <p className="text-sm" style={{ color: tcs }}>
                      @{user?.username || "username"}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* Classic */
              <div className="flex flex-col items-center gap-4">
                {c.showProfilePicture && (
                  <div
                    className={`w-24 h-24 flex items-center justify-center text-3xl font-bold overflow-hidden ring-4 ring-white/20 shadow-lg ${getAvatarClasses(c.avatarShape)}`}
                    style={{ backgroundColor: `${c.accentColor}33`, color: c.accentColor }}
                  >
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt={user?.name} className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.charAt(0).toUpperCase() || "U"
                    )}
                  </div>
                )}
                <div className="flex flex-col gap-1 items-center">
                  <h1 className="text-xl font-bold" style={{ color: tc }}>
                    {user?.name || "Your Name"}
                  </h1>
                  {c.showUsername !== false && (
                    <p className="text-sm" style={{ color: tcs }}>
                      @{user?.username || "username"}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ─── Bio (hidden if empty or disabled) ─── */}
            {c.showBio && user?.bio && (
              <p className="text-sm leading-relaxed max-w-[300px] mx-auto text-center" style={{ color: tcs }}>
                {user.bio}
              </p>
            )}

            {/* ─── Divider ─── */}
            <div className="w-12 h-0.5 mx-auto rounded-full" style={{ backgroundColor: `${c.accentColor}44` }} />

            {/* ─── Links ─── */}
            <div className={`flex flex-col gap-3 ${c.linkAlignment === "left" ? "items-start" : "items-center"}`}>
              {(links || []).slice(0, 5).map((link, idx) => {
                const { className, style } = getButtonClasses(
                  c.buttonStyle,
                  c.buttonWidth,
                  c.buttonAnimation,
                  c.accentColor,
                  c.buttonTextColor
                );
                return (
                  <motion.a
                    key={link._id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className={className}
                    style={style}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                  >
                    <div className={`flex items-center gap-3 ${c.linkAlignment === "left" ? "" : "justify-center"}`}>
                      {c.showIcons && (
                        <PlatformIcon platform={link.platform} className="w-4 h-4" style={{ color: c.buttonTextColor || "#000000" }} />
                      )}
                      <span>{link.title}</span>
                    </div>
                  </motion.a>
                );
              })}
              {(!links || links.length === 0) && (
                <div className="py-5 text-sm text-center" style={{ color: `${tcs}88` }}>
                  No links yet
                </div>
              )}
            </div>

            {/* ─── QR + Footer (wrapped so gap-5 separates only when QR is visible) ─── */}
            <div className="flex flex-col gap-5">
              {c.showQr && (
                <div className="inline-flex flex-col items-center mx-auto bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                  <p className="text-[10px] mb-2 uppercase tracking-widest font-medium" style={{ color: tcs }}>
                    Scan to share
                  </p>
                  <QRCodeCanvas
                    value={`${window.location.origin}/${user?.username || "username"}`}
                    size={56}
                  />
                </div>
              )}
              <p className="text-[10px] tracking-wider uppercase text-center" style={{ color: `${tcs}66` }}>
                Powered by LinkIn
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
