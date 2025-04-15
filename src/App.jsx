// IMPORTS (sem mudanças)
import React, { useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Sankey from "./components/Sankey";
import { generateDataset } from "./components/Sankey/hooks/utils";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";
import { Box, Button, Modal, Divider } from "@mui/material";

function calculateSankeyParameters({
  availableHeight,
  nodes,
  links,
  minLinkHeight,
}) {
  const A_nodes = nodes.A;
  const Q_nodes = nodes.Q;
  const K_nodes = nodes.K;

  const countA = A_nodes.length;
  const countQ = Q_nodes.length;
  const countK = K_nodes.length;

  const totalLinks = links.length;
  const avgLinkWeight = 0.5;

  const sumTargetLinksQ = Q_nodes.reduce(
    (sum, q) => sum + (q.targetLinks?.length || 0),
    0
  );
  const sumSourceLinksK = K_nodes.reduce(
    (sum, k) => sum + (k.sourceLinks?.length || 0),
    0
  );

  const densityA = countA / availableHeight;
  const densityQ = sumTargetLinksQ / availableHeight;
  const densityK = sumSourceLinksK / availableHeight;

  // Estimar K inicial
  let K;
  if (countA >= countQ && countA >= countK) {
    K = availableHeight / (3 * countA);
  } else {
    K = availableHeight / (totalLinks * avgLinkWeight);
  }

  // Redutor r_Q
  const maxLinksPerQ = Math.max(
    ...Q_nodes.map((q) => q.targetLinks?.length || 0)
  );
  const r_Q = 1 / (1 + Math.log(maxLinksPerQ || 1));

  // Redutor r_K
  const allKLinks = K_nodes.map((k) => k.sourceLinks?.length || 0);
  const sortedKLinks = [...allKLinks].sort((a, b) => a - b);
  const medianKLinks = sortedKLinks[Math.floor(sortedKLinks.length / 2)] || 1;
  const r_K = minLinkHeight / (medianKLinks * K);

  // Estimar altura total dos nós
  const totalNodeHeight = countA * K + countQ * K * r_Q + countK * K * r_K;

  const remainingSpace = availableHeight - totalNodeHeight;
  const totalNodes = countA + countQ + countK;
  const gap_base = remainingSpace / (totalNodes - 1);

  const avgDensity = (densityA + densityQ + densityK) / 3;

  const gap_A = gap_base * (densityA / avgDensity);
  const gap_Q = gap_base * (1 - r_Q);
  const gap_K = gap_base * (1 - r_K);

  // Restrição: garantir altura mínima dos links
  const minReducer = Math.min(r_Q, r_K);
  const minKRequired = minLinkHeight / (minReducer || 0.1);
  if (K < minKRequired) K = minKRequired;

  // Verificação de overflow
  let totalHeight =
    countA * K +
    countQ * K * r_Q +
    countK * K * r_K +
    (totalNodes - 1) * gap_base;
  if (totalHeight > availableHeight) {
    const overflow = totalHeight - availableHeight;
    K = K - overflow / (totalNodes * 3);
  }

  // Iteração até convergir (simplificada com 3 ciclos máx)
  for (let i = 0; i < 3; i++) {
    const r_K_new = minLinkHeight / (medianKLinks * K);
    const totalNodeHeightNew =
      countA * K + countQ * K * r_Q + countK * K * r_K_new;
    const K_new = K * ((0.95 * availableHeight) / totalNodeHeightNew);

    if (Math.abs(K_new - K) / K < 0.02) break;

    K = K_new;
  }

  return {
    K: Math.round(K),
    r_Q: +r_Q.toFixed(3),
    r_K: +r_K.toFixed(3),
    gap_A: Math.round(gap_A),
    gap_Q: Math.round(gap_Q),
    gap_K: Math.round(gap_K),
  };
}

const App = () => {
  // STATES (sem mudanças)
  const [nodes, setNodes] = React.useState([]);
  const [links, setLinks] = React.useState([]);
  const [width, setWidth] = React.useState(window.innerWidth - 300);
  const [height, setHeight] = React.useState(window.innerHeight - 100);

  const [k, setK] = React.useState(10);
  const [reductorK, setReductorK] = React.useState(2);
  const [reductorQ, setReductorQ] = React.useState(10);
  const [gapA, setGapA] = React.useState(20);
  const [gapQ, setGapQ] = React.useState(40);
  const [gapK, setGapK] = React.useState(60);

  const [apearingLinks, setApearingLinks] = React.useState([1, 2, 3]);
  const [nodeOrderBy, setNodeOrderBy] = React.useState(1);
  const [nodeOrder, setNodeOrder] = React.useState("ascending");
  const [orderLinks, setOrderLinks] = React.useState(3);

  const [openModal, setOpenModal] = React.useState(false);

  const [numA, setNumA] = React.useState(10);
  const [numQ, setNumQ] = React.useState(5);
  const [numK, setNumK] = React.useState(5);
  const [percentage1, setPercentage1] = React.useState(20);
  const [percentage2, setPercentage2] = React.useState(40);
  const [percentage3, setPercentage3] = React.useState(60);

  React.useEffect(() => {
    const { nodes, links } = generateDataset(
      numA,
      numQ,
      numK,
      percentage1,
      percentage2,
      percentage3
    );
    setNodes(nodes);
    setLinks(links);
  }, [numA, numQ, numK, percentage1, percentage2, percentage3]);

  // useEffect(() => {
  //   const { K, r_Q, r_K, gap_A, gap_Q, gap_K } = calculateSankeyParameters({
  //     availableHeight: 200,
  //     nodes: {
  //       A: nodes.filter((node) => node.id[0] === "A"),
  //       Q: nodes.filter((node) => node.id[0] === "Q"),
  //       K: nodes.filter((node) => node.id[0] === "K"),
  //     },
  //     links: links,
  //     minLinkHeight: 5,
  //   });

  //   console.log("K", K);
  //   console.log("r_Q", r_Q);
  //   console.log("r_K", r_K);
  //   console.log("gap_A", gap_A);
  //   console.log("gap_Q", gap_Q);
  //   console.log("gap_K", gap_K);

  //   setK(K);
  //   setReductorK(r_K);
  //   setReductorQ(r_Q);
  //   setGapA(gap_A);
  //   setGapQ(gap_Q);
  //   setGapK(gap_K);
  // }, [nodes, links, height]);

  const handleResize = () => {
    setWidth(window.innerWidth - 300);
    setHeight(window.innerHeight - 100);
  };

  React.useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleApearingLinksChange = (event) => {
    const {
      target: { value },
    } = event;
    setApearingLinks(typeof value === "string" ? value.split(",") : value);
  };

  const handleInputChange = (setter) => (e) => {
    const value = Number(e.target.value);
    if (value >= 0) setter(value);
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Sankey VIS
          </Typography>
          <Typography variant="body1">Version 1.0</Typography>
        </Toolbar>
      </AppBar>

      <Box display="flex" height="100%">
        {/* SIDEBAR */}
        <Box
          sx={{
            width: 280,
            bgcolor: "#f4f4f4",
            p: 2,
            borderRight: "1px solid #ddd",
            height: "100vh",
            overflowY: "auto",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Legenda
          </Typography>
          <Box display="flex" flexDirection="column" mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box width={20} height={20} bgcolor="#E07121" />
              <Typography variant="body2">Insuficiente</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box width={20} height={20} bgcolor="#916BD4" />
              <Typography variant="body2">Parcialmente Suficiente</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box width={20} height={20} bgcolor="#68E4C9" />
              <Typography variant="body2">Suficiente</Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Filtros
          </Typography>

          <FormControl fullWidth margin="dense">
            <InputLabel>Filtrar por</InputLabel>
            <Select
              multiple
              value={apearingLinks}
              onChange={handleApearingLinksChange}
              renderValue={(selected) => selected.join(", ")}
            >
              {[1, 2, 3].map((link) => (
                <MenuItem key={link} value={link}>
                  <Checkbox checked={apearingLinks.includes(link)} />
                  <ListItemText
                    primary={
                      link === 1
                        ? "Insuficiente"
                        : link === 2
                        ? "Parcialmente Suficiente"
                        : "Suficiente"
                    }
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense">
            <InputLabel>Ordenar por</InputLabel>
            <Select
              value={nodeOrderBy}
              onChange={(e) => setNodeOrderBy(Number(e.target.value))}
            >
              <MenuItem value={1}>Qtd. Insuficientes</MenuItem>
              <MenuItem value={2}>Qtd. Parcialmente</MenuItem>
              <MenuItem value={3}>Qtd. Suficientes</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense">
            <InputLabel>Ordem</InputLabel>
            <Select
              value={nodeOrder}
              onChange={(e) => setNodeOrder(e.target.value)}
            >
              <MenuItem value={"ascending"}>Crescente</MenuItem>
              <MenuItem value={"descending"}>Decrescente</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense">
            <InputLabel>Destacar</InputLabel>
            <Select
              value={orderLinks}
              onChange={(e) => setOrderLinks(e.target.value)}
            >
              <MenuItem value={1}>Insuficientes</MenuItem>
              <MenuItem value={2}>Parcialmente</MenuItem>
              <MenuItem value={3}>Suficientes</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => setOpenModal(true)}
          >
            Ajustar Dimensões
          </Button>
        </Box>
        {/* CONTEÚDO À DIREITA */}
        <Box flex={1} p={2}>
          <Typography variant="h5" gutterBottom>
            Avaliação de Matemática 2º Sobral
          </Typography>

          <Typography variant="subtitle2" gutterBottom>
            <strong>Relações:</strong> A - Alunos | Q - Questões | K -
            Habilidades
          </Typography>

          <Sankey
            width={width}
            height={height}
            nodes={nodes}
            links={links}
            k={k}
            reductorK={reductorK}
            reductorQ={reductorQ}
            gapA={gapA}
            gapQ={gapQ}
            gapK={gapK}
            apearingLinks={apearingLinks}
            nodeOrderBy={nodeOrderBy}
            nodeOrder={nodeOrder}
            orderingLinks={orderLinks}
          />
        </Box>
      </Box>

      {/* MODAL DE DIMENSÕES */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "white",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            minWidth: 400,
          }}
        >
          <Typography variant="h6">Ajustes de Dimensões</Typography>

          <TextField
            label="Altura A"
            type="number"
            value={k}
            onChange={handleInputChange(setK)}
          />
          <TextField
            label="Altura Q"
            type="number"
            value={reductorQ}
            onChange={handleInputChange(setReductorQ)}
          />
          <TextField
            label="Altura K"
            type="number"
            value={reductorK}
            onChange={handleInputChange(setReductorK)}
          />
          <TextField
            label="Espaçamento A"
            type="number"
            value={gapA}
            onChange={handleInputChange(setGapA)}
          />
          <TextField
            label="Espaçamento Q"
            type="number"
            value={gapQ}
            onChange={handleInputChange(setGapQ)}
          />
          <TextField
            label="Espaçamento K"
            type="number"
            value={gapK}
            onChange={handleInputChange(setGapK)}
          />

          <Button variant="contained" onClick={() => setOpenModal(false)}>
            Fechar
          </Button>
        </Box>
      </Modal>
    </>
  );
};

export default App;
