
import React from 'react';
import { Clock, Plus, Trash2, Copy, AlertCircle } from 'lucide-react';

interface BusinessHoursEditorProps {
  hours: { [key: string]: string };
  onChange: (newHours: { [key: string]: string }) => void;
}

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

export const BusinessHoursEditor: React.FC<BusinessHoursEditorProps> = ({ hours, onChange }) => {
  
  const handleDayToggle = (day: string) => {
    const newHours = { ...hours };
    if (newHours[day] === 'Fechado') {
      newHours[day] = '09:00 - 18:00';
    } else {
      newHours[day] = 'Fechado';
    }
    onChange(newHours);
  };

  const handleTimeChange = (day: string, rangeIdx: number, type: 'start' | 'end', value: string) => {
    const newHours = { ...hours };
    const currentStr = newHours[day] || '09:00 - 18:00';
    if (currentStr === 'Fechado' || currentStr === '24 horas') return;

    const ranges = currentStr.split(',').map(r => r.trim());
    const [start, end] = ranges[rangeIdx].split('-').map(t => t.trim());
    
    if (type === 'start') {
      ranges[rangeIdx] = `${value} - ${end}`;
    } else {
      ranges[rangeIdx] = `${start} - ${value}`;
    }
    
    newHours[day] = ranges.join(', ');
    onChange(newHours);
  };

  const addRange = (day: string) => {
    const newHours = { ...hours };
    const currentStr = newHours[day] || '09:00 - 18:00';
    if (currentStr === 'Fechado' || currentStr === '24 horas') {
        newHours[day] = '09:00 - 12:00, 14:00 - 18:00';
    } else {
        newHours[day] = `${currentStr}, 19:00 - 22:00`;
    }
    onChange(newHours);
  };

  const removeRange = (day: string, idx: number) => {
    const newHours = { ...hours };
    const ranges = (newHours[day] || '').split(',').map(r => r.trim());
    if (ranges.length <= 1) {
        newHours[day] = 'Fechado';
    } else {
        ranges.splice(idx, 1);
        newHours[day] = ranges.join(', ');
    }
    onChange(newHours);
  };

  const copyToAll = (day: string) => {
    const value = hours[day];
    const newHours = { ...hours };
    DAYS.forEach(d => {
      newHours[d] = value;
    });
    onChange(newHours);
  };

  const set24Hours = (day: string) => {
    const newHours = { ...hours };
    newHours[day] = '24 horas';
    onChange(newHours);
  };

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3 items-start mb-6">
        <AlertCircle className="text-amber-600 shrink-0" size={20} />
        <p className="text-[10px] text-amber-800 font-medium leading-relaxed">
          Configure os horários de funcionamento. Você pode adicionar múltiplos turnos (ex: almoço e jantar) clicando no botão &quot;+&quot;. Use o botão de cópia para replicar o horário para todos os dias da semana.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {DAYS.map(day => {
          const value = hours[day] || 'Fechado';
          const isClosed = value === 'Fechado';
          const is24h = value === '24 horas';
          const ranges = (isClosed || is24h) ? [] : value.split(',').map(r => r.trim());

          return (
            <div key={day} className={`p-4 rounded-2xl border transition-all ${isClosed ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${isClosed ? 'bg-slate-200 text-slate-400' : 'bg-ocean-100 text-ocean-600'}`}>
                    {day.substring(0, 3).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-ocean-950 text-sm">{day}</h4>
                    <div className="flex gap-2 mt-1">
                        <button 
                            type="button"
                            onClick={() => handleDayToggle(day)}
                            className={`text-[10px] font-black uppercase px-2 py-1 rounded-md border transition-all ${isClosed ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-slate-200 text-slate-400 hover:text-red-500'}`}
                        >
                            {isClosed ? 'Fechado' : 'Fechar'}
                        </button>
                        <button 
                            type="button"
                            onClick={() => set24Hours(day)}
                            className={`text-[10px] font-black uppercase px-2 py-1 rounded-md border transition-all ${is24h ? 'bg-ocean-600 border-ocean-600 text-white' : 'bg-white border-slate-200 text-slate-400 hover:text-ocean-600'}`}
                        >
                            24 Horas
                        </button>
                    </div>
                  </div>
                </div>

                {!isClosed && !is24h && (
                  <div className="flex-1 space-y-3">
                    {ranges.map((range, idx) => {
                      const [start, end] = range.split('-').map(t => t.trim());
                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100 flex-1">
                            <input 
                              type="time" 
                              className="bg-transparent text-xs font-bold outline-none w-full"
                              value={start || '09:00'}
                              onChange={(e) => handleTimeChange(day, idx, 'start', e.target.value)}
                            />
                            <span className="text-slate-300 text-xs font-bold">até</span>
                            <input 
                              type="time" 
                              className="bg-transparent text-xs font-bold outline-none w-full"
                              value={end || '18:00'}
                              onChange={(e) => handleTimeChange(day, idx, 'end', e.target.value)}
                            />
                          </div>
                          <button 
                            type="button"
                            onClick={() => removeRange(day, idx)}
                            className="p-2 text-red-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      );
                    })}
                    <div className="flex justify-between items-center pt-1">
                        <button 
                            type="button"
                            onClick={() => addRange(day)}
                            className="text-[10px] font-black text-ocean-600 flex items-center gap-1 hover:underline"
                        >
                            <Plus size={12} /> ADICIONAR TURNO
                        </button>
                        <button 
                            type="button"
                            onClick={() => copyToAll(day)}
                            className="text-[10px] font-black text-slate-400 flex items-center gap-1 hover:text-ocean-600 transition-colors"
                        >
                            <Copy size={12} /> REPLICAR PARA TODOS OS DIAS
                        </button>
                    </div>
                  </div>
                )}

                {(isClosed || is24h) && (
                    <div className="flex-1 flex justify-end">
                        <button 
                            type="button"
                            onClick={() => copyToAll(day)}
                            className="text-[10px] font-black text-slate-400 flex items-center gap-1 hover:text-ocean-600 transition-colors"
                        >
                            <Copy size={12} /> REPLICAR PARA TODOS OS DIAS
                        </button>
                    </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
