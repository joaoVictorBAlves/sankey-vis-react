import * as d3 from "d3";
import { LINK_COLORS, LINK_COLORS_HOVER } from "../constants";

/**
 * Reseta TODOS os nós e links para o estado padrão.
 * Usa query DOM fresca (g.selectAll) em vez de seleção D3 capturada,
 * para garantir que funcione mesmo após .raise() reordenar elementos.
 *
 * @param {d3.Selection} g - Grupo SVG raiz.
 * @param {string} nodeColor - Cor padrão dos nós.
 */
export function resetAllToDefault(g, nodeColor) {
  // Resetar TODOS os nós (query fresca)
  g.selectAll(".node rect").style("fill", nodeColor);

  // Resetar TODOS os links (query fresca)
  g.selectAll(".link")
    .attr("fill", function () {
      const d = d3.select(this).datum();
      return LINK_COLORS[d.value] || "lightgray";
    })
    .attr("opacity", 0.5);

  // Remover quaisquer highlight-links remanescentes
  g.selectAll(".highlight-link").remove();

  // Remover info boxes
  g.selectAll(".info-box").remove();
}

/**
 * Atualiza cor e opacidade de nós e links conectados a um LINK específico.
 *
 * @param {Object} link - O link base (dados do DOM, source/target são strings).
 * @param {number} opacityValue - Opacidade a aplicar.
 * @param {string} fillColor - Cor de preenchimento dos nós.
 * @param {d3.Selection} g - Grupo SVG raiz.
 * @param {"over"|"out"} type - Tipo de evento.
 */
export function updateLinksAndNodesByLink(
  link,
  opacityValue,
  fillColor,
  g,
  type,
) {
  const allNodeEls = g.selectAll(".node").nodes();
  const allLinkEls = g.selectAll(".link").nodes();

  let conNodes = [];
  let conLinks = [];

  // Encontrar os nós source e target do link
  allNodeEls.forEach((el) => {
    const d = d3.select(el).datum();
    if (d.id === link.source || d.id === link.target) {
      conNodes.push(d);
    }
  });

  const midNode = conNodes.find((node) => node.id[0] === "Q");
  if (!midNode) return;

  // ── Direção A→Q: midNode é o TARGET do link ──
  if (midNode.id === link.target) {
    // Links A→Q irmãos com mesmo valor
    const siblingAQLinks = midNode.targetLinks.filter(
      (l) => l.value === link.value,
    );
    conLinks.push(...siblingAQLinks);
    siblingAQLinks.forEach((cl) => {
      const srcId = cl.sourceNode ? cl.sourceNode.id : cl.source;
      allNodeEls.forEach((el) => {
        const d = d3.select(el).datum();
        if (d.id === srcId) conNodes.push(d);
      });
    });

    // Links Q→K com mesmo valor
    const qToKLinks = midNode.sourceLinks.filter((l) => l.value === link.value);
    conLinks.push(...qToKLinks);
    qToKLinks.forEach((cl) => {
      const tgtId = cl.targetNode ? cl.targetNode.id : cl.target;
      allNodeEls.forEach((el) => {
        const d = d3.select(el).datum();
        if (d.id === tgtId) conNodes.push(d);
      });
    });
  }

  // ── Direção Q→K: midNode é o SOURCE do link ──
  if (midNode.id === link.source) {
    const aToQLinks = midNode.targetLinks.filter((l) => l.value === link.value);
    conLinks.push(...aToQLinks);
    aToQLinks.forEach((cl) => {
      const srcId = cl.sourceNode ? cl.sourceNode.id : cl.source;
      allNodeEls.forEach((el) => {
        const d = d3.select(el).datum();
        if (d.id === srcId) conNodes.push(d);
      });
    });
  }

  highlightNodes(allNodeEls, conNodes, fillColor);
  highlightLinks(allLinkEls, conLinks, opacityValue, type);
}

/**
 * Atualiza cor e opacidade de nós e links conectados a um NÓ específico.
 */
