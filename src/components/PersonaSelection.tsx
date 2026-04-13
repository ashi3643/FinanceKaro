"use client";

import { useState, useEffect } from "react";
import { GraduationCap, Briefcase, Users, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { useTranslations } from "next-intl";

type Persona = 'junior' | 'youth' | 'legacy';

interface PersonaOption {
  id: Persona;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  ageRange: string;
  focus: string;
}

export default function PersonaSelection() {
  const t = useTranslations("persona");
  const { persona, setPersona } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only show modal if persona is not set
    if (!persona) {
      setIsOpen(true);
    }
  }, [persona]);

  if (!isOpen || persona) return null;

  const personas: PersonaOption[] = [
    {
      id: 'junior',
      title: t("junior.title"),
      subtitle: t("junior.subtitle"),
      icon: <GraduationCap className="w-8 h-8" />,
      ageRange: t("junior.ageRange"),
      focus: t("junior.focus")
    },
    {
      id: 'youth',
      title: t("youth.title"),
      subtitle: t("youth.subtitle"),
      icon: <Briefcase className="w-8 h-8" />,
      ageRange: t("youth.ageRange"),
      focus: t("youth.focus")
    },
    {
      id: 'legacy',
      title: t("legacy.title"),
      subtitle: t("legacy.subtitle"),
      icon: <Users className="w-8 h-8" />,
      ageRange: t("legacy.ageRange"),
      focus: t("legacy.focus")
    }
  ];

  const handleSelect = (selectedPersona: Persona) => {
    setPersona(selectedPersona);
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface1 rounded-2xl max-w-lg w-full p-6 border border-border shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold font-display text-text-primary mb-2">
              {t("title")}
            </h2>
            <p className="text-sm text-text-secondary">
              {t("subtitle")}
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Persona Options */}
        <div className="space-y-3">
          {personas.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className="w-full p-4 rounded-xl border border-border bg-surface2 hover:border-accent hover:bg-surface3 transition-all group text-left"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-surface1 group-hover:bg-accent/10 transition-colors">
                  <div className="text-accent">
                    {option.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-text-primary mb-1">
                    {option.title}
                  </h3>
                  <p className="text-sm text-text-secondary mb-2">
                    {option.subtitle}
                  </p>
                  <div className="flex gap-3 text-xs text-text-tertiary">
                    <span className="bg-surface1 px-2 py-1 rounded">
                      {option.ageRange}
                    </span>
                    <span className="bg-surface1 px-2 py-1 rounded">
                      {option.focus}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer Note */}
        <p className="text-xs text-text-tertiary text-center mt-6">
          {t("note")}
        </p>
      </div>
    </div>
  );
}
