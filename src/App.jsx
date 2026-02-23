import { useEffect, useState, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { AccountTree } from "@mui/icons-material";

import Sankey from "./components/Sankey";
import Sidebar from "./components/Sidebar";
import DimensionsModal from "./components/DimensionsModal";
import { generateDataset } from "./components/Sankey/utils/dataGenerator";
import { calculateLayoutParameters } from "./components/Sankey/hooks/calculateLayoutParameters";

// ── Configuração do dataset ──
const DATASET_CONFIG = {
  numA: 10,
  numQ: 10,
  numK: 10,
  percentage1: 20,
  percentage2: 40,
  percentage3: 60,
};

const INITIAL_LAYOUT = {
  k: 10,
  reductorK: 2,
  reductorQ: 10,
  gapA: 20,
  gapQ: 40,
  gapK: 60,
};

const App = () => {
  // ── Data state ──
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);

  // ── Layout state ──
  const [dimensions, setDimensions] = useState(INITIAL_LAYOUT);
  const [width, setWidth] = useState(window.innerWidth - 300);
  const [height, setHeight] = useState(window.innerHeight - 100);

  // ── Filter state ──
  const [apearingLinks, setApearingLinks] = useState([1, 2, 3]);
  const [nodeOrderBy, setNodeOrderBy] = useState(1);
  const [nodeOrder, setNodeOrder] = useState("ascending");
  const [orderLinks, setOrderLinks] = useState(3);

  // ── UI state ──
  const [openModal, setOpenModal] = useState(false);

  // ── Gerar dataset ──
  useEffect(() => {
    const { numA, numQ, numK, percentage1, percentage2, percentage3 } =
      DATASET_CONFIG;
    const { nodes, links } = generateDataset(
      numA,
      numQ,
      numK,
      percentage1,
      percentage2,
      percentage3,
    );
    setNodes(nodes);
    setLinks(links);
  }, []);

  // ── Calcular layout automaticamente ──
  useEffect(() => {
    if (nodes.length === 0 || links.length === 0) return;

    // eslint-disable-next-line no-unused-vars
    const { K, GapA, rQ, GapQ, rK, GapK } = calculateLayoutParameters(
      nodes,
      links,
      500,
    );

    if (K > 0 && rK > 0 && rQ > 0 && GapA > 0) {
      setDimensions((prev) => ({
        k: K,
        reductorK: rK,
        reductorQ: rQ,
        gapA: GapA,
        gapQ: prev.gapA * rQ * 2,
        gapK: prev.gapK * rK * 2,
      }));
    }
  }, [nodes, links, height]);

  // ── Resize listener ──
  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth - 300);
      setHeight(window.innerHeight - 100);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── Handlers ──
  const handleDimensionChange = useCallback((key, value) => {
    setDimensions((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <>
      {/* ── Header ── */}
      <AppBar position="static">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AccountTree />
            <Typography
              fontFamily="Poppins"
              fontWeight={600}
              variant="h5"
              sx={{ flexGrow: 1 }}
            >
              Sankey Chart
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Box display="flex" height="100%">
        {/* ── Sidebar ── */}
        <Sidebar
          apearingLinks={apearingLinks}
          onApearingLinksChange={setApearingLinks}
          nodeOrderBy={nodeOrderBy}
          onNodeOrderByChange={setNodeOrderBy}
          nodeOrder={nodeOrder}
          onNodeOrderChange={setNodeOrder}
          orderLinks={orderLinks}
          onOrderLinksChange={setOrderLinks}
          onOpenModal={() => setOpenModal(true)}
        />

        {/* ── Chart ── */}
        <Box flex={1} p={2}>
          <Typography fontFamily="Poppins" variant="h5" gutterBottom>
            Avaliação de Matemática 2º Sobral
          </Typography>

          <Typography fontFamily="Poppins" variant="subtitle2" gutterBottom>
            <strong>Relações:</strong> A - Alunos | Q - Questões | K -
            Habilidades
          </Typography>

          <Sankey
            width={width}
            height={height}
            nodes={nodes}
            links={links}
            k={dimensions.k}
            reductorK={dimensions.reductorK}
            reductorQ={dimensions.reductorQ}
            gapA={dimensions.gapA}
            gapQ={dimensions.gapQ}
            gapK={dimensions.gapK}
            apearingLinks={apearingLinks}
            nodeOrderBy={nodeOrderBy}
            nodeOrder={nodeOrder}
            orderingLinks={orderLinks}
          />
        </Box>
      </Box>

      {/* ── Modal ── */}
      <DimensionsModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        values={dimensions}
        onValueChange={handleDimensionChange}
      />
    </>
  );
};

export default App;
