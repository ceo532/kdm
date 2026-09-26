/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  GraduationCap,
  Award,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Trophy,
  UserCheck,
  Check,
  HelpCircle,
  Send,
  Flame,
  Star
} from 'lucide-react';

interface Question {
  cau: number;
  hoi: string;
  A: string;
  B: string;
  C: string;
  D: string;
  dapAn: 'A' | 'B' | 'C' | 'D';
}

const STUDENTS = ['Minh Chi', 'Duy Sang', 'Bảo Khuê'] as const;

const QUESTIONS: Question[] = [
  { cau: 1, hoi: 'I have lived in this city ______ 2015.', A: 'since', B: 'for', C: 'in', D: 'at', dapAn: 'A' },
  { cau: 2, hoi: 'She ______ to Paris three times.', A: 'go', B: 'goes', C: 'has been', D: 'was', dapAn: 'C' },
  { cau: 3, hoi: 'We ______ our grandparents last weekend.', A: 'visit', B: 'have visited', C: 'visited', D: 'are visiting', dapAn: 'C' },
  { cau: 4, hoi: 'My brother enjoys ______ models in his free time.', A: 'making', B: 'make', C: 'to make', D: 'makes', dapAn: 'A' },
  { cau: 5, hoi: 'Health is ______ than money.', A: 'important', B: 'importance', C: 'more important', D: 'the most important', dapAn: 'C' },
  { cau: 6, hoi: 'How ______ water do you drink every day?', A: 'many', B: 'much', C: 'long', D: 'often', dapAn: 'B' },
  { cau: 7, hoi: 'You should eat ______ fruit and vegetables to stay healthy.', A: 'fewer', B: 'little', C: 'less', D: 'more', dapAn: 'D' },
  { cau: 8, hoi: 'I like playing football, ______ my brother likes playing tennis.', A: 'but', B: 'so', C: 'and', D: 'because', dapAn: 'A' },
  { cau: 9, hoi: '______ we were tired, we finished the project on time.', A: 'Although', B: 'So', C: 'Because', D: 'However', dapAn: 'A' },
  { cau: 10, hoi: 'Find the word with a different sound:', A: 'played', B: 'cleaned', C: 'lived', D: 'visited', dapAn: 'D' },
  { cau: 11, hoi: 'The new bridge ______ last year.', A: 'is built', B: 'was built', C: 'built', D: 'has built', dapAn: 'B' },
  { cau: 12, hoi: 'If you want to stay healthy, you should do more ______.', A: 'television', B: 'homework', C: 'exercise', D: 'games', dapAn: 'C' },
  { cau: 13, hoi: 'We often donate clothes and money to help ______ children.', A: 'rich', B: 'happy', C: 'well', D: 'street', dapAn: 'D' },
  { cau: 14, hoi: "I don't like watching horror films, and my sister doesn't ______.", A: 'neither', B: 'either', C: 'too', D: 'so', dapAn: 'B' },
  { cau: 15, hoi: '"______ is it from your house to the school?" - "About 2 kilometers."', A: 'How long', B: 'How much', C: 'How often', D: 'How far', dapAn: 'D' },
  { cau: 16, hoi: "Let's go to the cinema tonight, ______?", A: 'let we', B: 'do we', C: 'will we', D: 'shall we', dapAn: 'D' },
  { cau: 17, hoi: 'She bought a lot of ______ to make a birthday cake.', A: 'meat', B: 'ingredients', C: 'dishes', D: 'meals', dapAn: 'B' },
  { cau: 18, hoi: 'Have you ______ eaten sushi before?', A: 'never', B: 'ever', C: 'just', D: 'yet', dapAn: 'B' },
  { cau: 19, hoi: 'I am very interested ______ learning about Vietnamese history.', A: 'in', B: 'at', C: 'on', D: 'for', dapAn: 'A' },
  { cau: 20, hoi: 'Choose the word with a different sound:', A: 'school', B: 'child', C: 'cheese', D: 'chair', dapAn: 'A' }
];

const WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycbw00EtPyhylfx8ZUg3o7CFvc5g44RK17byvTJqy8kMY6grcfIVpTAT7Enu9NenGnBFR/exec';

type Screen = 'name_selection' | 'quiz' | 'result';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('name_selection');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [filterMode, setFilterMode] = useState<'all' | 'correct' | 'wrong'>('all');
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const hasSentReportRef = useRef<boolean>(false);

  // Send score to Google Sheet + Telegram webhook
  const sendResultToBackend = async (student: string, score: number) => {
    if (hasSentReportRef.current) return;
    hasSentReportRef.current = true;
    setSubmissionStatus('sending');

    const payload = {
      ten: student,
      lop: '7',
      diem: score,
      tongCau: QUESTIONS.length,
      url: window.location.href,
    };

    try {
      // NOTE: Using text/plain to avoid CORS preflight issues on Google Apps Script Web App
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });
      setSubmissionStatus('sent');
      console.log('Result successfully submitted to backend for:', student, score);
    } catch (error) {
      console.error('Failed to submit result to backend:', error);
      setSubmissionStatus('error');
    }
  };

  const handleStartQuiz = () => {
    if (!selectedStudent) return;
    setCurrentScreen('quiz');
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    hasSentReportRef.current = false;
    setSubmissionStatus('idle');
  };

  const handleSelectOption = (option: 'A' | 'B' | 'C' | 'D') => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: option,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Calculate score and submit
      handleSubmitQuiz();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const calculateScore = () => {
    let correctCount = 0;
    QUESTIONS.forEach((q, idx) => {
      if (userAnswers[idx] === q.dapAn) {
        correctCount += 1;
      }
    });
    return correctCount;
  };

  const handleSubmitQuiz = () => {
    const score = calculateScore();
    setCurrentScreen('result');
    sendResultToBackend(selectedStudent, score);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRestart = () => {
    setCurrentScreen('name_selection');
    setSelectedStudent('');
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    hasSentReportRef.current = false;
    setSubmissionStatus('idle');
    setFilterMode('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const selectedAnswer = userAnswers[currentQuestionIndex];
  const totalQuestions = QUESTIONS.length;
  const progressPercent = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);
  const score = calculateScore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-emerald-50 text-slate-800 flex flex-col font-sans">
      {/* Top Banner / Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-indigo-100 shadow-xs">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg text-slate-800 leading-tight">
                Tiếng Anh Lớp 7
              </h1>
              <p className="text-xs text-indigo-600 font-medium">Luyện tập trắc nghiệm kiến thức</p>
            </div>
          </div>

          {currentScreen !== 'name_selection' && selectedStudent && (
            <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-indigo-700 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{selectedStudent}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {/* ==================== MÀN HÌNH 1: CHỌN TÊN ==================== */}
        {currentScreen === 'name_selection' && (
          <div className="w-full bg-white rounded-3xl shadow-xl shadow-indigo-100/60 border border-indigo-100/80 p-6 sm:p-10 my-auto transition-all">
            {/* Mascot and Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-400 to-rose-400 text-white shadow-lg shadow-orange-200/60 mb-4 transform hover:scale-105 transition-transform">
                <Sparkles className="w-10 h-10" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold tracking-wide uppercase mb-2">
                <Flame className="w-3.5 h-3.5 text-amber-600" />
                Ôn luyện trắc nghiệm 20 câu
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                Chào mừng em đến với bài tập!
              </h2>
              <p className="text-slate-500 text-sm sm:text-base mt-2 max-w-md mx-auto">
                Hãy chọn đúng tên của mình trong danh sách bên dưới trước khi bắt đầu làm bài nhé!
              </p>
            </div>

            {/* Form Chọn Tên */}
            <div className="max-w-md mx-auto space-y-6">
              <div>
                <label
                  htmlFor="student-select"
                  className="block text-sm font-bold text-slate-700 mb-2 flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    Chọn tên của em
                  </span>
                  <span className="text-xs font-normal text-rose-500">* Bắt buộc</span>
                </label>

                <div className="relative">
                  <select
                    id="student-select"
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full appearance-none bg-slate-50 border-2 border-indigo-100 focus:border-indigo-500 focus:bg-white text-slate-800 font-semibold text-base sm:text-lg rounded-2xl px-4 py-3.5 pr-10 focus:outline-hidden focus:ring-4 focus:ring-indigo-100 transition-all cursor-pointer shadow-xs"
                  >
                    <option value="" disabled>
                      -- Nhấn vào đây để chọn tên --
                    </option>
                    {STUDENTS.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Quick Select Buttons */}
              <div>
                <p className="text-xs font-medium text-slate-400 mb-2.5 text-center">
                  Hoặc bấm nhanh tên của em:
                </p>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {STUDENTS.map((name) => {
                    const isSelected = selectedStudent === name;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setSelectedStudent(name)}
                        className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200 transform scale-102'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50'
                        }`}
                      >
                        <span className="text-base">{name === 'Minh Chi' ? '👧' : name === 'Duy Sang' ? '👦' : '🌟'}</span>
                        <span>{name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Thông tin quy chế làm bài */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs text-slate-600 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-slate-700">
                  <BookOpen className="w-4 h-4 text-sky-600" />
                  <span>Quy định bài làm:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 pl-1 text-slate-500">
                  <li>Gồm 20 câu hỏi trắc nghiệm tiếng Anh ngữ pháp & từ vựng Lớp 7.</li>
                  <li>Mỗi câu chọn 1 đáp án A, B, C hoặc D.</li>
                  <li>Hệ thống tự động chấm điểm và thông báo kết quả ngay sau khi nộp.</li>
                </ul>
              </div>

              {/* Nút Bắt đầu làm bài */}
              <button
                type="button"
                onClick={handleStartQuiz}
                disabled={!selectedStudent}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-md ${
                  selectedStudent
                    ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white shadow-indigo-300 active:scale-[0.99] cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                <span>Bắt đầu làm bài</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ==================== MÀN HÌNH 2: LÀM BÀI ==================== */}
        {currentScreen === 'quiz' && (
          <div className="w-full space-y-4 my-auto">
            {/* Header info & Progress */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-indigo-100/70">
              <div className="flex items-center justify-between mb-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg text-xs sm:text-sm">
                    Câu {currentQuestionIndex + 1}/{totalQuestions}
                  </span>
                  <span className="text-slate-400 text-xs hidden sm:inline">•</span>
                  <span className="text-slate-600 text-xs sm:text-sm font-medium hidden sm:inline">
                    Lớp 7 - Tiếng Anh
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-500">
                    Tiến độ: <span className="text-indigo-600 font-bold">{progressPercent}%</span>
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/60">
                <div
                  className="bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>

              {/* Question dots indicator */}
              <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100 justify-center">
                {QUESTIONS.map((_, idx) => {
                  const isAnswered = userAnswers[idx] !== undefined;
                  const isCurrent = currentQuestionIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentQuestionIndex(idx)}
                      title={`Câu ${idx + 1}`}
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center ${
                        isCurrent
                          ? 'bg-indigo-600 text-white ring-2 ring-indigo-300 ring-offset-1 scale-105'
                          : isAnswered
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-3xl shadow-lg shadow-indigo-100/60 border border-indigo-100/80 p-5 sm:p-8">
              {/* Question Text - Keeping EXACT English string */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-xs font-bold">
                    Question {currentQuestion.cau}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800 leading-relaxed bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                  {currentQuestion.hoi}
                </h3>
              </div>

              {/* 4 Choices */}
              <div className="space-y-3 mb-8">
                {(['A', 'B', 'C', 'D'] as const).map((key) => {
                  const isSelected = selectedAnswer === key;
                  const optionText = currentQuestion[key];

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSelectOption(key)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-3.5 group cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-600 text-indigo-950 shadow-md shadow-indigo-100 scale-[1.01]'
                          : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50/80 text-slate-700'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700'
                        }`}
                      >
                        {key}
                      </div>
                      <span className="text-base sm:text-lg font-medium flex-1">
                        {optionText}
                      </span>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-600 text-white'
                            : 'border-slate-300 group-hover:border-indigo-400'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className={`py-3 px-4 rounded-xl font-semibold text-sm flex items-center gap-1.5 transition-all ${
                    currentQuestionIndex === 0
                      ? 'opacity-0 pointer-events-none'
                      : 'text-slate-600 hover:bg-slate-100 active:scale-95 cursor-pointer'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Câu trước</span>
                </button>

                <div className="flex items-center gap-2">
                  {currentQuestionIndex < totalQuestions - 1 ? (
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      disabled={!selectedAnswer}
                      className={`py-3.5 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center gap-2 transition-all shadow-md ${
                        selectedAnswer
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 active:scale-98 cursor-pointer'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      }`}
                    >
                      <span>Câu tiếp theo</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitQuiz}
                      disabled={!selectedAnswer}
                      className={`py-3.5 px-7 rounded-2xl font-bold text-sm sm:text-base flex items-center gap-2 transition-all shadow-lg ${
                        selectedAnswer
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-200 active:scale-98 cursor-pointer'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      }`}
                    >
                      <Send className="w-4 h-4" />
                      <span>Nộp bài</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== MÀN HÌNH 3: KẾT QUẢ ==================== */}
        {currentScreen === 'result' && (
          <div className="w-full space-y-6 my-6">
            {/* Score Summary Card */}
            <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/60 border border-indigo-100/80 p-6 sm:p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 translate-x-8 -translate-y-8 w-40 h-40 bg-indigo-100/50 rounded-full blur-2xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 -translate-x-8 translate-y-8 w-40 h-40 bg-emerald-100/50 rounded-full blur-2xl pointer-events-none"></div>

              {/* Trophy & Badge */}
              <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-400 to-amber-500 text-white shadow-xl shadow-amber-200/80 mb-4 transform hover:scale-105 transition-transform">
                <Trophy className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>

              <div className="inline-block px-3.5 py-1 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs uppercase tracking-wider mb-2">
                Học sinh: {selectedStudent} • Lớp 7
              </div>

              {/* Điểm số chính */}
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight mt-1 mb-2">
                Em đúng <span className="text-indigo-600">{score}</span>/{totalQuestions} câu
              </h2>

              {/* Lời nhận xét động viên */}
              <p className="text-base sm:text-lg font-medium text-slate-600 max-w-lg mx-auto mb-5">
                {score >= 19
                  ? '🎉 Xuất sắc! Em nắm kiến thức Tiếng Anh lớp 7 rất vững vàng!'
                  : score >= 16
                  ? '🌟 Giỏi lắm! Kết quả rất tốt, hãy tiếp tục phát huy nhé!'
                  : score >= 12
                  ? '👍 Khá tốt! Hãy xem lại các câu chưa đúng để nhớ lâu hơn nhé!'
                  : '💪 Cố lên em nhé! Xem lại đáp án chi tiết và làm lại để đạt điểm cao hơn!'}
              </p>

              {/* Detailed metrics pill */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md mx-auto mb-6">
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3">
                  <div className="text-xs text-emerald-700 font-semibold mb-0.5">Số câu đúng</div>
                  <div className="text-2xl font-extrabold text-emerald-600">
                    {score} <span className="text-xs font-normal text-emerald-500">câu</span>
                  </div>
                </div>
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3">
                  <div className="text-xs text-rose-700 font-semibold mb-0.5">Số câu sai</div>
                  <div className="text-2xl font-extrabold text-rose-600">
                    {totalQuestions - score}{' '}
                    <span className="text-xs font-normal text-rose-500">câu</span>
                  </div>
                </div>
                <div className="bg-sky-50 border border-sky-100 rounded-2xl p-3 col-span-2 sm:col-span-1">
                  <div className="text-xs text-sky-700 font-semibold mb-0.5">Tỷ lệ chính xác</div>
                  <div className="text-2xl font-extrabold text-sky-600">
                    {Math.round((score / totalQuestions) * 100)}%
                  </div>
                </div>
              </div>

              {/* Trạng thái ghi nhận kết quả */}
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 px-4 py-2 rounded-full border border-slate-200/70 mb-6">
                {submissionStatus === 'sending' && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                    <span>Đang gửi kết quả về hệ thống giáo viên...</span>
                  </>
                )}
                {submissionStatus === 'sent' && (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-700">Đã lưu kết quả của em về bảng điểm & Telegram!</span>
                  </>
                )}
                {submissionStatus === 'error' && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    <span>Kết quả bài làm đã hoàn thành.</span>
                  </>
                )}
                {submissionStatus === 'idle' && (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                    <span>Đã chấm điểm hoàn tất.</span>
                  </>
                )}
              </div>

              {/* Nút Làm lại từ đầu */}
              <div>
                <button
                  type="button"
                  onClick={handleRestart}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-95 cursor-pointer text-base"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Làm lại từ đầu</span>
                </button>
              </div>
            </div>

            {/* Chi tiết đáp án từng câu */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <span>Chi tiết bài làm (20 câu):</span>
                </h3>

                {/* Filter buttons */}
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setFilterMode('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      filterMode === 'all'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Tất cả (20)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode('correct')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      filterMode === 'correct'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Đúng ({score})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode('wrong')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      filterMode === 'wrong'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Sai ({totalQuestions - score})
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-3.5">
                {QUESTIONS.filter((_, idx) => {
                  const isCorrect = userAnswers[idx] === QUESTIONS[idx].dapAn;
                  if (filterMode === 'correct') return isCorrect;
                  if (filterMode === 'wrong') return !isCorrect;
                  return true;
                }).map((q) => {
                  const studentAnswer = userAnswers[q.cau - 1];
                  const isCorrect = studentAnswer === q.dapAn;

                  return (
                    <div
                      key={q.cau}
                      className={`bg-white rounded-2xl p-4 sm:p-5 border-2 transition-all shadow-xs ${
                        isCorrect
                          ? 'border-emerald-200/80 hover:border-emerald-300'
                          : 'border-rose-200/80 hover:border-rose-300'
                      }`}
                    >
                      {/* Câu hỏi header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              isCorrect
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            #{q.cau}
                          </span>
                          <span className="font-semibold text-slate-800 text-sm sm:text-base">
                            {q.hoi}
                          </span>
                        </div>

                        {/* Status badge */}
                        <div className="shrink-0">
                          {isCorrect ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Đúng
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              Chưa đúng
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs sm:text-sm">
                        {(['A', 'B', 'C', 'D'] as const).map((key) => {
                          const isKeyCorrect = q.dapAn === key;
                          const isStudentPick = studentAnswer === key;

                          let optionStyle = 'bg-slate-50 border-slate-200 text-slate-600';
                          if (isKeyCorrect) {
                            optionStyle = 'bg-emerald-50 border-emerald-500 font-bold text-emerald-900';
                          } else if (isStudentPick && !isCorrect) {
                            optionStyle = 'bg-rose-50 border-rose-400 font-medium text-rose-900 line-through';
                          }

                          return (
                            <div
                              key={key}
                              className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${optionStyle}`}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                                    isKeyCorrect
                                      ? 'bg-emerald-600 text-white'
                                      : isStudentPick && !isCorrect
                                      ? 'bg-rose-500 text-white'
                                      : 'bg-slate-200 text-slate-600'
                                  }`}
                                >
                                  {key}
                                </span>
                                <span>{q[key]}</span>
                              </div>

                              <div>
                                {isKeyCorrect && (
                                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                                    Đáp án đúng
                                  </span>
                                )}
                                {isStudentPick && !isKeyCorrect && (
                                  <span className="text-[11px] font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md">
                                    Em đã chọn
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom restart button */}
              <div className="text-center pt-4 pb-8">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 px-8 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer text-sm sm:text-base"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Làm lại từ đầu</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 border-t border-slate-200/80 py-3 text-center text-xs text-slate-500">
        <p>Hệ thống bài tập trắc nghiệm Tiếng Anh Lớp 7 • Dành cho học sinh</p>
      </footer>
    </div>
  );
}
