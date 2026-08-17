'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Paper,
  alpha,
} from '@mui/material';
import {
  ExpandMore,
  HelpOutlineOutlined,
  ShoppingBagOutlined,
  CreditCardOutlined,
  StorefrontOutlined,
  ReplayOutlined,
  PersonOutlined,
} from '@mui/icons-material';
import { faqService } from '@/services/supplier.service';
import { FAQ } from '@/types';
import LoadingState from '@/components/common/LoadingState';
import SectionHeading from '@/components/storefront/home/SectionHeading';
import { colors } from '@/theme/colors';

const categoryMeta: Record<string, { icon: React.ReactNode; color: string }> = {
  Orders: { icon: <ShoppingBagOutlined fontSize="small" />, color: '#F49121' },
  Payments: { icon: <CreditCardOutlined fontSize="small" />, color: '#2E7D6F' },
  Suppliers: { icon: <StorefrontOutlined fontSize="small" />, color: '#5C6BC0' },
  Returns: { icon: <ReplayOutlined fontSize="small" />, color: '#C62828' },
  Account: { icon: <PersonOutlined fontSize="small" />, color: '#6A4C93' },
};

function getCategoryMeta(category: string) {
  return categoryMeta[category] ?? { icon: <HelpOutlineOutlined fontSize="small" />, color: colors.orange };
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    faqService.getPublicFAQs().then(setFaqs).finally(() => setLoading(false));
  }, []);

  const grouped = faqs.reduce<Record<string, FAQ[]>>((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = [];
    acc[faq.category].push(faq);
    return acc;
  }, {});

  return (
    <Box sx={{ bgcolor: colors.cream, minHeight: '100%' }}>
      {/* Hero */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderBottom: `1px solid ${colors.divider}`,
          bgcolor: colors.white,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -60,
            right: -40,
            width: 220,
            height: 220,
            borderRadius: '50%',
            bgcolor: alpha(colors.orange, 0.08),
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -80,
            left: -50,
            width: 260,
            height: 260,
            borderRadius: '50%',
            bgcolor: alpha(colors.orange, 0.05),
            pointerEvents: 'none',
          }}
        />
        <Container maxWidth="md" sx={{ position: 'relative', py: { xs: 5, md: 6 } }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '14px',
                bgcolor: alpha(colors.orange, 0.12),
                color: colors.orange,
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: `0 4px 14px ${colors.orangeShadowSoft}`,
              }}
            >
              <HelpOutlineOutlined sx={{ fontSize: 28 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <SectionHeading
                eyebrow="Help Center"
                title="Frequently Asked Questions"
                subtitle="Find answers to common questions about shopping, orders, and selling on Brillar Market."
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* FAQ content */}
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 5 } }}>
        {loading ? (
          <LoadingState />
        ) : Object.keys(grouped).length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 5,
              textAlign: 'center',
              borderRadius: '12px',
              border: `1px solid ${colors.divider}`,
              boxShadow: colors.cardShadow,
            }}
          >
            <HelpOutlineOutlined sx={{ fontSize: 48, color: alpha(colors.orange, 0.5), mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>No FAQs available yet</Typography>
            <Typography color="text.secondary">Check back soon for helpful answers.</Typography>
          </Paper>
        ) : (
          Object.entries(grouped).map(([category, items]) => {
            const meta = getCategoryMeta(category);
            return (
              <Box key={category} sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '10px',
                      bgcolor: alpha(meta.color, 0.12),
                      color: meta.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {meta.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: colors.charcoal, fontSize: '1.05rem' }}
                  >
                    {category}
                  </Typography>
                  <Box
                    sx={{
                      flex: 1,
                      height: 1,
                      bgcolor: colors.divider,
                      ml: 0.5,
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.textSecondary,
                      fontWeight: 600,
                      bgcolor: alpha(meta.color, 0.08),
                      px: 1.25,
                      py: 0.35,
                      borderRadius: '20px',
                    }}
                  >
                    {items.length} {items.length === 1 ? 'question' : 'questions'}
                  </Typography>
                </Box>

                {items.map((faq) => (
                  <Accordion
                    key={faq._id}
                    disableGutters
                    elevation={0}
                    sx={{
                      border: `1px solid ${colors.divider}`,
                      borderRadius: '12px !important',
                      mb: 1.25,
                      overflow: 'hidden',
                      bgcolor: colors.white,
                      boxShadow: colors.cardShadow,
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                      '&:before': { display: 'none' },
                      '&:hover': {
                        borderColor: alpha(meta.color, 0.35),
                        boxShadow: colors.cardShadowHover,
                      },
                      '&.Mui-expanded': {
                        borderColor: alpha(meta.color, 0.45),
                        boxShadow: colors.cardShadowHover,
                        m: 0,
                        mb: 1.25,
                      },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={
                        <ExpandMore sx={{ color: meta.color, transition: 'transform 0.2s ease' }} />
                      }
                      sx={{
                        px: 2.5,
                        py: 0.5,
                        minHeight: 56,
                        '& .MuiAccordionSummary-content': { my: 1.25 },
                        '&.Mui-expanded': {
                          borderBottom: `1px solid ${alpha(meta.color, 0.15)}`,
                          bgcolor: alpha(meta.color, 0.04),
                        },
                      }}
                    >
                      <Typography sx={{ fontWeight: 600, color: colors.charcoal, pr: 1 }}>
                        {faq.question}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 2.5, py: 2, bgcolor: colors.white }}>
                      <Typography
                        color="text.secondary"
                        sx={{ lineHeight: 1.75, fontSize: '0.95rem' }}
                      >
                        {faq.answer}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            );
          })
        )}
      </Container>
    </Box>
  );
}
