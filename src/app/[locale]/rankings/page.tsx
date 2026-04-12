"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Trophy, Medal, Building2, LoaderCircle, Plus, AlertCircle, Search, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/lib/store";
import { useTranslations } from "next-intl";

interface CollegeNode {
  college: string;
  total_xp: number;
  students: number;
}

const RANKINGS_CACHE_KEY = "financekaro-rankings-cache-v1";
const RANKINGS_CACHE_TTL = 1000 * 60 * 60 * 4; // 4 hours

// Common Indian colleges for search-ahead - Tier 1, 2, 3 colleges across India
const INDIAN_COLLEGES = [
  // IITs (Tier 1)
  "IIT Delhi, Delhi",
  "IIT Bombay, Mumbai",
  "IIT Madras, Chennai",
  "IIT Kanpur, Kanpur",
  "IIT Kharagpur, Kharagpur",
  "IIT Roorkee, Roorkee",
  "IIT Guwahati, Guwahati",
  "IIT Hyderabad, Hyderabad",
  "IIT Indore, Indore",
  "IIT Bhubaneswar, Bhubaneswar",
  "IIT Gandhinagar, Gandhinagar",
  "IIT Ropar, Rupnagar",
  "IIT Patna, Patna",
  "IIT Bhilai, Bhilai",
  "IIT Goa, Goa",
  "IIT Jammu, Jammu",
  "IIT Dharwad, Dharwad",
  "IIT Tirupati, Tirupati",
  "IIT Palakkad, Palakkad",
  "IIT Mandi, Mandi",
  "IIT Jodhpur, Jodhpur",
  "IIT Dhanbad, Dhanbad",
  "IIT Roorkee, Roorkee",
  "IIT BHU, Varanasi",
  
  // BITS (Tier 1)
  "BITS Pilani, Pilani",
  "BITS Goa, Goa",
  "BITS Hyderabad, Hyderabad",
  
  // NITs (Tier 1/2)
  "NIT Trichy, Tiruchirappalli",
  "NIT Surathkal, Mangalore",
  "NIT Warangal, Warangal",
  "NIT Calicut, Kozhikode",
  "NIT Kurukshetra, Kurukshetra",
  "NIT Allahabad, Prayagraj",
  "NIT Jamshedpur, Jamshedpur",
  "NIT Durgapur, Durgapur",
  "NIT Silchar, Silchar",
  "NIT Srinagar, Srinagar",
  "NIT Nagpur, Nagpur",
  "NIT Rourkela, Rourkela",
  "NIT Jaipur, Jaipur",
  "NIT Allahabad, Prayagraj",
  "NIT Hamirpur, Hamirpur",
  "NIT Jalandhar, Jalandhar",
  "NIT Patna, Patna",
  "NIT Raipur, Raipur",
  "NIT Agartala, Agartala",
  "NIT Delhi, Delhi",
  "NIT Puducherry, Puducherry",
  "NIT Goa, Goa",
  "NIT Meghalaya, Shillong",
  "NIT Manipur, Imphal",
  "NIT Mizoram, Aizawl",
  "NIT Nagaland, Dimapur",
  "NIT Sikkim, Ravangla",
  "NIT Andhra Pradesh, Tadepalligudem",
  "NIT Uttarakhand, Srinagar",
  "NIT Arunachal Pradesh, Jote",
  "NIT Karnataka, Surathkal",
  "NIT Hamirpur, Hamirpur",
  "NIT Jalandhar, Jalandhar",
  "NIT Patna, Patna",
  "NIT Raipur, Raipur",
  "NIT Agartala, Agartala",
  "NIT Delhi, Delhi",
  "NIT Puducherry, Puducherry",
  "NIT Goa, Goa",
  "NIT Meghalaya, Shillong",
  "NIT Manipur, Imphal",
  "NIT Mizoram, Aizawl",
  "NIT Nagaland, Dimapur",
  "NIT Sikkim, Ravangla",
  "NIT Andhra Pradesh, Tadepalligudem",
  "NIT Uttarakhand, Srinagar",
  "NIT Arunachal Pradesh, Jote",
  
  // IIITs (Tier 1/2)
  "IIIT Hyderabad, Hyderabad",
  "IIIT Bangalore, Bangalore",
  "IIIT Delhi, Delhi",
  "IIIT Allahabad, Prayagraj",
  "IIIT Kottayam, Kottayam",
  "IIIT Sri City, Sri City",
  "IIIT Gwalior, Gwalior",
  "IIIT Jabalpur, Jabalpur",
  "IIITDM Kancheepuram, Kancheepuram",
  "IIITDM Jabalpur, Jabalpur",
  "IIIT Bhopal, Bhopal",
  "IIIT Pune, Pune",
  "IIIT Ranchi, Ranchi",
  "IIIT Vadodara, Vadodara",
  "IIIT Dharwad, Dharwad",
  "IIIT Bhagalpur, Bhagalpur",
  "IIIT Lucknow, Lucknow",
  "IIIT Kalyani, Kalyani",
  "IIIT Agartala, Agartala",
  "IIIT Una, Una",
  "IIIT Surat, Surat",
  "IIIT Bhubaneswar, Bhubaneswar",
  "IIIT Guwahati, Guwahati",
  "IIIT Sri City, Sri City",
  "IIIT Kottayam, Kottayam",
  
  // Central Universities (Tier 1/2)
  "Delhi University, Delhi",
  "JNU, Delhi",
  "Banaras Hindu University, Varanasi",
  "Aligarh Muslim University, Aligarh",
  "Panjab University, Chandigarh",
  "University of Hyderabad, Hyderabad",
  "Jadavpur University, Kolkata",
  "University of Calcutta, Kolkata",
  "University of Mumbai, Mumbai",
  "University of Pune, Pune",
  "Savitribai Phule Pune University, Pune",
  "Anna University, Chennai",
  "Osmania University, Hyderabad",
  "University of Madras, Chennai",
  "University of Mysore, Mysore",
  "University of Kerala, Thiruvananthapuram",
  "University of Bangalore, Bangalore",
  "University of Gujarat, Ahmedabad",
  "University of Rajasthan, Jaipur",
  "University of Lucknow, Lucknow",
  "University of Patna, Patna",
  "University of Allahabad, Prayagraj",
  "University of Kashmir, Srinagar",
  "University of Jammu, Jammu",
  "University of Himachal Pradesh, Shimla",
  "University of Uttarakhand, Dehradun",
  "University of North Bengal, Siliguri",
  "University of Burdwan, Burdwan",
  "University of Kalyani, Kalyani",
  "Vidyasagar University, Midnapore",
  "University of North Bengal, Siliguri",
  "Tezpur University, Tezpur",
  "Assam University, Silchar",
  "Dibrugarh University, Dibrugarh",
  "Gauhati University, Guwahati",
  "Manipur University, Imphal",
  "Mizoram University, Aizawl",
  "Nagaland University, Lumami",
  "Tripura University, Agartala",
  "Sikkim University, Gangtok",
  "Rajasthan University, Jaipur",
  "Mohammad Ali Jauhar University, Aligarh",
  "Shivaji University, Kolhapur",
  "University of Mumbai, Mumbai",
  "University of Calcutta, Kolkata",
  "University of Delhi, Delhi",
  "Jawaharlal Nehru University, Delhi",
  
  // State Universities (Tier 2/3) - Major ones
  "Andhra University, Visakhapatnam",
  "Acharya Nagarjuna University, Guntur",
  "Sri Venkateswara University, Tirupati",
  "Kakatiya University, Warangal",
  "Osmania University, Hyderabad",
  "University of Hyderabad, Hyderabad",
  "Telangana University, Nizamabad",
  "Mahatma Gandhi University, Kottayam",
  "Cochin University of Science and Technology, Kochi",
  "University of Calicut, Kozhikode",
  "Kannur University, Kannur",
  "University of Kerala, Thiruvananthapuram",
  "Mahatma Gandhi University, Kottayam",
  "Sree Sankaracharya University of Sanskrit, Kalady",
  
  // Deemed Universities (Tier 1/2/3)
  "SRM University, Chennai",
  "VIT University, Vellore",
  "Amrita Vishwa Vidyapeetham, Coimbatore",
  "Manipal University, Manipal",
  "SASTRA University, Thanjavur",
  "Bharath University, Chennai",
  "Sathyabama Institute of Science and Technology, Chennai",
  "Vellore Institute of Technology, Vellore",
  "SRM Institute of Science and Technology, Chennai",
  "Amrita School of Engineering, Coimbatore",
  "Manipal Institute of Technology, Manipal",
  
  // Medical Colleges (Tier 1/2)
  "AIIMS Delhi, Delhi",
  "AIIMS Mumbai, Mumbai",
  "AIIMS Chennai, Chennai",
  "AIIMS Kolkata, Kolkata",
  "AIIMS Bhubaneswar, Bhubaneswar",
  "AIIMS Jodhpur, Jodhpur",
  "AIIMS Bhopal, Bhopal",
  "AIIMS Rishikesh, Rishikesh",
  "AIIMS Patna, Patna",
  "AIIMS Raipur, Raipur",
  "AIIMS Rourkela, Rourkela",
  "JIPMER, Puducherry",
  "PGIMER, Chandigarh",
  "CMC Vellore, Vellore",
  "AFMC Pune, Pune",
  "Christian Medical College, Vellore",
  "St. John's Medical College, Bangalore",
  "Kasturba Medical College, Manipal",
  "Madras Medical College, Chennai",
  "Grant Medical College, Mumbai",
  "King George's Medical University, Lucknow",
  "Government Medical College, Thiruvananthapuram",
  
  // Law Colleges (Tier 1/2)
  "National Law School of India University, Bangalore",
  "NALSAR University of Law, Hyderabad",
  "National Law University, Delhi",
  "WB National University of Juridical Sciences, Kolkata",
  "National Law Institute University, Bhopal",
  "Gujarat National Law University, Gandhinagar",
  "Dr. Ram Manohar Lohiya National Law University, Lucknow",
  "Rajiv Gandhi National University of Law, Patiala",
  "National Law University, Jodhpur",
  "Chanakya National Law University, Patna"
];

