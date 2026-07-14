export const Highlight = ({
  children,
  tone = "mint",
}: {
  children: React.ReactNode;
  tone?: "mint" | "coral";
}) => {
  const bg = tone === "mint" ? "#8FE3C4" : "#E98A57";
  return (
    <span
      className="relative inline-block px-2 rounded-md"
      style={{ background: bg, color: "#0F2D29" }}
    >
      {children}
    </span>
  );
};
