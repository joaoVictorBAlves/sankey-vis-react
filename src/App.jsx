import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Sankey from './components/Sankey';
import { generateDataset } from './components/Sankey/hooks/utils';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import { Box } from '@mui/material';

const App = () => {
  const [nodes, setNodes] = React.useState([]);
  const [links, setLinks] = React.useState([]);
  const [width, setWidth] = React.useState(window.innerWidth - 60);
  const [height, setHeight] = React.useState(window.innerHeight - 20);

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

  const [numA, setNumA] = React.useState(10);
  const [numQ, setNumQ] = React.useState(5);
  const [numK, setNumK] = React.useState(5);
  const [percentage1, setPercentage1] = React.useState(20);
  const [percentage2, setPercentage2] = React.useState(40);
  const [percentage3, setPercentage3] = React.useState(60);


  const handleResize = () => {
    setWidth(window.innerWidth - 35);
    setHeight(window.innerHeight - 20);
  };

  React.useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  React.useEffect(() => {
    const { nodes, links } = generateDataset(numA, numQ, numK, percentage1, percentage2, percentage3);
    setNodes(nodes);
    setLinks(links);
  }, [numA, numQ, numK, percentage1, percentage2, percentage3]);

  const handleApearingLinksChange = (event) => {
    const { target: { value } } = event;
    setApearingLinks(typeof value === 'string' ? value.split(',') : value);
  };

  const handleInputChange = (setter) => (e) => {
    const value = Number(e.target.value);
    if (value >= 0) {
      setter(value);
    }
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Sankey VIS
          </Typography>
          <Typography variant="body1" component="div">
            Version 1.0
          </Typography>
        </Toolbar>
      </AppBar>
      <Container width={"100%"} sx={{ mx: 0 }}>
        <Typography variant="h5" component="h1" style={{ marginTop: '20px' }}>Sankey Diagram</Typography>

        <Box
          style={{
            marginBottom: "20px",
            marginTop: "30px",
            display: "flex",
            justifyContent: "start",
            width,
            gap: 12,
          }}
        >
          <TextField
            label="Num A"
            type="number"
            value={numA}
            onChange={handleInputChange(setNumA)}
            sx={{ height: 30 }}
            InputProps={{ sx: { height: 30 } }}
          />
          <TextField
            label="Num Q"
            type="number"
            value={numQ}
            onChange={handleInputChange(setNumQ)}
            sx={{ height: 30 }}
            InputProps={{ sx: { height: 30 } }}
          />
          <TextField
            label="Num K"
            type="number"
            value={numK}
            onChange={handleInputChange(setNumK)}
            sx={{ height: 30 }}
            InputProps={{ sx: { height: 30 } }}
          />
          <TextField
            label="% Insuficiente"
            type="number"
            value={percentage1}
            onChange={handleInputChange(setPercentage1)}
            sx={{ height: 30 }}
            InputProps={{ sx: { height: 30 } }}
          />
          <TextField
            label="% Parcialmente Suficiente"
            type="number"
            value={percentage2}
            onChange={handleInputChange(setPercentage2)}
            sx={{ height: 30 }}
            InputProps={{ sx: { height: 30 } }}
          />
          <TextField
            label="% Suficiente"
            type="number"
            value={percentage3}
            onChange={handleInputChange(setPercentage3)}
            sx={{ height: 30 }}
            InputProps={{ sx: { height: 30 } }}
          />
        </Box>
        <Box
          style={{
            marginBottom: "20px",
            marginTop: "30px",
            display: "flex",
            justifyContent: "start",
            width,
            gap: 12,
          }}
        >
          <TextField
            label="Height A"
            type="number"
            value={k}
            onChange={handleInputChange(setK)}
            sx={{ height: 30 }}
            InputProps={{ sx: { height: 30 } }}
          />
          <TextField
            label="Height Q"
            type="number"
            value={reductorQ}
            onChange={handleInputChange(setReductorQ)}
            sx={{ height: 30 }}
            InputProps={{ sx: { height: 30 } }}
          />
          <TextField
            label="Height K"
            type="number"
            value={reductorK}
            onChange={handleInputChange(setReductorK)}
            sx={{ height: 30 }}
            InputProps={{ sx: { height: 30 } }}
          />
          
          <TextField
            label="Gap A"
            type="number"
            value={gapA}
            onChange={handleInputChange(setGapA)}
            sx={{ height: 30 }}
            InputProps={{ sx: { height: 30 } }}
          />
          <TextField
            label="Gap Q"
            type="number"
            value={gapQ}
            onChange={handleInputChange(setGapQ)}
            sx={{ height: 30 }}
            InputProps={{ sx: { height: 30 } }}
          />
          <TextField
            label="Gap K"
            type="number"
            value={gapK}
            onChange={handleInputChange(setGapK)}
            sx={{ height: 30 }}
            InputProps={{ sx: { height: 30 } }}
          />
        </Box>
        <Box
          style={{
            marginBottom: "20px",
            marginTop: "30px",
            display: "flex",
            justifyContent: "start",
            width,
            gap: 12,
          }}
        >
          <FormControl style={{ minWidth: "200px", height: 30 }}>
            <InputLabel>Filtrar</InputLabel>
            <Select
              multiple
              value={apearingLinks}
              onChange={handleApearingLinksChange}
              renderValue={(selected) => selected.join(", ")}
              sx={{ height: 30 }}
            >
              {[1, 2, 3].map((link) => (
                <MenuItem key={link} value={link}>
                  <Checkbox checked={apearingLinks.indexOf(link) > -1} />
                  <ListItemText primary={link === 1 ? "Insuficiente" : link === 2 ? "Parcialmente Suficiente" : "Suficiente"} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ height: 30 }}>
            <InputLabel>Ordenar por</InputLabel>
            <Select
              value={nodeOrderBy}
              onChange={(e) => setNodeOrderBy(Number(e.target.value))}
              sx={{ height: 30 }}
            >
              <MenuItem value={1}>Quantidade de Insuficientes</MenuItem>
              <MenuItem value={2}>Quantidade de Parcialmente Suficientes</MenuItem>
              <MenuItem value={3}>Quantidade de Suficientes</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ height: 30 }}>
            <InputLabel>Ordem</InputLabel>
            <Select
              value={nodeOrder}
              onChange={(e) => setNodeOrder(e.target.value)}
              sx={{ height: 30 }}
            >
              <MenuItem value={"ascending"}>Crecente</MenuItem>
              <MenuItem value={"descending"}>Decrescente</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ height: 30 }}>
            <InputLabel>Destacar</InputLabel>
            <Select
              value={orderLinks}
              onChange={(e) => setOrderLinks(e.target.value)}
              sx={{ height: 30 }}
            >
              <MenuItem value={1}>Insuficientes</MenuItem>
              <MenuItem value={2}>Parcialmente Suficientes</MenuItem>
              <MenuItem value={3}>Suficientes</MenuItem>
            </Select>
          </FormControl>
        </Box>
      


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
        />
      </Container>
    </div>
  );
}

export default App;