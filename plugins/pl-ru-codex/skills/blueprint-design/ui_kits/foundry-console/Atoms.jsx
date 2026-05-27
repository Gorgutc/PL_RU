// Atoms — Button, Tag, Card, Callout, Icon, Input
// CRITICAL: each Babel script gets its own scope.
// Style objects are NOT shared; we either use inline styles or the
// global utility classes in bp.css. We expose components on `window`
// at the bottom so other scripts can use them.

const { useState } = React;

/**
 * Icon renders a Blueprint SVG as a mask, so currentColor tinting works.
 * Use intent={"primary"|"success"|"warning"|"danger"|"muted"} or color={...}.
 */
function Icon({ name, size = 16, intent, color, style = {}, ...rest }) {
  const sizeKey = size >= 20 ? "20px" : "16px";
  const url = `../../assets/icons/${sizeKey}/${name}.svg`;
  const intentColor = {
    primary: "var(--bp-blue2)",
    success: "var(--bp-green2)",
    warning: "var(--bp-orange2)",
    danger: "var(--bp-red2)",
    muted: "var(--bp-text-muted)",
  }[intent];
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width: size,
        height: size,
        backgroundColor: color || intentColor || "currentColor",
        WebkitMaskImage: `url(${url})`,
        maskImage: `url(${url})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        flexShrink: 0,
        ...style,
      }}
      {...rest}
    />
  );
}

function Button({
  children,
  intent,
  variant,
  size,
  icon,
  rightIcon,
  fill,
  disabled,
  onClick,
  type = "button",
  className = "",
  style = {},
  ...rest
}) {
  const classes = [
    "bp-btn",
    intent && `bp-btn-${intent}`,
    variant && `bp-btn-${variant}`,
    size && `bp-btn-${size}`,
    className,
  ].filter(Boolean).join(" ");
  const baseStyle = fill ? { width: "100%" } : {};
  return (
    <button
      type={type}
      className={classes}
      style={{ ...baseStyle, ...style }}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {icon && <Icon name={icon} size={16} />}
      {children}
      {rightIcon && <Icon name={rightIcon} size={16} />}
    </button>
  );
}

function Tag({ children, intent, minimal, icon, removable, onRemove, style = {} }) {
  const classes = ["bp-tag", intent && `bp-tag-${intent}`, minimal && "bp-tag-minimal"]
    .filter(Boolean).join(" ");
  return (
    <span className={classes} style={style}>
      {icon && <Icon name={icon} size={12} />}
      {children}
      {removable && (
        <span onClick={onRemove} style={{ cursor: "pointer", marginLeft: 2, opacity: 0.7 }}>
          <Icon name="cross" size={12} />
        </span>
      )}
    </span>
  );
}

function Card({ children, interactive, dark, style = {}, onClick }) {
  return (
    <div
      className={"bp-card " + (interactive ? "bp-card-interactive" : "") + (dark ? " bp-dark" : "")}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

function Callout({ children, intent, icon, title }) {
  const cls = "bp-callout " + (intent ? `bp-callout-${intent}` : "");
  const iconName = icon || ({
    primary: "info-sign",
    success: "tick-circle",
    warning: "warning-sign",
    danger: "error",
  }[intent] || "info-sign");
  return (
    <div className={cls}>
      <Icon name={iconName} size={16} style={{ marginTop: 1 }} />
      <div style={{ flex: 1 }}>
        {title && <div style={{ fontWeight: 600, marginBottom: 4 }}>{title}</div>}
        {children}
      </div>
    </div>
  );
}

function Input({ leftIcon, value, onChange, placeholder, large, fill, style = {}, ...rest }) {
  if (!leftIcon) {
    return (
      <input
        className={"bp-input " + (large ? "bp-input-large" : "")}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        style={{ width: fill ? "100%" : undefined, ...style }}
        {...rest}
      />
    );
  }
  return (
    <div style={{ position: "relative", width: fill ? "100%" : undefined, ...style }}>
      <Icon
        name={leftIcon}
        size={16}
        intent="muted"
        style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)" }}
      />
      <input
        className={"bp-input " + (large ? "bp-input-large" : "")}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        style={{ paddingLeft: 28, width: "100%" }}
        {...rest}
      />
    </div>
  );
}

/** small helper: avatar circle from initials with palette pick */
function Avatar({ name = "AS", size = 28, hue }) {
  const palette = ["#7c327c", "#0f6894", "#1c6e42", "#866103", "#634dbf", "#b83211"];
  const pick = hue ?? (name.charCodeAt(0) % palette.length);
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: palette[pick],
        color: "#fff",
        fontSize: size * 0.42,
        fontWeight: 600,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

Object.assign(window, { Icon, Button, Tag, Card, Callout, Input, Avatar });
