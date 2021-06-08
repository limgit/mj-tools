/* eslint-disable max-len */
import { GameMode, Game } from './types';

export function fufanToRonScore(mode: GameMode, fu: number, fan: number, isOya: boolean) {
  if (fan <= 0) return 0;
  if (mode === 'fan') {
    switch (fan) {
      case 1: return isOya ? 1500 : 1000;
      case 2: return isOya ? 3000 : 2000;
      case 3: return isOya ? 5800 : 3900;
      case 4:
      case 5: return isOya ? 12000 : 8000;
      case 6:
      case 7: return isOya ? 18000 : 12000;
      case 8:
      case 9:
      case 10: return isOya ? 24000 : 18000;
      case 11:
      case 12: return isOya ? 36000 : 24000;
      default: return isOya ? 48000 : 36000; // kazoe yakuman
    }
  }
  console.log(fu);
  // TODO: fufan
  return 0;
}
export function fufanToTsumoScoreOya(mode: GameMode, fu: number, fan: number) {
  // All Scores
  if (fan <= 0) return 0;
  if (mode === 'fan') {
    switch (fan) {
      case 1: return 500;
      case 2: return 1000;
      case 3: return 2000;
      case 4:
      case 5: return 4000;
      case 6:
      case 7: return 6000;
      case 8:
      case 9:
      case 10: return 8000;
      case 11:
      case 12: return 12000;
      default: return 16000; // kazoe yakuman
    }
  }
  console.log(fu);
  // TODO: fufan
  return 0;
}
export function fufanToTsumoScoreKodomo(mode: GameMode, fu: number, fan: number) {
  // All Scores
  if (fan <= 0) return { oya: 0, kodomo: 0 };
  if (mode === 'fan') {
    switch (fan) {
      case 1: return { oya: 500, kodomo: 300 };
      case 2: return { oya: 1000, kodomo: 500 };
      case 3: return { oya: 2000, kodomo: 1000 };
      case 4:
      case 5: return { oya: 4000, kodomo: 2000 };
      case 6:
      case 7: return { oya: 6000, kodomo: 3000 };
      case 8:
      case 9:
      case 10: return { oya: 8000, kodomo: 4000 };
      case 11:
      case 12: return { oya: 12000, kodomo: 6000 };
      default: return { oya: 16000, kodomo: 8000 }; // kazoe yakuman
    }
  }
  console.log(fu);
  // TODO: fufan
  return { oya: 0, kodomo: 0 };
}
export function gameToScoreLog(game: Game) {
  const { eswn } = game;
  const scoreLog: number[][] = [];
  let deposit = 0;
  game.rounds.forEach((round) => {
    let thisRoundLog = [0, 0, 0, 0];
    // Handling riichi
    eswn.forEach((name, idx) => {
      if (round.riichi.includes(name)) {
        thisRoundLog[idx] -= 1000; deposit += 1000;
      }
    });
    // Handling round end
    const { ending } = round;
    if (ending?.type === 'yuugyoku') {
      const { tenpai } = ending;
      const notenCount = 4 - tenpai.length;
      if (notenCount !== 0 && notenCount !== 4) {
        const tenpaiRyo = 3000 / notenCount;
        eswn.forEach((name, idx) => {
          thisRoundLog[idx] += (tenpai.includes(name) ? 3000 / (4 - notenCount) : -tenpaiRyo);
        });
      }
    } else if (ending?.type === 'ron') {
      const { point } = ending;
      const playerIdx = eswn.indexOf(ending.player);
      const targetIdx = eswn.indexOf(ending.target);
      const isOya = playerIdx === round.kyoku % 4;
      const movingScore = (() => {
        if (point.type === 'normal') return fufanToRonScore(game.mode, point.fu, point.fan, isOya);
        return (isOya ? 48000 : 36000) * point.multiplier;
      })();
      thisRoundLog[targetIdx] -= movingScore + round.honba * 300;
      thisRoundLog[playerIdx] += (movingScore + deposit + round.honba * 300);
      deposit = 0;
    } else if (ending?.type === 'tsumo') {
      // tsumo
      const { point } = ending;
      const playerIdx = eswn.indexOf(ending.player);
      const isOya = playerIdx === round.kyoku % 4;
      if (isOya) {
        const perPlayerScore = (() => {
          if (point.type === 'normal') return fufanToTsumoScoreOya(game.mode, point.fu, point.fan);
          return 16000 * point.multiplier;
        })();
        thisRoundLog = thisRoundLog.map((e, idx) => {
          if (idx === playerIdx) return e + perPlayerScore * 3 + deposit + round.honba * 300;
          return e - (perPlayerScore + round.honba * 100);
        });
        deposit = 0;
      } else {
        const perPlayerScore = (() => {
          if (point.type === 'normal') return fufanToTsumoScoreKodomo(game.mode, point.fu, point.fan);
          return { oya: 16000 * point.multiplier, kodomo: 8000 * point.multiplier };
        })();
        thisRoundLog = thisRoundLog.map((e, idx) => {
          if (idx === round.kyoku % 4) return e - (perPlayerScore.oya + round.honba * 100);
          if (idx === playerIdx) return e + perPlayerScore.oya + perPlayerScore.kodomo * 2 + deposit + round.honba * 300;
          return e - (perPlayerScore.kodomo + round.honba * 100);
        });
        deposit = 0;
      }
    }
    scoreLog.push(thisRoundLog);
  });
  return {
    scoreLog,
    deposit,
  };
}
