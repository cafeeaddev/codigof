import { useMemo } from 'react';
import { ResponseData } from '@/types/admin';

interface MissionScore {
  score: number;
  maxScore: number;
  completed: boolean;
}

interface MissionScores {
  mission1: MissionScore;
  mission2: MissionScore;
  mission3: MissionScore;
  total: { score: number; maxScore: number };
}

export const useMissionScores = (
  userEmail: string,
  responses1: ResponseData[],
  responses2: ResponseData[],
  responses3: ResponseData[],
  missionsCompleted: {
    missao_1_completed: boolean;
    missao_2_completed: boolean;
    missao_3_completed: boolean;
  }
): MissionScores => {
  return useMemo(() => {
    let mission1Score = 0;
    let mission2Score = 0;
    let mission3Score = 0;

    // Calcular pontuação da Missão 1 (máximo 20 pontos)
    if (missionsCompleted.missao_1_completed) {
      const mission1Response = responses1.find(r => r.email === userEmail);
      if (mission1Response && Array.isArray(mission1Response.respostas)) {
        mission1Score = mission1Response.respostas.reduce((sum: number, resp: any) => 
          sum + (resp.pontuacao || 0), 0
        );
      }
    }

    // Calcular pontuação da Missão 2 (máximo 15 pontos)
    if (missionsCompleted.missao_2_completed) {
      const mission2Response = responses2.find(r => r.email === userEmail);
      if (mission2Response && Array.isArray(mission2Response.respostas)) {
        mission2Score = mission2Response.respostas.reduce((sum: number, resp: any) => 
          sum + (resp.points || 0), 0
        );
      }
    }

    // Calcular pontuação da Missão 3 (máximo 20 pontos)
    if (missionsCompleted.missao_3_completed) {
      const mission3Response = responses3.find(r => r.email === userEmail);
      if (mission3Response && Array.isArray(mission3Response.respostas)) {
        mission3Score = mission3Response.respostas.reduce((sum: number, resp: any) => 
          sum + (resp.points || 0), 0
        );
      }
    }

    const totalScore = mission1Score + mission2Score + mission3Score;

    return {
      mission1: {
        score: parseFloat(mission1Score.toFixed(1)),
        maxScore: 20,
        completed: missionsCompleted.missao_1_completed
      },
      mission2: {
        score: parseFloat(mission2Score.toFixed(1)),
        maxScore: 15,
        completed: missionsCompleted.missao_2_completed
      },
      mission3: {
        score: parseFloat(mission3Score.toFixed(1)),
        maxScore: 20,
        completed: missionsCompleted.missao_3_completed
      },
      total: {
        score: parseFloat(totalScore.toFixed(1)),
        maxScore: 55
      }
    };
  }, [userEmail, responses1, responses2, responses3, missionsCompleted]);
};