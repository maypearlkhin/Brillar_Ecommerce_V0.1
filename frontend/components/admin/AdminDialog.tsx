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
} from '@mui/material';
import {
  adminDialogActionsSx,
  adminDialogContentSx,
  adminDialogSlotProps,
  adminDialogTitleSx,
} from './adminDialogStyles';

export function AdminDialog({ slotProps, ...props }: DialogProps) {
  return (
    <Dialog
      slotProps={{
        ...slotProps,
        paper: {
          ...adminDialogSlotProps.paper,
          ...slotProps?.paper,
          sx: [adminDialogSlotProps.paper.sx, (slotProps?.paper as { sx?: object })?.sx],
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
