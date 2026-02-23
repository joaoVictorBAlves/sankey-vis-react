import { groupNodesByInitial } from "./nodeMap";

/**
 * Calcula a altura de um link baseado no nó de origem e o fator K.
 *
 * @param {Object} link - O link com sourceNode e targetNode.
 * @param {number} K - Fator constante de altura.
 * @returns {number} Altura calculada do link.
 */
export function calculateLinkHeight(link, K) {
  const sourceInitial = link.sourceNode.id[0];
  let height;

  if (sourceInitial === "A") {
    height = K;
  } else if (sourceInitial === "Q") {
    const matchingLinks = link.sourceNode.targetLinks.filter(
      (l) => l.targetNode.id === link.sourceNode.id && l.value === link.value
    );
    height = K * matchingLinks.length;
  } else {
    height = 5; // MIN HEIGHT
  }

  link.height = height;
  return height;
}

/**
 * Calcula e atribui posições Y aos nós dentro do nodeMap.
 *
 * @param {Object} nodeMap - Mapa de nós.
 * @param {number} K - Fator de altura base.
 * @param {number} gapA - Espaçamento entre nós A.
 * @param {number} gapQ - Espaçamento entre nós Q.
 * @param {number} gapK - Espaçamento entre nós K.
 * @param {number} reductorQ - Redutor de escala para nós Q.
 * @param {number} reductorK - Redutor de escala para nós K.
 */
export function calculateNodePositions(
  nodeMap,
  K,
  gapA,
  gapQ,
  gapK,
  reductorQ,
  reductorK
) {
  const nodeGroups = groupNodesByInitial(nodeMap);

  const gapByGroup = { A: gapA, Q: gapQ, K: gapK };

  Object.entries(nodeGroups).forEach(([key, nodes]) => {
    let currentY = 0;
    const gap = gapByGroup[key] ?? gapA;

    nodes.forEach((node) => {
      node.height = calculateNodeHeight(node, key, K, reductorQ, reductorK);
      node.y = currentY;
      currentY += node.height + gap;
    });
  });
}

/**
 * Calcula a altura de um nó baseado no seu grupo.
 */
function calculateNodeHeight(node, group, K, reductorQ, reductorK) {
  switch (group) {
    case "A":
      return 3 * K; // Grupo A: 3 links (valores 1, 2, 3)

    case "Q":
      return node.targetLinks.length * K * reductorQ;

    case "K":
      return node.targetLinks.reduce((sum, link) => {
        return sum + calculateLinkHeight(link, K) * reductorK;
      }, 0);

    default:
      return K;
  }
}

/**
 * Calcula e atribui as alturas dos links no nodeMap.
 *
 * @param {Object} nodeMap - Mapa de nós.
 * @param {number} K - Fator de altura base.
 */
export function calculateLinkHeights(nodeMap, K) {
  Object.values(nodeMap).forEach((node) => {
    node.targetLinks.forEach((link) => {
      link.height = calculateLinkHeight(link, K);
    });
    node.sourceLinks.forEach((link) => {
      link.height = calculateLinkHeight(link, K);
    });
  });
}

/**
 * Atribui posições X aos grupos de nós, distribuindo uniformemente.
 *
 * @param {Object} nodeGroups - Nós agrupados por inicial.
 * @param {number} width - Largura total disponível.
 * @param {number} nodeWidth - Largura de cada nó.
 */
export function assignXPositions(nodeGroups, width, nodeWidth) {
  const keys = Object.keys(nodeGroups);
  const groupCount = keys.length;
  const spacing = (width - nodeWidth) / (groupCount - 1);

  keys.forEach((key, index) => {
    let xPosition;
    if (index === 0) {
      xPosition = 0;
    } else if (index === groupCount - 1) {
      xPosition = width - nodeWidth;
    } else {
      xPosition = index * spacing;
    }

    nodeGroups[key].forEach((node) => {
      node.x = xPosition;
    });
  });
}
