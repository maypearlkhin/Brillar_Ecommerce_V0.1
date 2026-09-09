'use client';

import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import {
  createCatalog,
  type CatalogRenderers,
} from '@copilotkit/a2ui-renderer';
import {
  catalogDefinitions,
  type A2UIActionPayload,
  type BrillarCatalogDefinitions,
} from './definitions';
import CheckoutFormCard from './CheckoutFormCard';
import BabyAuthCard from '@/components/assistant/baby-auth/BabyAuthCard';
import { formatPrice, formatDate, capitalize } from '@/utils/format';
import { colors } from '@/theme/colors';

function dispatchAction(
  dispatch: ((action: A2UIActionPayload) => void) | undefined,
  name: string,
  context?: Record<string, unknown>,
) {
  dispatch?.({ event: { name, context: context ?? {} } });
}

const cardSx = {
  borderRadius: '12px',
  border: `1px solid ${colors.divider}`,
  boxShadow: colors.cardShadow,
  overflow: 'hidden',
};

const productListActionButtonSx = {
  flex: 1,
  minWidth: 0,
  borderRadius: '8px',
};

const productListImageSx = {
  position: 'relative',
  width: '100%',
  aspectRatio: '4 / 3',
  overflow: 'hidden',
  bgcolor: 'grey.100',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
};

