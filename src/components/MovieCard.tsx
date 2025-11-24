import { Download, Share2, Link as LinkIcon, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MovieCardProps {
  id: string;
  title: string;
  posterUrl: string;
  category: string;
  downloads: number;
  clicks: number;
  impressions: number;
  isWebSeries?: boolean;
  onDownload: () => void;
  onShare: () => void;
  onCopyLink: () => void;
  onClick: () => void;
}

export const MovieCard = ({
  title,
  posterUrl,
  category,
  downloads,
  clicks,
  impressions,
  isWebSeries,
  onDownload,
  onShare,
  onCopyLink,
  onClick,
}: MovieCardProps) => {
  const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) : "0.0";

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-1">
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden cursor-pointer" onClick={onClick}>
        <img
          src={posterUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
            <Play className="w-8 h-8 text-primary-foreground ml-1" fill="currentColor" />
          </div>
        </div>

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isWebSeries && (
            <Badge className="bg-premium text-premium-foreground">Series</Badge>
          )}
          <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm">
            {category}
          </Badge>
        </div>

        {/* Stats overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/90">
          <span>{downloads} downloads</span>
          <span>{ctr}% CTR</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-display font-semibold text-foreground line-clamp-2 cursor-pointer hover:text-primary transition-colors" onClick={onClick}>
          {title}
        </h3>

        {/* Quick actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-primary/20 hover:bg-primary/10"
            onClick={(e) => {
              e.stopPropagation();
              onDownload();
            }}
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Download
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onCopyLink();
            }}
          >
            <LinkIcon className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onShare();
            }}
          >
            <Share2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
