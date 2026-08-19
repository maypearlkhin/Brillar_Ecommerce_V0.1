'use client';

import { Box, Typography, alpha } from '@mui/material';
import { Check, LocalShippingOutlined, PaymentOutlined } from '@mui/icons-material';
import { colors } from '@/theme/colors';

export interface CheckoutStep {
  label: string;
  color: string;
}

interface CheckoutStepperProps {
  steps: CheckoutStep[];
  activeStep: number;
}

const stepIcons = [LocalShippingOutlined, PaymentOutlined];

export default function CheckoutStepper({ steps, activeStep }: CheckoutStepperProps) {
  return (
    <Box
      sx={{
        maxWidth: 720,
        mx: 'auto',
        mb: { xs: 3, md: 4 },
        px: { xs: 1, sm: 2 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}
      >
        {steps.map((step, index) => {
          const isCompleted = index < activeStep;
          const isActive = index === activeStep;
          const isUpcoming = index > activeStep;
          const StepIcon = stepIcons[index] ?? stepIcons[0];
          const isLast = index === steps.length - 1;
          const accentColor = isUpcoming ? colors.divider : step.color;

          return (
            <Box
              key={step.label}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                flex: isLast ? '0 0 auto' : 1,
                minWidth: 0,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: { xs: 88, sm: 128 },
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: { xs: 52, sm: 58 },
                    height: { xs: 52, sm: 58 },
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: isCompleted || isActive ? step.color : colors.white,
                    border: '2px solid',
                    borderColor: accentColor,
                    color: isCompleted || isActive ? colors.white : colors.textSecondary,
                    transition: 'all 0.3s ease',
                    boxShadow: isActive
                      ? `0 0 0 6px ${alpha(step.color, 0.14)}, 0 8px 20px ${alpha(step.color, 0.28)}`
                      : isCompleted
                        ? `0 4px 12px ${alpha(step.color, 0.22)}`
                        : 'none',
                  }}
                >
                  {isCompleted ? (
                    <Check sx={{ fontSize: { xs: 24, sm: 28 } }} />
                  ) : (
                    <StepIcon sx={{ fontSize: { xs: 22, sm: 24 }, opacity: isUpcoming ? 0.55 : 1 }} />
                  )}
                </Box>

                <Typography
                  variant="caption"
                  sx={{
                    mt: 1.5,
                    fontWeight: isActive ? 700 : 600,
                    color: isActive || isCompleted ? step.color : colors.textSecondary,
                    textAlign: 'center',
                    lineHeight: 1.35,
                    fontSize: { xs: '0.72rem', sm: '0.8rem' },
                    maxWidth: { xs: 88, sm: 128 },
                    letterSpacing: isActive ? '0.01em' : 0,
                  }}
                >
                  {step.label}
                </Typography>
              </Box>

              {!isLast && (
                <Box
                  sx={{
                    flex: 1,
                    mt: { xs: 2.6, sm: 2.9 },
                    mx: { xs: 0.75, sm: 1.25 },
                    height: 4,
                    borderRadius: 999,
                    bgcolor: colors.divider,
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      width: index < activeStep ? '100%' : '0%',
                      bgcolor: steps[index + 1]?.color || step.color,
                      borderRadius: 999,
                      transition: 'width 0.35s ease',
                    }}
                  />
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
