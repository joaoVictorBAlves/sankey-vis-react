// ── Cores dos links por valor ──
export const LINK_COLORS = {
  1: "#E07121", // Insuficiente
  2: "#916BD4", // Parcialmente Suficiente
  3: "#68E4C9", // Suficiente
};

export const LINK_COLORS_HOVER = {
  1: "#D06020",
  2: "#7150B0",
  3: "#58B0A0",
};

// Fallback
export const LINK_COLOR_DEFAULT = "lightgray";

// ── Cores dos nós ──
export const NODE_COLOR_ACTIVE = "steelblue";
export const NODE_COLOR_INACTIVE = "gray";
export const NODE_COLOR_HOVER_ACTIVE = "#003049";
export const NODE_COLOR_HOVER_INACTIVE = "#444444";

// ── Dimensões fixas ──
export const NODE_WIDTH = 25;

// ── Opacidades ──
export const LINK_OPACITY_NORMAL = 0.5;
export const LINK_OPACITY_DIM = 0.08;
export const LINK_OPACITY_HIGHLIGHT = 0.85;
export const NODE_COLOR_DIM = "#c8d0d8"; // Cinza claro para nós não-conectados

// ── Labels para valores ──
export const VALUE_LABELS = {
  1: "Insuficiente",
  2: "Parcialmente Suficiente",
  3: "Suficiente",
};
