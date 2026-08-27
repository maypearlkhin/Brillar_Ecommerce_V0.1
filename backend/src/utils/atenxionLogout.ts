import { ConfigurationService } from '../services/admin.service';

function getAtenxionBaseUrl(): string | null {
  const endpointDomain = process.env.ENDPOINT_DOMAIN?.trim();
  if (!endpointDomain) return null;
  return `https://${endpointDomain}`;
}

export const sendLogoutEvent = async (userId: string, role: string): Promise<void> => {
  try {
    const endpointDomain = getAtenxionBaseUrl();
    if (!endpointDomain || !userId) return;

    const widget = await ConfigurationService.getWidgetForRole(role);
    if (!widget?.token) return;

    const endpoint = `${endpointDomain}/post-login/user-logout`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: widget.token,
      },
      body: JSON.stringify({
        userId,
        message: `User logged out successfully with userId: ${userId}`,
      }),
    });

    if (!response.ok) {
      console.log(
        'Failed calling api to Atenxion Backend for user logout',
        response.status,
        await response.text().catch(() => '')
      );
    }
  } catch (e) {
    console.log('Failed calling api to Atenxion Backend for user logout', e);
  }
};
