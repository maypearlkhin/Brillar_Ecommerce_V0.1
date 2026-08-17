'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  AdminPanelSettingsOutlined,
  BoltOutlined,
  DeleteOutlined,
  PeopleOutlined,
  StorefrontOutlined,
} from '@mui/icons-material';
import { PageHeader } from '@/components/common/MetricCard';
import LoadingState from '@/components/common/LoadingState';
import AdminPageCard from '@/components/admin/AdminPageCard';
import AdminCardHeader from '@/components/admin/AdminCardHeader';
import AdminSectionPanel from '@/components/admin/AdminSectionPanel';
import { adminService } from '@/services/supplier.service';
import { getErrorMessage } from '@/services/api';
import { IntegrationConfigType, IntegrationConfiguration } from '@/types';
import {
  isWidgetConfigType,
  validateWidgetScript,
  validateWidgetScriptLive,
  validateWidgetToken,
  validateWidgetTokenLive,
} from '@/utils/widgetConfig';

const TAB_CONFIG = {
  trigger: {
    label: 'Trigger',
    icon: <BoltOutlined fontSize="small" />,
    title: 'Trigger Configuration',
    description: 'Webhooks for agent triggers. Configure one API URL and token. To change, remove first then add again.',
    urlLabel: 'API URL',
    tokenLabel: 'Trigger token',
    emptyHint: 'No trigger configured yet. Add one API URL and token below.',
    removeHint: 'After removing, you can add a new trigger configuration.',
  },
  admin_widget: {
    label: 'Administrator',
    icon: <AdminPanelSettingsOutlined fontSize="small" />,
    title: 'Administrator Widget',
    description: 'Embed widget configuration for administrators. One widget per role. To change, remove first then add again.',
    urlLabel: 'Widget script',
    tokenLabel: 'Access token',
    emptyHint: 'No administrator widget configured yet. Add a script URL and access token below.',
    removeHint: 'After removing, you can add a new administrator widget.',
  },
  customer_widget: {
    label: 'Customer',
    icon: <PeopleOutlined fontSize="small" />,
    title: 'Customer Widget',
    description: 'Embed widget configuration for customers. One widget per role. To change, remove first then add again.',
    urlLabel: 'Widget script',
    tokenLabel: 'Access token',
    emptyHint: 'No customer widget configured yet. Add a script URL and access token below.',
    removeHint: 'After removing, you can add a new customer widget.',
  },
  supplier_widget: {
    label: 'Supplier',
    icon: <StorefrontOutlined fontSize="small" />,
    title: 'Supplier Widget',
    description: 'Embed widget configuration for suppliers. One widget per role. To change, remove first then add again.',
    urlLabel: 'Widget script',
    tokenLabel: 'Access token',
    emptyHint: 'No supplier widget configured yet. Add a script URL and access token below.',
    removeHint: 'After removing, you can add a new supplier widget.',
  },
} as const;

const EMPTY_CONFIGS: IntegrationConfiguration = {
  trigger: null,
  adminWidget: null,
  customerWidget: null,
  supplierWidget: null,
};

function getConfigForTab(configs: IntegrationConfiguration, tab: IntegrationConfigType) {
  if (tab === 'trigger') return configs.trigger;
  if (tab === 'admin_widget') return configs.adminWidget;
  if (tab === 'customer_widget') return configs.customerWidget;
  return configs.supplierWidget;
}

