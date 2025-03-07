import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
}

interface QuizAnswer {
  questionId: string;
  answer: string;
}

interface QuizResult {
  id: string;
  userId: string;
  partnerId: string;
  userAnswers: QuizAnswer[];
  partnerAnswers: QuizAnswer[];
  matchPercentage: number;
  completedAt: string;
}

interface ActiveQuiz {
  id: string;
  partnerId: string;
  questions: QuizQuestion[];
  answers: QuizAnswer[];
  startedAt: string;
  timeLimit: number; // in seconds
}

interface QuizContextType {
  quizQuestions: QuizQuestion[];
  quizResults: QuizResult[];
  activeQuiz: ActiveQuiz | null;
  startQuiz: (partnerId: string) => void;
  answerQuestion: (questionId: string, answer: string) => void;
  completeQuiz: () => void;
  cancelQuiz: () => void;
  timeRemaining: number;
}

const defaultQuizQuestions: QuizQuestion[] = [
  {
    id: '1',
    question: 'What is your ideal first date?',
    options: [
      'Coffee shop conversation',
      'Movie and dinner',
      'Outdoor adventure',
      'Museum or art gallery'
    ]
  },
  {
    id: '2',
    question: 'How do you prefer to communicate in a relationship?',
    options: [
      'Frequent texting throughout the day',
      'Phone calls',
      'Face-to-face conversations',
      'A mix of all communication methods'
    ]
  },
  {
    id: '3',
    question: 'What quality do you value most in a partner?',
    options: [
      'Sense of humor',
      'Intelligence',
      'Kindness',
      'Ambition'
    ]
  },
  {
    id: '4',
    question: 'How do you handle conflicts in a relationship?',
    options: [
      'Address issues immediately',
      'Take time to cool off, then discuss',
      'Compromise and find middle ground',
      'Seek outside advice or counseling'
    ]
  },
  {
    id: '5',
    question: 'What is your love language?',
    options: [
      'Words of affirmation',
      'Acts of service',
      'Receiving gifts',
      'Quality time',
      'Physical touch'
    ]
  }
];

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(defaultQuizQuestions);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<ActiveQuiz | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Load quiz data from localStorage
  useEffect(() => {
    if (user) {
      const storedResults = localStorage.getItem(`campusConnection_quizResults_${user.id}`);
      if (storedResults) {
        setQuizResults(JSON.parse(storedResults));
      }
    }
  }, [user]);

  // Save quiz results to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(`campusConnection_quizResults_${user.id}`, JSON.stringify(quizResults));
    }
  }, [quizResults, user]);

  // Timer for active quiz
  useEffect(() => {
    if (!activeQuiz) {
      setTimeRemaining(0);
      return;
    }

    const startTime = new Date(activeQuiz.startedAt).getTime();
    const endTime = startTime + (activeQuiz.timeLimit * 1000);
    
    setTimeRemaining(Math.max(0, Math.floor((endTime - Date.now()) / 1000)));
    
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeRemaining(remaining);
      
      if (remaining === 0) {
        completeQuiz();
        clearInterval(timer);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [activeQuiz]);

  // Start a new quiz
  const startQuiz = (partnerId: string) => {
    if (!user) return;
    
    // Select 5 random questions
    const shuffled = [...quizQuestions].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, 5);
    
    const newQuiz: ActiveQuiz = {
      id: uuidv4(),
      partnerId,
      questions: selectedQuestions,
      answers: [],
      startedAt: new Date().toISOString(),
      timeLimit: 180 // 3 minutes
    };
    
    setActiveQuiz(newQuiz);
  };

  // Answer a question in the active quiz
  const answerQuestion = (questionId: string, answer: string) => {
    if (!activeQuiz) return;
    
    // Check if question already answered
    const existingAnswerIndex = activeQuiz.answers.findIndex(a => a.questionId === questionId);
    
    if (existingAnswerIndex >= 0) {
      // Update existing answer
      setActiveQuiz(prev => {
        if (!prev) return null;
        
        const updatedAnswers = [...prev.answers];
        updatedAnswers[existingAnswerIndex] = { questionId, answer };
        
        return {
          ...prev,
          answers: updatedAnswers
        };
      });
    } else {
      // Add new answer
      setActiveQuiz(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          answers: [...prev.answers, { questionId, answer }]
        };
      });
    }
  };

  // Complete the active quiz
  const completeQuiz = () => {
    if (!user || !activeQuiz) return;
    
    // For demo purposes, generate random partner answers
    const partnerAnswers = activeQuiz.questions.map(q => ({
      questionId: q.id,
      answer: q.options[Math.floor(Math.random() * q.options.length)]
    }));
    
    // Calculate match percentage
    const matchCount = activeQuiz.answers.filter(userAnswer => {
      const partnerAnswer = partnerAnswers.find(pa => pa.questionId === userAnswer.questionId);
      return partnerAnswer && partnerAnswer.answer === userAnswer.answer;
    }).length;
    
    const totalQuestions = activeQuiz.questions.length;
    const matchPercentage = Math.round((matchCount / totalQuestions) * 100);
    
    // Create quiz result
    const newResult: QuizResult = {
      id: uuidv4(),
      userId: user.id,
      partnerId: activeQuiz.partnerId,
      userAnswers: activeQuiz.answers,
      partnerAnswers,
      matchPercentage,
      completedAt: new Date().toISOString()
    };
    
    setQuizResults(prev => [...prev, newResult]);
    setActiveQuiz(null);
  };

  // Cancel the active quiz
  const cancelQuiz = () => {
    setActiveQuiz(null);
  };

  return (
    <QuizContext.Provider value={{
      quizQuestions,
      quizResults,
      activeQuiz,
      startQuiz,
      answerQuestion,
      completeQuiz,
      cancelQuiz,
      timeRemaining
    }}>
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};