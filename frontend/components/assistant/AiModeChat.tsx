'use client';



import { CopilotChat, useFrontendTool } from '@copilotkit/react-core/v2';

import { Box } from '@mui/material';

import { z } from 'zod';

import { useCart } from '@/contexts/CartContext';



function CartSyncTool() {

  const { refreshCart } = useCart();



  useFrontendTool({

    name: 'sync_cart_context',

    description:

      'Refresh the storefront cart badge and local cart state after cart mutations or checkout in chat.',

    parameters: z.object({}),

    handler: async () => {

      await refreshCart();

      return { synced: true };

    },

  });



  return null;

}



export default function AiModeChat() {

  return (

    <Box

      className="ai-mode-chat-shell"

      sx={{

        flex: 1,

        display: 'flex',

        flexDirection: 'column',

        width: '100%',

        maxWidth: 820,

        mx: 'auto',

        px: { xs: 2, sm: 3 },

        py: { xs: 2, sm: 3 },

        minHeight: 0,

        '& .ai-mode-chat': {

          flex: 1,

          display: 'flex',

          flexDirection: 'column',

          minHeight: 0,

          height: '100%',

        },

        '& .ai-mode-chat [data-copilot-chat-view]': {

          flex: 1,

          minHeight: 0,

        },

      }}

    >

      <CartSyncTool />

      <CopilotChat

        className="ai-mode-chat"

        welcomeScreen

        labels={{

          welcomeMessageText: 'Ready when you are.',

          chatInputPlaceholder: 'Ask about products, orders, or policies...',

          chatDisclaimerText: 'AI can make mistakes. Please verify important information.',

        }}

      />

    </Box>

  );

}


