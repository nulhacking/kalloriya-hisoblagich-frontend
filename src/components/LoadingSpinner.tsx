interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
}

const LoadingSpinner = ({ size = 'md' }: LoadingSpinnerProps) => {
  const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  return (
    <div
      className={`${sizeClasses[size]} border-2 border-white border-t-transparent rounded-full animate-spin`}
    />
  )
}

export default LoadingSpinner

