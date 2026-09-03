'use client';

import { Typography } from '@mui/material';
import { useCopilotChatConfiguration } from '@copilotkit/react-core/v2';
import { colors } from '@/theme/colors';

export default function AiModeWelcomeBrand() {
  const labels = useCopilotChatConfiguration()?.labels;
  const welcomeText = labels?.welcomeMessageText ?? 'Ready when you are.';

  return (
    <Typography
      component="h1"
      className="ai-mode-welcome-brand"
      sx={{
        mb: 3,
        textAlign: 'center',
        fontSize: { xs: '1.35rem', sm: '1.5rem' },
        fontWeight: 500,
        letterSpacing: '-0.02em',
        color: colors.charcoalDark,
      }}
    >
      {welcomeText}
    </Typography>
  );
}
