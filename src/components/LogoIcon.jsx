export const LogoIcon = ({ className = "w-12 h-12" }) => (
  <img
    src="/logo.png"
    alt="LearnSphere logo"
    className={`object-contain select-none ${className}`}
    draggable={false}
  />
);