const catalogRenderers: CatalogRenderers<BrillarCatalogDefinitions> = {
  ProductList: ({ props, dispatch }) => (
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
          <Card key={product.productId} sx={cardSx}>
            <Box sx={productListImageSx}>
              <CardMedia
                component="img"
                image={product.imageUrl || '/placeholder-product.svg'}
                alt={product.name}
              />
            </Box>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }} gutterBottom>
                {product.name}
              </Typography>
              <Typography variant="h6" sx={{ color: colors.orange }}>
                {formatPrice(product.price)}
              </Typography>
              {product.supplierName && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {product.supplierName}
                </Typography>
              )}
              <Chip
                size="small"
                label={product.inStock ? 'In stock' : 'Out of stock'}
                color={product.inStock ? 'success' : 'default'}
                sx={{ mt: 1, mb: 1.5 }}
              />
              <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() =>
                    dispatchAction(dispatch, 'view_product', { productId: product.productId })
                  }
                  sx={productListActionButtonSx}
                >
                  View details
                </Button>
                {product.inStock && (
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() =>
                      dispatchAction(dispatch, 'add_to_cart', { productId: product.productId })
                    }
                    sx={{
                      ...productListActionButtonSx,
                      bgcolor: colors.orange,
                      '&:hover': { bgcolor: colors.orangeDark },
                    }}
                  >
                    Add to cart
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  ),

  ProductDetailCard: ({ props, dispatch }) => (
    <Card sx={{ ...cardSx, maxWidth: 360, width: '100%', mx: 'auto' }}>
      <Box sx={productListImageSx}>
        <CardMedia
          component="img"
          image={props.imageUrl || '/placeholder-product.svg'}
          alt={props.name}
        />
      </Box>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }} gutterBottom>
          {props.name}
        </Typography>
        <Typography variant="h6" sx={{ color: colors.orange, mb: 1 }}>
          {formatPrice(props.price)}
        </Typography>
        {props.supplierName && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1 }}>
            {props.supplierName}
          </Typography>
        )}
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', alignItems: 'center', mb: 1.5 }}>
          {props.category && <Chip label={props.category} size="small" />}
          <Chip
            size="small"
            label={props.inStock ? 'In stock' : 'Out of stock'}
            color={props.inStock ? 'success' : 'default'}
          />
        </Stack>
        {props.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {props.description}
          </Typography>
        )}
        {props.inStock && (
          <Button
            fullWidth
            size="small"
            variant="contained"
            onClick={() =>
              dispatchAction(dispatch, 'add_to_cart', { productId: props.productId })
            }
            sx={{
              ...productListActionButtonSx,
              flex: 'unset',
              bgcolor: colors.orange,
              '&:hover': { bgcolor: colors.orangeDark },
            }}
          >
            Add to cart
          </Button>
        )}
      </CardContent>
    </Card>
  ),

  CartSummary: ({ props, dispatch }) => (
    <Card sx={cardSx}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>
          {props.title || 'Your cart'}
        </Typography>
        <Stack spacing={1.5} divider={<Divider />}>
          {props.items.map((item) => (
            <Box
              key={item.productId}
              sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}
            >
              {item.imageUrl && (
                <Box
                  component="img"
                  src={item.imageUrl}
                  alt={item.name}
                  sx={{ width: 56, height: 56, borderRadius: 1, objectFit: 'cover' }}
                />
              )}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600 }}>{item.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatPrice(item.unitPrice)} each
                </Typography>
                <Stack direction="row" spacing={0.5} sx={{ mt: 1, alignItems: 'center' }}>
                  <IconButton
                    size="small"
                    aria-label="Decrease quantity"
                    onClick={() =>
                      dispatchAction(dispatch, 'update_cart_quantity', {
                        productId: item.productId,
                        quantity: Math.max(1, item.quantity - 1),
                      })
                    }
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <Typography variant="body2">{item.quantity}</Typography>
                  <IconButton
                    size="small"
                    aria-label="Increase quantity"
                    onClick={() =>
                      dispatchAction(dispatch, 'update_cart_quantity', {
                        productId: item.productId,
                        quantity: item.quantity + 1,
                      })
                    }
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                  <Button
                    size="small"
                    color="error"
                    onClick={() =>
                      dispatchAction(dispatch, 'remove_from_cart', {
                        productId: item.productId,
                      })
                    }
                    sx={{ ml: 1 }}
                  >
                    Remove
                  </Button>
                </Stack>
              </Box>
              <Typography sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                {formatPrice(item.lineTotal)}
              </Typography>
            </Box>
          ))}
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography color="text.secondary">{props.itemCount} items</Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {formatPrice(props.subtotal)}
          </Typography>
        </Box>
        {(props.showCheckout ?? true) && (
          <Button
            variant="contained"
            fullWidth
            onClick={() => dispatchAction(dispatch, 'proceed_to_checkout')}
            sx={{ bgcolor: colors.orange, '&:hover': { bgcolor: colors.orangeDark } }}
          >
            Checkout
          </Button>
        )}
      </CardContent>
    </Card>
  ),

  CheckoutForm: ({ props, dispatch }) => (
    <CheckoutFormCard
      title={props.title}
      subtotal={props.subtotal}
      itemCount={props.itemCount}
      defaultFullName={props.defaultFullName}
      defaultPhone={props.defaultPhone}
      defaultAddressLine1={props.defaultAddressLine1}
      defaultCity={props.defaultCity}
      defaultPostalCode={props.defaultPostalCode}
      defaultPaymentMethod={props.defaultPaymentMethod}
      dispatch={dispatch}
    />
  ),

  OrderStatusCard: ({ props, dispatch }) => (
    <Card sx={cardSx}>
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            Order placed
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {props.orderNumber}
          </Typography>
          <Chip
            label={capitalize(props.status)}
            size="small"
            color="primary"
            sx={{ alignSelf: 'flex-start' }}
          />
          <Typography variant="body2" color="text.secondary">
            Placed {formatDate(props.createdAt)}
          </Typography>
          {props.itemSummary && (
            <Typography variant="body2">{props.itemSummary}</Typography>
          )}
          <Typography variant="h6" sx={{ color: colors.orange }}>
            {formatPrice(props.total)}
          </Typography>
          <Button
            size="small"
            onClick={() =>
              dispatchAction(dispatch, 'view_order', { orderId: props.orderId })
            }
          >
            View details
          </Button>
        </Stack>
      </CardContent>
    </Card>
  ),

  OrderList: ({ props, dispatch }) => (
    <Box>
      {props.title && (
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          {props.title}
        </Typography>
      )}
      {props.orders.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No orders yet.
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {props.orders.map((order) => (
            <Card key={order.orderId} sx={cardSx}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 2,
                    flexWrap: 'wrap',
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {order.orderNumber}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Placed {formatDate(order.createdAt)}
                    </Typography>
                    {order.itemSummary ? (
                      <Typography variant="body2" sx={{ mt: 0.75 }}>
                        {order.itemSummary}
                      </Typography>
                    ) : null}
                    {order.itemCount != null ? (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {order.itemCount} item{order.itemCount === 1 ? '' : 's'}
                      </Typography>
                    ) : null}
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                    <Chip label={capitalize(order.status)} size="small" color="primary" />
                    <Typography sx={{ fontWeight: 700, color: colors.orange }}>
                      {formatPrice(order.total)}
                    </Typography>
                    <Button
                      size="small"
                      onClick={() =>
                        dispatchAction(dispatch, 'view_order', { orderId: order.orderId })
                      }
                    >
                      View details
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  ),

  OrderDetailCard: ({ props, dispatch }) => (
    <Card sx={cardSx}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>
          Order {props.orderNumber}
        </Typography>
        <Chip label={capitalize(props.status)} size="small" sx={{ mb: 1 }} />
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Placed {formatDate(props.createdAt)}
        </Typography>
        {props.paymentMethod && (
          <Typography variant="body2" color="text.secondary">
            Payment: {props.paymentMethod}
          </Typography>
        )}
        {props.deliveryAddress && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Delivery: {props.deliveryAddress}
          </Typography>
        )}
        {props.items && props.items.length > 0 && (
          <Stack spacing={1} divider={<Divider />} sx={{ mb: 2 }}>
            {props.items.map((item, index) => (
              <Box
                key={`${item.name}-${index}`}
                sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}
              >
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
        )}
        <Typography variant="h6" sx={{ color: colors.orange, mb: 2 }}>
          Total: {formatPrice(props.total)}
        </Typography>
        <Button
          variant="outlined"
          onClick={() => dispatchAction(dispatch, 'buy_again', { orderId: props.orderId })}
        >
          Buy again
        </Button>
      </CardContent>
    </Card>
  ),

  FaqList: ({ props }) => (
    <Box>
      {props.title && (
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          {props.title}
        </Typography>
      )}
      <Stack spacing={1.5}>
        {props.faqs.map((faq, index) => (
          <Card key={`${faq.question}-${index}`} sx={cardSx}>
            <CardContent>
              {faq.category && (
                <Chip label={faq.category} size="small" sx={{ mb: 1 }} />
              )}
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }} gutterBottom>
                {faq.question}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {faq.answer}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  ),

  FaqItem: ({ props }) => (
    <Card sx={{ ...cardSx, mb: 1.5 }}>
      <CardContent>
        {props.category && <Chip label={props.category} size="small" sx={{ mb: 1 }} />}
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }} gutterBottom>
          {props.question}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {props.answer}
        </Typography>
      </CardContent>
    </Card>
  ),

  AuthLoginCard: ({ props }) => (
    <BabyAuthCard mode="login" title={props.title} message={props.message} />
  ),

  AuthSignupCard: ({ props }) => (
    <BabyAuthCard mode="signup" title={props.title} message={props.message} />
  ),
};

export const brillarCatalog = createCatalog(catalogDefinitions, catalogRenderers, {
  catalogId: 'brillar-storefront',
  includeBasicCatalog: false,
});
