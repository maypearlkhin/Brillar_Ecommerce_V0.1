import { ConfigurationService } from '../services/admin.service';

function getAtenxionBaseUrl(): string | null {
  const endpointDomain = process.env.ENDPOINT_DOMAIN?.trim();
  if (!endpointDomain) return null;
  return endpointDomain;
}

export const sendLoginEvent = async (userId: string, role: string): Promise<void> => {
  try {
    const endpointDomain = getAtenxionBaseUrl();
    if (!endpointDomain || !userId) return;

    const widget = await ConfigurationService.getWidgetForRole(role);
    if (!widget?.token) return;

    const endpoint = `${endpointDomain}/post-login/user-login`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: widget.token
      },
      body: JSON.stringify({
        userId,
        message: `User logged in successfully with userId: ${userId}`,
        
      }),
    });

    if (!response.ok) {
      console.log(
        'Failed calling api to Atenxion Backend for user login',
        response.status,
        await response.text().catch(() => '')
      );
    }
  } catch (e) {
    console.log('Failed calling api to Atenxion Backend for user login', e);
  }
};
