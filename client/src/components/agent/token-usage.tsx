import { useTranslations } from "@/components/agent/translations-context"
import { Message } from "@/types"
import { cn } from "@/lib/utils"

interface TokenUsageDisplayProps {
  messages: Message[]
  className?: string
}

export function TokenUsageDisplay({ messages, className }: TokenUsageDisplayProps) {
  const { t } = useTranslations()
  
  const lastMessage = messages
    .filter((msg) => msg.type === 'response.done')
    .slice(-1)[0]

  if (!lastMessage?.response?.usage) return null

  const { total_tokens, input_tokens, output_tokens } = lastMessage.response.usage

  return (
    <div className={cn("text-xs text-muted-foreground flex items-center justify-end gap-4 mt-1", className)}>
      <span>{t('tokenUsage.input')}: {input_tokens}</span>
      <span>{t('tokenUsage.output')}: {output_tokens}</span>
      <span className="font-medium">{t('tokenUsage.total')}: {total_tokens}</span>
    </div>
  )
} 