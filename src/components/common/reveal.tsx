import { useReveal } from "@/hooks/use-reveal";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
}

export const Reveal = ({ children, delay = 0 }: RevealProps) => {
  const { ref, shown } = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(14px)",
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};