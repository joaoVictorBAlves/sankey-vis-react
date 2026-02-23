import { groupNodesByInitial } from "./nodeMap";

/**
 * Define a posição Y0 (saída) dos links baseado no nó de origem.
 *
 * @param {Object} nodeMap - Mapa de nós.
 * @param {Array} links - Lista de links original.
 * @param {number} K - Fator de altura.
 * @param {number} factor - Fator de offset (geralmente K/2).
 * @param {number} reductorQ - Redutor para nós Q.
 * @param {number} reductorK - Redutor para nós K.
 */
// eslint-disable-next-line no-unused-vars
export function defineY0ForLinks(
  nodeMap,
  links,
  K,
  factor,
  reductorQ,
  // eslint-disable-next-line no-unused-vars
  reductorK,
) {
  const nodeGroups = groupNodesByInitial(nodeMap);

  Object.entries(nodeGroups).forEach(([key, nodes]) => {
    if (key === "A") {
      assignY0ForGroupA(nodes, K, factor);
    } else if (key === "Q") {
      assignY0ForGroupQ(nodes, reductorQ);
    }
  });
}

/**
 * Atribui Y0 para nós do grupo A.
 * Cada valor (1, 2, 3) ocupa uma fatia vertical do nó.
 */
function assignY0ForGroupA(nodes, K, factor) {
  nodes.forEach((node) => {
    const sortedLinks = node.sourceLinks.sort((a, b) => a.value - b.value);
    const yOffset = node.y + factor;

    sortedLinks.forEach((link) => {
      link.y0 =
        link.value === 1
          ? yOffset
          : link.value === 2
            ? yOffset + K
            : yOffset + 2 * K;
    });
  });
}

/**
 * Atribui Y0 para nós do grupo Q.
 * Links são empilhados por valor (1, 2, 3).
 */
function assignY0ForGroupQ(nodes, reductorQ) {
  nodes.forEach((node) => {
    const sortedLinks = node.sourceLinks.sort((a, b) => a.value - b.value);
    let currentY = node.y + (sortedLinks[0].height / 2) * reductorQ;

    [1, 2, 3].forEach((value) => {
      const linksByValue = sortedLinks.filter((link) => link.value === value);

      if (value > 1 && linksByValue.length > 0) {
        currentY += (linksByValue[0].height / 2) * reductorQ;
      }

      if (linksByValue.length > 0) {
        const y0 = currentY;
        linksByValue.forEach((link) => {
          link.y0 = y0;
        });
        currentY += (linksByValue[0].height / 2) * reductorQ;
      }
    });
  });
}

/**
 * Define a posição Y1 (entrada) dos links baseado no nó de destino.
 *
 * @param {Object} nodeMap - Mapa de nós.
 * @param {Array} links - Lista de links original.
 * @param {number} K - Fator de altura.
 * @param {number} factor - Fator de offset.
 * @param {number} reductorQ - Redutor para nós Q.
 * @param {number} reductorK - Redutor para nós K.
 */
export function defineY1ForLinks(
  nodeMap,
  links,
  K,
  factor,
  reductorQ,
  reductorK,
) {
  const nodeGroups = groupNodesByInitial(nodeMap);

  Object.entries(nodeGroups).forEach(([key, nodes]) => {
    if (key === "Q") {
      assignY1ForGroup(nodes, links, reductorQ);
    } else if (key === "K") {
      assignY1ForGroup(nodes, links, reductorK);
    }
  });
}

/**
 * Atribui Y1 para um grupo de nós (Q ou K).
 */
function assignY1ForGroup(nodes, links, reductor) {
  nodes.forEach((node) => {
    const sortedLinks = node.targetLinks.sort((a, b) => a.value - b.value);
    let currentY1 = node.y + (sortedLinks[0].height / 2) * reductor;

    sortedLinks.forEach((link, i) => {
      const originalLink = links.find((l) => l.id === link.id);

      if (i !== 0) {
        currentY1 += (link.height / 2) * reductor;
      }

      link.y1 = currentY1;
      if (originalLink) originalLink.y1 = currentY1;

      // Propagar para os targetLinks do nó de destino
      link.targetNode.targetLinks.forEach((sourceLink) => {
        if (sourceLink === link) {
          sourceLink.y1 = currentY1;
        }
      });

      currentY1 += (link.height / 2) * reductor;
    });
  });
}

/**
 * Sincroniza posições dos links entre nodeMap e a lista original de links.
 *
 * @param {Object} nodeMap - Mapa de nós.
 * @param {Array} links - Lista original de links.
 */
export function syncLinkPositions(nodeMap, links) {
  Object.values(nodeMap).forEach((node) => {
    syncLinksFromNode(node.sourceLinks, links, "source");
    syncLinksFromNode(node.targetLinks, links, "target");
  });
}

/**
 * Sincroniza um conjunto de links de um nó com a lista original.
 */
// eslint-disable-next-line no-unused-vars
function syncLinksFromNode(nodeLinks, originalLinks, direction) {
  const positionKeys = ["x0", "x1", "y0", "y1", "height"];

  nodeLinks.forEach((nodeLink) => {
    const originalLink = originalLinks.find(
      (link) =>
        link.source === nodeLink.sourceNode.id &&
        link.target === nodeLink.targetNode.id &&
        nodeLink.value === link.value,
    );

    if (originalLink) {
      positionKeys.forEach((key) => {
        if (nodeLink[key] !== undefined) {
          originalLink[key] = nodeLink[key];
        }
      });
    }
  });
}
