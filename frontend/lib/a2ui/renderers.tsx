'use client';

import Link from 'next/link';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import {
  createCatalog,
  type CatalogRenderers,
} from '@copilotkit/a2ui-renderer';
import { catalogDefinitions, type BrillarCatalogDefinitions } from './definitions';
import { formatPrice, formatDate, capitalize } from '@/utils/format';
import { colors } from '@/theme/colors';

const productCardRenderer = ({
  props,
}: {
  props: {
    productId: string;
    name: string;
    price: number;
    imageUrl?: string;
    inStock: boolean;
    supplierName?: string;
    productUrl?: string;
  };
}) => {
  const href = props.productUrl || `/products/${props.productId}`;

  return (
    <Card
      sx={{
        borderRadius: '12px',
        border: `1px solid ${colors.divider}`,
        boxShadow: colors.cardShadow,
        overflow: 'hidden',
      }}
    >
      <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
        <CardMedia
          component="img"
          height="180"
          image={props.imageUrl || '/placeholder-product.svg'}
          alt={props.name}
          sx={{ objectFit: 'cover', bgcolor: 'grey.100' }}
        />
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }} gutterBottom>
            {props.name}
          </Typography>
          <Typography variant="h6" color="primary" sx={{ color: colors.orange }}>
            {formatPrice(props.price)}
          </Typography>
          {props.supplierName && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {props.supplierName}
            </Typography>
          )}
          <Chip
            size="small"
            label={props.inStock ? 'In stock' : 'Out of stock'}
            color={props.inStock ? 'success' : 'default'}
            sx={{ mt: 1 }}
          />
        </CardContent>
      </Link>
    </Card>
  );
};

const catalogRenderers: CatalogRenderers<BrillarCatalogDefinitions> = {
  ProductCard: productCardRenderer,
  ProductList: ({ props }) => (
    <Box>
      {props.title && (
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          {props.title}
        </Typography>
      )}
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
        }}
      >
        {props.products.map((product) => (
          <Box key={product.productId}>
            {productCardRenderer({ props: product })}
          </Box>
        ))}
      </Box>
    </Box>
  ),
  CartSummary: ({ props }) => (
    <Card sx={{ borderRadius: '12px', border: `1px solid ${colors.divider}` }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>
          {props.title || 'Your cart'}
        </Typography>
        <Stack spacing={1.5} divider={<Divider />}>
          {props.items.map((item, index) => (
            <Box key={`${item.name}-${index}`} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
              <Box>
                <Typography sx={{ fontWeight: 600 }}>{item.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Qty {item.quantity} x {formatPrice(item.unitPrice)}
                </Typography>
              </Box>
              <Typography sx={{ fontWeight: 600 }}>{formatPrice(item.lineTotal)}</Typography>
            </Box>
          ))}
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography color="text.secondary">{props.itemCount} items</Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {formatPrice(props.subtotal)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  ),
  OrderStatusCard: ({ props }) => {
    const href = props.orderUrl || '/orders';

    return (
      <Card sx={{ borderRadius: '12px', border: `1px solid ${colors.divider}` }}>
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="overline" color="text.secondary">
              Order
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {props.orderNumber}
            </Typography>
            <Chip label={capitalize(props.status)} size="small" color="primary" sx={{ alignSelf: 'flex-start' }} />
            <Typography variant="body2" color="text.secondary">
              Placed {formatDate(props.createdAt)}
            </Typography>
            {props.itemSummary && (
              <Typography variant="body2">{props.itemSummary}</Typography>
            )}
            <Typography variant="h6" sx={{ color: colors.orange }}>
              {formatPrice(props.total)}
            </Typography>
            <Link href={href} style={{ color: colors.orange, fontWeight: 600 }}>
              View order details
            </Link>
          </Stack>
        </CardContent>
      </Card>
    );
  },
  FaqItem: ({ props }) => (
    <Card sx={{ borderRadius: '12px', border: `1px solid ${colors.divider}`, mb: 1.5 }}>
      <CardContent>
        {props.category && (
          <Chip label={props.category} size="small" sx={{ mb: 1 }} />
        )}
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }} gutterBottom>
          {props.question}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {props.answer}
        </Typography>
      </CardContent>
    </Card>
  ),
};

export const brillarCatalog = createCatalog(catalogDefinitions, catalogRenderers, {
  catalogId: 'brillar-storefront',
  includeBasicCatalog: true,
});
