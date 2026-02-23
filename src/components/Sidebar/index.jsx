/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { VALUE_LABELS, LINK_COLORS } from "../Sankey/constants";

const Sidebar = ({
  apearingLinks,
  onApearingLinksChange,
  nodeOrderBy,
  onNodeOrderByChange,
  nodeOrder,
  onNodeOrderChange,
  orderLinks,
  onOrderLinksChange,
  onOpenModal,
}) => {
  const handleApearingLinksChange = (event) => {
    const { value } = event.target;
    onApearingLinksChange(typeof value === "string" ? value.split(",") : value);
  };

  return (
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
      {/* ── Legenda ── */}
      <Typography fontFamily="Poppins" variant="h6" gutterBottom>
        Legenda
      </Typography>
      <Box display="flex" flexDirection="column" mb={2}>
        {Object.entries(VALUE_LABELS).map(([value, label]) => (
          <Box key={value} display="flex" alignItems="center" gap={1}>
            <Box width={20} height={20} bgcolor={LINK_COLORS[value]} />
            <Typography fontFamily="Poppins" variant="body2">
              {label}
            </Typography>
          </Box>
        ))}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* ── Filtros ── */}
      <Typography fontFamily="Poppins" variant="h6" gutterBottom>
        Filtros
      </Typography>

      <FormControl fullWidth margin="dense">
        <InputLabel sx={{ fontFamily: "Poppins" }}>Filtrar por</InputLabel>
        <Select
          multiple
          value={apearingLinks}
          onChange={handleApearingLinksChange}
          renderValue={(selected) => selected.join(", ")}
        >
          {[1, 2, 3].map((link) => (
            <MenuItem key={link} value={link}>
              <Checkbox checked={apearingLinks.includes(link)} />
              <ListItemText primary={VALUE_LABELS[link]} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="dense">
        <InputLabel sx={{ fontFamily: "Poppins" }}>Ordenar por</InputLabel>
        <Select
          value={nodeOrderBy}
          onChange={(e) => onNodeOrderByChange(Number(e.target.value))}
        >
          <MenuItem value={1}>Qtd. Insuficientes</MenuItem>
          <MenuItem value={2}>Qtd. Parcialmente</MenuItem>
          <MenuItem value={3}>Qtd. Suficientes</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth margin="dense">
        <InputLabel sx={{ fontFamily: "Poppins" }}>Ordem</InputLabel>
        <Select
          value={nodeOrder}
          onChange={(e) => onNodeOrderChange(e.target.value)}
        >
          <MenuItem value="ascending">Crescente</MenuItem>
          <MenuItem value="descending">Decrescente</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth margin="dense">
        <InputLabel sx={{ fontFamily: "Poppins" }}>Destacar</InputLabel>
        <Select
          value={orderLinks}
          onChange={(e) => onOrderLinksChange(e.target.value)}
        >
          <MenuItem value={1}>Insuficientes</MenuItem>
          <MenuItem value={2}>Parcialmente</MenuItem>
          <MenuItem value={3}>Suficientes</MenuItem>
        </Select>
      </FormControl>

      <Button
        variant="outlined"
        fullWidth
        sx={{ mt: 2, fontFamily: "Poppins" }}
        onClick={onOpenModal}
      >
        Ajustar Dimensões
      </Button>
    </Box>
  );
};

export default Sidebar;
