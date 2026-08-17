'use client';

import { useRef, useState } from 'react';
import { Box, Button, IconButton, Typography, CircularProgress } from '@mui/material';
import { CloudUploadOutlined, Close, Star } from '@mui/icons-material';
import { colors } from '@/theme/colors';
import { supplierService } from '@/services/supplier.service';
import { getErrorMessage } from '@/services/api';

interface ProductImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
}

export default function ProductImageUpload({ value, onChange, disabled }: ProductImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length || disabled) return;
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (!imageFiles.length) {
      setError('Please choose image files only (JPG, PNG, WEBP, GIF).');
      return;
    }
    if (value.length + imageFiles.length > 8) {
      setError('You can upload up to 8 images per product.');
      return;
    }

    try {
      setUploading(true);
      setError('');
      const urls = await supplierService.uploadProductImages(imageFiles);
      onChange([...value, ...urls]);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const setAsMain = (index: number) => {
    if (index === 0) return;
    const next = [...value];
    const [selected] = next.splice(index, 1);
    next.unshift(selected);
    onChange(next);
  };

  return (
    <Box>
      <Box
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled && !uploading) handleFiles(e.dataTransfer.files);
        }}
        sx={{
          border: `2px dashed ${colors.divider}`,
          borderRadius: '12px',
          p: 3,
          textAlign: 'center',
          cursor: disabled || uploading ? 'default' : 'pointer',
          bgcolor: 'grey.50',
          transition: 'border-color 0.2s ease, background-color 0.2s ease',
          '&:hover': disabled || uploading ? undefined : {
            borderColor: colors.orange,
            bgcolor: 'rgba(244, 145, 33, 0.04)',
          },
        }}
      >
        {uploading ? (
          <CircularProgress size={28} sx={{ color: colors.orange }} />
        ) : (
          <CloudUploadOutlined sx={{ fontSize: 36, color: colors.orange, mb: 1 }} />
        )}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
          Upload product images
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Drag and drop images here, or click to browse
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          JPG, PNG, WEBP, GIF · Max 5MB each · Up to 8 images · First image is the main photo
        </Typography>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          hidden
          disabled={disabled || uploading}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </Box>

      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
          {error}
        </Typography>
      )}

      {value.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 2 }}>
          {value.map((url, index) => (
            <Box
              key={`${url}-${index}`}
              sx={{
                position: 'relative',
                width: 96,
                height: 96,
                borderRadius: '10px',
                overflow: 'hidden',
                border: `1px solid ${index === 0 ? colors.orange : colors.divider}`,
                boxShadow: index === 0 ? `0 0 0 1px ${colors.orange}` : undefined,
              }}
            >
              <Box
                component="img"
                src={url}
                alt={`Product image ${index + 1}`}
                sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              {index === 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 6,
                    left: 6,
                    bgcolor: colors.orange,
                    color: colors.white,
                    px: 0.75,
                    py: 0.25,
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.25,
                  }}
                >
                  <Star sx={{ fontSize: 12 }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.65rem' }}>
                    Main
                  </Typography>
                </Box>
              )}
              {!disabled && (
                <>
                  {index > 0 && (
                    <Button
                      size="small"
                      onClick={() => setAsMain(index)}
                      sx={{
                        position: 'absolute',
                        bottom: 4,
                        left: 4,
                        minWidth: 0,
                        px: 0.75,
                        py: 0.25,
                        fontSize: '0.65rem',
                        borderRadius: '6px',
                        bgcolor: 'rgba(255,255,255,0.92)',
                      }}
                    >
                      Set main
                    </Button>
                  )}
                  <IconButton
                    size="small"
                    onClick={() => removeAt(index)}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      bgcolor: 'rgba(255,255,255,0.92)',
                      '&:hover': { bgcolor: colors.white },
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