export default function AdminConfigurationPage() {
  const [tab, setTab] = useState<IntegrationConfigType>('trigger');
  const [configs, setConfigs] = useState<IntegrationConfiguration>(EMPTY_CONFIGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [removeTarget, setRemoveTarget] = useState<IntegrationConfigType | null>(null);
  const [form, setForm] = useState({ url: '', token: '' });
  const [fieldErrors, setFieldErrors] = useState({ url: '', token: '' });

  const activeConfig = getConfigForTab(configs, tab);
  const copy = TAB_CONFIG[tab];
  const isWidgetTab = isWidgetConfigType(tab);
  const canAddWidget = !validateWidgetScript(form.url) && !validateWidgetToken(form.token);

  const load = () => {
    adminService.getConfiguration()
      .then(setConfigs)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    setForm({ url: '', token: '' });
    setFieldErrors({ url: '', token: '' });
    setError('');
    setSuccess('');
  }, [tab]);

  const handleWidgetUrlChange = (value: string) => {
    setForm((prev) => ({ ...prev, url: value }));
    setFieldErrors((prev) => ({ ...prev, url: validateWidgetScriptLive(value) || '' }));
  };

  const handleWidgetTokenChange = (value: string) => {
    setForm((prev) => ({ ...prev, token: value }));
    setFieldErrors((prev) => ({ ...prev, token: validateWidgetTokenLive(value) || '' }));
  };

  const handleAdd = async () => {
    if (isWidgetTab) {
      const urlError = validateWidgetScript(form.url);
      const tokenError = validateWidgetToken(form.token);
      setFieldErrors({ url: urlError || '', token: tokenError || '' });
      if (urlError || tokenError) return;
    } else if (!form.url.trim() || !form.token.trim()) {
      setError('URL and token are required.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await adminService.createConfiguration({
        type: tab,
        url: form.url.trim(),
        token: form.token.trim(),
      });
      setForm({ url: '', token: '' });
      setFieldErrors({ url: '', token: '' });
      setSuccess(`${copy.label} configuration saved.`);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;

    try {
      setRemoving(true);
      setError('');
      setSuccess('');
      await adminService.deleteConfiguration(removeTarget);
      setRemoveTarget(null);
      setSuccess(`${TAB_CONFIG[removeTarget].label} configuration removed.`);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRemoving(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader
        title="Configuration"
        subtitle="Embed widget configuration by user role. One widget per role. To change, remove first then add again."
      />

      <AdminPageCard flush>
        <AdminCardHeader>
          <Tabs
            value={tab}
            onChange={(_, value: IntegrationConfigType) => setTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 36,
              width: '100%',
              '& .MuiTab-root': { minHeight: 36, py: 0, px: 1.25, gap: 0.75, fontSize: '0.8125rem', fontWeight: 600 },
              '& .MuiTabs-indicator': { height: 2 },
            }}
          >
            <Tab icon={TAB_CONFIG.trigger.icon} iconPosition="start" label={TAB_CONFIG.trigger.label} value="trigger" />
            <Tab icon={TAB_CONFIG.admin_widget.icon} iconPosition="start" label={TAB_CONFIG.admin_widget.label} value="admin_widget" />
            <Tab icon={TAB_CONFIG.customer_widget.icon} iconPosition="start" label={TAB_CONFIG.customer_widget.label} value="customer_widget" />
            <Tab icon={TAB_CONFIG.supplier_widget.icon} iconPosition="start" label={TAB_CONFIG.supplier_widget.label} value="supplier_widget" />
          </Tabs>
        </AdminCardHeader>

        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 720, lineHeight: 1.45 }}>
            {copy.description}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 1.5, borderRadius: '10px' }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 1.5, borderRadius: '10px' }}>{success}</Alert>}

          <AdminSectionPanel title={copy.title} subtitle={activeConfig ? copy.removeHint : copy.emptyHint}>
            {activeConfig ? (
              <Box>
                <TextField
                  fullWidth
                  size="small"
                  label={copy.urlLabel}
                  value={activeConfig.url}
                  slotProps={{ input: { readOnly: true } }}
                  sx={{ mb: 1.5 }}
                />
                <TextField
                  fullWidth
                  size="small"
                  label={copy.tokenLabel}
                  value={activeConfig.token}
                  slotProps={{ input: { readOnly: true } }}
                  sx={{ mb: 1.5 }}
                />
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<DeleteOutlined />}
                  onClick={() => setRemoveTarget(tab)}
                >
                  Remove
                </Button>
              </Box>
            ) : (
              <Box>
                <TextField
                  fullWidth
                  size="small"
                  label={copy.urlLabel}
                  value={form.url}
                  error={Boolean(fieldErrors.url)}
                  helperText={fieldErrors.url || (isWidgetTab ? 'Paste a <script src="..."></script> tag.' : undefined)}
                  onChange={(e) => {
                    if (isWidgetTab) {
                      handleWidgetUrlChange(e.target.value);
                      return;
                    }
                    setForm({ ...form, url: e.target.value });
                  }}
                  sx={{ mb: 1.5 }}
                />
                <TextField
                  fullWidth
                  size="small"
                  label={copy.tokenLabel}
                  value={form.token}
                  error={Boolean(fieldErrors.token)}
                  helperText={fieldErrors.token || (isWidgetTab ? 'Paste the access token only, not a script.' : undefined)}
                  onChange={(e) => {
                    if (isWidgetTab) {
                      handleWidgetTokenChange(e.target.value);
                      return;
                    }
                    setForm({ ...form, token: e.target.value });
                  }}
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAdd}
                  disabled={saving || (isWidgetTab && !canAddWidget)}
                >
                  {saving ? 'Saving...' : 'Add Configuration'}
                </Button>
              </Box>
            )}
          </AdminSectionPanel>
        </Box>
      </AdminPageCard>

      <Dialog open={!!removeTarget} onClose={() => !removing && setRemoveTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Remove Configuration</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove this {removeTarget ? TAB_CONFIG[removeTarget].label.toLowerCase() : ''} configuration?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            You will need to add a new one before it can be used again.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRemoveTarget(null)} disabled={removing}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleRemove} disabled={removing}>
            {removing ? 'Removing...' : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
