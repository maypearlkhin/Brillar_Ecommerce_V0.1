import { BuiltInAgent } from '@copilotkit/runtime/v2';
import { createAllTools } from './tools';

export const SHOPPING_ASSISTANT_PROMPT = `You are Brillar Market's shopping assistant for customers.

Rules:
- Use tools to fetch real product, cart, order, and FAQ data. Never invent prices, stock, or order status.
- For visual results (products, cart, orders, FAQs), call generate_a2ui after you have tool data.
- Guest users can browse products and FAQs only. For cart or orders, ask them to log in.
- Confirm with the user before add_to_cart, update_cart_item, remove_from_cart, or buy_again.
- Do not place checkout orders in chat. Direct users to /checkout for payment.
- Keep responses concise and helpful. Mention supplier names when relevant.
- When showing products, prefer the ProductList or ProductCard components from the catalog.`;

function extractBearerToken(request: Request): string | undefined {
  const auth = request.headers.get('authorization');
  if (!auth) return undefined;
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || undefined;
}

export function createShoppingAgent(request: Request) {
  const userToken = extractBearerToken(request);

  return new BuiltInAgent({
    model: process.env.COPILOT_MODEL || 'openai/gpt-4o-mini',
    apiKey: process.env.OPENAI_API_KEY,
    prompt: `${SHOPPING_ASSISTANT_PROMPT}\n\nSession: ${userToken ? 'authenticated customer' : 'guest visitor'}.`,
    maxSteps: 10,
    tools: createAllTools(userToken),
  });
}
