'use client';

import { useEffect } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import BabyLoginForm from '@/components/assistant/baby-auth/BabyLoginForm';
import BabySignupForm from '@/components/assistant/baby-auth/BabySignupForm';
import { useAiModeAuthUi, type AiModeAuthMode } from '@/contexts/AiModeAuthUiContext';
import { colors } from '@/theme/colors';

type BabyAuthCardProps = {
  mode: AiModeAuthMode;
  title?: string;
  message?: string;
};

const cardSx = {
  maxWidth: 360,
  width: '100%',
  mx: 'auto',
  borderRadius: '12px',
  border: `1px solid ${colors.divider}`,
  boxShadow: colors.cardShadow,
};

export default function BabyAuthCard({ mode, title, message }: BabyAuthCardProps) {
  const { authMode, setAuthMode } = useAiModeAuthUi();

  useEffect(() => {
    setAuthMode(mode);
  }, [mode, setAuthMode]);

  const isLogin = authMode === 'login';
  return (
    <Card sx={cardSx}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
          {title ?? (isLogin ? 'Sign In' : 'Create Account')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          {message ??
            (isLogin
              ? 'Welcome back to Brillar Market'
              : 'Join Brillar Market to start shopping')}
        </Typography>
        {isLogin ? <BabyLoginForm /> : <BabySignupForm />}
      </CardContent>
    </Card>
  );
}
