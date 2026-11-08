import React from 'react';
import { User } from '../types';
import { Discover } from './Discover';

interface HomeProps {
  currentUser: User | null;
  onNavigate: (page: string, params?: any) => void;
}

/** A Home é a tela Descubra: busca, categorias, filtros, comodidades, destaques, coleções e feed. */
export const Home: React.FC<HomeProps> = ({ onNavigate }) => <Discover onNavigate={onNavigate} home />;