export default function RankingsPage() {
  const t = useTranslations("rankings");
  const { deviceId, initDevice, setCollege } = useStore();
  const [city, setCity] = useState("All");
  const [leaderboard, setLeaderboard] = useState<CollegeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cachedAt, setCachedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [failureCount, setFailureCount] = useState(0);
  const [circuitOpen, setCircuitOpen] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySuccess, setNotifySuccess] = useState(false);
  const [notifyError, setNotifyError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collegeInput, setCollegeInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [citySearch, setCitySearch] = useState("");

  const filteredColleges = useMemo(() => {
    if (!collegeInput.trim()) return [];
    return INDIAN_COLLEGES.filter(college =>
      college.toLowerCase().includes(collegeInput.toLowerCase())
    ).slice(0, 5);
  }, [collegeInput]);

  const getCity = (fullName: string) => fullName.split(", ").pop() || fullName;

  const readCachedLeaderboard = () => {
    if (typeof window === "undefined") return null;
    try {
      const cachedText = window.localStorage.getItem(RANKINGS_CACHE_KEY);
      if (!cachedText) return null;
      const parsed = JSON.parse(cachedText) as { items: CollegeNode[]; cachedAt: string };
      if (!parsed.items || !parsed.cachedAt) return null;
      const age = Date.now() - new Date(parsed.cachedAt).getTime();
      if (age > RANKINGS_CACHE_TTL) {
        window.localStorage.removeItem(RANKINGS_CACHE_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  };

  const cacheLeaderboard = (items: CollegeNode[]) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      RANKINGS_CACHE_KEY,
      JSON.stringify({ items, cachedAt: new Date().toISOString() })
    );
    setCachedAt(new Date().toLocaleString());
  };

  const openCircuit = () => {
    setCircuitOpen(true);
    setTimeout(() => setCircuitOpen(false), 15000);
  };

  const notifyWhenUp = () => {
    const trimmed = notifyEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setNotifyError(t("validEmailHint"));
      return;
    }

    setNotifySuccess(true);
    setNotifyError(null);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("financekaro-rankings-notify-email", trimmed);
    }
  };

  const loadLeaderboard = useCallback(async () => {
    const cached = readCachedLeaderboard();
    if (cached) {
      setLeaderboard(cached.items);
      setCachedAt(new Date(cached.cachedAt).toLocaleString());
    }

    if (circuitOpen) {
      setError(t("serverCoolingDown"));
      setLoading(false);
      setIsRefreshing(false);
      return;
    }

    setError(null);
    if (!cached) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }

    if (!supabase) {
      setError(t("connectionError"));
      setLoading(false);
      setIsRefreshing(false);
      if (!cached) setLeaderboard([]);
      return;
    }

    try {
      const { data, error: queryError } = await supabase
        .from("profiles")
        .select("college, xp")
        .not("college", "is", null)
        .neq("college", "");

      if (queryError || !data || !Array.isArray(data)) {
        throw queryError || new Error("No data returned");
      }

      const collegeMap = new Map<string, { total_xp: number; students: number }>();
      data.forEach((profile) => {
        const college = profile.college;
        if (!college) return;
        if (collegeMap.has(college)) {
          const existing = collegeMap.get(college)!;
          existing.total_xp += profile.xp || 0;
          existing.students += 1;
        } else {
          collegeMap.set(college, { total_xp: profile.xp || 0, students: 1 });
        }
      });

      const aggregatedData = Array.from(collegeMap.entries())
        .map(([college, stats]) => ({ college, ...stats }))
        .sort((a, b) => b.total_xp - a.total_xp);

      setLeaderboard(aggregatedData);
      cacheLeaderboard(aggregatedData);
      setError(null);
      setFailureCount(0);
    } catch {
      setFailureCount((current) => {
        const next = current + 1;
        if (next >= 2) {
          openCircuit();
        }
        return next;
      });
      setError(t(cached ? "connectionWarning" : "connectionError"));
      if (!cached) setLeaderboard([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [t, circuitOpen]);

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

  const visibleCityOptions = useMemo(() => {
    if (!citySearch.trim()) return cityOptions;
    return cityOptions.filter((cityOption) => cityOption.toLowerCase().includes(citySearch.toLowerCase()));
  }, [cityOptions, citySearch]);

  const trendingCities = useMemo(() => leaderboard.slice(0, 3).map((entry) => getCity(entry.college)), [leaderboard]);

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
      console.error("Supabase client is not initialized");
      setFormError("Database connection error. Please try again.");
      setIsSaving(false);
      return;
    }

    console.log("Attempting to save college:", { deviceId: currentDeviceId, college: trimmed });

    const { error: updateError } = await supabase
      .from("profiles")
      .upsert({ device_id: currentDeviceId, college: trimmed }, { onConflict: "device_id" });

    if (updateError) {
      console.error("Supabase upsert error:", updateError);
      setFormError(`Failed to save: ${updateError.message}`);
      setIsSaving(false);
      return;
    }

    console.log("College saved successfully");
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

      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-surface2/80 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-accent">{t("milestoneTitle")}</div>
            <div className="mt-1 text-sm font-semibold text-text">{t("milestoneReward")}</div>
          </div>
          {cachedAt ? (
            <div className="text-xs text-muted">
              {t("cacheNotice")} • {cachedAt}
            </div>
          ) : null}
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              placeholder={t("searchCities")}
              aria-label="Search cities"
              className="w-full rounded-2xl border border-border bg-surface2 py-3 pl-10 pr-4 text-sm text-text outline-none focus:border-accent"
            />
          </div>

          <div className="rounded-2xl border border-border bg-surface2 p-4 text-sm text-muted">
            <div className="font-semibold text-text mb-2">{t("trendingCities")}</div>
            <div className="flex flex-wrap gap-2">
              {trendingCities.length > 0 ? (
                trendingCities.map((cityName) => (
                  <button
                    key={cityName}
                    onClick={() => {
                      setCity(cityName);
                      setCitySearch("");
                    }}
                    className={`rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${city === cityName ? "bg-accent text-white border-accent" : "bg-surface text-muted border-border"}`}
                  >
                    {cityName}
                  </button>
                ))
              ) : (
                <div className="text-xs text-muted">{t("noTrendingCities")}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pb-2 overflow-x-auto">
        {visibleCityOptions.length > 0 ? visibleCityOptions.map((cityOption) => (
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
        )) : (
          <div className="px-4 py-2 rounded-full bg-surface2 text-xs text-muted">{t("noCityMatches")}</div>
        )}
      </div>

      {isRefreshing && leaderboard.length > 0 && (
        <div className="rounded-2xl border border-accent/20 bg-accent/10 p-4 text-sm text-accent flex items-center gap-2">
          <LoaderCircle size={16} className="animate-spin" />
          {t("refreshing")}
        </div>
      )}

      {loading && leaderboard.length === 0 && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-20 rounded-3xl bg-surface2/80 animate-pulse" />
          ))}
        </div>
      )}

      {error && leaderboard.length === 0 && (
        <div className="rounded-3xl border border-warning/40 bg-warning/10 p-6 text-sm space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-warning mt-1" size={24} />
            <div>
              <div className="font-bold text-warning text-lg">{t("connectionError")}</div>
              <div className="text-muted text-sm mt-1">{t("retryHint")}</div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="text-sm font-semibold text-text mb-2">{t("notifyHeadline")}</div>
            <p className="text-xs text-muted mb-3">{t("notifySubtext")}</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                value={notifyEmail}
                onChange={(e) => {
                  setNotifyEmail(e.target.value);
                  setNotifyError(null);
                  setNotifySuccess(false);
                }}
                placeholder={t("notifyPlaceholder")}
                className="w-full rounded-2xl border border-border bg-surface2 px-4 py-3 text-sm outline-none focus:border-accent"
              />
              <button
                onClick={notifyWhenUp}
                className="rounded-2xl bg-accent px-4 py-3 text-sm font-bold text-black transition-colors hover:bg-accent/90"
              >
                {t("notifyButton")}
              </button>
            </div>
            {notifyError && <div className="text-xs text-warning mt-2">{notifyError}</div>}
            {notifySuccess && <div className="text-xs text-green-500 mt-2">{t("notifySuccess")}</div>}
          </div>
          <button
            onClick={() => loadLeaderboard()}
            className="w-full rounded-2xl bg-warning/20 border border-warning/40 py-3 text-sm font-semibold text-warning hover:bg-warning/30 transition-colors"
          >
            {t("retry")}
          </button>
        </div>
      )}

      {error && leaderboard.length > 0 && (
        <div className="rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm text-warning mb-4">
          <div className="font-semibold">{t("connectionWarning")}</div>
          <div className="text-muted text-xs mt-1">{t("retryHint")}</div>
        </div>
      )}

      {!loading && (
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

      <div className="mt-8 pb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          aria-label="Add your college to rankings"
          className="w-full bg-surface2 border border-accent text-accent font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-accent/10 transition-colors"
        >
          <Medal size={20} /> {t("addCollege")}
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-5 space-y-4">
            <h2 className="text-lg font-display font-bold">{t("yourCollege")}</h2>
            <p className="text-sm text-muted">{t("addCollegeHint")}</p>

            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" size={16} />
                <input
                  value={collegeInput}
                  onChange={(e) => {
                    setCollegeInput(e.target.value);
                    setShowSuggestions(true);
                    setFormError(null);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder={t("collegePlaceholder")}
                  aria-label="College name and city"
                  className="w-full bg-surface2 border border-border rounded-lg pl-10 pr-8 py-2 text-sm outline-none focus:border-accent"
                />
                {collegeInput && (
                  <button
                    onClick={() => {
                      setCollegeInput("");
                      setShowSuggestions(false);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-text"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {showSuggestions && filteredColleges.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {filteredColleges.map((college, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCollegeInput(college);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-accent/10 first:rounded-t-lg last:rounded-b-lg"
                    >
                      <div className="font-medium">{college.split(",")[0]}</div>
                      <div className="text-xs text-muted">{college.split(",")[1]}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {formError && (
              <div className="text-xs text-warning">{formError}</div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setFormError(null);
                  setCollegeInput("");
                  setShowSuggestions(false);
                }}
                aria-label="Cancel adding college"
                className="flex-1 bg-surface2 border border-border py-2 rounded-lg text-sm font-semibold"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleAddCollege}
                disabled={isSaving || collegeInput.trim().length < 3}
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
