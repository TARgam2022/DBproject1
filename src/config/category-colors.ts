export type CategoryColor = {
  key: string;
  label: string;
  bg: string;
  text: string;
};

export const CATEGORY_COLORS: CategoryColor[] = [
  { key: "blue", label: "Blue", bg: "#DBEAFE", text: "#1D4ED8" },
  { key: "green", label: "Green", bg: "#DCFCE7", text: "#15803D" },
  { key: "red", label: "Red", bg: "#FEE2E2", text: "#B91C1C" },
  { key: "orange", label: "Orange", bg: "#FFEDD5", text: "#C2410C" },
  { key: "purple", label: "Purple", bg: "#EDE9FE", text: "#6D28D9" },
  { key: "pink", label: "Pink", bg: "#FCE7F3", text: "#BE185D" },
  { key: "yellow", label: "Yellow", bg: "#FEF9C3", text: "#A16207" },
  { key: "teal", label: "Teal", bg: "#CCFBF1", text: "#0F766E" },
];

export function getCategoryColor(key: string | undefined | null): CategoryColor {
  return (
    CATEGORY_COLORS.find((c) => c.key === key) || {
      key: "gray",
      label: "General",
      bg: "#F3F4F6",
      text: "#6B7280",
    }
  );
}
