"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { getDKTModel, type InteractionEvent } from "@/lib/dktModel";
import { Brain, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";

interface AdaptiveLessonProps {
  conceptId: string;
  title: string;
  children: React.ReactNode;
  onComplete?: (isCorrect: boolean, timeTaken: number) => void;
}

export default function AdaptiveLesson({ conceptId, title, children, onComplete }: AdaptiveLessonProps) {
  const { deviceId } = useStore();
  const dktModel = getDKTModel();
  const [startTime, setStartTime] = useState<number>(0);
  const [showAdaptiveHint, setShowAdaptiveHint] = useState(false);
  const [masteryLevel, setMasteryLevel] = useState(0.5);

  useEffect(() => {
    // Initialize knowledge state for this concept
    dktModel.initializeKnowledgeState(conceptId);
    setMasteryLevel(dktModel.getMasteryLevel(conceptId));
  }, [conceptId, dktModel]);

  const handleStart = () => {
    setStartTime(Date.now());
  };

  const handleComplete = async (isCorrect: boolean) => {
    const timeTaken = Date.now() - startTime;
    const difficulty = dktModel.getRecommendedDifficulty(conceptId);

    // Create interaction event
    const event: InteractionEvent = {
      conceptId,
      isCorrect,
      timeTaken: timeTaken / 1000, // convert to seconds
      timestamp: Date.now(),
      difficulty
    };

    // Update local DKT model
    dktModel.updateKnowledgeState(event);
    setMasteryLevel(dktModel.getMasteryLevel(conceptId));

    // Send to backend for persistence
    if (deviceId) {
      try {
        await fetch('/api/dkt/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            deviceId,
            conceptId,
            isCorrect,
            timeTaken: timeTaken / 1000,
            difficulty
          })
        });
      } catch (error) {
        console.error('Error updating knowledge state:', error);
      }
    }

    // Call parent callback
    if (onComplete) {
      onComplete(isCorrect, timeTaken / 1000);
    }
  };

  const shouldSkip = dktModel.shouldSkipConcept(conceptId);

  if (shouldSkip) {
    return (
      <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="text-accent" size={20} />
          <div>
            <div className="font-semibold text-accent">Concept Mastered!</div>
            <div className="text-xs text-muted">You've already mastered {title}</div>
          </div>
        </div>
        <button
          onClick={() => {
            // Reset mastery to allow re-learning
            dktModel.initializeKnowledgeState(conceptId);
            setMasteryLevel(0.5);
          }}
          className="text-xs text-accent underline hover:text-accent/80"
        >
          Practice again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Adaptive Header */}
      <div className="flex items-center justify-between bg-surface2 rounded-lg p-3 border border-border">
        <div className="flex items-center gap-2">
          <Brain className="text-accent" size={18} />
          <span className="font-semibold text-sm">Adaptive Learning</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-muted">Mastery:</div>
          <div className="w-24 h-2 bg-surface1 rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${masteryLevel * 100}%` }}
            />
          </div>
          <div className="text-xs font-mono text-accent">{Math.round(masteryLevel * 100)}%</div>
        </div>
      </div>

      {/* Adaptive Hints */}
      {masteryLevel < 0.5 && (
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="text-warning flex-shrink-0 mt-0.5" size={16} />
            <div className="text-xs text-warning">
              <div className="font-semibold mb-1">Learning Focus</div>
              <div>This concept is challenging for you. Take your time and review the examples carefully.</div>
            </div>
          </div>
        </div>
      )}

      {masteryLevel > 0.7 && (
        <div className="bg-accent/10 border border-accent/30 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <TrendingUp className="text-accent flex-shrink-0 mt-0.5" size={16} />
            <div className="text-xs text-accent">
              <div className="font-semibold mb-1">Great Progress!</div>
              <div>You're doing well. Try the challenge questions to test your understanding.</div>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Content */}
      <div 
        className="bg-surface rounded-xl p-6 border border-border"
        onMouseEnter={handleStart}
      >
        {children}
      </div>

      {/* Adaptive Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => handleComplete(true)}
          className="flex-1 py-3 bg-accent text-black font-semibold rounded-lg hover:bg-accent/90 transition-colors"
        >
          I Got It ✓
        </button>
        <button
          onClick={() => handleComplete(false)}
          className="flex-1 py-3 bg-surface2 border border-border text-muted font-semibold rounded-lg hover:bg-surface3 transition-colors"
        >
          Need Review
        </button>
      </div>
    </div>
  );
}
