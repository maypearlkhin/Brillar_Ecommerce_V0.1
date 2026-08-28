import { ConfigurationService } from '../services/admin.service';
import { getAtenxionBaseUrl } from './atenxionEndpoint';

export const sendLoginEvent = async (userId: string, role: string): Promise<void> => {
  try {
    const endpointDomain = getAtenxionBaseUrl();
    if (!endpointDomain || !userId) return;

    const widget = await ConfigurationService.getWidgetForRole(role);
    if (!widget?.token) return;

    const endpoint = `${endpointDomain}/post-login/user-login`;
    const requestBody = {
      userId,
      message: `User logged in successfully with userId: ${userId}`,
    };
    const requestHeaders = {
      'Content-Type': 'application/json',
      Authorization: widget.token,
    };

    console.log('[Atenxion Login] Request:', {
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

    console.log('[Atenxion Login] Response:', {
      status: response.status,
      ok: response.ok,
      data: responseData,
    });

    if (!response.ok) {
      console.log(
        'Failed calling api to Atenxion Backend for user login',
        response.status,
        responseText
      );
    }
  } catch (e) {
    console.log('Failed calling api to Atenxion Backend for user login', e);
  }
};
