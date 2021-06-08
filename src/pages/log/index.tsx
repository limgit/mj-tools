// TODO: Rewrite this code. This code is for fast MVP

/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/naming-convention */
import React from 'react';
import {
  VStack,
  HStack,
  Button,
  Heading,
  Text,
  useDisclosure,
  Grid,
  GridItem,
} from '@chakra-ui/react';

import { getItem, setItem } from '@/storage';

import NewGameModal from './NewGameModal';

const GAME_LIST_KEY = 'gameList';

type GameMode = 'fan' | 'fufan';
type Game = {
  id: number,
  mode: GameMode,
  eswn: [string, string, string, string],
  rounds: {
    kyoku: number,
    honba: number,
    riichi: string[],
    ending: {
      type: 'yuugyoku',
      tenpai: string[],
      note: string,
    } | {
      type: 'ron',
      player: string,
      target: string,
      point: {
        type: 'yakuman',
        multiplier: number,
      } | {
        type: 'normal',
        fan: number,
        fu: number, // Ignored in fan mode
      },
      note: string,
    } | {
      type: 'tsumo',
      player: string,
      point: {
        type: 'yakuman',
        multiplier: number,
      } | {
        type: 'normal',
        fan: number,
        fu: number, // Ignored in fan mode
      },
      note: string,
    } | undefined, // round still going
  }[],
};

