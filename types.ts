
export enum RankPost {
  CEL = 'Coronel',
  TC = 'Tenente-Coronel',
  MAJ = 'Major',
  MAJ_QOE = 'Major QOE',
  CAP_MAJ_QOE = 'Capitão QOE (Maj)',
  CAP = 'Capitão',
  TEN1 = '1º Tenente',
  TEN2 = '2º Tenente'
}

export interface OfficerDetail {
  name: string;
  role: string;
  sector: string;
  antiquity?: string;
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
