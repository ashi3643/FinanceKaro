"use client";

import { useStore } from "@/lib/store";
import { useParams, useRouter } from "next/navigation";
import { useState, TouchEvent } from "react";
import { level1Lessons } from "@/data/lessons/level1";
import { level2Lessons } from "@/data/lessons/level2";
import { level3Lessons } from "@/data/lessons/level3";
import { level4Lessons } from "@/data/lessons/level4";
import { level5Lessons } from "@/data/lessons/level5";
import { ArrowLeft, CheckCircle2, Trophy, XCircle } from "lucide-react";

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const { addXp, completeLesson } = useStore();
  
  const level = params?.level as string;
  const lessonId = params?.lesson as string;

  // Lesson data router
  let lesson: any = null;
  const levelNum = parseInt(level);
  switch (levelNum) {
    case 1:
      lesson = (level1Lessons as any)[lessonId];
      break;
    case 2:
      lesson = (level2Lessons as any)[lessonId];
      break;
    case 3:
      lesson = (level3Lessons as any)[lessonId];
      break;
    case 4:
      lesson = (level4Lessons as any)[lessonId];
      break;
    case 5:
      lesson = (level5Lessons as any)[lessonId];
      break;
  }

  const [currentCard, setCurrentCard] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Swipe detection limits
  const [touchStart, setTouchStart] = useState<number | null>(null);

  if (!lesson) {
    return <div className="p-4 pt-10 text-center">Lesson not found. <button onClick={() => router.back()} className="text-accent underline">Go back</button></div>;
  }

  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientY;
    const diff = touchStart - touchEnd;

    // Swipe up -> next card
    if (diff > 50) {
      nextCard();
    }
  };

  const nextCard = () => {
    if (lesson.cards[currentCard].type === 'quiz' && !showResult) {
      // Must complete quiz to proceed
      return;
    }
    
    if (currentCard < lesson.cards.length - 1) {
      setCurrentCard(c => c + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else if (!completed) {
      finishLesson();
    }
  };

  const handleQuizAnswer = (idx: number) => {
    if (showResult) return;
    setSelectedOption(idx);
    setShowResult(true);
    
    const card = lesson.cards[currentCard];
    if (idx === card.answerIndex) {
      // Correct!
      addXp(50); // Give XP for correct answer
    }
  };

  const finishLesson = () => {
    setCompleted(true);
    addXp(100); // 100 XP for lesson complete
    completeLesson(Number(level), lessonId);
  };

  const progress = ((currentCard + 1) / lesson.cards.length) * 100;
  const card = lesson.cards[currentCard];

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] animate-in zoom-in duration-500 space-y-6">
        <div className="w-32 h-32 bg-accent/20 rounded-full flex items-center justify-center border border-accent/40 shadow-lg shadow-accent/20">
          <Trophy size={64} className="text-accent" />
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-display font-extrabold mb-2">Lesson Complete!</h2>
          <p className="text-muted">+150 XP Earned</p>
        </div>
        <button 
          onClick={() => router.push('/learn')}
          className="bg-accent text-white font-bold py-4 px-8 rounded-full w-full hover:scale-105 transition-transform"
        >
          Continue Journey
        </button>
      </div>
    );
  }

  return (
    <div 
      className="absolute inset-0 bg-bg z-50 flex flex-col pt-4 overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Progress */}
      <div className="px-4 pb-2">
        <button onClick={() => router.back()} className="p-2 -ml-2 mb-2 text-muted">
          <ArrowLeft size={24} />
        </button>
        <div className="w-full h-1.5 bg-surface2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card Content area */}
      <div className="flex-1 flex flex-col px-4 pb-10" onClick={nextCard}>
        <div className={`flex-1 flex flex-col justify-center animate-in slide-in-from-bottom-10 fade-in duration-300`}>
          
          {card.type !== 'quiz' ? (
            <div className="space-y-6">
               <div className="inline-block px-3 py-1 bg-surface2 rounded-full text-xs font-bold text-muted uppercase tracking-wider">
                 {card.type}
               </div>
               <h2 className="text-3xl font-display font-bold leading-tight">{card.text}</h2>
               {card.subtext && <p className="text-muted text-lg">{card.subtext}</p>}
            </div>
          ) : (
            <div className="space-y-6 w-full max-w-sm mx-auto" onClick={(e) => e.stopPropagation()}>
               <div className="inline-block px-3 py-1 bg-accent/20 rounded-full text-xs font-bold text-accent uppercase tracking-wider mb-2">
                 Knowledge Check
               </div>
               <h2 className="text-2xl font-display font-bold leading-tight mb-8">{card.question}</h2>
               
               <div className="space-y-3">
                 {card.options.map((opt: string, idx: number) => {
                   let stateClass = "bg-surface border-border hover:border-accent/40";
                   if (showResult) {
                     if (idx === card.answerIndex) stateClass = "bg-accent/20 border-accent text-accent";
                     else if (idx === selectedOption) stateClass = "bg-warning/20 border-warning text-warning";
                     else stateClass = "bg-surface/50 border-border opacity-50";
                   }

                   return (
                     <button
                       key={idx}
                       onClick={() => handleQuizAnswer(idx)}
                       disabled={showResult}
                       className={`w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center ${stateClass}`}
                     >
                       <span className="font-medium text-[15px]">{opt}</span>
                       {showResult && idx === card.answerIndex && <CheckCircle2 size={20} className="text-accent"/>}
                       {showResult && idx === selectedOption && idx !== card.answerIndex && <XCircle size={20} className="text-warning"/>}
                     </button>
                   );
                 })}
               </div>

               {showResult && (
                 <div className="pt-6 animate-in fade-in">
                   <button 
                     onClick={nextCard}
                     className="w-full bg-accent text-white font-bold py-4 rounded-full flex items-center justify-center gap-2"
                   >
                     Continue
                   </button>
                 </div>
               )}
            </div>
          )}

        </div>
        
        {/* Swipe Hint */}
        {card.type !== 'quiz' && (
          <div className="text-center pb-8 text-muted/50 text-xs uppercase tracking-widest animate-pulse opacity-60">
            Tap or swipe up to continue
          </div>
        )}
      </div>

    </div>
  );
}
