"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { Lock, Check, Play } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import curriculumData from "@/data/curriculum.json";

export default function LearnPage() {
  const { stage, unlockedLevels, completedLessons } = useStore();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("learn");
  const basePath = `/${locale}`;
  const stageLabel = stage === "Student" ? t("studentPath") : "First Jobber Path";

  useEffect(() => {
    if (!stage) {
      router.push(basePath);
    }
  }, [basePath, router, stage]);

  if (!stage) {
    return null;
  }

  const levels = [
    {
      id: 1,
      title: stage === "Student" ? "Student Life" : "Basic Reality",
      sub: "Pocket Money Reality",
      color: "text-accent",
      bgColor: "bg-accent",
      borderColor: "border-accent",
      shadow: "shadow-sm shadow-accent/15",
      lessons: 7
    },
    ...(Object.keys(curriculumData.curriculum).map(levelKey => {
      const levelData = (curriculumData.curriculum as any)[levelKey];
      const levelId = parseInt(levelKey.replace('level', ''));
      return {
        id: levelId,
        title: levelData.title,
        sub: levelData.subtitle,
        color: levelId === 2 ? "text-accent3" : levelId === 3 ? "text-accent2" : levelId === 4 ? "text-warning" : "text-accent",
        bgColor: levelId === 2 ? "bg-accent3" : levelId === 3 ? "bg-accent2" : levelId === 4 ? "bg-warning" : "bg-accent",
        borderColor: levelId === 2 ? "border-accent3" : levelId === 3 ? "border-accent2" : levelId === 4 ? "border-warning" : "border-accent",
        shadow: `shadow-sm shadow-${levelId === 2 ? "accent3" : levelId === 3 ? "accent2" : levelId === 4 ? "warning" : "accent"}/15`,
        lessons: levelData.lessons.length
      };
    }))
  ];

  return (
    <div className="flex flex-col min-h-full py-4 space-y-6">
      <div className="flex justify-between items-end mb-2">
        <div>
          <span className="text-xs font-bold text-muted uppercase tracking-widest block mb-1">{t("yourJourney")}</span>
          <h1 className="text-3xl font-display font-extrabold">{stageLabel}</h1>
        </div>
      </div>

      <div className="relative pl-6 space-y-10 py-4">
        <div className="absolute left-[39px] top-6 bottom-16 w-0.5 bg-border z-0" />

        {levels.map((level) => {
          const isUnlocked = unlockedLevels.includes(level.id);
          const levelCompletedLessons = completedLessons.filter((lessonKey) => lessonKey.startsWith(`level${level.id}`)).length;
          const progress = Math.min(100, Math.round((levelCompletedLessons / level.lessons) * 100));
          const isCompleted = progress === 100;

          return (
            <div key={level.id} className="relative z-10">
              <div className="flex items-start gap-5">
                <div
                  className={`relative shrink-0 mt-1 flex items-center justify-center w-8 h-8 rounded-full border-2 bg-surface transition-colors duration-500
                  ${isCompleted ? level.borderColor : isUnlocked ? level.borderColor : "border-border text-muted"}
                `}
                >
                  {isCompleted ? (
                    <div className={`w-full h-full rounded-full ${level.bgColor} flex items-center justify-center text-black`}>
                      <Check size={16} strokeWidth={3} />
                    </div>
                  ) : isUnlocked ? (
                    <div className={`w-3 h-3 rounded-full ${level.bgColor} animate-pulse`} />
                  ) : (
                    <Lock size={12} />
                  )}
                </div>

                <div
                  className={`flex-1 rounded-2xl border transition-all duration-300 overflow-hidden ${isUnlocked ? "bg-surface border-border hover:border-text/30 " + level.shadow : "bg-surface/50 border-border/50 opacity-60"}`}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-1">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${isUnlocked ? level.color + " bg-current/10" : "text-muted bg-surface2"}`}
                      >
                        Level {level.id}
                      </span>
                      <span className="text-xs text-muted font-medium font-mono">
                        {levelCompletedLessons}/{level.lessons} Lessons
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-lg leading-tight mt-3 text-text">{level.title}</h3>
                    <p className="text-xs text-muted mt-1">{level.sub}</p>

                    {isUnlocked ? (
                      <div className="mt-4 flex gap-2">
                        {(() => {
                          const levelData = (curriculumData.curriculum as any)[`level${level.id}`];
                          const lessonIds = levelData ? levelData.lessons.map((l: any) => l.id) : Array.from({ length: level.lessons }, (_, j) => `lesson${j + 1}`);
                          return lessonIds.map((lessonId: string, j: number) => {
                            const isLessonCompleted = completedLessons.includes(`level${level.id}-${lessonId}`);
                            const lessonLocked = !isLessonCompleted && j > levelCompletedLessons;

                            return (
                              <Link
                                key={j}
                                href={lessonLocked ? "#" : `${basePath}/learn/${level.id}/${lessonId}`}
                                aria-label={lessonLocked ? `Lesson ${j + 1} is locked` : `Open lesson ${j + 1}`}
                                className={`flex-1 h-2 rounded-full transition-colors ${
                                  isLessonCompleted
                                    ? level.bgColor
                                    : lessonLocked
                                      ? "bg-surface2"
                                      : "bg-surface2 border border-dashed border-muted"
                                }`}
                              />
                            );
                          });
                        })()}
                      </div>
                    ) : null}
                  </div>

                  {isUnlocked ? (
                    <div className="flex w-full divide-x divide-border/50 border-t border-border/50">
                      <Link
                        href={`${basePath}/learn/${level.id}/${(() => {
                          const levelData = (curriculumData.curriculum as any)[`level${level.id}`];
                          const lessonIds = levelData ? levelData.lessons.map((l: any) => l.id) : Array.from({ length: level.lessons }, (_, j) => `lesson${j + 1}`);
                          const nextLessonIndex = isCompleted ? 0 : levelCompletedLessons;
                          return lessonIds[nextLessonIndex] || lessonIds[0];
                        })()}`}
                        aria-label={isCompleted ? `Review level ${level.id}` : `Continue level ${level.id}`}
                        className="flex-1 py-3 px-4 flex items-center justify-center text-xs font-bold transition-colors hover:bg-black/5"
                      >
                        {isCompleted ? (
                          <span className="text-text/70 flex items-center gap-2">Review</span>
                        ) : (
                          <span className="flex items-center gap-2 text-text">
                            <Play size={14} fill="currentColor" /> {t("continue")}
                          </span>
                        )}
                      </Link>
                      {isCompleted ? (
                        <button
                          onClick={() => alert("Certificate generator feature flag enabled. Downloading...")}
                          aria-label={`Download certificate for level ${level.id}`}
                          className="flex-1 py-3 px-4 flex items-center justify-center text-xs font-bold text-accent transition-colors hover:bg-accent/5"
                        >
                          Certificate
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
