import * as d3 from "d3";
import {
  createNodeMap,
  groupNodesByInitial,
  sortNodesByLinkValue,
} from "./nodeMap";
import {
  calculateNodePositions,
  calculateLinkHeights,
  assignXPositions,
} from "./layout";
import {
  defineY0ForLinks,
  defineY1ForLinks,
  syncLinkPositions,
} from "./linkPositions";
import {
  NODE_WIDTH,
  LINK_COLORS,
  LINK_COLORS_HOVER,
  LINK_COLOR_DEFAULT,
  NODE_COLOR_ACTIVE,
  NODE_COLOR_INACTIVE,
  NODE_COLOR_HOVER_ACTIVE,
  NODE_COLOR_HOVER_INACTIVE,
  NODE_COLOR_DIM,
  LINK_OPACITY_NORMAL,
  LINK_OPACITY_DIM,
  LINK_OPACITY_HIGHLIGHT,
} from "../constants";

/**
 * Desenha o gráfico Sankey completo usando D3.
 *
 * Arquitetura de camadas SVG:
 *   <g class="zoom-group">
 *     <g class="layer-links">       ← links base (recebem mouse events, NUNCA mudam de cor/opacidade)
 *     <g class="layer-nodes">       ← nós (recebem mouse events)
 *     <g class="layer-highlights">  ← cópias de highlight (pointer-events: none, esvaziada no mouseout)
 *     <g class="layer-ui">          ← info boxes
 *   </g>
 */
export function drawSankey(
  ref,
  width,
  height,
  nodes,
  links,
  kAlias,
  reductorKAlias,
  reductorQAlias,
  gapAAlias,
  gapQAlias,
  gapKAlias,
  appearingLinksAlias,
  nodeOrderByAlias,
  nodeOrderAlias,
  orderingLinksAlias,
) {
  // ── Config ──
  const K = kAlias;
  const REDUCTOR_Q = reductorQAlias;
  const REDUCTOR_K = reductorKAlias;
  const FACTOR = K / 2;
  const gapA = gapAAlias;
  const gapQ = gapQAlias;
  const gapK = gapKAlias;

  const appearingValues = appearingLinksAlias;
  const orderingLinks = resolveLinksOrder(orderingLinksAlias);

  const nodeColor =
    appearingValues.length > 2 ? NODE_COLOR_ACTIVE : NODE_COLOR_INACTIVE;
  const nodeColorOver =
    appearingValues.length > 2
      ? NODE_COLOR_HOVER_ACTIVE
      : NODE_COLOR_HOVER_INACTIVE;

  // ── Build data structures ──
  let nodeMap = createNodeMap(nodes, links);
  nodeMap = sortNodesByLinkValue(nodeMap, nodeOrderByAlias, nodeOrderAlias);

  const nodeGroups = groupNodesByInitial(nodeMap);
  assignXPositions(nodeGroups, width, NODE_WIDTH);
  calculateNodePositions(nodeMap, K, gapA, gapQ, gapK, REDUCTOR_Q, REDUCTOR_K);
  calculateLinkHeights(nodeMap, K);

  Object.values(nodeMap).forEach((node) => {
    node.targetLinks.forEach((link) => {
      link.x0 = link.sourceNode.x;
      link.x1 = link.targetNode.x;
    });
  });

  defineY0ForLinks(nodeMap, links, K, FACTOR, REDUCTOR_Q, REDUCTOR_K);
  defineY1ForLinks(nodeMap, links, K, FACTOR, REDUCTOR_Q, REDUCTOR_K);
  syncLinkPositions(nodeMap, links);

  links = links.sort(
    (a, b) => orderingLinks.indexOf(a.value) - orderingLinks.indexOf(b.value),
  );

  // ── Filtrar ──
  const nodeMapFiltered = filterNodeMap(nodeMap, appearingValues);
  const filteredLinks = links.filter((link) =>
    appearingValues.includes(link.value),
  );

  // ── Desenhar ──
  d3.select(ref.current).selectAll("*").remove();

  const svg = createSvg(ref, width, height);
  const zoomGroup = svg.append("g").attr("class", "zoom-group");

  // Camadas em ordem de empilhamento (bottom → top)
  const layerLinks = zoomGroup.append("g").attr("class", "layer-links");
  const layerNodes = zoomGroup.append("g").attr("class", "layer-nodes");
  const layerHighlights = zoomGroup
    .append("g")
    .attr("class", "layer-highlights")
    .style("pointer-events", "none"); // TODA a camada ignora mouse
  const layerUI = zoomGroup
    .append("g")
    .attr("class", "layer-ui")
    .style("pointer-events", "none");

  drawNodes(layerNodes, nodeMapFiltered, NODE_WIDTH, nodeColor);

  if (appearingValues.length < 3) {
    drawFilteredContribution(
      layerNodes,
      appearingValues,
      links,
      filteredLinks,
      K,
      REDUCTOR_Q,
      REDUCTOR_K,
      NODE_WIDTH,
    );
  }

  drawNodeLabels(layerNodes, NODE_WIDTH);
  drawLinks(layerLinks, filteredLinks, REDUCTOR_Q, REDUCTOR_K, NODE_WIDTH);

  // Interações
  attachNodeInteractions(
    layerNodes,
    layerLinks,
    layerHighlights,
    layerUI,
    nodeMap,
    nodeColor,
    nodeColorOver,
    REDUCTOR_Q,
    REDUCTOR_K,
    NODE_WIDTH,
  );
  attachLinkInteractions(
    layerLinks,
    layerHighlights,
    layerNodes,
    layerUI,
    nodeMap,
    nodeColor,
    nodeColorOver,
    REDUCTOR_Q,
    REDUCTOR_K,
    NODE_WIDTH,
  );
}

