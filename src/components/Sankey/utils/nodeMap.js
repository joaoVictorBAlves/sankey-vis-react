/**
 * Cria um mapa de nós indexado por id, com sourceLinks e targetLinks preenchidos.
 *
 * @param {Array} nodes - Array de nós com propriedade id.
 * @param {Array} links - Array de links com source e target.
 * @returns {Object} Mapa de nós indexado por id.
 */
export function createNodeMap(nodes, links) {
  const nodeMap = {};

  nodes.forEach((node) => {
    nodeMap[node.id] = {
      ...node,
      sourceLinks: [],
      targetLinks: [],
    };
  });

  links.forEach((link) => {
    const sourceNode = nodeMap[link.source];
    const targetNode = nodeMap[link.target];

    const linkWithNodes = {
      ...link,
      sourceNode,
      targetNode,
    };

    sourceNode.sourceLinks.push(linkWithNodes);
    targetNode.targetLinks.push(linkWithNodes);
  });

  return nodeMap;
}

/**
 * Agrupa nós pelo caractere inicial do id (A, Q, K).
 *
 * @param {Object} nodeMap - Mapa de nós.
 * @returns {Object} Objeto com chaves A, Q, K e arrays de nós.
 */
export function groupNodesByInitial(nodeMap) {
  const groups = {};

  Object.values(nodeMap).forEach((node) => {
    const initial = node.id.charAt(0);
    if (!groups[initial]) {
      groups[initial] = [];
    }
    groups[initial].push(node);
  });

  return groups;
}

/**
 * Ordena nós pela quantidade de links com um valor específico.
 * Mantém a ordem de grupos (A, Q, K).
 *
 * @param {Object} nodeMap - Mapa de nós.
 * @param {number} value - Valor para contagem nos links.
 * @param {string} order - "ascending" ou "descending".
 * @returns {Array} Nós ordenados.
 */
export function sortNodesByLinkValue(nodeMap, value, order) {
  const nodes = Object.values(nodeMap);

  // Ordena por contagem de links com o valor
  nodes.sort((a, b) => {
    const aCount = getLinksCountByValue(a, value);
    const bCount = getLinksCountByValue(b, value);

    if (order === "ascending") return aCount - bCount;
    if (order === "descending") return bCount - aCount;
    return 0;
  });

  // Estabiliza a ordem dos grupos (A antes de Q antes de K)
  nodes.sort((a, b) => {
    const groupOrder = { A: 0, Q: 1, K: 2 };
    return (groupOrder[a.id[0]] ?? 99) - (groupOrder[b.id[0]] ?? 99);
  });

  return nodes;
}

/**
 * Retorna a contagem de links de um nó com determinado valor.
 */
function getLinksCountByValue(node, value) {
  if (node.id[0] === "A") {
    return node.sourceLinks.filter((l) => l.value === value).length;
  }
  return node.targetLinks.filter((l) => l.value === value).length;
}
