import CopilotProvider from '@/components/assistant/CopilotProvider';

export default function AiModeLayout({ children }: { children: React.ReactNode }) {
  return <CopilotProvider>{children}</CopilotProvider>;
}
