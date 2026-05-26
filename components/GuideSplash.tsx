
import React from 'react';
import { Compass } from 'lucide-react';

export const GuideSplash = () => (
    <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col items-center justify-center animate-in fade-in duration-200">
        <div className="relative mb-8 text-center">
            <div className="absolute inset-0 bg-ocean-200 rounded-full animate-ping opacity-20 duration-1000"></div>
            <div className="relative w-24 h-24 bg-white rounded-3xl shadow-xl border-4 border-ocean-50 flex items-center justify-center mx-auto">
                <Compass size={48} className="text-ocean-600 animate-[spin_4s_linear_infinite]" />
            </div>
            <h2 className="text-xl font-bold text-ocean-950 mt-6 animate-pulse">Explorando o Rio...</h2>
            <p className="text-slate-400 text-xs mt-2 font-medium">Sincronizando guia comercial</p>
        </div>
    </div>
);
