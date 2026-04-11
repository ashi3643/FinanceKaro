"use client";

import { useStore } from "@/lib/store";
import { ShieldAlert, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

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
  const [current, setCurrent] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const { addXp } = useStore();

  const handleGuess = (userSaysScam: boolean) => {
    const correct = userSaysScam === SCAMS[current].isScam;
    setIsCorrect(correct);
    setShowResult(true);
    if (correct) addXp(20);
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
          <h1 className="text-3xl font-display font-extrabold flex items-center gap-2">Scam Radar <ShieldAlert className="text-warning"/></h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
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
              <button 
                onClick={() => handleGuess(true)}
                className="bg-surface2 border border-border hover:border-warning/50 py-4 rounded-xl flex flex-col items-center gap-2 transition-colors"
              >
                <XCircle className="text-warning" />
                <span className="font-bold text-sm uppercase tracking-wider">Fake / Scam</span>
              </button>
              <button 
                onClick={() => handleGuess(false)}
                className="bg-surface2 border border-border hover:border-accent/50 py-4 rounded-xl flex flex-col items-center gap-2 transition-colors"
              >
                <CheckCircle2 className="text-accent" />
                <span className="font-bold text-sm uppercase tracking-wider">Real / Safe</span>
              </button>
            </div>
          ) : (
             <div className="animate-in fade-in zoom-in-95">
               <div className={`p-4 rounded-xl mb-6 text-center border ${isCorrect ? 'bg-accent/20 border-accent/50 text-accent' : 'bg-[#ff4d8d]/20 border-[#ff4d8d]/50 text-[#ff4d8d]'}`}>
                 <h4 className="font-display font-bold text-lg mb-1">{isCorrect ? 'Spot On! +20 XP' : 'You Got Trapped!'}</h4>
                 <p className="text-sm font-medium text-text/90 italic mt-2">"{scam.realTruth}"</p>
               </div>
               <button 
                 onClick={nextCard}
                 className="w-full bg-surface2 border border-border py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-black/5 transition-colors"
               >
                 Next Case
               </button>
             </div>
          )}

        </div>
        
        <div className="text-center text-xs text-muted uppercase tracking-widest">
          If it's too good to be true, it is.
        </div>
      </div>
    </div>
  );
}
