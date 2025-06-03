/* eslint-disable no-unused-vars */
export function calculateLayoutParameters(nodes, links, H) {
  // Separar nós por tipo
  const Na = nodes?.filter((node) => node.id.startsWith("A")); // Alunos
  const Nq = nodes?.filter((node) => node.id.startsWith("Q")); // Questões
  const Nk = nodes?.filter((node) => node.id.startsWith("K")); // Habilidades

  // 1. Calcular K e GapA para nós de alunos (Na)
  let { K, GapA } = calculateNaParameters(Na.length, H);

  // 2. Calcular rQ e GapQ para nós de questões (Nq)
  // Primeiro contar os links de entrada para cada questão
  const questionLinkCounts = {};
  Nq.forEach((q) => (questionLinkCounts[q.id] = 0));

  links.forEach((link) => {
    if (link.target.startsWith("Q")) {
      questionLinkCounts[link.target]++;
    }
  });

  let { rQ, GapQ } = calculateNqParameters(Nq, questionLinkCounts, K, H);

  // 3. Calcular rK e GapK para nós de habilidades (Nk)
  // Calcular a soma das alturas dos links de entrada para cada habilidade
  const skillLinkHeights = {};
  Nk.forEach((k) => (skillLinkHeights[k.id] = 0));

  links.forEach((link) => {
    if (link.target.startsWith("K")) {
      skillLinkHeights[link.target] += link.height || 10; // Usar height do link ou valor padrão
    }
  });

  let { rK, GapK } = calculateNkParameters(Nk, skillLinkHeights, H);

  // Verificação final e ajustes se necessário
  const finalCheck = verifyAndAdjust(
    K,
    GapA,
    rQ,
    GapQ,
    rK,
    GapK,
    Na,
    Nq,
    Nk,
    questionLinkCounts,
    skillLinkHeights,
    H
  );

  return {
    K: finalCheck.K,
    GapA: finalCheck.GapA,
    rQ: finalCheck.rQ,
    GapQ: finalCheck.GapQ,
    rK: finalCheck.rK,
    GapK: finalCheck.GapK,
  };
}

// Funções auxiliares
function calculateNaParameters(naCount, H) {
  let K = 1.0;
  let GapA = 5.0;
  const target = H;
  const tolerance = 0.01 * H;

  for (let i = 0; i < 100; i++) {
    const current = naCount * K + (naCount - 1) * GapA;
    if (Math.abs(current - target) < tolerance) break;

    const factor = target / current;
    K *= factor;
    GapA *= factor;
  }

  return { K, GapA };
}

function calculateNqParameters(Nq, questionLinkCounts, K, H) {
  let rQ = 1;
  let GapQ = 5.0;
  const target = H;
  const tolerance = 0.01 * H;

  for (let i = 0; i < 100; i++) {
    let totalNodeHeight = 0;
    Nq.forEach((q) => {
      totalNodeHeight += questionLinkCounts[q.id] * K * rQ;
    });

    const current = totalNodeHeight + (Nq.length - 1) * GapQ;
    if (Math.abs(current - target) < tolerance) break;

    const factor = target / current;
    rQ *= factor;
    GapQ *= factor;
  }

  // Verificar se ainda ultrapassa H
  let totalNodeHeight = 0;
  Nq.forEach((q) => {
    totalNodeHeight += questionLinkCounts[q.id] * K * rQ;
  });

  const current = totalNodeHeight + (Nq.length - 1) * GapQ;
  if (current > H) {
    const excess = current - H;
    const gapReduction = Math.min(excess, (Nq.length - 1) * GapQ);

    if (gapReduction > 0) {
      GapQ -= gapReduction / (Nq.length - 1);
    } else {
      const remainingExcess = excess - gapReduction;
      let totalLinks = 0;
      Nq.forEach((q) => {
        totalLinks += questionLinkCounts[q.id];
      });

      if (totalLinks > 0) {
        rQ -= remainingExcess / (totalLinks * K);
      }
      GapQ = 0;
    }
  }

  // Final debug: Show final height vs H
  let finalTotalNodeHeight = 0;
  Nq.forEach((q) => {
    finalTotalNodeHeight += questionLinkCounts[q.id] * K * rQ;
  });
  const finalCurrent = finalTotalNodeHeight + (Nq.length - 1) * GapQ;
  return { rQ, GapQ };
}

