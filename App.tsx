
import React, { useState, useEffect, useRef } from 'react';
import { AppStage, TaskResult, TaskType, TASKS, UIStyle } from './types';
import { BadForm } from './components/BadForm';
import { GoodForm } from './components/GoodForm';
import { Dashboard } from './components/Dashboard';
import { 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight, 
  MousePointer2, 
  RefreshCw, 
  Mail, 
  Lock, 
  User, 
  ChevronRight,
  Info,
  CheckCircle2,
  Eye,
  EyeOff,
  ClipboardList,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const App: React.FC = () => {
  const [stage, setStage] = useState<AppStage>('intro');
  const [taskType, setTaskType] = useState<TaskType>('email');
  const [taskOrder, setTaskOrder] = useState<UIStyle[]>([]);
  const [completedTasks, setCompletedTasks] = useState<UIStyle[]>([]);
  const [isInstructionMinimized, setIsInstructionMinimized] = useState(false);
  const [isPasswordVisibleInInstruction, setIsPasswordVisibleInInstruction] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [flashMistake, setFlashMistake] = useState(false);
  
  const [results, setResults] = useState<TaskResult>({
    bad: { clickCount: 0, timeTaken: 0, mistakes: 0 },
    good: { clickCount: 0, timeTaken: 0, mistakes: 0 }
  });

  const startTimeRef = useRef<number>(0);
  const clickCountRef = useRef<number>(0);

  useEffect(() => {
    const handleGlobalClick = () => {
      if (stage === 'task-bad' || stage === 'task-good') {
        clickCountRef.current += 1;
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [stage]);
  
  useEffect(() => {
    let interval: any;
    if (stage === 'task-bad' || stage === 'task-good') {
      interval = setInterval(() => {
        setCurrentTime(Date.now() - startTimeRef.current);
      }, 100);
    } else {
      setCurrentTime(0);
    }
    return () => clearInterval(interval);
  }, [stage]);

  const handleTaskSelection = (type: TaskType) => {
    setTaskType(type);
    setStage('order-selection');
  };

  const handleOrderSelection = (firstStyle: UIStyle) => {
    const order: UIStyle[] = firstStyle === 'bad' ? ['bad', 'good'] : ['good', 'bad'];
    setTaskOrder(order);
    const firstStage: AppStage = order[0] === 'bad' ? 'briefing-bad' : 'briefing-good';
    setStage(firstStage);
  };

  const startTask = (nextStage: 'task-bad' | 'task-good') => {
    startTimeRef.current = Date.now();
    clickCountRef.current = 0;
    setIsInstructionMinimized(false);
    setStage(nextStage);
  };

  const completeTask = (currentStyle: UIStyle) => {
    const endTime = Date.now();
    const timeTaken = endTime - startTimeRef.current;
    
    setResults(prev => ({
      ...prev,
      [currentStyle]: {
        ...prev[currentStyle],
        clickCount: clickCountRef.current,
        timeTaken,
      }
    }));

    const newCompleted = [...completedTasks, currentStyle];
    setCompletedTasks(newCompleted);

    const remainingTask = taskOrder.find(t => !newCompleted.includes(t));
    if (remainingTask) {
      setStage(remainingTask === 'bad' ? 'briefing-bad' : 'briefing-good');
    } else {
      setStage('results');
    }
  };

  const handleMistake = (currentStyle: UIStyle) => {
    setFlashMistake(true);
    setTimeout(() => setFlashMistake(false), 300);
    setResults(prev => ({
      ...prev,
      [currentStyle]: { ...prev[currentStyle], mistakes: prev[currentStyle].mistakes + 1 }
    }));
  };

  const resetApp = () => {
    setResults({
      bad: { clickCount: 0, timeTaken: 0, mistakes: 0 },
      good: { clickCount: 0, timeTaken: 0, mistakes: 0 }
    });
    setCompletedTasks([]);
    setTaskOrder([]);
    setStage('intro');
  };

  const goToTaskSelection = () => {
    setResults({
      bad: { clickCount: 0, timeTaken: 0, mistakes: 0 },
      good: { clickCount: 0, timeTaken: 0, mistakes: 0 }
    });
    setCompletedTasks([]);
    setTaskOrder([]);
    setStage('task-selection');
  };

  const getMaskedInstruction = (instruction: string) => {
    if (taskType !== 'password' || isPasswordVisibleInInstruction) return instruction;
    // Mask the password part "M3@zP7$q"
    return instruction.replace('M3@zP7$q', '********');
  };

  const renderBriefing = (type: UIStyle) => {
    const isFirst = completedTasks.length === 0;
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-2xl mx-auto text-center mt-20 p-8 bg-white rounded-2xl shadow-xl border border-slate-100"
      >
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${type === 'bad' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
          {type === 'bad' ? <AlertTriangle size={32} /> : <CheckCircle size={32} />}
        </div>
        <h2 className="text-3xl font-bold mb-2">
          {type === 'bad' ? '悪いUI (Bad UI)' : '良いUI (Good UI)'}
        </h2>
        <div className="flex justify-center gap-2 mb-6">
          <div className={`h-2 w-12 rounded-full ${isFirst ? (type === 'bad' ? 'bg-red-500' : 'bg-blue-500') : 'bg-slate-300'}`}></div>
          <div className={`h-2 w-12 rounded-full ${!isFirst ? (type === 'bad' ? 'bg-red-500' : 'bg-blue-500') : 'bg-slate-300'}`}></div>
        </div>
        {!isFirst && (
          <p className="mb-6 text-slate-500 bg-slate-100 py-2 px-4 rounded-lg inline-block">
            お疲れ様でした！次は比較のために<strong>{type === 'bad' ? '使いにくいデザイン' : '理想的なデザイン'}</strong>を体験します。
          </p>
        )}
        <div className="text-lg text-slate-600 mb-8 mt-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-left">
          <p className="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-2 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Info size={18} className="text-blue-500" />
              ミッション指示書
            </span>
            {taskType === 'password' && (
              <button 
                onClick={() => setIsPasswordVisibleInInstruction(!isPasswordVisibleInInstruction)}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                {isPasswordVisibleInInstruction ? <EyeOff size={14}/> : <Eye size={14}/>}
                {isPasswordVisibleInInstruction ? 'パスワードを隠す' : 'パスワードを表示'}
              </button>
            )}
          </p>
          <p className="whitespace-pre-line font-medium">{getMaskedInstruction(TASKS[taskType].instruction)}</p>
        </div>
        <div className="flex justify-center gap-4 mx-auto">
          <button 
            onClick={() => setStage('task-selection')}
            className="px-8 py-4 rounded-full font-bold text-slate-600 bg-white border-2 border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            戻る
          </button>
          <button 
            onClick={() => startTask(type === 'bad' ? 'task-bad' : 'task-good')}
            className={`px-8 py-4 rounded-full font-bold text-white transition-all hover:scale-105 shadow-lg flex items-center gap-2 ${type === 'bad' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {type === 'bad' ? '悪いUIを体験する' : '良いUIを体験する'}
            <ChevronRight size={20} />
          </button>
        </div>
      </motion.div>
    );
  };

  const renderInstructionOverlay = () => {
    if (stage !== 'task-bad' && stage !== 'task-good') return null;

    return (
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
        <div 
          className={`
            bg-white rounded-lg shadow-2xl border-2 border-slate-800 overflow-hidden transition-all duration-300
            ${isInstructionMinimized ? 'w-48' : 'w-80'}
          `}
        >
          <div 
            className="bg-slate-800 text-white p-3 flex justify-between items-center cursor-pointer hover:bg-slate-700 transition-colors"
            onClick={() => setIsInstructionMinimized(!isInstructionMinimized)}
          >
            <span className="font-bold text-sm flex items-center gap-2">
              <ClipboardList size={16} className="text-blue-300"/> 
              ミッション指示書
            </span>
            {isInstructionMinimized ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          
          {!isInstructionMinimized && (
            <div className="p-5 bg-yellow-50 text-slate-800 max-h-64 overflow-y-auto">
              <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider border-b border-yellow-200 pb-1">
                 Target Data
              </div>
              <p className="whitespace-pre-line text-sm font-medium leading-relaxed font-mono">
                {getMaskedInstruction(TASKS[taskType].instruction)}
              </p>
              {taskType === 'password' && (
                <button 
                  onClick={() => setIsPasswordVisibleInInstruction(!isPasswordVisibleInInstruction)}
                  className="mt-2 text-[10px] text-blue-600 hover:underline flex items-center gap-1"
                >
                  {isPasswordVisibleInInstruction ? <EyeOff size={12}/> : <Eye size={12}/>}
                  {isPasswordVisibleInInstruction ? 'パスワードを隠す' : 'パスワードを表示'}
                </button>
              )}
              <p className="text-[10px] text-slate-400 mt-3 text-right">
                この通りに入力してください
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      
      {/* Header (except for task views to focus attention) */}
      {!stage.startsWith('task-') && (
        <header className="bg-white border-b border-slate-200 py-4 px-6">
          <div className="max-w-6xl mx-auto flex items-center gap-2">
            <MousePointer2 className="text-blue-600" />
            <h1 className="font-bold text-xl tracking-tight">UI/UX Lab. <span className="text-slate-400 font-normal ml-2">情報Ⅰ 教材アプリ</span></h1>
          </div>
        </header>
      )}

      {/* Task Header Overlay */}
      {stage.startsWith('task-') && (
        <div className="bg-slate-900 text-white py-2 px-4 text-center sticky top-0 z-50 shadow-md flex justify-between items-center">
          <div className="w-1/3 text-left pl-4 text-gray-400 text-xs">
             Mode: {stage === 'task-bad' ? 'Bad UI' : 'Good UI'} | Genre: {TASKS[taskType].title}
          </div>
          <div className="w-1/3 text-center">
              <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">ミッション中</span>
              <span className="ml-4 font-mono text-sm text-blue-400">{(currentTime / 1000).toFixed(1)}s</span>
          </div>
          <div className="w-1/3 text-right pr-4">
              <button onClick={resetApp} className="text-xs text-slate-400 hover:text-white underline">中断する</button>
          </div>
        </div>
      )}

      <main className="flex-grow relative overflow-auto">
        {/* Mistake Flash Overlay */}
        <AnimatePresence>
          {flashMistake && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-red-500 z-[100] pointer-events-none"
            />
          )}
        </AnimatePresence>
        
        <AnimatePresence mode="wait">
          {stage === 'intro' && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center p-6 text-center"
            >
              <div className="max-w-3xl">
                <motion.span 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-block py-1 px-4 rounded-full bg-blue-100 text-blue-700 text-sm font-bold mb-6"
                >
                  高校 情報Ⅰ 実習教材
                </motion.span>
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-5xl sm:text-6xl font-extrabold mb-8 tracking-tight text-slate-900 leading-tight"
                >
                  悪いUI vs 良いUI <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">体験型比較シミュレーター</span>
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl text-slate-600 mb-12 leading-relaxed max-w-2xl mx-auto"
                >
                  「使いにくい」と「使いやすい」を実際に操作して比較します。<br/>
                  デザインがユーザー行動に与える影響をデータで確認しましょう。
                </motion.p>
                <motion.button 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStage('task-selection')} 
                  className="group relative flex items-center gap-4 p-6 bg-blue-600 text-white rounded-full hover:bg-blue-700 hover:shadow-2xl transition-all pr-12 pl-12 shadow-xl mx-auto"
                >
                  <span className="text-xl font-bold">実習を開始する</span>
                  <ArrowRight className="group-hover:translate-x-2 transition-transform" size={24} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {stage === 'task-selection' && (
            <motion.div 
              key="task-selection"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col items-center py-16 px-6"
            >
              <h2 className="text-4xl font-bold mb-4 text-slate-800">実習テーマを選択</h2>
              <p className="text-slate-500 mb-12 text-lg">比較したい入力フォームのジャンルを選んでください。</p>
              <div className="grid md:grid-cols-3 gap-8 w-full max-w-5xl">
                {(Object.keys(TASKS) as TaskType[]).map((type) => (
                  <motion.button 
                    key={type}
                    whileHover={{ y: -8, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                    onClick={() => handleTaskSelection(type)} 
                    className="bg-white p-8 rounded-3xl border-2 border-slate-100 hover:border-blue-500 transition-all text-left flex flex-col h-full shadow-sm group"
                  >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-colors ${
                      type === 'email' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' : 
                      type === 'password' ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white' : 
                      'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
                    }`}>
                      {type === 'email' ? <Mail size={32}/> : type === 'password' ? <Lock size={32}/> : <User size={32}/>}
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-slate-800">{TASKS[type].title}</h3>
                    <p className="text-slate-500 leading-relaxed flex-grow">{TASKS[type].description}</p>
                    <div className="mt-8 pt-6 border-t border-slate-50 text-blue-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                      このテーマで開始 <ArrowRight size={18}/>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {stage === 'order-selection' && (
            <motion.div 
              key="order-selection"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full flex flex-col items-center justify-center p-6"
            >
              <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 max-w-2xl w-full text-center">
                <h2 className="text-3xl font-bold mb-4">どちらから体験しますか？</h2>
                <p className="text-slate-500 mb-10">実習の順番を選択してください。どちらから始めても結果は同じです。</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <button 
                    onClick={() => handleOrderSelection('bad')}
                    className="flex flex-col items-center gap-4 p-8 rounded-2xl border-2 border-red-100 hover:border-red-500 hover:bg-red-50 transition-all group"
                  >
                    <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <AlertTriangle size={32} />
                    </div>
                    <span className="font-bold text-xl text-red-700">悪いUIから</span>
                  </button>
                  <button 
                    onClick={() => handleOrderSelection('good')}
                    className="flex flex-col items-center gap-4 p-8 rounded-2xl border-2 border-blue-100 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CheckCircle size={32} />
                    </div>
                    <span className="font-bold text-xl text-blue-700">良いUIから</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {stage === 'briefing-bad' && renderBriefing('bad')}
          {stage === 'briefing-good' && renderBriefing('good')}

          {stage === 'task-bad' && (
            <motion.div 
              key="task-bad"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col"
            >
              <div className={`bg-yellow-100 border-b border-yellow-200 p-3 transition-all ${isInstructionMinimized ? 'h-12' : ''}`}>
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="bg-yellow-600 text-white text-[10px] px-2 py-0.5 rounded font-bold whitespace-nowrap">MISSION</span>
                    <p className={`text-sm text-yellow-900 font-medium truncate ${isInstructionMinimized ? 'max-w-md' : ''}`}>
                      {TASKS[taskType].instruction}
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsInstructionMinimized(!isInstructionMinimized)}
                    className="text-xs text-yellow-700 hover:text-yellow-900 underline whitespace-nowrap ml-4"
                  >
                    {isInstructionMinimized ? '指示を表示' : '閉じる'}
                  </button>
                </div>
              </div>
              <div className="flex-grow">
                <BadForm 
                  taskType={taskType} 
                  onComplete={() => completeTask('bad')} 
                  onMistake={() => handleMistake('bad')}
                />
              </div>
            </motion.div>
          )}

          {stage === 'task-good' && (
            <motion.div 
              key="task-good"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col"
            >
              <div className="bg-blue-50 border-b border-blue-100 p-4">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                      <Info size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-blue-500 font-bold uppercase tracking-wider">Mission Instruction</p>
                      <p className="text-blue-900 font-medium">{TASKS[taskType].instruction}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-grow overflow-y-auto bg-slate-100 py-12">
                <GoodForm 
                  taskType={taskType} 
                  onComplete={() => completeTask('good')} 
                  onMistake={() => handleMistake('good')}
                />
              </div>
            </motion.div>
          )}

          {stage === 'results' && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full py-12"
            >
              <Dashboard 
                results={results} 
                taskType={taskType} 
                onRestart={resetApp} 
                onBackToSelection={goToTaskSelection}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      {renderInstructionOverlay()}
    </div>
  );
};

export default App;
