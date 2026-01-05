
import React, { useState } from 'react';

interface CalculatorDisguiseProps {
  onUnlock: () => void;
}

export const CalculatorDisguise: React.FC<CalculatorDisguiseProps> = ({ onUnlock }) => {
  const [display, setDisplay] = useState('0');
  const [secretBuffer, setSecretBuffer] = useState('');

  const handleDigit = (digit: string) => {
    setDisplay(prev => prev === '0' ? digit : prev + digit);
    const newBuffer = (secretBuffer + digit).slice(-3);
    setSecretBuffer(newBuffer);
    
    // Secret code is 911
    if (newBuffer === '911') {
      onUnlock();
    }
  };

  const clear = () => {
    setDisplay('0');
    setSecretBuffer('');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 select-none">
      <div className="w-full max-w-sm bg-zinc-900 rounded-[3rem] p-8 shadow-2xl border border-zinc-800">
        <div className="h-32 flex items-end justify-end mb-8 px-4 overflow-hidden">
          <span className="text-white text-6xl font-light tracking-tighter truncate">{display}</span>
        </div>
        
        <div className="grid grid-cols-4 gap-4">
          <button onClick={clear} className="h-16 w-16 rounded-full bg-zinc-400 text-black text-2xl font-medium">AC</button>
          <button className="h-16 w-16 rounded-full bg-zinc-400 text-black text-2xl font-medium">+/-</button>
          <button className="h-16 w-16 rounded-full bg-zinc-400 text-black text-2xl font-medium">%</button>
          <button className="h-16 w-16 rounded-full bg-orange-500 text-white text-3xl font-medium">÷</button>
          
          {[7, 8, 9].map(n => (
            <button key={n} onClick={() => handleDigit(n.toString())} className="h-16 w-16 rounded-full bg-zinc-700 text-white text-2xl font-medium">{n}</button>
          ))}
          <button className="h-16 w-16 rounded-full bg-orange-500 text-white text-3xl font-medium">×</button>
          
          {[4, 5, 6].map(n => (
            <button key={n} onClick={() => handleDigit(n.toString())} className="h-16 w-16 rounded-full bg-zinc-700 text-white text-2xl font-medium">{n}</button>
          ))}
          <button className="h-16 w-16 rounded-full bg-orange-500 text-white text-3xl font-medium">-</button>
          
          {[1, 2, 3].map(n => (
            <button key={n} onClick={() => handleDigit(n.toString())} className="h-16 w-16 rounded-full bg-zinc-700 text-white text-2xl font-medium">{n}</button>
          ))}
          <button className="h-16 w-16 rounded-full bg-orange-500 text-white text-3xl font-medium">+</button>
          
          <button onClick={() => handleDigit('0')} className="col-span-2 h-16 rounded-full bg-zinc-700 text-white text-2xl font-medium px-6 text-left">0</button>
          <button className="h-16 w-16 rounded-full bg-zinc-700 text-white text-2xl font-medium">.</button>
          <button className="h-16 w-16 rounded-full bg-orange-500 text-white text-3xl font-medium">=</button>
        </div>
        
        <p className="text-zinc-600 text-[10px] text-center mt-8 font-bold uppercase tracking-widest opacity-20">System Calc v1.4.2</p>
      </div>
    </div>
  );
};
