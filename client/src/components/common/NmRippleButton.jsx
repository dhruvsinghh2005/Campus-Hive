import { useRef } from "react";

const NmRippleButton = ({
  children,
  onClick,
  className = "",
  disabled = false,
  type = "button",
  variant = "accent",
  ...props
}) => {
  const buttonRef = useRef(null);

  const handleClick = (e) => {
    if (disabled) return;

    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const size = Math.max(rect.width, rect.height);

    const ripple = document.createElement("span");
    ripple.style.cssText = `
      position: absolute;
      left: ${x - size / 2}px;
      top: ${y - size / 2}px;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%);
      transform: scale(0);
      animation: rippleEffect 0.7s ease-out forwards;
      pointer-events: none;
    `;

    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);

    if (onClick) onClick(e);
  };

  const baseVariants = {
    accent:
      "nm-accent-btn text-white font-semibold",
    flat:
      "nm-button font-medium",
    inset:
      "nm-inset font-medium",
  };

  return (
    <button
      ref={buttonRef}
      type={type}
      disabled={disabled}
      onClick={handleClick}
      className={`relative overflow-hidden px-6 py-3 ${baseVariants[variant] || baseVariants.accent} ${className} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      style={{ color: variant === "flat" || variant === "inset" ? "var(--nm-text)" : undefined }}
      {...props}
    >
      {children}
    </button>
  );
};

export default NmRippleButton;
