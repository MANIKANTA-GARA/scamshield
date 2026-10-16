import React, { useState } from 'react';
import { 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Award, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useLanguage } from '../translations/index.js';

interface Question {
  id: number;
  question: { en: string; te: string };
  options: Array<{ text: { en: string; te: string }; isCorrect: boolean }>;
  explanation: { en: string; te: string };
}

export const AwarenessQuiz: React.FC = () => {
  const { language, t } = useLanguage();

  const questions: Question[] = [
    {
      id: 1,
      question: {
        en: "You receive an SMS: 'Your Electricity Power will be disconnected tonight at 9:30 PM due to unpaid bill. Immediately call 9876543210'. What should you do?",
        te: "మీకు ఒక SMS వచ్చింది: 'కరెంట్ బిల్లు చెల్లించనందున ఈ రాత్రి 9:30కి విద్యుత్ నిలిపివేయబడుతుంది. వెంటనే 9876543210 కి కాల్ చేయండి'. మీరు ఏమి చేయాలి?",
      },
      options: [
        {
          text: {
            en: "Immediately call the 10-digit number in the SMS to pay ₹10 recharge.",
            te: "SMS లో ఉన్న 10 అంకెల నంబర్‌కు కాల్ చేసి ₹10 రీఛార్జ్ చేయాలి.",
          },
          isCorrect: false,
        },
        {
          text: {
            en: "Ignore the SMS phone number and verify your bill status via your official electricity board app or customer care.",
            te: "SMS లోని ఫోన్ నంబర్‌ను విస్మరించి, అధికారిక విద్యుత్ బోర్డు యాప్ ద్వారా బిల్లును తనిఖీ చేయాలి.",
          },
          isCorrect: true,
        },
        {
          text: {
            en: "Download any screen-sharing app the caller suggests to fix the meter.",
            te: "కాలర్ సూచించిన స్క్రీన్ షేరింగ్ యాప్‌ను ఇన్‌స్టాల్ చేసుకోవాలి.",
          },
          isCorrect: false,
        },
      ],
      explanation: {
        en: "Power distribution boards never disconnect power overnight via unofficial 10-digit personal mobile numbers. Never call numbers printed in unsolicited SMS messages.",
        te: "విద్యుత్ బోర్డులు వ్యక్తిగత మొబైల్ నంబర్ల నుండి రాత్రికి రాత్రే విద్యుత్‌ను కట్ చేయవు. గుర్తుతెలియని నంబర్లకు ఎప్పుడూ కాల్ చేయవద్దు.",
      },
    },
    {
      id: 2,
      question: {
        en: "Someone on WhatsApp sends a QR code: 'Scan this QR code and enter your UPI PIN to receive ₹2,500 cashback prize'. What will happen if you enter your PIN?",
        te: "వాట్సాప్‌లో ఒకరు QR కోడ్ పంపారు: 'ఈ QR కోడ్ స్కాన్ చేసి, మీ UPI PIN నమోదు చేస్తే ₹2,500 క్యాష్‌బ్యాక్ బహుమతి వస్తుంది'. PIN నొక్కితే ఏమి జరుగుతుంది?",
      },
      options: [
        {
          text: {
            en: "Entering your UPI PIN will DEBIT (steal) money from your account, never credit it.",
            te: "UPI PIN నమోదు చేస్తే మీ ఖాతా నుండి డబ్బు కట్ అవుతుంది, డబ్బు రాదు.",
          },
          isCorrect: true,
        },
        {
          text: {
            en: "₹2,500 will be credited directly to your bank account.",
            te: "మీ బ్యాంక్ ఖాతాలో ₹2,500 జమ అవుతుంది.",
          },
          isCorrect: false,
        },
        {
          text: {
            en: "The bank requires your PIN to verify your identity for receiving prizes.",
            te: "బహుమతులు స్వీకరించడానికి గుర్తింపు కోసం బ్యాంక్ పిన్ అడుగుతుంది.",
          },
          isCorrect: false,
        },
      ],
      explanation: {
        en: "UPI Golden Rule: You ONLY enter your UPI PIN to transfer money OUT of your bank account. Receiving money never requires a PIN.",
        te: "UPI గోల్డెన్ రూల్: మీ బ్యాంక్ ఖాతా నుండి డబ్బు పంపడానికి మాత్రమే UPI PIN ఉపయోగిస్తారు. డబ్బు పొందడానికి PIN ఎప్పటికీ అవసరం లేదు.",
      },
    },
    {
      id: 3,
      question: {
        en: "You get an unexpected OTP for a ₹35,000 purchase you never made. A caller says: 'I am your bank fraud officer. Tell me the OTP immediately to cancel this debit'. What should you do?",
        te: "మీరు చేయని ₹35,000 కొనుగోలుకు సంబంధించి మీకు అకస్మాత్తుగా OTP వచ్చింది. ఒక వ్యక్తి కాల్ చేసి: 'నేను బ్యాంక్ అధికారిని, ఈ లావాదేవీని రద్దు చేయడానికి వెంటనే OTP చెప్పండి' అన్నాడు. మీరు ఏమి చేయాలి?",
      },
      options: [
        {
          text: {
            en: "Quickly give them the OTP so they can cancel the unauthorized transaction.",
            te: "లావాదేవీ రద్దు కోసం వెంటనే వారికి OTP చెప్పాలి.",
          },
          isCorrect: false,
        },
        {
          text: {
            en: "Hang up immediately. Bank staff NEVER ask for OTPs. Open your official bank app to block your card and call 1930.",
            te: "వెంటనే కాల్ కట్ చేయాలి. బ్యాంక్ సిబ్బంది ఎప్పుడూ OTP అడగరు. మీ బ్యాంక్ యాప్ ద్వారా కార్డు బ్లాక్ చేసి 1930 కి కాల్ చేయాలి.",
          },
          isCorrect: true,
        },
        {
          text: {
            en: "Ask them for their employee ID and then share the OTP.",
            te: "వారి ఎంప్లాయ్ ఐడీ అడిగి, ఆ తర్వాత OTP చెప్పాలి.",
          },
          isCorrect: false,
        },
      ],
      explanation: {
        en: "Scammers trigger unrequested transactions deliberately so you panic and hand over the OTP. Once you disclose the OTP, the purchase is permanently confirmed.",
        te: "మోసగాళ్ళు కావాలనే లావాదేవీని మొదలుపెట్టి మిమ్మల్ని భయపెడతారు. మీరు OTP చెబితే ఆ లావాదేవీ పూర్తయి మీ డబ్బు పోతుంది.",
      },
    },
    {
      id: 4,
      question: {
        en: "A link starts with 'https://' and has a padlock icon. Does this prove the website is genuine and safe for entering your net banking password?",
        te: "ఒక వెబ్‌సైట్ లింక్ 'https://' తో మొదలవుతూ ప్యాడ్‌లాక్ గుర్తు కలిగి ఉంది. ఇది మీ నెట్‌బ్యాంకింగ్ పాస్‌వర్డ్ నమోదు చేయడానికి సురక్షితమైనదేనా?",
      },
      options: [
        {
          text: {
            en: "Yes, HTTPS means the government or bank has verified the company.",
            te: "అవును, HTTPS ఉంటే బ్యాంక్ లేదా ప్రభుత్వం ధృవీకరించినట్లు లెక్క.",
          },
          isCorrect: false,
        },
        {
          text: {
            en: "NO. HTTPS only encrypts the connection. Anyone can obtain a free SSL certificate for a phishing website.",
            te: "కాదు. HTTPS కేవలం సమాచార రవాణాను దాచిపెడుతుంది. మోసగాళ్ళు కూడా ఉచితంగా SSL సర్టిఫికెట్ పొందవచ్చు.",
          },
          isCorrect: true,
        },
      ],
      explanation: {
        en: "Over 80% of modern phishing websites use HTTPS. A padlock icon merely encrypts transit between your phone and the attacker's server.",
        te: "నేటి 80% కంటే ఎక్కువ మోసపూరిత సైట్‌లు HTTPS ని ఉపయోగిస్తాయి. ప్యాడ్‌లాక్ గుర్తు ఉన్నంత మాత్రాన అది సురక్షితమని భావించకూడదు.",
      },
    },
    {
      id: 5,
      question: {
        en: "A part-time job offer pays you ₹150 for subscribing to 3 YouTube channels. Then they ask you to deposit ₹5,000 in a Telegram VIP trading group to double it to ₹10,000. What is this?",
        te: "3 యూట్యూబ్ ఛానెల్‌లను సబ్‌స్క్రైబ్ చేసినందుకు ఒక పార్ట్-టైమ్ జాబ్ మీకు ₹150 ఇచ్చింది. ఆ తర్వాత ₹5,000 డిపాజిట్ చేస్తే ₹10,000 ఇస్తామని టెలిగ్రామ్ గ్రూప్‌లో కోరారు. ఇది ఏమిటి?",
      },
      options: [
        {
          text: {
            en: "A legitimate high-paying investment opportunity.",
            te: "నిజమైన అధిక ఆదాయం ఇచ్చే పెట్టుబడి అవకాశం.",
          },
          isCorrect: false,
        },
        {
          text: {
            en: "Classic 'Task Scam'. The ₹150 was bait to win trust; deposited funds can never be withdrawn.",
            te: "క్లాసిక్ 'టాస్క్ స్కామ్'. మొదట్లో ఇచ్చిన ₹150 నమ్మకం కలిగించే ఎర మాత్రమే; డిపాజిట్ చేసిన డబ్బు తిరిగి రాదు.",
          },
          isCorrect: true,
        },
      ],
      explanation: {
        en: "Prepaid task scams are one of the most widespread scams in India. Legitimate employment never requires job-seekers to pay upfront deposit money.",
        te: "ప్రీపెయిడ్ టాస్క్ స్కామ్‌లు భారతదేశంలో సర్వసాధారణం. నిజమైన ఉద్యోగాలు ఎప్పుడూ ముందస్తు డిపాజిట్లు అడగవు.",
      },
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (showExplanation) return;
    setSelectedOption(idx);
    setShowExplanation(true);
    if (currentQ.options[idx].isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-shield-teal/20 text-shield-cyan flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {t.quiz.title}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-300">
          {t.quiz.subtitle}
        </p>
      </div>

      {!quizFinished ? (
        <div className="rounded-2xl glass-panel-elevated p-6 border border-shield-teal/40 shadow-2xl space-y-5">
          {/* Progress Header */}
          <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-shield-border/60">
            <span>
              {t.quiz.question} <strong className="text-white">{currentIndex + 1}</strong> {t.quiz.of} {questions.length}
            </span>
            <span className="font-mono text-shield-teal font-semibold">
              Score: {score} / {currentIndex + (showExplanation ? 1 : 0)}
            </span>
          </div>

          {/* Question Text */}
          <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
            {language === 'te' ? currentQ.question.te : currentQ.question.en}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              let btnClass = 'bg-shield-navy hover:bg-shield-navy/80 border-shield-border text-slate-200';

              if (showExplanation) {
                if (opt.isCorrect) {
                  btnClass = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-semibold';
                } else if (isSelected) {
                  btnClass = 'bg-rose-950/80 border-rose-500 text-rose-200';
                } else {
                  btnClass = 'bg-shield-navy/40 border-shield-border/40 text-slate-500 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={showExplanation}
                  className={`w-full p-4 rounded-xl border text-xs sm:text-sm text-left transition-all flex items-start gap-3 ${btnClass}`}
                >
                  <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0 mt-0.5 text-xs font-mono font-bold">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1">
                    {language === 'te' ? opt.text.te : opt.text.en}
                  </span>
                  {showExplanation && opt.isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  {showExplanation && isSelected && !opt.isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Callout */}
          {showExplanation && (
            <div className="p-4 rounded-xl bg-shield-card/80 border border-shield-border text-xs text-slate-200 leading-relaxed space-y-2 animate-fade-in">
              <strong className="text-shield-cyan block uppercase tracking-wider text-[11px]">
                Why this is critical:
              </strong>
              <p>{language === 'te' ? currentQ.explanation.te : currentQ.explanation.en}</p>

              <button
                onClick={handleNext}
                className="mt-3 w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-shield-navy bg-gradient-to-r from-shield-teal to-shield-emerald hover:opacity-95 shadow-md shadow-shield-teal/20 transition-all flex items-center justify-center gap-1.5"
              >
                <span>{currentIndex < questions.length - 1 ? t.quiz.nextQuestion : 'See Final Results'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Quiz Finished Card */
        <div className="rounded-2xl glass-panel-elevated p-8 border border-shield-teal/40 shadow-2xl text-center space-y-5 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-shield-teal to-shield-emerald flex items-center justify-center text-shield-navy mx-auto shadow-xl">
            <Award className="w-10 h-10 stroke-[2.5]" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">
              {t.quiz.scoreText} {score} / {questions.length}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              {score === 5 ? t.quiz.perfectScore : score >= 3 ? t.quiz.goodScore : t.quiz.needsPractice}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-shield-navy border border-shield-border text-xs text-slate-300 text-left space-y-1">
            <p className="font-semibold text-white">Continuous Defense Tip:</p>
            <p>Scammers evolve new scripts every week. Keep ScamShield installed on your phone to scan suspicious texts or links before tapping.</p>
          </div>

          <button
            onClick={handleRestart}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-shield-navy bg-gradient-to-r from-shield-teal to-shield-emerald hover:opacity-95 shadow-lg shadow-shield-teal/20 mx-auto transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.quiz.tryAgain}</span>
          </button>
        </div>
      )}
    </div>
  );
};
