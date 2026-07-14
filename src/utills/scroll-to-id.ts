export const scrollToId = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  const navOffset = 68;
  const top = el.getBoundingClientRect().top + window.scrollY - navOffset;
  window.scrollTo({
    top,
    behavior: "smooth",
  });
};