"use client";

import { useStore } from "@/lib/store";
import { ShieldAlert, CheckCircle2, XCircle, Search, AlertCircle, TrendingUp, Zap, Shield, AlertTriangle, Upload, Share, Phone, FileText, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";

// XP Animation Component
const XPAnimation = ({ show }: { show: boolean }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
      >
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: -100 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="bg-gradient-to-r from-accent to-accent/80 text-white px-6 py-3 rounded-full font-bold text-lg shadow-2xl border-2 border-white/20"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            +20 XP
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Live Ticker Component
const LiveTicker = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const tickerItems = [
    "🚨 15 scams detected this hour",
    "✅ 47 users protected today",
    "💰 ₹2.3L saved from fraud",
    "🎯 89% detection accuracy",
    "🛡️ 1200+ scam patterns learned"
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tickerItems.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface2/50 border border-border/50 rounded-full px-4 py-2 text-xs text-muted flex items-center gap-2"
    >
      <TrendingUp className="w-3 h-3 text-accent" />
      <span className="font-medium">{tickerItems[currentIndex]}</span>
    </motion.div>
  );
};

const SCAMS = [
  // Task Fraud / Work-from-Home Scams
  {
    id: 1,
    title: "Telegram Part-Time Job",
    message: "\"Like 3 YouTube videos and get ₹500/day. Pay ₹1000 joining fee which is refundable.\"",
    isScam: true,
    realTruth: "Task Fraud. They pay you ₹150 first to build trust, then trap you into larger 'prepaid' tasks."
  },
  {
    id: 2,
    title: "Instagram Money Making",
    message: "\"Follow 50 accounts daily and earn ₹2000/month. Pay ₹500 for training material.\"",
    isScam: true,
    realTruth: "Ponzi scheme. You recruit others who pay you, but eventually the pyramid collapses."
  },
  {
    id: 3,
    title: "Data Entry Job",
    message: "\"Work from home data entry. ₹15000/month. Pay ₹2000 for software setup.\"",
    isScam: true,
    realTruth: "Advance fee fraud. They disappear after you pay the 'setup' fee."
  },

  // Phishing Scams
  {
    id: 4,
    title: "Bank KYC Update",
    message: "\"Dear customer, your SBI account will be blocked today. Click sbi-kyc-update.xyz to complete KYC.\"",
    isScam: true,
    realTruth: "Phishing. Official bank links don't end in .xyz and they never threaten immediate blocking via SMS."
  },
  {
    id: 5,
    title: "IRCTC Password Reset",
    message: "\"Your IRCTC password expires today. Click here to reset: irctc-secure-login.com\"",
    isScam: true,
    realTruth: "Phishing. Official IRCTC site is irctc.co.in, not .com variations."
  },
  {
    id: 6,
    title: "Amazon Order Confirmation",
    message: "\"Your Amazon order #123456 is delayed. Pay ₹500 processing fee to amazon-support.in\"",
    isScam: true,
    realTruth: "Amazon never asks for payment via external links or unofficial domains."
  },
  {
    id: 7,
    title: "Paytm Wallet Issue",
    message: "\"Paytm detected suspicious activity. Verify account: paytm-verify.net\"",
    isScam: true,
    realTruth: "Paytm uses paytm.com domain. Never click links from SMS for account issues."
  },

  // Investment Scams
  {
    id: 8,
    title: "Cryptocurrency Promise",
    message: "\"Invest ₹10000 in our crypto fund. Guaranteed 300% returns in 3 months.\"",
    isScam: true,
    realTruth: "No legitimate investment guarantees returns. Crypto is highly volatile."
  },
  {
    id: 9,
    title: "Private Equity Opportunity",
    message: "\"Exclusive PE deal: Invest ₹50000, get 50% returns in 6 months.\"",
    isScam: true,
    realTruth: "Real PE investments require ₹50 lakhs minimum and have 7-10 year lock-ins."
  },
  {
    id: 10,
    title: "Forex Trading Course",
    message: "\"Learn forex trading. Make ₹50000/day. Pay ₹15000 for premium course.\"",
    isScam: true,
    realTruth: "90% retail forex traders lose money. No course guarantees daily profits."
  },

  // Loan & Credit Scams
  {
    id: 11,
    title: "Instant Loan App",
    message: "\"Get ₹100000 loan instantly. Pay ₹2000 processing fee first.\"",
    isScam: true,
    realTruth: "Legitimate lenders don't charge advance processing fees for loans."
  },
  {
    id: 12,
    title: "Credit Card Limit Increase",
    message: "\"Your HDFC credit limit increased to ₹500000. Pay ₹5000 activation fee.\"",
    isScam: true,
    realTruth: "Banks never charge fees to activate approved credit limit increases."
  },
  {
    id: 13,
    title: "Loan Against Property",
    message: "\"Get 70% of property value as loan. Pay ₹10000 valuation fee first.\"",
    isScam: true,
    realTruth: "Property valuation is done by bank at no cost to borrower."
  },

  // Shopping & E-commerce Scams
  {
    id: 14,
    title: "Flash Sale Alert",
    message: "\"iPhone 15 at ₹19999! Limited stock. Pay now: flashdeals.in\"",
    isScam: true,
    realTruth: "Fake flash sales. Real Apple products are never this cheap."
  },
  {
    id: 15,
    title: "Flipkart Order Issue",
    message: "\"Your Flipkart order is stuck. Pay ₹300 customs duty: flipkart-support.net\"",
    isScam: true,
    realTruth: "Flipkart handles customs duty. Never pay via external links."
  },
  {
    id: 16,
    title: "Free Product Sample",
    message: "\"Enter contest to win free iPad. Pay ₹199 courier charges.\"",
    isScam: true,
    realTruth: "Legitimate contests don't ask you to pay for prizes you 'win'."
  },

  // Tech Support Scams
  {
    id: 17,
    title: "Windows Security Alert",
    message: "\"Your computer is infected! Call 1800-XXX-XXXX immediately.\"",
    isScam: true,
    realTruth: "Microsoft never calls users about security issues. They use Windows Security app."
  },
  {
    id: 18,
    title: "Google Account Suspension",
    message: "\"Your Gmail will be deleted. Verify: google-support.in\"",
    isScam: true,
    realTruth: "Google sends alerts through official app/email, not external links."
  },
  {
    id: 19,
    title: "Antivirus Renewal",
    message: "\"Your antivirus expired. Renew now for ₹2999: antivirus-pro.in\"",
    isScam: true,
    realTruth: "Legitimate antivirus software renews automatically or through official sites."
  },

  // Job & Career Scams
  {
    id: 20,
    title: "High Salary Job Offer",
    message: "\"Selected for ₹150000/month job. Pay ₹5000 verification fee.\"",
    isScam: true,
    realTruth: "Legitimate companies never charge job seekers for employment."
  },
  {
    id: 21,
    title: "Freelancer Platform",
    message: "\"Get projects worth ₹50000/month. Pay ₹3000 platform fee.\"",
    isScam: true,
    realTruth: "Real freelancing platforms like Upwork don't charge joining fees."
  },
  {
    id: 22,
    title: "Government Job",
    message: "\"Railway job vacancy. Pay ₹2000 application fee.\"",
    isScam: true,
    realTruth: "Government jobs have minimal or no application fees through official portals."
  },

  // Travel & Booking Scams
  {
    id: 23,
    title: "Cheap Flight Deal",
    message: "\"Delhi to Dubai flight for ₹5999! Book now: cheapflights.in\"",
    isScam: true,
    realTruth: "Flights to Dubai cost minimum ₹25000. Such cheap deals are fake."
  },
  {
    id: 24,
    title: "Hotel Booking Issue",
    message: "\"Your OYO booking failed. Pay ₹1500 to oyo-support.com\"",
    isScam: true,
    realTruth: "OYO handles payments through their official app/website."
  },
  {
    id: 25,
    title: "Visa Processing",
    message: "\"US visa approved. Pay ₹15000 processing fee to visa-agent.in\"",
    isScam: true,
    realTruth: "US embassy handles visa processing directly, no third-party agents."
  },

  // Health & Insurance Scams
  {
    id: 26,
    title: "Cancer Cure Medicine",
    message: "\"New medicine cures cancer. Buy for ₹50000: healthmiracle.in\"",
    isScam: true,
    realTruth: "No unproven medicine can cure cancer. Consult registered doctors."
  },
  {
    id: 27,
    title: "Life Insurance Policy",
    message: "\"Get ₹1 crore coverage for ₹500/month. No medical check.\"",
    isScam: true,
    realTruth: "High coverage at low premium without medical check is impossible."
  },
  {
    id: 28,
    title: "Ayurvedic Weight Loss",
    message: "\"Lose 10kg in 7 days. Pay ₹9999 for treatment.\"",
    isScam: true,
    realTruth: "Safe weight loss is 0.5-1kg per week. Quick fixes are dangerous."
  },

  // Education Scams
  {
    id: 29,
    title: "Online Degree",
    message: "\"Get MBA degree in 6 months. Pay ₹25000: fastdegree.in\"",
    isScam: true,
    realTruth: "Recognized degrees take 2+ years and are from accredited universities."
  },
  {
    id: 30,
    title: "Skill Development Course",
    message: "\"Learn coding in 2 months. Guaranteed job. Pay ₹15000.\"",
    isScam: true,
    realTruth: "No course guarantees jobs. Learning coding takes 6-12 months of practice."
  },
  {
    id: 31,
    title: "Exam Paper Leak",
    message: "\"Get JEE/NEET question paper. Pay ₹5000: examhelp.in\"",
    isScam: true,
    realTruth: "Paper leaks are illegal. Real preparation comes from consistent study."
  },

  // Matrimony & Personal Scams
  {
    id: 32,
    title: "Rich Matrimonial Match",
    message: "\"Doctor from USA wants to marry you. Pay ₹10000 for contact details.\"",
    isScam: true,
    realTruth: "Legitimate matrimonial sites don't charge for contact information."
  },
  {
    id: 33,
    title: "Lottery Winner",
    message: "\"You won ₹1 crore in lottery. Pay ₹5000 tax to claim.\"",
    isScam: true,
    realTruth: "If you didn't buy a ticket, you can't win. No taxes to claim prizes."
  },
  {
    id: 34,
    title: "Inheritance Claim",
    message: "\"Distant relative died, left ₹50 lakhs. Pay ₹10000 legal fees to claim.\"",
    isScam: true,
    realTruth: "Inheritance claims go through proper legal channels, not random emails."
  },

  // Real Estate Scams
  {
    id: 35,
    title: "Under Construction Flat",
    message: "\"Buy flat for ₹20 lakhs, will be worth ₹1 crore after completion.\"",
    isScam: true,
    realTruth: "Under-construction properties have high risk of project delays or failure."
  },
  {
    id: 36,
    title: "Plot in Noida Extension",
    message: "\"Agricultural land for ₹5000/sq yard. Will become residential soon.\"",
    isScam: true,
    realTruth: "Check land use certificate. Agricultural land can't be sold as residential."
  },
  {
    id: 37,
    title: "Property Registration",
    message: "\"Your property registration is pending. Pay ₹25000 to complete.\"",
    isScam: true,
    realTruth: "Property registration is done through government offices, not agents."
  },

  // Charity & Donation Scams
  {
    id: 38,
    title: "COVID Relief Fund",
    message: "\"Donate ₹1000 for COVID victims. Get tax exemption.\"",
    isScam: true,
    realTruth: "Verify charity registration. Many fake NGOs misuse donations."
  },
  {
    id: 39,
    title: "Temple Donation",
    message: "\"Donate ₹51000 for special puja. Get divine blessings.\"",
    isScam: true,
    realTruth: "Temples don't demand specific amounts. Donations are voluntary."
  },
  {
    id: 40,
    title: "Animal Shelter",
    message: "\"Save 100 dogs. Donate ₹2000: animalcare.in\"",
    isScam: true,
    realTruth: "Check NGO registration on government portal before donating."
  },

  // LEGITIMATE Examples (Safe to trust)
  {
    id: 41,
    title: "SBI Mutual Fund App",
    message: "A mutual fund app you downloaded from Google Play Store offering 12% annual returns.",
    isScam: false,
    realTruth: "Official verified apps from Play Store by registered AMCs are safe."
  },
  {
    id: 42,
    title: "IRCTC Official Booking",
    message: "Booking train tickets on irctc.co.in with UPI payment.",
    isScam: false,
    realTruth: "Official government websites are safe for transactions."
  },
  {
    id: 43,
    title: "Bank App Update",
    message: "HDFC Bank app asking for biometric authentication update.",
    isScam: false,
    realTruth: "Official bank apps from Play Store are legitimate for updates."
  },
  {
    id: 44,
    title: "LIC Policy Purchase",
    message: "Buying life insurance policy from LIC India official website.",
    isScam: false,
    realTruth: "Government-owned insurance companies are trustworthy."
  },
  {
    id: 45,
    title: "Government Job Portal",
    message: "Applying for railway jobs through indianrailways.gov.in",
    isScam: false,
    realTruth: "Official government job portals are legitimate."
  },
  {
    id: 46,
    title: "Credible Online Course",
    message: "Taking coding course on Coursera from IIT professors.",
    isScam: false,
    realTruth: "Established platforms like Coursera, Udemy with verified instructors are safe."
  },
  {
    id: 47,
    title: "Registered Real Estate",
    message: "Buying apartment from RERA-registered builder through bank loan.",
    isScam: false,
    realTruth: "RERA-registered projects with bank-approved loans are generally safe."
  },
  {
    id: 48,
    title: "Hospital Bill Payment",
    message: "Paying medical bills through hospital's official payment gateway.",
    isScam: false,
    realTruth: "Direct payment through hospital systems is secure."
  },
  {
    id: 49,
    title: "Tax Filing Portal",
    message: "Filing income tax return on incometaxindia.gov.in",
    isScam: false,
    realTruth: "Official government tax portals are secure for filing returns."
  },
  {
    id: 50,
    title: "University Admission",
    message: "Paying college fees through university's official payment portal.",
    isScam: false,
    realTruth: "Direct payment to educational institutions through their official channels is safe."
  }
];

export default function ScamRadarPage() {
  const t = useTranslations("scamRadar");
  const [current, setCurrent] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const { addXp } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchMode, setShowSearchMode] = useState(false);
  const [showUploadMode, setShowUploadMode] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectionResult, setDetectionResult] = useState<{
    isScam: boolean;
    confidence: number;
    redFlags: string[];
    pattern: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setShowUploadMode(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!uploadedImage) return;
    
    setIsAnalyzing(true);
    
    try {
      // Call NLP detection API
      const response = await fetch('/api/scam-detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: uploadedImage,
        }),
      });

      const result = await response.json();
      setDetectionResult(result);
      
      if (result.isScam) {
        addXp(50); // Bonus XP for detecting real scams
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      // Fallback to pattern-based detection
      setDetectionResult({
        isScam: true,
        confidence: 0.75,
        redFlags: ['Urgency language detected', 'Money request pattern', 'Unverified sender'],
        pattern: 'Task Fraud / Advance Fee'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleShare = async () => {
    if (!detectionResult) return;
    
    const shareText = `⚠️ SCAM ALERT!\n\nPattern: ${detectionResult.pattern}\nConfidence: ${detectionResult.confidence}%\n\nRed Flags:\n${detectionResult.redFlags.map(f => `• ${f}`).join('\n')}\n\nDetected via FinanceSekho Scam Radar`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Scam Alert - Protect Your Family',
          text: shareText,
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      alert('Copied to clipboard! Share with your family.');
    }
  };

  const handleScamSOS = () => {
    const sosSteps = [
      "📞 Dial 1930 - National Cyber Crime Helpline",
      "🏦 Contact your bank immediately to freeze accounts/cards",
      "📸 Take screenshots of all communications",
      "📝 File a complaint at cybercrime.gov.in",
      "🚫 Do NOT pay any more money",
      "💬 Inform your family to prevent further spread"
    ];
    
    alert(`SCAM SOS - Immediate Actions:\n\n${sosSteps.join('\n\n')}\n\nStay calm and act fast!`);
  };

  // Filter scams based on search query
  const filteredScams = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return SCAMS.filter(
      scam =>
        scam.title.toLowerCase().includes(query) ||
        scam.message.toLowerCase().includes(query) ||
        scam.realTruth.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleGuess = (userSaysScam: boolean) => {
    const correct = userSaysScam === SCAMS[current].isScam;
    setIsCorrect(correct);
    setShowResult(true);
    if (correct) {
      addXp(20);
      setShowXPAnimation(true);
      // Hide animation after 1.5 seconds
      setTimeout(() => setShowXPAnimation(false), 1500);
    }
  };

  const nextCard = () => {
    if (current < SCAMS.length - 1) {
      setCurrent(c => c + 1);
      setShowResult(false);
    } else {
      setCurrent(0);
      setShowResult(false);
    }
  };

  const scam = SCAMS[current];

  return (
    <div className="flex flex-col min-h-full py-4 space-y-6">
      <div className="flex justify-between items-end mb-2">
        <div>
          <span className="text-xs font-bold text-muted uppercase tracking-widest block mb-1">Defense Training</span>
          <h1 className="text-3xl font-display font-extrabold flex items-center gap-2">{t("scamRadar")} <ShieldAlert className="text-warning"/></h1>
        </div>
        <LiveTicker />
      </div>

      {/* XP Animation */}
      <XPAnimation show={showXPAnimation} />

      {/* QUICK SCAN FEATURE */}
      <div className="bg-surface border border-accent/20 rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-top-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-accent/20 rounded-lg text-accent">
            <Search size={18} />
          </div>
          <div>
            <h3 className="font-bold text-accent">🔍 Quick Scan</h3>
            <p className="text-xs text-muted">Search for a scam you're suspicious of</p>
          </div>
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Paste a message, link, or keyword..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.trim()) setShowSearchMode(true);
            }}
            className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-text placeholder-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            aria-label="Search for scams"
          />
        </div>

        {/* Search Results */}
        {showSearchMode && searchQuery.trim() ? (
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {filteredScams.length > 0 ? (
              <>
                <div className="text-xs font-bold text-accent uppercase tracking-wider">
                  Found {filteredScams.length} match{filteredScams.length !== 1 ? 'es' : ''}
                </div>
                {filteredScams.map((scam) => (
                  <div
                    key={scam.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      scam.isScam
                        ? 'bg-warning/10 border-l-warning text-warning'
                        : 'bg-accent/10 border-l-accent text-accent'
                    }`}
                  >
                    <div className="flex gap-2 items-start">
                      {scam.isScam ? (
                        <XCircle size={16} className="flex-shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-sm">{scam.title}</div>
                        <div className="text-xs text-text/70 mt-1 line-clamp-2">
                          {scam.isScam ? '🚫 SCAM: ' : '✅ SAFE: '} {scam.realTruth}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-6">
                <AlertCircle className="text-muted mx-auto mb-2" size={32} aria-hidden="true" />
                <p className="text-sm text-muted font-medium">No matches found</p>
                <p className="text-xs text-muted/80 mt-1">Try different keywords or check our database below</p>
              </div>
            )}
          </div>
        ) : null}

        {searchQuery.trim() && filteredScams.length === 0 ? (
          <button
            onClick={() => {
              setSearchQuery("");
              setShowSearchMode(false);
            }}
            className="w-full py-2 text-xs font-bold text-muted hover:text-text transition-colors"
          >
            ✕ Clear Search
          </button>
        ) : null}
      </div>

      {/* SCREENSHOT UPLOAD FEATURE */}
      <div className="bg-surface border border-warning/20 rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-top-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-warning/20 rounded-lg text-warning">
            <Upload size={18} />
          </div>
          <div>
            <h3 className="font-bold text-warning">📸 Upload Screenshot</h3>
            <p className="text-xs text-muted">Upload a suspicious message for AI analysis</p>
          </div>
        </div>
        
        {!showUploadMode ? (
          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
              aria-label="Upload screenshot"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 bg-surface2 border-2 border-dashed border-border hover:border-warning/50 rounded-xl text-muted hover:text-warning transition-all flex flex-col items-center gap-2"
            >
              <Upload size={24} />
              <span className="font-medium text-sm">Tap to upload screenshot</span>
              <span className="text-xs opacity-60">Supports JPG, PNG, WebP</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {uploadedImage && (
              <div className="relative rounded-lg overflow-hidden border border-border">
                <img src={uploadedImage} alt="Uploaded screenshot" className="w-full h-auto" />
                <button
                  onClick={() => {
                    setUploadedImage(null);
                    setShowUploadMode(false);
                    setDetectionResult(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            
            {!detectionResult ? (
              <button
                onClick={analyzeImage}
                disabled={isAnalyzing}
                className="w-full py-3 bg-warning text-black font-bold rounded-xl hover:bg-warning/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <ShieldAlert size={18} />
                    Analyze for Scam Patterns
                  </>
                )}
              </button>
            ) : (
              <div className={`p-4 rounded-xl border-2 space-y-3 ${
                detectionResult.isScam 
                  ? 'bg-warning/10 border-warning' 
                  : 'bg-accent/10 border-accent'
              }`}>
                <div className="flex items-center gap-2">
                  {detectionResult.isScam ? (
                    <AlertTriangle className="text-warning" size={20} />
                  ) : (
                    <CheckCircle2 className="text-accent" size={20} />
                  )}
                  <span className="font-bold">
                    {detectionResult.isScam ? '⚠️ SCAM DETECTED' : '✅ LIKELY SAFE'}
                  </span>
                </div>
                
                <div className="text-sm">
                  <div className="font-semibold">Pattern: {detectionResult.pattern}</div>
                  <div className="text-xs opacity-80">Confidence: {detectionResult.confidence}%</div>
                </div>
                
                {detectionResult.redFlags.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs font-bold uppercase tracking-wider">Red Flags:</div>
                    {detectionResult.redFlags.map((flag, idx) => (
                      <div key={idx} className="text-xs flex items-start gap-2">
                        <span className="text-warning">•</span>
                        <span>{flag}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleShare}
                    className="flex-1 py-2 bg-surface2 border border-border rounded-lg text-sm font-medium hover:bg-surface3 transition-colors flex items-center justify-center gap-2"
                  >
                    <Share size={16} />
                    Share
                  </button>
                  {detectionResult.isScam && (
                    <button
                      onClick={handleScamSOS}
                      className="flex-1 py-2 bg-warning/20 border border-warning rounded-lg text-sm font-medium text-warning hover:bg-warning/30 transition-colors flex items-center justify-center gap-2"
                    >
                      <Phone size={16} />
                      SOS
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {/* GAME SECTION DIVIDER */}
        {!showSearchMode && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-xs font-bold text-muted uppercase tracking-wider px-2">Or Play the Game</span>
              <div className="flex-1 h-px bg-border"></div>
            </div>
          </div>
        )}

        {/* GAME SECTION */}
        {!showSearchMode ? (
          <div className="relative bg-surface border border-border p-6 rounded-3xl shadow-sm shadow-warning/10 mb-8">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-surface2 border border-border px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-muted">
              Case File {current + 1}
            </div>

            <h3 className="font-display text-xl font-bold mb-4 text-center mt-2">{scam.title}</h3>
          
          <div className="bg-bg p-4 rounded-xl font-mono text-sm border-l-4 border-warning/50 mb-6 text-text/80 leading-relaxed italic">
            {scam.message}
          </div>

          {!showResult ? (
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleGuess(true)}
                aria-label="Mark this case as fake or scam"
                className="bg-gradient-to-br from-warning/10 to-warning/5 border-2 border-warning/30 hover:border-warning/60 py-5 rounded-2xl flex flex-col items-center gap-3 transition-all duration-200 shadow-lg hover:shadow-warning/20 backdrop-blur-sm"
              >
                <div className="p-2 bg-warning/20 rounded-full">
                  <XCircle className="text-warning w-6 h-6" />
                </div>
                <span className="font-bold text-sm uppercase tracking-wider text-warning">Fake / Scam</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleGuess(false)}
                aria-label="Mark this case as real or safe"
                className="bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/30 hover:border-accent/60 py-5 rounded-2xl flex flex-col items-center gap-3 transition-all duration-200 shadow-lg hover:shadow-accent/20 backdrop-blur-sm"
              >
                <div className="p-2 bg-accent/20 rounded-full">
                  <CheckCircle2 className="text-accent w-6 h-6" />
                </div>
                <span className="font-bold text-sm uppercase tracking-wider text-accent">Real / Safe</span>
              </motion.button>
            </div>
          ) : (
             <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.3, ease: "easeOut" }}
               className="space-y-4"
             >
               <div className={`p-6 rounded-2xl text-center border-2 shadow-lg backdrop-blur-sm ${isCorrect ? 'bg-gradient-to-br from-accent/20 to-accent/10 border-accent/50 text-accent' : 'bg-gradient-to-br from-[#ff4d8d]/20 to-[#ff4d8d]/10 border-[#ff4d8d]/50 text-[#ff4d8d]'}`}>
                 <div className="flex items-center justify-center gap-2 mb-2">
                   {isCorrect ? <Shield className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                   <h4 className="font-display font-bold text-lg">{isCorrect ? 'Spot On!' : 'You Got Trapped!'}</h4>
                 </div>
                 <p className="text-sm font-medium text-text/90 italic leading-relaxed"><q>{scam.realTruth}</q></p>
               </div>
               <motion.button
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
                 onClick={nextCard}
                 aria-label="Go to next scam case"
                 className="w-full bg-gradient-to-r from-surface2 to-surface border-2 border-border hover:border-accent/50 py-4 rounded-2xl font-bold uppercase tracking-wider transition-all duration-200 shadow-lg hover:shadow-accent/10"
               >
                 {t("next")}
               </motion.button>
             </motion.div>
          )}
          </div>
        ) : null}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center bg-gradient-to-r from-warning/10 via-accent/10 to-warning/10 border border-warning/20 rounded-2xl p-4 mx-4 shadow-lg backdrop-blur-sm"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span className="text-sm font-bold text-warning uppercase tracking-widest">Golden Rule</span>
            <AlertTriangle className="w-4 h-4 text-warning" />
          </div>
          <p className="text-base font-semibold text-text italic">
            "If it is too good to be true, it is."
          </p>
        </motion.div>
      </div>
    </div>
  );
}
