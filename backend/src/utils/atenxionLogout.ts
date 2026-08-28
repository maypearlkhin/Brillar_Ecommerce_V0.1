import { ConfigurationService } from '../services/admin.service';
import { getAtenxionBaseUrl } from './atenxionEndpoint';

export const sendLogoutEvent = async (userId: string, role: string): Promise<void> => {
  try {
    const endpointDomain = getAtenxionBaseUrl();
    if (!endpointDomain || !userId) return;

    const widget = await ConfigurationService.getWidgetForRole(role);
    if (!widget?.token) return;

    const endpoint = `${endpointDomain}/post-login/user-logout`;
    const requestBody = {
      userId,
      message: `User logged out successfully with userId: ${userId}`,
    };
    const requestHeaders = {
      'Content-Type': 'application/json',
      Authorization: widget.token,
    };

    console.log('[Atenxion Logout] Request:', {
      endpoint,
      method: 'POST',
      headers: requestHeaders,
      body: requestBody,
    });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text().catch(() => '');
    let responseData: unknown = responseText;
    try {
      responseData = responseText ? JSON.parse(responseText) : null;
    } catch {
      // keep raw text if not JSON
    }

    console.log('[Atenxion Logout] Response:', {
      status: response.status,
      ok: response.ok,
      data: responseData,
    });

    if (!response.ok) {
      console.log(
        'Failed calling api to Atenxion Backend for user logout',
        response.status,
        responseText
      );
    }
  } catch (e) {
    console.log('Failed calling api to Atenxion Backend for user logout', e);
  }
};
