import { Box, Typography } from '@mui/material';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
}

export default function SectionHeading({ eyebrow, title, subtitle, align = 'left' }: SectionHeadingProps) {
  return (
    <Box sx={{ textAlign: align, mb: 4 }}>
      {eyebrow && (
        <Typography
          variant="overline"
          sx={{ color: 'primary.main', letterSpacing: '0.12em', display: 'block', mb: 1, fontSize: '0.7rem', fontWeight: 600 }}
        >
          {eyebrow}
        </Typography>
      )}
      <Typography variant="h4" color="primary.main" sx={{ mb: subtitle ? 1 : 0, fontSize: { xs: '1.35rem', md: '1.6rem' } }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520, mx: align === 'center' ? 'auto' : 0 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}
