import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, RefreshCw, ArrowUp, Sparkles, Hash, User, X, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTrendingThoughts } from '@/hooks/useTrendingThoughts';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface TrendingThoughtDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
  onStartRecording: (trendingTopicId: string) => void;
}

export function TrendingThoughtDropdown({ 
  isOpen, 
  onClose, 
  onOpenAuth, 
  onStartRecording 
}: TrendingThoughtDropdownProps) {
  const { currentTopic, loading, refreshCurrentTopic, showFeedThought } = useTrendingThoughts();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRecordClick = () => {
    if (!user) {
      onOpenAuth();
      return;
    }

    if (currentTopic) {
      onStartRecording(currentTopic.id);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    refreshCurrentTopic();
    setTimeout(() => setIsRefreshing(false), 500); // Visual feedback
  };

  const handleShowMore = () => {
    navigate('/feed');
    onClose();
  };

  const handleGoToFeed = () => {
    navigate('/feed');
    onClose();
  };

  // Always render the container - don't return null to prevent vanishing

  if (isMobile) {
    // Mobile: Show as modal with backdrop
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={onClose}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                duration: 0.3 
              }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="panel surface-elevated w-full max-w-sm max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="text-lg font-semibold">Trending Thoughts</h3>
                  <div className="flex items-center gap-2">
                  {/* Removed redundant Feed button for mobile */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-5">
                  {renderContent()}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop/Tablet: Show as slide-down panel
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            duration: 0.3 
          }}
          className="w-full max-w-2xl mx-auto mt-4 px-4 z-20"
        >
          <div className="panel surface-elevated bg-background border border-border">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Trending Thoughts</h3>
              <div className="flex items-center gap-2">
                {/* Removed redundant Feed button for desktop */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-6">
              {renderContent()}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  function renderContent() {
    return (
      <div>
        {loading || !currentTopic ? (
          <div className="text-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <Sparkles className="h-8 w-8 text-primary" />
            </motion.div>
            <p className="text-sm text-muted-foreground mt-2">
              Loading trending thoughts...
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="mt-3"
            >
              Retry
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {showFeedThought ? (
                <>
                  <User className="h-3 w-3" />
                  <span>From the community</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3" />
                  <span>Generated by Woices AI</span>
                </>
              )}
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-foreground leading-tight">
              {currentTopic.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {currentTopic.description}
            </p>

            {/* Tags */}
            {currentTopic.tags && currentTopic.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {currentTopic.tags.slice(0, 3).map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs px-2 py-0.5 bg-muted text-muted-foreground border-border"
                  >
                    <Hash className="h-2.5 w-2.5 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Max Woices Info */}
            <div className="text-xs text-muted-foreground bg-muted px-3 py-2 rounded-lg border border-border">
              <span className="font-medium">Limited:</span> Only 10 Woice replies allowed
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                onClick={handleRecordClick}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                size="sm"
              >
                <Mic className="h-4 w-4 mr-2" />
                Record Your Woice Reply
              </Button>

              <div className="flex gap-2">
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  size="sm"
                  disabled={isRefreshing}
                  className="border-border hover:bg-accent"
                >
                  <RefreshCw 
                    className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} 
                  />
                </Button>

                <Button
                  onClick={handleShowMore}
                  variant="outline"
                  size="sm"
                  className="border-border hover:bg-accent"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Help Text */}
            <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border/50">
              {user 
                ? showFeedThought
                  ? "Reply to this community thought with your voice"
                  : "Explore more questions by tapping the feed button" 
                : "Sign in to join the conversation"
              }
            </p>

            {/* Close button for desktop */}
            {!isMobile && (
              <div className="flex justify-center pt-2">
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}