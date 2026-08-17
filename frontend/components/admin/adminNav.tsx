'use client';

import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import StoreIcon from '@mui/icons-material/Store';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import HelpIcon from '@mui/icons-material/Help';
import SettingsIcon from '@mui/icons-material/Settings';
import AssignmentIcon from '@mui/icons-material/Assignment';

export const adminNavItems = [
  { label: 'Dashboard', href: '/admin', icon: <DashboardIcon fontSize="small" /> },
  { label: 'Applications', href: '/admin/applications', icon: <AssignmentIcon fontSize="small" /> },
  { label: 'Suppliers', href: '/admin/suppliers', icon: <StoreIcon fontSize="small" /> },
  { label: 'Orders', href: '/admin/orders', icon: <ShoppingBagIcon fontSize="small" /> },
  { label: 'Customers', href: '/admin/customers', icon: <PeopleIcon fontSize="small" /> },
  { label: 'FAQ', href: '/admin/faqs', icon: <HelpIcon fontSize="small" /> },
  { label: 'Configuration', href: '/admin/configuration', icon: <SettingsIcon fontSize="small" /> },
];
