'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, LogIn, BookHeart, Calendar as CalendarIcon, TrendingUp, Settings } from 'lucide-react';

// Types
type Mood = 'incredible' | 'good' | 'normal' | 'bad' | 'horrible';
type Energy = 'Baja' | 'Media' | 'Alta';

interface DailyEntry {
  date: string; // YYYY-MM-DD
  mood: Mood | null;
  energy: Energy | null;
  word: string;
  note: string;
}

// Constants
const MOODS: { id: Mood; emoji: string; label: string; color: string; bg: string }[] = [
  { id: 'incredible', emoji: '😄', label: 'Increíble', color: 'text-green-400', bg: 'bg-green-500/20' },
  { id: 'good', emoji: '😊', label: 'Bien', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  { id: 'normal', emoji: '😐', label: 'Normal', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  { id: 'bad', emoji: '😞', label: 'Mal', color: 'text-orange-400', bg: 'bg-orange-500/20' },
  { id: 'horrible', emoji: '😢', label: 'Horrible', color: 'text-red-400', bg: 'bg-red-500/20' },
];

const ENERGIES: Energy[] = ['Baja', 'Media', 'Alta'];

// Helper for dates
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => {
  let day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Make Monday 0
};
const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export default function AnimoApp() {
  // State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [entries, setEntries] = useState<Record<string, DailyEntry>>({});
  
  // Form State
  const [currentMood, setCurrentMood] = useState<Mood | null>(null);
  const [currentEnergy, setCurrentEnergy] = useState<Energy | null>(null);
  const [currentWord, setCurrentWord] = useState('');
  const [currentNote, setCurrentNote] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('animo_entries');
    if (saved) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setEntries(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading entries", e);
      }
    }
  }, []);

  // Update form when selected date changes
  useEffect(() => {
    const entry = entries[selectedDate];
    if (entry) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentMood(entry.mood);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentEnergy(entry.energy);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentWord(entry.word);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentNote(entry.note);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentMood(null);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentEnergy(null);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentWord('');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentNote('');
    }
  }, [selectedDate, entries]);

  // Save entry
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const newEntry: DailyEntry = {
      date: selectedDate,
      mood: currentMood,
      energy: currentEnergy,
      word: currentWord,
      note: currentNote,
    };
    
    const updatedEntries = { ...entries, [selectedDate]: newEntry };
    setEntries(updatedEntries);
    localStorage.setItem('animo_entries', JSON.stringify(updatedEntries));
    
    setTimeout(() => setIsSaving(false), 600);
  };

  // Calendar generation
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));

  // Stats calculation
  const currentMonthEntries = Object.values(entries).filter(e => e.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`));
  const entriesCount = currentMonthEntries.filter(e => e.mood !== null).length;
  
  // Calculate predominant mood
  const moodCounts = currentMonthEntries.reduce((acc, curr) => {
    if (curr.mood) acc[curr.mood] = (acc[curr.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  let predominantMoodId = null;
  let maxCount = 0;
  for (const [m, count] of Object.entries(moodCounts)) {
    if (count > maxCount) {
      maxCount = count;
      predominantMoodId = m;
    }
  }
  const predominantMood = MOODS.find(m => m.id === predominantMoodId);

  // Calculate streak (simple version)
  let streak = 0;
  let checkDate = new Date();
  while (true) {
    const dStr = formatDate(checkDate);
    if (entries[dStr] && entries[dStr].mood) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // If today is empty, check yesterday before breaking
      if (streak === 0 && formatDate(checkDate) === formatDate(new Date())) {
         checkDate.setDate(checkDate.getDate() - 1);
         const yStr = formatDate(checkDate);
         if (entries[yStr] && entries[yStr].mood) {
             streak++;
             checkDate.setDate(checkDate.getDate() - 1);
             continue;
         }
      }
      break;
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans bg-[#0a0a0a]">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-[#050505] border-r border-white/5 p-8 flex flex-col z-20 shrink-0">
        <div className="mb-12">
          <h1 className="font-serif text-4xl text-purple-400 italic mb-2">Ánimo</h1>
          <p className="text-gray-500 text-sm italic font-light">Tu santuario de medianoche</p>
        </div>
        
        <nav className="space-y-2 flex-1">
          <a href="#" className="flex items-center gap-4 text-purple-400 font-medium bg-purple-500/10 px-4 py-3 rounded-xl border-l-2 border-purple-400 transition-all">
            <BookHeart size={20} /> Mi Diario
          </a>
          <a href="#" className="flex items-center gap-4 text-gray-400 hover:text-gray-200 hover:bg-white/5 px-4 py-3 rounded-xl transition-all">
            <CalendarIcon size={20} /> Calendario
          </a>
          <a href="#" className="flex items-center gap-4 text-gray-400 hover:text-gray-200 hover:bg-white/5 px-4 py-3 rounded-xl transition-all">
            <TrendingUp size={20} /> Tendencias
          </a>
          <a href="#" className="flex items-center gap-4 text-gray-400 hover:text-gray-200 hover:bg-white/5 px-4 py-3 rounded-xl transition-all">
            <Settings size={20} /> Ajustes
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Bar / Login Banner */}
        <header className="h-20 flex items-center justify-end px-8 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
          <button className="flex items-center gap-3 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm text-gray-300 transition-all group">
            <LogIn size={16} className="text-purple-400 group-hover:scale-110 transition-transform" />
            <span>Inicia sesión con Google para guardar tu historial</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12 flex flex-col xl:flex-row gap-12">
          
          {/* Left Column: Calendar & Stats */}
          <div className="flex-1 max-w-3xl space-y-10">
            {/* Calendar Header */}
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-5xl font-serif font-light tracking-tight uppercase text-gray-100">
                  {monthNames[month]}
                </h2>
                <p className="text-gray-500 mt-2 flex items-center gap-2">
                  <CalendarIcon size={16} /> Explora tu viaje emocional este mes
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={prevMonth} className="p-3 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={nextMonth} className="p-3 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-3">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                <div key={d} className="text-center text-xs uppercase tracking-widest text-gray-600 font-bold pb-2">
                  {d}
                </div>
              ))}
              
              {days.map((date, i) => {
                if (!date) return <div key={`empty-${i}`} className="aspect-square" />;
                
                const dateStr = formatDate(date);
                const isSelected = dateStr === selectedDate;
                const isToday = dateStr === formatDate(new Date());
                const entry = entries[dateStr];
                const moodConfig = entry?.mood ? MOODS.find(m => m.id === entry.mood) : null;
                
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`
                      aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all relative overflow-hidden
                      ${isSelected ? 'ring-2 ring-purple-500 ring-offset-4 ring-offset-[#0a0a0a] scale-105 z-10' : 'hover:scale-105'}
                      ${moodConfig ? `${moodConfig.bg} border border-white/5` : 'bg-[#141414] border border-white/5 hover:bg-[#1f1f1f]'}
                    `}
                  >
                    <span className={`text-sm font-medium ${moodConfig ? moodConfig.color : 'text-gray-400'}`}>
                      {date.getDate()}
                    </span>
                    {moodConfig && <span className="text-xl">{moodConfig.emoji}</span>}
                    {isToday && !moodConfig && <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1" />}
                  </button>
                );
              })}
            </div>

            {/* Stats Bento */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
              <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Racha Actual</span>
                <p className="text-4xl font-serif mt-4 text-gray-200">{streak} <span className="text-lg text-purple-400 font-sans">días</span></p>
              </div>
              <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Predominante</span>
                <div className="flex items-center gap-3 mt-4">
                  {predominantMood ? (
                    <>
                      <span className="text-3xl">{predominantMood.emoji}</span>
                      <span className="text-lg font-light text-gray-300">{predominantMood.label}</span>
                    </>
                  ) : (
                    <span className="text-lg font-light text-gray-600">Sin datos</span>
                  )}
                </div>
              </div>
              <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 flex flex-col justify-between col-span-2 md:col-span-1">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Registros {monthNames[month].substring(0,3)}</span>
                <p className="text-4xl font-serif mt-4 text-gray-200">{entriesCount}<span className="text-xl text-gray-600 font-sans">/{daysInMonth}</span></p>
              </div>
            </div>
          </div>

          {/* Right Column: Form Panel */}
          <div className="w-full xl:w-[400px] shrink-0">
            <div className="bg-[#111] border border-white/5 rounded-3xl p-8 sticky top-8 shadow-2xl shadow-black/50">
              <h3 className="text-2xl font-serif mb-1 text-gray-100">¿Cómo te sientes hoy?</h3>
              <p className="text-gray-500 font-light text-sm mb-8">
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>

              <form onSubmit={handleSave} className="space-y-8">
                {/* Mood Selector */}
                <div className="space-y-4">
                  <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Estado de Ánimo</label>
                  <div className="flex justify-between gap-2">
                    {MOODS.map((m) => {
                      const isSelected = currentMood === m.id;
                      // Determine the ring color based on the mood's color class
                      let ringColorClass = '';
                      if (m.id === 'incredible') ringColorClass = 'ring-green-500';
                      else if (m.id === 'good') ringColorClass = 'ring-emerald-500';
                      else if (m.id === 'normal') ringColorClass = 'ring-blue-500';
                      else if (m.id === 'bad') ringColorClass = 'ring-orange-500';
                      else if (m.id === 'horrible') ringColorClass = 'ring-red-500';

                      return (
                        <motion.button
                          key={m.id}
                          type="button"
                          onClick={() => setCurrentMood(m.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="flex flex-col items-center gap-2 group relative"
                        >
                          <div className={`
                            w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-300
                            ${isSelected ? `${m.bg} ring-2 ${ringColorClass} ring-offset-2 ring-offset-[#111]` : 'bg-white/5 hover:bg-white/10'}
                          `}>
                            {m.emoji}
                          </div>
                          <span className={`text-[10px] uppercase tracking-wider font-bold transition-opacity absolute -bottom-6 whitespace-nowrap
                            ${isSelected ? m.color : 'text-gray-500 opacity-0 group-hover:opacity-100'}
                          `}>
                            {m.label}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4" />

                {/* Energy Selector */}
                <div className="space-y-4">
                  <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Nivel de Energía</label>
                  <div className="grid grid-cols-3 gap-3">
                    {ENERGIES.map(e => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => setCurrentEnergy(e)}
                        className={`
                          py-2.5 text-xs rounded-xl font-bold transition-all
                          ${currentEnergy === e 
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' 
                            : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'}
                        `}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                {/* One Word */}
                <div className="space-y-3">
                  <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Una palabra para hoy</label>
                  <input
                    type="text"
                    maxLength={30}
                    value={currentWord}
                    onChange={(e) => setCurrentWord(e.target.value)}
                    placeholder="Ej: Serenidad"
                    className="w-full bg-transparent border-0 border-b border-white/10 focus:border-purple-500 focus:ring-0 text-sm py-3 px-0 placeholder:text-gray-600 text-gray-200 transition-colors outline-none"
                  />
                </div>

                {/* Textarea */}
                <div className="space-y-3">
                  <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">¿Qué ha pasado hoy?</label>
                  <div className="relative">
                    <textarea
                      value={currentNote}
                      onChange={(e) => setCurrentNote(e.target.value)}
                      maxLength={150}
                      rows={3}
                      placeholder="Escribe tus pensamientos..."
                      className="w-full bg-white/5 rounded-xl border border-white/5 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 outline-none text-sm p-4 placeholder:text-gray-600 text-gray-200 resize-none transition-all"
                    />
                    <span className="absolute bottom-3 right-4 text-[10px] text-gray-600">
                      {currentNote.length} / 150
                    </span>
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  animate={isSaving ? { scale: [1, 1.05, 1], backgroundColor: ['#9333ea', '#d8b4fe', '#9333ea'] } : {}}
                  className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold tracking-widest uppercase text-xs shadow-lg shadow-purple-500/20 transition-colors relative overflow-hidden"
                >
                  {isSaving ? 'Guardado ✨' : 'Guardar Registro'}
                </motion.button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
