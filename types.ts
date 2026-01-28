
export enum RankPost {
  CEL = 'Coronel',
  TC = 'Tenente-Coronel',
  MAJ = 'Major',
  MAJ_QOE = 'Major QOE',
  CAP_MAJ_QOE = 'Capitão QOE (Maj)',
  CAP = 'Capitão',
  TEN1 = '1º Tenente',
  TEN2 = '2º Tenente',
  ASP = 'Aspirante'
}

export interface OfficerDetail {
  name: string;
  role: string;
  sector: string;
  antiquity?: string;
  // Fix: added imageUrl to resolve "Object literal may only specify known properties" error
  imageUrl?: string;
}

export interface AntiquityRecord {
  antiquity: string;
  name: string;
  omp: string;
  // Fix: added imageUrl for consistency and better type safety in lists
  imageUrl?: string;
}

export interface OfficerData {
  id: string;
  rank: RankPost;
  fixed: number;
  occupied: number;
  surplus: number;
  surplusOfficers?: OfficerDetail[];
}

export interface WorkforceSummary {
  totalFixed: number;
  totalOccupied: number;
  totalVacant: number;
  totalSurplus: number;
}
