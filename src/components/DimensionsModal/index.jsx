import { Box, Button, Modal, TextField, Typography } from "@mui/material";

const FIELDS = [
  { label: "Altura A", key: "k" },
  { label: "Altura Q", key: "reductorQ" },
  { label: "Altura K", key: "reductorK" },
  { label: "Espaçamento A", key: "gapA" },
  { label: "Espaçamento Q", key: "gapQ" },
  { label: "Espaçamento K", key: "gapK" },
];

// eslint-disable-next-line react/prop-types
const DimensionsModal = ({ open, onClose, values, onValueChange }) => {
  const handleChange = (key) => (e) => {
    const value = Number(e.target.value);
    if (value >= 0) onValueChange(key, value);
  };

  return (
    <Modal open={open} onClose={onClose}>
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

        {FIELDS.map(({ label, key }) => (
          <TextField
            key={key}
            label={label}
            type="number"
            inputProps={{ step: "any" }}
            value={values[key]}
            onChange={handleChange(key)}
          />
        ))}

        <Button variant="contained" onClick={onClose}>
          Fechar
        </Button>
      </Box>
    </Modal>
  );
};

export default DimensionsModal;
