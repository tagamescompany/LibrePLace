import type { Pixel } from "@shared/schema";

interface StatsData {
  totalPixels: number;
  recentPixels: Pixel[];
  contributors: number;
}

interface StatsPanelProps {
  stats?: StatsData;
  pixels: Pixel[];
  compact?: boolean;
}

export default function StatsPanel({ stats, pixels, compact = false }: StatsPanelProps) {
  const userPixelCount = pixels.length; // In a real app, this would be user-specific
  const viewPixelCount = pixels.length;

  return (
    <div className="bg-slate-800/90 backdrop-blur-md rounded-lg p-2 border border-slate-700/50 max-w-[180px]">
      <h3 className="text-xs font-medium text-slate-200 mb-2" data-testid="stats-title">
        Stats
      </h3>
      
      {/* Statistics */}
      <div className="space-y-1 mb-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">Placed</span>
          <span className="text-xs font-mono text-slate-200" data-testid="user-pixel-count">
            {userPixelCount}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">View</span>
          <span className="text-xs font-mono text-slate-200" data-testid="view-pixel-count">
            {viewPixelCount}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">Users</span>
          <span className="text-xs font-mono text-slate-200" data-testid="contributor-count">
            {stats?.contributors || '0'}
          </span>
        </div>
      </div>
      
      {/* Recent Activity - Only show first 2 items when not compact */}
      {!compact && (
        <div>
          <h4 className="text-xs font-medium text-slate-300 mb-1" data-testid="recent-activity-title">
            Recent
          </h4>
          <div className="space-y-1 text-[10px]" data-testid="recent-activity-list">
            {stats?.recentPixels?.slice(0, 2).map((pixel, index) => (
              <div key={`${pixel.id}-${index}`} className="flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: pixel.color }}
                />
                <span className="text-slate-400 truncate">
                  ({pixel.latitude.toFixed(1)}, {pixel.longitude.toFixed(1)})
                </span>
              </div>
            )) || (
              <div className="text-slate-400 text-center py-1 text-[10px]">
                No activity
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