function fufanToRonScore(mode: GameMode, fu: number, fan: number, isOya: boolean) {
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
function fufanToTsumoScoreOya(mode: GameMode, fu: number, fan: number) {
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
function fufanToTsumoScoreKodomo(mode: GameMode, fu: number, fan: number) {
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
function gameToScoreLog(game: Game) {
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
      thisRoundLog[targetIdx] -= movingScore + round.kyoku * 300;
      thisRoundLog[playerIdx] += (movingScore + deposit + round.kyoku * 300);
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
          if (idx === playerIdx) return e + perPlayerScore * 3 + deposit + round.kyoku * 300;
          return e - (perPlayerScore + round.kyoku * 100);
        });
        deposit = 0;
      } else {
        const perPlayerScore = (() => {
          if (point.type === 'normal') return fufanToTsumoScoreKodomo(game.mode, point.fu, point.fan);
          return { oya: 16000 * point.multiplier, kodomo: 8000 * point.multiplier };
        })();
        thisRoundLog = thisRoundLog.map((e, idx) => {
          if (idx === round.kyoku % 4) return e - (perPlayerScore.oya + round.kyoku * 100);
          if (idx === playerIdx) return e + perPlayerScore.oya + perPlayerScore.kodomo * 2 + deposit + round.kyoku * 300;
          return e - (perPlayerScore.kodomo + round.kyoku * 100);
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

const Log: React.FC = () => {
  const { isOpen: modalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  const [gameList, _setGameList] = React.useState<Game[]>([]);

  const setGameList = (newV: Game[]) => {
    _setGameList(newV);
    setItem(GAME_LIST_KEY, newV);
  };

  React.useEffect(() => {
    // Initial loading of storage data
    const gList = getItem<Game[]>(GAME_LIST_KEY);
    _setGameList(gList ?? []);
  }, []);

  const addGame = (mode: GameMode, eswn: [string, string, string, string]) => {
    setGameList([
      ...gameList,
      {
        id: gameList.length === 0 ? 1 : gameList[gameList.length - 1]!.id + 1,
        mode,
        eswn,
        rounds: [{
          kyoku: 0,
          honba: 0,
          riichi: [],
          ending: undefined,
        }],
      },
    ]);
  };

  return (
    <VStack>
      {gameList.map((game) => {
        const { eswn } = game;
        const { scoreLog, deposit } = gameToScoreLog(game);
        const score = [25000, 25000, 25000, 25000].map((e, idx) => {
          return e + scoreLog.reduce((acc, curr) => acc + curr[idx]!, 0);
        });
        const lastRound = game.rounds[game.rounds.length - 1]!; // Already exists, because at least one kyoku exists
        return (
          <VStack key={game.id}>
            <HStack>
              <Heading>{`제 ${game.id}전`}</Heading>
              <Button onClick={() => setGameList(gameList.filter((e) => e.id !== game.id))}>삭제</Button>
            </HStack>
            <Heading size="md">현재 점수(괄호는 게임 시작시)</Heading>
            <HStack>
              <Text>{eswn[0]}(동)</Text>
              <Text>{score[0]}</Text>
              <Text>{eswn[1]}(남)</Text>
              <Text>{score[1]}</Text>
            </HStack>
            <HStack>
              <Text>{eswn[2]}(서)</Text>
              <Text>{score[2]}</Text>
              <Text>{eswn[3]}(북)</Text>
              <Text>{score[3]}</Text>
            </HStack>
            <HStack>
              <Text>공탁금</Text>
              <Text>{deposit}</Text>
            </HStack>
            {game.rounds.map((round) => {
              const roundPrefix = {
                0: '동', 1: '남', 2: '서', 3: '북',
              }[round.kyoku / 4];
              const { ending } = round;
              return (
                <HStack key={`${round.kyoku}-${round.honba}`}>
                  <Text fontWeight="bold">{`${roundPrefix} ${round.kyoku % 4 + 1}국 ${round.honba}본장`}</Text>
                  {ending === undefined && (<Text>진행 중</Text>)}
                  {ending?.type === 'yuugyoku' && (
                    <Text>
                      {ending.tenpai.length === 0 && '전원 노텐'}
                      {ending.tenpai.length === 4 && '전원 텐'}
                      {ending.tenpai.length !== 0 && ending.tenpai.length !== 4 && `텐파이: ${ending.tenpai.join(', ')}`}
                    </Text>
                  )}
                  {ending?.type === 'ron' && (() => {
                    const { target, player, point, note } = ending;
                    const isOya = eswn.indexOf(player) === round.kyoku % 4;
                    const pointTxt = (() => {
                      if (point.type === 'yakuman') {
                        if (point.multiplier === 1) return '역만';
                        return `${point.multiplier}배 역만`;
                      }
                      if (game.mode === 'fan') return `${point.fan}판`;
                      return `${point.fu}부 ${point.fan}판`;
                    })();
                    const ronScore = (() => {
                      if (point.type === 'yakuman') return (isOya ? 48000 : 36000) * point.multiplier;
                      return fufanToRonScore(game.mode, point.fu, point.fan, isOya);
                    })();
                    return (
                      <Text>
                        론: {target} → {player} ({pointTxt}, {ronScore}) {note}
                      </Text>
                    );
                  })()}
                  {ending?.type === 'tsumo' && (() => {
                    const { player, point, note } = ending;
                    const isOya = eswn.indexOf(player) === round.kyoku % 4;
                    const pointTxt = (() => {
                      if (point.type === 'yakuman') {
                        if (point.multiplier === 1) return '역만';
                        return `${point.multiplier}배 역만`;
                      }
                      if (game.mode === 'fan') return `${point.fan}판`;
                      return `${point.fu}부 ${point.fan}판`;
                    })();
                    const tsumoScore = (() => {
                      if (isOya) {
                        if (point.type === 'yakuman') return `${16000 * point.multiplier}∀`;
                        return `${fufanToTsumoScoreOya(game.mode, point.fu, point.fan)}∀`;
                      }
                      if (point.type === 'yakuman') return `${8000 * point.multiplier}-${16000 * point.multiplier}`;
                      const { oya, kodomo } = fufanToTsumoScoreKodomo(game.mode, point.fu, point.fan);
                      return `${kodomo}-${oya}`;
                    })();
                    return (
                      <Text>
                        쯔모: {player} ({pointTxt}, {tsumoScore}) {note}
                      </Text>
                    )
                  })()}
                </HStack>
              )
            })}
            <Grid templateColumns="repeat(2, 1fr)" gap={2}>
              {eswn.map((name) => {
                const isRiiched = lastRound.riichi.includes(name);
                return (
                  <GridItem key={name}>
                    <Button
                      colorScheme={isRiiched ? 'telegram' : undefined}
                      onClick={() => {
                        setGameList(gameList.map((g) => {
                          if (g.id !== game.id) return g;
                          return {
                            ...g,
                            rounds: g.rounds.map((round, rIdx) => {
                              if (rIdx !== g.rounds.length - 1) return round;
                              return {
                                ...round,
                                riichi: isRiiched ? round.riichi.filter((x) => x !== name) : [...round.riichi, name],
                              };
                            }),
                          };
                        }));
                      }}
                    >
                      {name} 리치
                    </Button>
                  </GridItem>
                );
              })}
            </Grid>
            <HStack>
              <Button>화료</Button>
              <Button>유국</Button>
            </HStack>
          </VStack>
        );
      })}
      <Button onClick={onModalOpen}>게임 추가</Button>

      <NewGameModal
        open={modalOpen}
        onClose={onModalClose}
        onAddGame={addGame}
      />
    </VStack>
  );
};

export default Log;