// ── Helpers privados ──

function resolveLinksOrder(orderingLinksAlias) {
  switch (orderingLinksAlias) {
    case 1:
      return [1, 2, 3];
    case 2:
      return [2, 1, 3];
    case 3:
      return [3, 1, 2];
    default:
      return [1, 2, 3];
  }
}

function filterNodeMap(nodeMap, appearingValues) {
  return Object.fromEntries(
    Object.entries(nodeMap).filter(([, node]) => {
      if (node.id[0] === "A") {
        return node.sourceLinks.some((link) =>
          appearingValues.includes(parseInt(link.value)),
        );
      }
      return (
        node.sourceLinks.some(
          (link) =>
            appearingValues.includes(parseInt(link.value)) && link.qtd > 0,
        ) ||
        node.targetLinks.some(
          (link) =>
            appearingValues.includes(parseInt(link.value)) && link.qtd > 0,
        )
      );
    }),
  );
}

function createSvg(ref, width, height) {
  return d3
    .select(ref.current)
    .append("svg")
    .attr("width", width)
    .attr("height", height * 2)
    .attr("viewBox", `0 0 ${width} ${height * 2}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .call(
      d3
        .zoom()
        .scaleExtent([0.5, 5])
        .on("zoom", function (event) {
          d3.select(this)
            .select(".zoom-group")
            .attr("transform", event.transform);
        }),
    );
}

// ── Desenho de nós ──

function drawNodes(layer, nodeMapFiltered, nodeWidth, nodeColor) {
  const Vs = layer
    .selectAll(".node")
    .data(Object.values(nodeMapFiltered))
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", (d) => `translate(${d.x}, ${d.y})`);

  Vs.append("rect")
    .attr("width", nodeWidth)
    .attr("height", (d) => d.height)
    .style("fill", nodeColor)
    .style("cursor", "pointer");

  return Vs;
}

function drawNodeLabels(layer, nodeWidth) {
  layer
    .selectAll(".node")
    .append("text")
    .text((d) => d.id)
    .attr("x", nodeWidth / 2)
    .attr("y", (d) => d.height / 2)
    .attr("dy", "0.35em")
    .style("fill", "white")
    .style("font-size", "12px")
    .style("text-anchor", "middle")
    .style("font-family", "Arial, sans-serif");
}

// ── Desenho de links ──

function drawLinks(layer, filteredLinks, REDUCTOR_Q, REDUCTOR_K, nodeWidth) {
  return layer
    .selectAll(".link")
    .data(filteredLinks)
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", (d) => buildLinkPath(d, REDUCTOR_Q, REDUCTOR_K, nodeWidth))
    .attr("fill", (d) => LINK_COLORS[d.value] || LINK_COLOR_DEFAULT)
    .attr("opacity", LINK_OPACITY_NORMAL);
}

function buildLinkPath(d, REDUCTOR_Q, REDUCTOR_K, nodeWidth) {
  const sourceWidth = d.source[0] === "Q" ? d.height * REDUCTOR_Q : d.height;
  const targetWidth =
    d.target[0] === "Q"
      ? d.height * REDUCTOR_Q
      : d.target[0] === "K"
        ? d.height * REDUCTOR_K
        : d.height;

  const x0 = d.x0 + nodeWidth;
  const y0Top = d.y0 - sourceWidth / 2;
  const y0Bottom = d.y0 + sourceWidth / 2;
  const x1 = d.x1;
  const y1Top = d.y1 - targetWidth / 2;
  const y1Bottom = d.y1 + targetWidth / 2;
  const midX = (x0 + x1) / 2;

  return `
    M${x0},${y0Top}
    C${midX},${y0Top} ${midX},${y1Top} ${x1},${y1Top}
    L${x1},${y1Bottom}
    C${midX},${y1Bottom} ${midX},${y0Bottom} ${x0},${y0Bottom}
    Z
  `;
}

// ── Limpeza de highlights ──
// Esta é a ÚNICA função de reset. Esvazia a camada de highlights e reseta nós.

/**
 * Reduz visualmente TODOS os links e nós (estado "dim").
 * Chamado no início de cada highlight para criar contraste.
 */
function dimAll(layerLinks, layerNodes) {
  layerLinks.selectAll(".link").attr("opacity", LINK_OPACITY_DIM);
  layerNodes.selectAll(".node rect").style("fill", NODE_COLOR_DIM);
}

/**
 * Restaura tudo ao estado normal e limpa highlights.
 */
function clearHighlights(
  layerHighlights,
  layerLinks,
  layerNodes,
  layerUI,
  nodeColor,
) {
  layerHighlights.selectAll("*").remove();
  layerUI.selectAll("*").remove();
  layerLinks.selectAll(".link").attr("opacity", LINK_OPACITY_NORMAL);
  layerNodes.selectAll(".node rect").style("fill", nodeColor);
}

// ── Interações de nós ──

function attachNodeInteractions(
  layerNodes,
  layerLinks,
  layerHighlights,
  layerUI,
  nodeMap,
  nodeColor,
  nodeColorOver,
  REDUCTOR_Q,
  REDUCTOR_K,
  nodeWidth,
) {
  layerNodes
    .selectAll(".node rect")
    .on("mouseover", function () {
      const node = d3.select(this.parentNode).datum();
      dimAll(layerLinks, layerNodes);
      highlightNodeConnections(
        node,
        layerHighlights,
        layerNodes,
        nodeMap,
        nodeColorOver,
        REDUCTOR_Q,
        REDUCTOR_K,
        nodeWidth,
      );
    })
    .on("mouseout", function () {
      clearHighlights(
        layerHighlights,
        layerLinks,
        layerNodes,
        layerUI,
        nodeColor,
      );
    });

  layerNodes.selectAll(".node").on("click", function (event, d) {
    drawInfoBox(layerUI, d);
  });
}

function highlightNodeConnections(
  node,
  layerHighlights,
  layerNodes,
  nodeMap,
  nodeColorOver,
  REDUCTOR_Q,
  REDUCTOR_K,
  nodeWidth,
) {
  // Destacar o próprio nó
  layerNodes.selectAll(".node").each(function () {
    if (d3.select(this).datum().id === node.id) {
      d3.select(this).select("rect").style("fill", nodeColorOver);
    }
  });

  // Coletar links e nós conectados
  let conLinks = [];
  let conNodeIds = new Set();

  if (node?.targetLinks) conLinks.push(...node.targetLinks);
  if (node?.sourceLinks) conLinks.push(...node.sourceLinks);

  conLinks.forEach((link) => {
    const src = link.sourceNode ? link.sourceNode.id : link.source;
    const tgt = link.targetNode ? link.targetNode.id : link.target;
    conNodeIds.add(src);
    conNodeIds.add(tgt);
  });

  // Expandir transitivamente
  if (node.id[0] === "A" && node.sourceLinks) {
    node.sourceLinks.forEach((aToQ) => {
      const qId = aToQ.targetNode ? aToQ.targetNode.id : aToQ.target;
      const qNode = Object.values(nodeMap).find((n) => n.id === qId);
      if (qNode?.sourceLinks) {
        qNode.sourceLinks.forEach((qToK) => {
          if (qToK.value === aToQ.value) {
            conLinks.push(qToK);
            conNodeIds.add(qToK.targetNode ? qToK.targetNode.id : qToK.target);
          }
        });
      }
    });
  } else if (node.id[0] === "K" && node.targetLinks) {
    node.targetLinks.forEach((qToK) => {
      const qId = qToK.sourceNode ? qToK.sourceNode.id : qToK.source;
      const qNode = Object.values(nodeMap).find((n) => n.id === qId);
      if (qNode?.targetLinks) {
        qNode.targetLinks.forEach((aToQ) => {
          conLinks.push(aToQ);
          conNodeIds.add(aToQ.sourceNode ? aToQ.sourceNode.id : aToQ.source);
        });
      }
    });
  }

  conNodeIds.delete(node.id);

  // Destacar nós conectados
  layerNodes.selectAll(".node").each(function () {
    const d = d3.select(this).datum();
    if (conNodeIds.has(d.id)) {
      d3.select(this).select("rect").style("fill", nodeColorOver);
    }
  });

  // Desenhar cópias dos links na camada de highlights
  conLinks.forEach((cl) => {
    const linkData = {
      ...cl,
      source: cl.sourceNode ? cl.sourceNode.id : cl.source,
      target: cl.targetNode ? cl.targetNode.id : cl.target,
    };
    layerHighlights
      .append("path")
      .attr("d", buildLinkPath(linkData, REDUCTOR_Q, REDUCTOR_K, nodeWidth))
      .attr("fill", LINK_COLORS_HOVER[linkData.value] || LINK_COLOR_DEFAULT)
      .attr("opacity", LINK_OPACITY_HIGHLIGHT);
  });
}

// ── Interações de links ──

function attachLinkInteractions(
  layerLinks,
  layerHighlights,
  layerNodes,
  layerUI,
  nodeMap,
  nodeColor,
  nodeColorOver,
  REDUCTOR_Q,
  REDUCTOR_K,
  nodeWidth,
) {
  layerLinks
    .selectAll(".link")
    .on("mouseover", function () {
      const link = d3.select(this).datum();
      dimAll(layerLinks, layerNodes);
      highlightLinkConnections(
        link,
        layerHighlights,
        layerNodes,
        nodeMap,
        nodeColorOver,
        REDUCTOR_Q,
        REDUCTOR_K,
        nodeWidth,
      );
    })
    .on("mouseout", function () {
      clearHighlights(
        layerHighlights,
        layerLinks,
        layerNodes,
        layerUI,
        nodeColor,
      );
    });
}

function highlightLinkConnections(
  link,
  layerHighlights,
  layerNodes,
  nodeMap,
  nodeColorOver,
  REDUCTOR_Q,
  REDUCTOR_K,
  nodeWidth,
) {
  const conNodeIds = new Set([link.source, link.target]);
  const conLinks = [link]; // O próprio link hovered

  // Encontrar o nó Q (intermediário)
  const qId =
    link.source[0] === "Q"
      ? link.source
      : link.target[0] === "Q"
        ? link.target
        : null;
  if (!qId) return;

  const qNode = Object.values(nodeMap).find((n) => n.id === qId);
  if (!qNode) return;

  // Se link é A→Q: mostrar também Q→K com mesmo valor (mas NÃO outros A→Q)
  if (qId === link.target) {
    // Links Q→K com mesmo value
    qNode.sourceLinks.forEach((qToK) => {
      if (qToK.value === link.value) {
        conLinks.push(qToK);
        conNodeIds.add(qToK.targetNode ? qToK.targetNode.id : qToK.target);
      }
    });
  }

  // Se link é Q→K: mostrar também A→Q com mesmo valor
  if (qId === link.source) {
    qNode.targetLinks.forEach((aToQ) => {
      if (aToQ.value === link.value) {
        conLinks.push(aToQ);
        conNodeIds.add(aToQ.sourceNode ? aToQ.sourceNode.id : aToQ.source);
      }
    });
  }

  // Destacar nós conectados
  layerNodes.selectAll(".node").each(function () {
    const d = d3.select(this).datum();
    if (conNodeIds.has(d.id)) {
      d3.select(this).select("rect").style("fill", nodeColorOver);
    }
  });

  // Desenhar cópias dos links na camada de highlights
  const seen = new Set();
  conLinks.forEach((cl) => {
    const src = cl.sourceNode ? cl.sourceNode.id : cl.source;
    const tgt = cl.targetNode ? cl.targetNode.id : cl.target;
    const key = `${src}-${tgt}-${cl.value}`;
    if (seen.has(key)) return;
    seen.add(key);

    const linkData = { ...cl, source: src, target: tgt };
    layerHighlights
      .append("path")
      .attr("d", buildLinkPath(linkData, REDUCTOR_Q, REDUCTOR_K, nodeWidth))
      .attr("fill", LINK_COLORS_HOVER[linkData.value] || LINK_COLOR_DEFAULT)
      .attr("opacity", LINK_OPACITY_HIGHLIGHT);
  });
}

// ── Info box ──

function drawInfoBox(layerUI, node) {
  layerUI.selectAll("*").remove();

  const linkCounts = { 1: 0, 2: 0, 3: 0 };
  node.sourceLinks.forEach((link) => linkCounts[link.value]++);
  node.targetLinks.forEach((link) => linkCounts[link.value]++);

  const total = linkCounts[1] + linkCounts[2] + linkCounts[3];
  const pieData = Object.entries(linkCounts).map(([key, value]) => ({
    value,
    percentage: total > 0 ? (value / total) * 100 : 0,
    label: key,
  }));

  const pie = d3.pie().value((d) => d.value);
  const arc = d3.arc().innerRadius(0).outerRadius(50);

  const infoBoxX = node.id[0] === "K" ? node.x - 210 : node.x + NODE_WIDTH + 10;

  const infoBox = layerUI
    .append("g")
    .attr("class", "info-box")
    .attr("transform", `translate(${infoBoxX}, ${node.y})`);

  infoBox
    .append("rect")
    .attr("width", 200)
    .attr("height", 180)
    .attr("rx", 4)
    .attr("ry", 4)
    .style("fill", "white")
    .style("stroke", "black")
    .style("stroke-width", 1);

  infoBox
    .append("text")
    .attr("x", 100)
    .attr("y", 25)
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text(`Node: ${node.id}`);

  const pieChart = infoBox.append("g").attr("transform", "translate(100, 90)");

  pieChart
    .selectAll("path")
    .data(pie(pieData))
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", (d) => LINK_COLORS[d.data.label] || "lightgray");

  pieChart
    .selectAll("text")
    .data(pie(pieData))
    .enter()
    .append("text")
    .attr("transform", (d) => `translate(${arc.centroid(d)})`)
    .attr("dy", "0.35em")
    .style("text-anchor", "middle")
    .style("font-size", "10px")
    .style("fill", "white")
    .text((d) =>
      d.data.percentage !== 0 ? `${d.data.percentage.toFixed(1)}%` : "",
    );

  infoBox
    .append("text")
    .attr("x", 100)
    .attr("y", 160)
    .style("text-anchor", "middle")
    .style("font-size", "12px")
    .text(
      `Total Connections: ${node.sourceLinks.length + node.targetLinks.length}`,
    );
}

// ── Contribuição filtrada ──

function drawFilteredContribution(
  layerNodes,
  appearingValues,
  links,
  filteredLinks,
  K,
  REDUCTOR_Q,
  REDUCTOR_K,
  nodeWidth,
) {
  const Vs = layerNodes.selectAll(".node");

  appearingValues.forEach(() => {
    Vs.append("rect")
      .attr("width", nodeWidth)
      .attr("y", (d) => {
        const mod = getModifier(d, K, REDUCTOR_Q, REDUCTOR_K);
        let fLinks = links.filter(
          (link) =>
            (link.source === d.id || link.target === d.id) &&
            appearingValues.includes(link.value),
        );
        fLinks = fLinks.some((link) => link.source === d.id)
          ? fLinks.filter((link) => link.source === d.id)
          : fLinks.filter((link) => link.target === d.id);

        const Ys = fLinks.map((link) => {
          const y = link.source === d.id ? link.y0 : link.y1;
          return y - d.y - (link.qtd ? link.qtd * (mod / 2) : mod / 2);
        });
        return Math.min(...Ys);
      })
      .attr("height", (d) => {
        const mod = getModifier(d, K, REDUCTOR_Q, REDUCTOR_K);
        const fLinks = filteredLinks.filter(
          (link) => link.source === d.id || link.target === d.id,
        );
        const Ys0 = fLinks.map((link) => {
          const y = link.source === d.id ? link.y0 : link.y1;
          return y - (link.qtd ? link.qtd * (mod / 2) : mod / 2);
        });
        const Ys1 = fLinks.map((link) => {
          const y = link.source === d.id ? link.y0 : link.y1;
          return y + (link.qtd ? link.qtd * (mod / 2) : mod / 2);
        });
        return Math.max(...Ys1) - Math.min(...Ys0);
      })
      .style("fill", "steelblue");
  });
}

function getModifier(node, K, REDUCTOR_Q, REDUCTOR_K) {
  if (node.id[0] === "Q") return K * REDUCTOR_Q;
  if (node.id[0] === "K") return K * REDUCTOR_K;
  return K;
}
