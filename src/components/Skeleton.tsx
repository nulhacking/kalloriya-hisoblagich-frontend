import { ReactNode } from "react";

interface SkeletonProps {
  className?: string;
}

// Base skeleton component with shimmer animation
export const Skeleton = ({ className = "" }: SkeletonProps) => (
  <div
    className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-lg ${className}`}
    style={{
      animation: "shimmer 1.5s infinite",
    }}
  />
);

// Skeleton for text lines
export const SkeletonText = ({ className = "" }: SkeletonProps) => (
  <Skeleton className={`h-4 ${className}`} />
);

// Skeleton for circular elements
export const SkeletonCircle = ({ className = "" }: SkeletonProps) => (
  <Skeleton className={`rounded-full ${className}`} />
);

// Skeleton wrapper with optional children
interface SkeletonWrapperProps {
  isLoading: boolean;
  children: ReactNode;
  skeleton: ReactNode;
}

export const SkeletonWrapper = ({
  isLoading,
  children,
  skeleton,
}: SkeletonWrapperProps) => {
  return isLoading ? <>{skeleton}</> : <>{children}</>;
};

// ============ SPECIFIC SKELETONS ============

// Skeleton for meal card in DailyLog
export const MealCardSkeleton = () => (
  <div className="bg-gradient-to-r from-food-green-50 to-food-yellow-50 rounded-xl p-3 border border-food-green-200">
    <div className="flex items-start gap-3">
      {/* Image skeleton */}
      <Skeleton className="w-14 h-14 rounded-lg" />

      {/* Content skeleton */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <SkeletonText className="w-32 h-5" />
          <SkeletonText className="w-12 h-3" />
        </div>
        <SkeletonText className="w-12 h-3 mt-2" />
        <div className="flex flex-wrap gap-1.5 mt-2">
          <Skeleton className="w-20 h-5 rounded-full" />
          <Skeleton className="w-16 h-5 rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

// Skeleton for daily stats in DailyLog
export const DailyStatsSkeleton = () => (
  <div className="bg-gradient-to-br from-food-green-50 to-food-yellow-50 rounded-2xl p-4 border-2 border-food-green-200">
    <div className="flex items-center gap-2 mb-3">
      <SkeletonCircle className="w-6 h-6" />
      <SkeletonText className="w-32 h-5" />
    </div>

    {/* Calorie progress skeleton */}
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <SkeletonText className="w-20 h-4" />
        <SkeletonText className="w-24 h-4" />
      </div>
      <Skeleton className="h-3 rounded-full" />
    </div>

    {/* Nutrient cards skeleton */}
    <div className="grid grid-cols-3 gap-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl p-2 text-center border border-gray-100"
        >
          <SkeletonCircle className="w-6 h-6 mx-auto" />
          <SkeletonText className="w-12 h-5 mx-auto mt-2" />
          <SkeletonText className="w-10 h-3 mx-auto mt-1" />
          <Skeleton className="h-1.5 rounded-full mt-2" />
        </div>
      ))}
    </div>
  </div>
);

// Skeleton for history day card
export const HistoryDayCardSkeleton = () => (
  <div className="bg-gradient-to-r from-food-green-50 to-food-yellow-50 rounded-xl p-4 border border-food-green-200">
    <div className="flex items-center justify-between">
      <div>
        <SkeletonText className="w-40 h-5" />
        <SkeletonText className="w-20 h-3 mt-2" />
      </div>
      <div className="text-right">
        <SkeletonText className="w-20 h-6 ml-auto" />
        <div className="flex gap-2 mt-2">
          <Skeleton className="w-12 h-3" />
          <Skeleton className="w-12 h-3" />
          <Skeleton className="w-12 h-3" />
        </div>
      </div>
    </div>
  </div>
);

// Skeleton for history list
export const HistoryListSkeleton = () => (
  <div className="space-y-2">
    {[1, 2, 3, 4, 5].map((i) => (
      <HistoryDayCardSkeleton key={i} />
    ))}
  </div>
);

// Skeleton for range stats
export const RangeStatsSkeleton = () => (
  <div className="bg-gradient-to-br from-food-orange-50 to-food-yellow-50 rounded-xl p-4 border-2 border-food-orange-200">
    <div className="flex items-center gap-2 mb-3">
      <SkeletonCircle className="w-6 h-6" />
      <SkeletonText className="w-48 h-5" />
    </div>

    <div className="grid grid-cols-2 gap-3 mb-3">
      {[1, 2].map((i) => (
        <div key={i} className="bg-white rounded-xl p-3 text-center">
          <SkeletonCircle className="w-8 h-8 mx-auto" />
          <SkeletonText className="w-16 h-6 mx-auto mt-2" />
          <SkeletonText className="w-20 h-3 mx-auto mt-1" />
          <SkeletonText className="w-24 h-3 mx-auto mt-1" />
        </div>
      ))}
    </div>

    <div className="grid grid-cols-3 gap-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-lg p-2 text-center">
          <SkeletonCircle className="w-5 h-5 mx-auto" />
          <SkeletonText className="w-10 h-5 mx-auto mt-1" />
          <SkeletonText className="w-16 h-3 mx-auto mt-1" />
        </div>
      ))}
    </div>
  </div>
);

// Skeleton for food stats card
export const FoodStatsCardSkeleton = () => (
  <div className="bg-gradient-to-r from-food-green-50 to-food-yellow-50 rounded-xl p-3 border border-food-green-200">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <SkeletonCircle className="w-10 h-10" />
        <div>
          <SkeletonText className="w-28 h-5" />
          <SkeletonText className="w-20 h-3 mt-1" />
        </div>
      </div>
      <div className="text-right">
        <SkeletonText className="w-16 h-5 ml-auto" />
        <SkeletonText className="w-24 h-3 mt-1" />
        <SkeletonText className="w-16 h-3 mt-1" />
      </div>
    </div>
  </div>
);

// Skeleton for food stats list
export const FoodStatsListSkeleton = () => (
  <div className="space-y-2">
    {[1, 2, 3, 4, 5].map((i) => (
      <FoodStatsCardSkeleton key={i} />
    ))}
  </div>
);

// Skeleton for daily chart
export const DailyChartSkeleton = () => (
  <div className="space-y-2">
    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
      <div key={i} className="space-y-1">
        <div className="flex items-center justify-between">
          <SkeletonText className="w-16 h-3" />
          <SkeletonText className="w-20 h-3" />
        </div>
        <Skeleton className="h-4 rounded-full" />
      </div>
    ))}
  </div>
);

// Full DailyLog page skeleton
export const DailyLogPageSkeleton = () => (
  <div className="space-y-4">
    {/* Header */}
    <div className="text-center mb-4">
      <div className="flex items-center justify-center gap-2">
        <SkeletonCircle className="w-6 h-6" />
        <SkeletonText className="w-44 h-7" />
      </div>
      <SkeletonText className="w-48 h-4 mx-auto mt-2" />
    </div>

    {/* Stats */}
    <DailyStatsSkeleton />

    {/* Meals list */}
    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border-2 border-food-green-100">
      <div className="flex items-center gap-2 mb-3">
        <SkeletonCircle className="w-6 h-6" />
        <SkeletonText className="w-40 h-5" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <MealCardSkeleton key={i} />
        ))}
      </div>
    </div>

    {/* Remaining calories */}
    <Skeleton className="h-16 rounded-2xl" />
  </div>
);

// Full History page skeleton
export const HistoryPageSkeleton = () => (
  <div className="space-y-4">
    {/* Header */}
    <div className="text-center mb-4">
      <div className="flex items-center justify-center gap-2">
        <SkeletonCircle className="w-6 h-6" />
        <SkeletonText className="w-20 h-7" />
      </div>
      <SkeletonText className="w-56 h-4 mx-auto mt-2" />
    </div>

    {/* Content */}
    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border-2 border-food-green-100">
      {/* Toggle buttons skeleton */}
      <div className="flex gap-2 mb-4">
        <Skeleton className="flex-1 h-10 rounded-xl" />
        <Skeleton className="flex-1 h-10 rounded-xl" />
      </div>

      {/* Days selector skeleton */}
      <div className="flex items-center gap-2 mb-3">
        <SkeletonText className="w-24 h-4" />
        <Skeleton className="w-20 h-10 rounded-xl" />
      </div>

      {/* History list skeleton */}
      <HistoryListSkeleton />
    </div>
  </div>
);

// Full Stats page skeleton
export const StatsPageSkeleton = () => (
  <div className="space-y-4">
    {/* Header */}
    <div className="text-center mb-4">
      <div className="flex items-center justify-center gap-2">
        <SkeletonCircle className="w-6 h-6" />
        <SkeletonText className="w-28 h-7" />
      </div>
      <SkeletonText className="w-52 h-4 mx-auto mt-2" />
    </div>

    {/* Date selectors */}
    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border-2 border-food-green-100">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <SkeletonText className="w-28 h-4 mb-2" />
          <Skeleton className="h-10 rounded-xl" />
        </div>
        <div>
          <SkeletonText className="w-24 h-4 mb-2" />
          <Skeleton className="h-10 rounded-xl" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <SkeletonText className="w-36 h-4" />
        <Skeleton className="w-20 h-10 rounded-xl" />
      </div>
    </div>

    {/* Range stats skeleton */}
    <RangeStatsSkeleton />

    {/* Food stats skeleton */}
    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border-2 border-food-green-100">
      <div className="flex items-center gap-2 mb-3">
        <SkeletonCircle className="w-6 h-6" />
        <SkeletonText className="w-52 h-5" />
      </div>
      <FoodStatsListSkeleton />
    </div>

    {/* Daily chart skeleton */}
    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border-2 border-food-green-100">
      <div className="flex items-center gap-2 mb-3">
        <SkeletonCircle className="w-6 h-6" />
        <SkeletonText className="w-44 h-5" />
      </div>
      <DailyChartSkeleton />
    </div>
  </div>
);

export default Skeleton;
