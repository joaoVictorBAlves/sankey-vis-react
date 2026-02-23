/**
 * Gera um dataset contendo nós de alunos (A), questões (Q) e habilidades (K),
 * e links que conectam esses nós.
 *
 * @param {number} numA - Número de alunos (A).
 * @param {number} numQ - Número de questões (Q).
 * @param {number} numK - Número de habilidades (K).
 * @param {number} [percentage1=null] - Porcentagem de links A→Q com valor 1 (0-100).
 * @param {number} [percentage2=null] - Porcentagem de links A→Q com valor 2 (0-100).
 * @param {number} [percentage3=null] - Porcentagem de links A→Q com valor 3 (0-100).
 * @returns {{ nodes: Array, links: Array }}
 */
export function generateDataset(
  numA,
  numQ,
  numK,
  percentage1 = null,
  percentage2 = null,
  percentage3 = null
) {
  const nodes = [];
  const links = [];
  const aToQLinks = [];

  // Gerar nós
  for (let i = 1; i <= numA; i++) nodes.push({ id: `A${i}` });
  for (let i = 1; i <= numQ; i++) nodes.push({ id: `Q${i}` });
  for (let i = 1; i <= numK; i++) nodes.push({ id: `K${i}` });

  // Normalizar porcentagens
  if (percentage1 == null && percentage2 == null && percentage3 == null) {
    percentage1 = Math.random() * 100;
    percentage2 = Math.random() * (100 - percentage1);
    percentage3 = 100 - percentage1 - percentage2;
  }

  const totalPercentage = percentage1 + percentage2 + percentage3;
  const scale = 100 / totalPercentage;
  percentage1 = Math.round(percentage1 * scale);
  percentage2 = Math.round(percentage2 * scale);
  percentage3 = 100 - percentage1 - percentage2;

  function getRandomValue() {
    const rand = Math.random() * 100;
    if (rand < percentage1) return 1;
    if (rand < percentage1 + percentage2) return 2;
    return 3;
  }

  // Links A → Q
  for (let i = 1; i <= numA; i++) {
    for (let j = 1; j <= numQ; j++) {
      aToQLinks.push({
        source: `A${i}`,
        target: `Q${j}`,
        value: getRandomValue(),
      });
    }
  }
  links.push(...aToQLinks);

  // Links Q → K
  for (let i = 1; i <= numQ; i++) {
    const connectedKs = new Set();
    const numConnections = Math.floor(Math.random() * numK) + 1;

    while (connectedKs.size < numConnections) {
      const randomK = `K${Math.floor(Math.random() * numK) + 1}`;
      if (!connectedKs.has(randomK)) {
        connectedKs.add(randomK);

        for (let value = 1; value <= 3; value++) {
          const qtd = aToQLinks.filter(
            (link) => link.target === `Q${i}` && link.value === value
          ).length;

          links.push({
            source: `Q${i}`,
            target: randomK,
            value: value,
            qtd: qtd,
          });
        }
      }
    }
  }

  return { nodes, links };
}