export function updateLinksAndNodesByNode(
  node,
  opacityValue,
  fillColor,
  g,
  type,
) {
  const allNodeEls = g.selectAll(".node").nodes();
  const allLinkEls = g.selectAll(".link").nodes();

  let conLinks = [];
  let conNodes = [];

  if (node?.targetLinks) conLinks.push(...node.targetLinks);
  if (node?.sourceLinks) conLinks.push(...node.sourceLinks);

  conLinks.forEach((link) => {
    const srcId = link.sourceNode ? link.sourceNode.id : link.source;
    const tgtId = link.targetNode ? link.targetNode.id : link.target;
    allNodeEls.forEach((el) => {
      const d = d3.select(el).datum();
      if (d.id === srcId || d.id === tgtId) {
        conNodes.push(d);
      }
    });
  });

  if (node.id[0] !== "Q") {
    expandTransitiveConnections(node, conLinks, conNodes, allNodeEls);
  }

  conNodes = conNodes.filter((n) => n.id[0] !== node.id[0]);

  highlightNodes(allNodeEls, conNodes, fillColor);
  highlightLinks(allLinkEls, conLinks, opacityValue, type);
}

// ── Expansão transitiva ──

function expandTransitiveConnections(node, conLinks, conNodes, allNodeEls) {
  if (node.id[0] === "K") {
    expandFromK(conNodes, conLinks, allNodeEls);
  } else if (node.id[0] === "A") {
    expandFromA(node, conLinks, conNodes, allNodeEls);
  }
}

function expandFromK(conNodes, conLinks, allNodeEls) {
  const initialNodes = [...conNodes];
  initialNodes.forEach((n) => {
    if (n?.targetLinks) {
      conLinks.push(...n.targetLinks);
      n.targetLinks.forEach((l) => {
        const srcId = l.sourceNode ? l.sourceNode.id : l.source;
        allNodeEls.forEach((el) => {
          const d = d3.select(el).datum();
          if (d.id === srcId) conNodes.push(d);
        });
      });
    }
  });
}

function expandFromA(node, conLinks, conNodes, allNodeEls) {
  if (!node?.sourceLinks) return;

  node.sourceLinks.forEach((inceptionLink) => {
    const qId = inceptionLink.targetNode
      ? inceptionLink.targetNode.id
      : inceptionLink.target;
    const qNodeEl = allNodeEls.find((el) => {
      const d = d3.select(el).datum();
      return d.id === qId && d.id[0] === "Q";
    });
    const qNode = qNodeEl ? d3.select(qNodeEl).datum() : null;

    if (!qNode) return;

    conLinks.push(inceptionLink);
    conNodes.push(qNode);

    if (qNode?.sourceLinks) {
      qNode.sourceLinks.forEach((qToKLink) => {
        if (qToKLink.value === inceptionLink.value) {
          conLinks.push(qToKLink);

          const kId = qToKLink.targetNode
            ? qToKLink.targetNode.id
            : qToKLink.target;
          const kNodeEl = allNodeEls.find((el) => {
            const d = d3.select(el).datum();
            return d.id === kId && d.id[0] === "K";
          });
          if (kNodeEl) conNodes.push(d3.select(kNodeEl).datum());
        }
      });
    }
  });
}

// ── Helpers internos ──

function highlightNodes(allNodeEls, conNodes, fillColor) {
  const conIds = new Set(conNodes.map((n) => n.id));
  allNodeEls.forEach((el) => {
    const d = d3.select(el).datum();
    if (conIds.has(d.id)) {
      d3.select(el).select("rect").style("fill", fillColor);
    }
  });
}

function highlightLinks(allLinkEls, conLinks, opacityValue, type) {
  const colorMap = type === "over" ? LINK_COLORS_HOVER : LINK_COLORS;

  allLinkEls.forEach((el) => {
    const data = d3.select(el).datum();
    const isConnected = conLinks.some((cl) => {
      const clSource = cl.sourceNode ? cl.sourceNode.id : cl.source;
      const clTarget = cl.targetNode ? cl.targetNode.id : cl.target;
      return (
        clSource === data.source &&
        clTarget === data.target &&
        cl.value === data.value
      );
    });

    if (isConnected) {
      d3.select(el)
        .attr("fill", colorMap[data.value] || "lightgray")
        .attr("opacity", opacityValue)
        .raise();
    }
  });
}
