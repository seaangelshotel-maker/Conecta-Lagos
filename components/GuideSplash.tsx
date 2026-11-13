
import React from 'react';

export const GuideSplash = () => (
    <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col items-center justify-center animate-in fade-in duration-200">
        <div className="relative mb-8 text-center">
            <div className="absolute inset-0 bg-ocean-200 rounded-full animate-ping opacity-20 duration-1000"></div>
            <div className="relative w-24 h-24 bg-white rounded-3xl shadow-xl border-4 border-ocean-50 flex items-center justify-center mx-auto">
                <img src="/brand/simbolo.svg" alt="Lagos GO" className="w-14 h-14 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-ocean-950 mt-6 animate-pulse">Explorando os Lagos...</h2>
            <p className="text-slate-400 text-xs mt-2 font-medium">Sincronizando guia comercial</p>
        </div>
    </div>
);
