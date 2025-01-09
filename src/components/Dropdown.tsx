import React from "react";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";

interface DropdownProps {
  pairs: string[];
  selectedPair: string;
  onChange: (pair: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({
  pairs,
  selectedPair,
  onChange,
}) => {
  return (
    <FormControl
      style={{
        width: "300px", // Ancho fijo
        margin: "10px auto", // Centrado horizontal y con margen superior/inferior
      }}
    >
      <InputLabel>Trading Pair</InputLabel>
      <Select
        value={selectedPair}
        onChange={(e) => onChange(e.target.value)}
        label="Trading Pair"
      >
        {pairs.map((pair) => (
          <MenuItem key={pair} value={pair}>
            {pair.toUpperCase()}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default Dropdown;
