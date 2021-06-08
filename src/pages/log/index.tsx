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
import {
  fufanToRonScore,
  fufanToTsumoScoreKodomo,
  fufanToTsumoScoreOya,
  gameToScoreLog,
} from './utils';
import { GameMode, Game } from './types';

import NewGameModal from './NewGameModal';

const GAME_LIST_KEY = 'gameList';

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
  const setGame = (gameId: number, newV: Game) => setGameList(gameList.map((game) => (game.id !== gameId ? game : newV)));
  const setRound = (gameId: number, roundIdx: number, newV: Game['rounds'][number]) => {
    const targetGame = gameList.find((game) => game.id === gameId);
    if (targetGame === undefined) return;
    setGame(gameId, {
      ...targetGame,
      rounds: targetGame.rounds.map((round, rIdx) => (rIdx !== roundIdx ? round : newV)),
    });
  };
  const toggleRiichi = (gameId: number, roundIdx: number, name: string) => {
    const targetGame = gameList.find((game) => game.id === gameId);
    if (targetGame === undefined) return;
    const targetRound = targetGame.rounds[roundIdx];
    if (targetRound === undefined) return;
    const prevRiichi = targetRound.riichi;
    setRound(gameId, roundIdx, {
      ...targetRound,
      riichi: prevRiichi.includes(name) ? prevRiichi.filter((x) => x !== name) : [...prevRiichi, name],
    });
  }

  return (
    <VStack spacing={8}>
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
                      onClick={() => toggleRiichi(game.id, game.rounds.length - 1, name)}
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
