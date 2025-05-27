import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "@/components/agent/translations-context";

interface BroadcastButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  isSessionActive: boolean
  onClick: () => void
}

export function BroadcastButton({ isSessionActive, onClick, className, ...props }: BroadcastButtonProps) {
  const { t } = useTranslations();
  return (
    <Button
      variant={isSessionActive ? "destructive" : "default"}
      className={`py-6 text-lg font-medium flex items-center justify-center gap-2 motion-preset-shake ${className || ''}`}
      onClick={onClick}
      {...props}
    >
      {isSessionActive && (
        <Badge variant="secondary" className="animate-pulse bg-red-100 text-red-700">
          {t('broadcast.live')}
        </Badge>
      )}
      {isSessionActive ? t('broadcast.end') : t('broadcast.start')}
    </Button>
  )
} 