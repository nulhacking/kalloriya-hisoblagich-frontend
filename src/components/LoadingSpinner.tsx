interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Rang ota elementdan olinadi (`currentColor`): oq fonda to'q, to'q rangli
 * tugma ichida esa oq bo'lib ko'rinadi — alohida variant kerak emas.
 */

const LoadingSpinner = ({ size = 'md' }: LoadingSpinnerProps) => {
  const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  return (
    <div
      className={`${sizeClasses[size]} border-2 border-current/25 border-t-current rounded-full animate-spin`}
    />
  )
}

export default LoadingSpinner

