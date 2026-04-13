'use client';

import { useState } from 'react';
import { Brain, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  category: 'basics' | 'investing' | 'risk' | 'planning';
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "What is the primary purpose of an emergency fund?",
    options: [
      "To buy luxury items",
      "To cover unexpected expenses",
      "To invest in stocks",
      "To pay for vacations"
    ],
    correctAnswer: 1,
    category: 'basics'
  },
  {
    id: 2,
    question: "What does diversification in investing mean?",
    options: [
      "Putting all money in one stock",
      "Spreading investments across different assets",
      "Only investing in safe options",
      "Borrowing money to invest"
    ],
    correctAnswer: 1,
    category: 'investing'
  },
  {
    id: 3,
    question: "What is compound interest?",
    options: [
      "Interest on principal only",
      "Interest on principal and accumulated interest",
      "A type of bank fee",
      "A government tax"
    ],
    correctAnswer: 1,
    category: 'basics'
  },
  {
    id: 4,
    question: "What is the recommended emergency fund size?",
    options: [
      "1 month of expenses",
      "3-6 months of expenses",
      "1 year of expenses",
      "No emergency fund needed"
    ],
    correctAnswer: 1,
    category: 'planning'
  },
  {
    id: 5,
    question: "What is a credit score?",
    options: [
      "Your bank balance",
      "A measure of creditworthiness",
      "Your investment returns",
      "Your monthly income"
    ],
    correctAnswer: 1,
    category: 'basics'
  },
  {
    id: 6,
    question: "What is the 50-30-20 rule in budgeting?",
    options: [
      "50% needs, 30% wants, 20% savings",
      "50% savings, 30% needs, 20% wants",
      "50% wants, 30% savings, 20% needs",
      "No such rule exists"
    ],
    correctAnswer: 0,
    category: 'planning'
  },
  {
    id: 7,
    question: "What is inflation?",
    options: [
      "Decrease in prices",
      "Increase in prices over time",
      "Stock market crash",
      "Bank interest rate"
    ],
    correctAnswer: 1,
    category: 'basics'
  },
  {
    id: 8,
    question: "What is the difference between saving and investing?",
    options: [
      "No difference",
      "Saving is for short-term, investing for long-term growth",
      "Investing is safer than saving",
      "Saving is for rich people only"
    ],
    correctAnswer: 1,
    category: 'investing'
  },
  {
    id: 9,
    question: "What is a mutual fund?",
    options: [
      "A type of bank account",
      "A pool of money from many investors",
      "A government scheme",
      "A personal loan"
    ],
    correctAnswer: 1,
    category: 'investing'
  },
  {
    id: 10,
    question: "What is the main risk of high-return investments?",
    options: [
      "Low returns",
      "Higher chance of losing money",
      "Government regulation",
      "No risk at all"
    ],
    correctAnswer: 1,
    category: 'risk'
  }
];

interface FinancialDiagnosticQuizProps {
  onComplete: (score: number, categoryScores: Record<string, number>) => void;
  onCancel?: () => void;
}

export default function FinancialDiagnosticQuiz({ onComplete, onCancel }: FinancialDiagnosticQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [categoryScores, setCategoryScores] = useState<Record<string, number>>({
    basics: 0,
    investing: 0,
    risk: 0,
    planning: 0
  });

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const question = QUIZ_QUESTIONS[currentQuestion];
    const isCorrect = answerIndex === question.correctAnswer;

    if (isCorrect) {
      setScore(prev => prev + 1);
      setCategoryScores(prev => ({
        ...prev,
        [question.category]: prev[question.category] + 1
      }));
    }
  };

  const handleNext = () => {
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      onComplete(score, categoryScores);
    }
  };

  const question = QUIZ_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100;

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/20 via-surface to-pink-500/10 border border-purple-500/20 p-6 sm:p-8 shadow-lg shadow-purple-500/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Brain className="text-purple-400" size={24} />
            <h2 className="text-xl font-display font-bold text-white">
              Financial Literacy Diagnostic
            </h2>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-muted hover:text-text transition-colors"
              aria-label="Cancel quiz"
            >
              Skip
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-muted mb-2">
            <span>Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-6">{question.question}</h3>

          <div className="space-y-3">
            {question.options.map((option, index) => {
              let stateClass = "bg-surface border-border hover:border-purple-500/40";
              if (showResult) {
                if (index === question.correctAnswer) {
                  stateClass = "bg-purple-500/20 border-purple-500 text-purple-400";
                } else if (index === selectedAnswer) {
                  stateClass = "bg-red-500/20 border-red-500 text-red-400";
                } else {
                  stateClass = "bg-surface/50 border-border opacity-50";
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={showResult}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center ${stateClass}`}
                >
                  <span className="font-medium">{option}</span>
                  {showResult && index === question.correctAnswer && (
                    <CheckCircle2 size={20} className="text-purple-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Next Button */}
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <button
              onClick={handleNext}
              className="bg-purple-500 text-white font-bold py-3 px-8 rounded-full flex items-center gap-2 hover:bg-purple-600 transition-colors"
            >
              {currentQuestion < QUIZ_QUESTIONS.length - 1 ? (
                <>
                  Next Question
                  <ArrowRight size={18} />
                </>
              ) : (
                "See Results"
              )}
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
