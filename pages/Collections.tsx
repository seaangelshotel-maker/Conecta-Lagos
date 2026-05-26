import React, { useState, useEffect } from 'react';
import { Collection } from '../types';
import { getCollections } from '../services/dataService';
import { Layers, ArrowLeft } from 'lucide-react';

interface CollectionsProps {
  onNavigate: (page: string, params?: any) => void;
}

export const Collections: React.FC<CollectionsProps> = ({ onNavigate }) => {
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getCollections();
      setCollections(data);
    };
    fetchData();
  }, []);

  return (
    <div className="pb-24 pt-4 min-h-screen bg-slate-50">
        
        <div className="px-4 mb-6 max-w-7xl mx-auto w-full">
            <h1 className="text-2xl font-bold text-ocean-950 mb-1">Coleções & Listas</h1>
            <p className="text-sm text-slate-500">Curadoria especial com o melhor da cidade.</p>
        </div>

        <div className="px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {collections.map(col => (
                <div 
                    key={col.id}
                    onClick={() => onNavigate('collection-detail', { collectionId: col.id })}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer border border-slate-100 flex flex-col h-full"
                >
                    <div className="h-56 relative overflow-hidden">
                        <img src={col.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                        <div className="absolute bottom-4 left-4 right-4">
                             <h2 className="text-white text-2xl font-bold leading-tight mb-1 shadow-black drop-shadow-md">{col.title}</h2>
                             <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-md">{col.businessIds.length} lugares</span>
                        </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                        <p className="text-slate-600 text-sm leading-relaxed mb-4">{col.description}</p>
                        <button className="w-full py-3 rounded-xl bg-ocean-50 text-ocean-600 font-bold text-sm group-hover:bg-ocean-600 group-hover:text-white transition-colors">
                            Explorar Coleção
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};