function calculateNkParameters(Nk, skillLinkHeights, H) {
  let rK = 1.0;
  let GapK = 5.0;
  const target = H;
  const tolerance = 0.01 * H;

  for (let i = 0; i < 100; i++) {
    let totalNodeHeight = 0;
    Nk.forEach((k) => {
      totalNodeHeight += skillLinkHeights[k.id] * rK;
    });

    const current = totalNodeHeight + (Nk.length - 1) * GapK;
    if (Math.abs(current - target) < tolerance) break;

    const factor = target / current;
    rK *= factor;
    GapK *= factor;
  }

  // Verificar se ainda ultrapassa H
  let totalNodeHeight = 0;
  Nk.forEach((k) => {
    totalNodeHeight += skillLinkHeights[k.id] * rK;
  });

  const current = totalNodeHeight + (Nk.length - 1) * GapK;
  if (current > H) {
    const excess = current - H;
    const gapReduction = Math.min(excess, (Nk.length - 1) * GapK);

    if (gapReduction > 0) {
      GapK -= gapReduction / (Nk.length - 1);
    } else {
      const remainingExcess = excess - gapReduction;
      let totalLinkHeight = 0;
      Nk.forEach((k) => {
        totalLinkHeight += skillLinkHeights[k.id];
      });

      if (totalLinkHeight > 0) {
        rK -= remainingExcess / totalLinkHeight;
      }
      GapK = 0;
    }
  }

  return { rK, GapK };
}

function verifyAndAdjust(
  K,
  GapA,
  rQ,
  GapQ,
  rK,
  GapK,
  Na,
  Nq,
  Nk,
  questionLinkCounts,
  skillLinkHeights,
  H
) {
  // Verificar Nq
  let totalNqHeight = 0;
  Nq.forEach((q) => {
    totalNqHeight += questionLinkCounts[q.id] * K * rQ;
  });
  totalNqHeight += (Nq.length - 1) * GapQ;

  if (totalNqHeight > H) {
    const excess = totalNqHeight - H;
    const gapReduction = Math.min(excess, (Nq.length - 1) * GapQ);

    if (gapReduction > 0) {
      GapQ -= gapReduction / (Nq.length - 1);
    } else {
      const remainingExcess = excess - gapReduction;
      let totalLinks = 0;
      Nq.forEach((q) => {
        totalLinks += questionLinkCounts[q.id];
      });

      if (totalLinks > 0) {
        rQ -= remainingExcess / (totalLinks * K);
      }
      GapQ = 0;
    }
  }

  // Verificar Nk
  let totalNkHeight = 0;
  Nk.forEach((k) => {
    totalNkHeight += skillLinkHeights[k.id] * rK;
  });
  totalNkHeight += (Nk.length - 1) * GapK;

  if (totalNkHeight > H) {
    const excess = totalNkHeight - H;
    const gapReduction = Math.min(excess, (Nk.length - 1) * GapK);

    if (gapReduction > 0) {
      GapK -= gapReduction / (Nk.length - 1);
    } else {
      const remainingExcess = excess - gapReduction;
      let totalLinkHeight = 0;
      Nk.forEach((k) => {
        totalLinkHeight += skillLinkHeights[k.id];
      });

      if (totalLinkHeight > 0) {
        rK -= remainingExcess / totalLinkHeight;
      }
      GapK = 0;
    }
  }

  return { K, GapA, rQ, GapQ, rK, GapK };
}
