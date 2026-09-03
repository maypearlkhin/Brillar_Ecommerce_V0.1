import AiModeChat from '@/components/assistant/AiModeChat';
import AiModeEntryGate from '@/components/assistant/AiModeEntryGate';
import CopilotProvider from '@/components/assistant/CopilotProvider';

export default function AiModePage() {
  return (
    <AiModeEntryGate>
      <CopilotProvider>
        <AiModeChat />
      </CopilotProvider>
    </AiModeEntryGate>
  );
}
