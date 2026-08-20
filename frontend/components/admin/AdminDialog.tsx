'use client';

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogProps,
  DialogTitleProps,
  DialogContentProps,
  DialogActionsProps,
  SxProps,
  Theme,
} from '@mui/material';
import {
  adminDialogActionsSx,
  adminDialogContentSx,
  adminDialogPaperSx,
  adminDialogSlotProps,
  adminDialogTitleSx,
} from './adminDialogStyles';

export function AdminDialog({ slotProps, ...props }: DialogProps) {
  const paperSlotSx = (slotProps?.paper as { sx?: SxProps<Theme> } | undefined)?.sx;
  const paperSx = (
    paperSlotSx ? [adminDialogPaperSx, paperSlotSx] : adminDialogPaperSx
  ) as SxProps<Theme>;

  return (
    <Dialog
      slotProps={{
        ...slotProps,
        paper: {
          ...adminDialogSlotProps.paper,
          ...slotProps?.paper,
          sx: paperSx,
        },
      }}
      {...props}
    />
  );
}

export function AdminDialogTitle({ sx, ...props }: DialogTitleProps) {
  return <DialogTitle sx={[adminDialogTitleSx, ...(Array.isArray(sx) ? sx : [sx])]} {...props} />;
}

export function AdminDialogContent({ sx, ...props }: DialogContentProps) {
  return <DialogContent sx={[adminDialogContentSx, ...(Array.isArray(sx) ? sx : [sx])]} {...props} />;
}

export function AdminDialogActions({ sx, ...props }: DialogActionsProps) {
  return <DialogActions sx={[adminDialogActionsSx, ...(Array.isArray(sx) ? sx : [sx])]} {...props} />;
}
