'use client';

import { ToolCallIndicator } from '@/components/chat/messages/tool-call-indicator';
import { useChatConfig } from '@/lib/chat/chat-context';

interface OnboardingToolCallIndicatorProps {
  toolName: string;
  state: 'call' | 'result' | 'partial-call';
  args: Record<string, any>;
}

export function OnboardingToolCallIndicator({
  toolName,
  state,
  args
}: OnboardingToolCallIndicatorProps) {
  const { config } = useChatConfig();

  // Don't render if tool is in hidden list
  if (config.hiddenTools?.includes(toolName)) {
    return null;
  }

  // Get display name from tools config, fallback to toolName if not found
  const displayName = config.toolRegistry.get(toolName)?.displayName || toolName;

  return (
    <div className={config.messageStyles.toolCall}>
      <ToolCallIndicator displayName={displayName} toolName={toolName} state={state} args={args} />
    </div>
  );
}
