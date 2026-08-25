'use client';

import { CopilotPopup } from '@copilotkit/react-core/v2';

export default function StoreAssistant() {
  return (
    <CopilotPopup
      labels={{
        modalHeaderTitle: 'Shopping Assistant',
        welcomeMessageText: 'Hi! I can help you find products, check FAQs, or manage your cart and orders.',
        chatInputPlaceholder: 'Ask about products, orders, or policies...',
      }}
      defaultOpen={false}
      clickOutsideToClose
    />
  );
}
