'use client';

import DashboardIcon from '@mui/icons-material/Dashboard';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import StorefrontIcon from '@mui/icons-material/Storefront';

export const supplierNavItems = [
  { label: 'Overview', href: '/supplier', icon: <DashboardIcon fontSize="small" /> },
  { label: 'Products', href: '/supplier/products', icon: <Inventory2Icon fontSize="small" /> },
  { label: 'Inventory', href: '/supplier/inventory', icon: <WarehouseIcon fontSize="small" /> },
  { label: 'Orders', href: '/supplier/orders', icon: <ReceiptIcon fontSize="small" /> },
  { label: 'Financials', href: '/supplier/financials', icon: <AccountBalanceIcon fontSize="small" /> },
  { label: 'Store Profile', href: '/supplier/profile', icon: <StorefrontIcon fontSize="small" /> },
];
