import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  Bell, 
  Search, 
  BarChart, 
  Folder, 
  Briefcase, 
  Calendar,
  MessageSquare,
  HelpCircle,
  Archive,
  Layers,
  CheckCircle,
  FileCheck,
  FileBarChart,
  FileClock,
  FileBox,
  FileCode,
  FileSearch,
  FileQuestion,
  FileCog
} from 'lucide-react';
import { ThemeConfig } from './types';

export const THEMES: ThemeConfig[] = [
  { name: 'Midnight Aurora', value: 'aurora', class: 'bg-aurora' },
  { name: 'Oceanic Mist', value: 'oceanic', class: 'bg-oceanic' },
  { name: 'Industrial Slate', value: 'industrial', class: 'bg-industrial' },
  { name: 'Minimalist Frost', value: 'frost', class: 'bg-frost' },
];

export const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
  { name: 'PDR Review', path: '/pdr', icon: <FileText size={20} /> },
  { name: 'MR-03', path: '/projects', icon: <FileText size={20} /> },
  { name: 'MR-04', path: '/teams', icon: <FileText size={20} /> },
  { name: 'MR-05', path: '/schedule', icon: <FileText size={20} /> },
  { name: 'MR-06', path: '/reports', icon: <FileText size={20} /> },
  { name: 'MR-07', path: '/workload', icon: <FileText size={20} /> },
  { name: 'MR-08', path: '/archive', icon: <FileText size={20} /> },
  { name: 'MR-09', path: '/messages', icon: <FileText size={20} /> },
  { name: 'MR-10', path: '/resources', icon: <FileText size={20} /> },
  { name: 'MR-11', path: '/knowledge', icon: <FileText size={20} /> },
  { name: 'MR-12', path: '/audit', icon: <FileText size={20} /> },
  { name: 'MR-13', path: '/support', icon: <FileText size={20} /> },
  { name: 'MR-14', path: '/settings', icon: <Settings size={20} /> },
];