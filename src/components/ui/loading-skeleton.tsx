import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const ProfileLoadingSkeleton = () => (
  <Card className="animate-pulse bg-background/95 backdrop-blur-sm border-2">
    <CardContent className="p-6 md:p-8">
      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        <div className="flex-shrink-0 text-center lg:text-left">
          <Skeleton className="w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-full mx-auto lg:mx-0" />
          <div className="space-y-3 sm:space-y-4 mt-6">
            <Skeleton className="h-8 w-64 mx-auto lg:mx-0" />
            <Skeleton className="h-6 w-80 mx-auto lg:mx-0" />
          </div>
        </div>
        <div className="flex-1 text-center lg:text-left space-y-4 sm:space-y-6 w-full">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-8 w-3/4 mx-auto lg:mx-0" />
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const MissionLoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="text-center space-y-4">
      <Skeleton className="h-12 w-64 mx-auto" />
      <Skeleton className="h-6 w-80 mx-auto" />
    </div>
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <div className="grid gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
          <Skeleton className="h-10 w-32 ml-auto" />
        </div>
      </CardContent>
    </Card>
  </div>
);

export const StatsLoadingSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[1, 2, 3, 4].map((i) => (
      <Card key={i} className="p-4">
        <div className="text-center space-y-2">
          <Skeleton className="h-6 w-6 mx-auto rounded-full" />
          <Skeleton className="h-8 w-16 mx-auto" />
          <Skeleton className="h-4 w-20 mx-auto" />
        </div>
      </Card>
    ))}
  </div>
);