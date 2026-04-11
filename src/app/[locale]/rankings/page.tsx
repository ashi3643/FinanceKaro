"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Trophy, Medal, Building2, LoaderCircle, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/lib/store";
import { useTranslations } from "next-intl";

interface CollegeNode {
  college: string;
  total_xp: number;
  students: number;
}

export default function RankingsPage() {
  const t = useTranslations("rankings");
  const { deviceId, initDevice, setCollege } = useStore();
  const [city, setCity] = useState("All");
  const [leaderboard, setLeaderboard] = useState<CollegeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collegeInput, setCollegeInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const getCity = (fullName: string) => fullName.split(", ").pop() || fullName;

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!supabase) {
      setError(t("loadError"));
      setLeaderboard([]);
      setLoading(false);
      return;
    }

    const { data, error: queryError } = await supabase
      .from("college_leaderboard")
      .select("*")
      .order("total_xp", { ascending: false });

    if (queryError) {
      setError(t("loadError"));
      setLeaderboard([]);
      setLoading(false);
      return;
    }

    setLeaderboard(data ?? []);
    setLoading(false);
  }, [t]);

  useEffect(() => {
    initDevice();
  }, [initDevice]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadLeaderboard();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadLeaderboard]);

  const cityOptions = useMemo(() => {
    const uniqueCities = Array.from(new Set(leaderboard.map((entry) => getCity(entry.college))));
    return ["All", ...uniqueCities];
  }, [leaderboard]);

  const filtered = city === "All" ? leaderboard : leaderboard.filter((entry) => getCity(entry.college) === city);

  const handleAddCollege = async () => {
    const trimmed = collegeInput.trim();
    if (trimmed.length < 3) {
      setFormError(t("validationError"));
      return;
    }

    setFormError(null);
    setIsSaving(true);

    let currentDeviceId = deviceId;
    if (!currentDeviceId) {
      await initDevice();
      currentDeviceId = useStore.getState().deviceId;
    }

    if (!currentDeviceId) {
      setFormError(t("deviceError"));
      setIsSaving(false);
      return;
    }

    if (!supabase) {
      setFormError(t("saveError"));
      setIsSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .upsert({ device_id: currentDeviceId, college: trimmed }, { onConflict: "device_id" });

    if (updateError) {
      setFormError(t("saveError"));
      setIsSaving(false);
      return;
    }

    setCollege(trimmed);
    setIsSaving(false);
    setIsModalOpen(false);
    setCollegeInput("");
    await loadLeaderboard();
  };

  return (
    <div className="flex flex-col min-h-full py-4 space-y-6">
      <div className="flex justify-between items-end mb-2">
        <div>
          <span className="text-xs font-bold text-accent uppercase tracking-widest block mb-1">{t("stateLevel")}</span>
          <h1 className="text-3xl font-display font-extrabold flex items-center gap-2">{t("collegeRankings")} <Trophy className="text-accent" size={24} /></h1>
        </div>
      </div>

      <div className="flex gap-2 pb-2 overflow-x-auto">
        {cityOptions.map((cityOption) => (
          <button
            key={cityOption}
            onClick={() => setCity(cityOption)}
            aria-label={`Filter by ${cityOption === "All" ? "all cities" : cityOption}`}
            aria-pressed={city === cityOption}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
              city === cityOption ? "bg-accent text-white" : "bg-surface2 text-muted border border-border"
            }`}
          >
            {cityOption === "All" ? t("allCities") : cityOption}
          </button>
        ))}
      </div>

      {loading && (
        <div className="rounded-2xl border border-border bg-surface p-6 flex items-center gap-3 text-sm text-muted">
          <LoaderCircle size={18} className="animate-spin" />
          <span>{t("loadingRankings")}</span>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm text-warning">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-3 pb-8">
          {filtered.length === 0 && (
            <div className="rounded-2xl border border-border bg-surface2/50 p-6 text-sm text-muted text-center">
              {t("emptyState")}
            </div>
          )}

          {filtered.map((college, idx) => {
            const isTop3 = idx < 3;

            return (
              <div
                key={college.college}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                  isTop3 ? "bg-surface glass border-accent/20" : "bg-surface2/50 border-border"
                }`}
              >
                <div className={`w-8 font-display font-extrabold text-xl text-center ${
                  idx === 0 ? "text-warning" : idx === 1 ? "text-muted" : idx === 2 ? "text-accent2" : "text-muted/50"
                }`}>
                  #{idx + 1}
                </div>

                <div className="flex-1">
                  <div className="font-bold font-display text-text">{college.college.split(",")[0]}</div>
                  <div className="text-[11px] text-muted flex items-center gap-1 uppercase tracking-wider mt-1">
                    <Building2 size={10} /> {getCity(college.college)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-accent">{college.total_xp.toLocaleString()}</div>
                  <div className="text-[10px] text-muted uppercase tracking-wider">{t("totalXP")}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-auto pb-4 sticky bottom-0 bg-gradient-to-t from-bg via-bg to-transparent pt-8">
        <button
          onClick={() => setIsModalOpen(true)}
          aria-label="Add your college to rankings"
          className="w-full bg-surface border border-accent text-accent font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-accent/10 transition-colors"
        >
          <Medal size={20} /> {t("addCollege")}
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-5 space-y-4">
            <h2 className="text-lg font-display font-bold">{t("yourCollege")}</h2>
            <p className="text-sm text-muted">{t("addCollegeHint")}</p>
            <input
              value={collegeInput}
              onChange={(e) => setCollegeInput(e.target.value)}
              placeholder={t("collegePlaceholder")}
              aria-label="College name and city"
              className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
            />
            {formError && (
              <div className="text-xs text-warning">{formError}</div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setFormError(null);
                }}
                aria-label="Cancel adding college"
                className="flex-1 bg-surface2 border border-border py-2 rounded-lg text-sm font-semibold"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleAddCollege}
                disabled={isSaving}
                aria-label="Save college"
                className="flex-1 bg-accent text-black py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSaving ? <LoaderCircle size={16} className="animate-spin" /> : <Plus size={16} />}
                {t("saveCollege")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
