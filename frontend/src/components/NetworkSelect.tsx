import { getChainName, supportedChains } from '@/utils/chain';
import { FormControl, FormHelperText, InputLabel, MenuItem, Select, SelectProps } from '@mui/material';
import { useId } from 'react';

export const NetworkSelect = ({ helperText, ...props }: SelectProps & { helperText?: string }) => {
  const id = useId();

  return (
    <FormControl>
      <InputLabel id={id}>Network</InputLabel>

      <Select {...props} labelId={id}>
        {supportedChains.map((chainId) => (
          <MenuItem key={chainId} value={chainId}>
            {getChainName(chainId)}
          </MenuItem>
        ))}
      </Select>

      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};
