// TODO: Rewrite this code. This code is for fast MVP

/* eslint-disable max-len */
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
  useClipboard,
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
import {
  GameMode, Game, Round, RoundEnding,
} from './types';

import NewGameModal from './NewGameModal';
import AgariModal from './AgariModal';
import YuugyokuModal from './YuugyokuModal';

const GAME_LIST_KEY = 'gameList';

const Log: React.FC = () => {
  const { isOpen: modalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  const [gameList, _setGameList] = React.useState<Game[]>([]);
  const [yuugyokuModal, setYuugyokuModal] = React.useState<{ open: boolean, game: Game | null, }>({
    open: false,
    game: null,
  });
  const [agariModal, setAgariModal] = React.useState<{ open: boolean, game: Game | null, }>({
    open: false,
    game: null,
  });
  const { hasCopied, onCopy } = useClipboard(JSON.stringify(gameList));

  const csv = gameList.map((game) => {
    const { scoreLog } = gameToScoreLog(game);
    const score = [25000, 25000, 25000, 25000].map((e, idx) => {
      return e + scoreLog.reduce((acc, curr) => acc + curr[idx]!, 0);
    });
    return [
      ['', '', ...game.eswn].join(','),
      ...game.rounds.map((round, rIdx) => {
        const roundPrefix = {
          0: '동', 1: '남', 2: '서', 3: '북',
        }[Math.floor(round.kyoku / 4)]!;
        const currScoreLog = scoreLog[rIdx]!.map((e) => (e === 0 ? '' : e));
        return [
          `${roundPrefix}${(round.kyoku % 4) + 1}국`,
          round.honba,
          ...currScoreLog,
          '', // slot for fan
          `"${round.riichi.join(', ')}"`,
          round.ending?.note,
        ].join(',');
      }),
      ['최종', '', ...score].join(','),
    ].join('\n');
  }).join('\n');
  const { hasCopied: csvCopied, onCopy: copyCsv } = useClipboard(csv);

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
  const endGame = (gameId: number) => {
    const targetGame = gameList.find((game) => game.id === gameId);
    if (targetGame === undefined) return;
    setGame(gameId, {
      ...targetGame,
      rounds: targetGame.rounds.slice(0, -1), // Remove ongoing round
    });
  };
  const setRound = (gameId: number, roundIdx: number, newV: Round) => {
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
  };
  const endCurrentRound = (gameId: number, endingV: RoundEnding) => {
    const targetGame = gameList.find((game) => game.id === gameId);
    if (targetGame === undefined) return;
    const lastRound = targetGame.rounds[targetGame.rounds.length - 1]!;
    const next = (() => {
      const { kyoku, honba } = lastRound;
      const oyaPlayer = targetGame.eswn[kyoku % 4]!;
      // oya's agari / yuugyoku, oya is ten -> kyoku persists, honba increases
      if ((endingV.type === 'ron' && endingV.payees.filter((e) => e.name === oyaPlayer).length === 1)
        || (endingV.type === 'tsumo' && endingV.player === oyaPlayer)
        || (endingV.type === 'yuugyoku' && endingV.tenpai.includes(oyaPlayer))
      ) {
        return { kyoku, honba: honba + 1 };
      }
      // yuugyoku, oya is not ten -> kyoku and honba increases
      if ((endingV.type === 'yuugyoku' && !endingV.tenpai.includes(oyaPlayer))) {
        return { kyoku: kyoku + 1, honba: honba + 1 };
      }
      // All the other ending cases -> kyoku increases, and honba reset to 0
      return { kyoku: kyoku + 1, honba: 0 };
    })();
    setGame(gameId, {
      ...targetGame,
      rounds: [
        ...targetGame.rounds.map((round, rIdx) => {
          if (rIdx !== targetGame.rounds.length - 1) return round;
          return {
            ...round,
            ending: endingV,
          };
        }),
        {
          kyoku: next.kyoku,
          honba: next.honba,
          riichi: [],
          ending: undefined,
        },
      ],
    });
  };

  const onAgariModalClose = () => setAgariModal({ open: false, game: null });
  const onAgariModalSave = (ending: RoundEnding) => {
    const { game } = agariModal;
    if (game === null) return;
    endCurrentRound(game.id, ending);
  };
  const onYuugyokuModalClose = () => setYuugyokuModal({ open: false, game: null });
  const onYuugyokuModalSave = (tenpaiList: string[], note: string) => {
    const { game } = yuugyokuModal;
    if (game === null) return;
    endCurrentRound(game.id, {
      type: 'yuugyoku',
      tenpai: tenpaiList,
      note,
    });
  };

  return (
    <VStack spacing={8} mb={8}>
      <HStack>
        <Button onClick={onCopy}>
          {hasCopied ? '복사됨!' : '내보내기'}
        </Button>
        <Button
          onClick={() => {
            const data = prompt('불러오기');
            if (data !== null) {
              setGameList(JSON.parse(data));
            }
          }}
        >
          불러오기
        </Button>
        <Button onClick={copyCsv}>
          {csvCopied ? '복사됨!' : 'CSV'}
        </Button>
      </HStack>
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
              }[Math.floor(round.kyoku / 4)]!;
              const { ending } = round;
              return (
                <HStack key={`${round.kyoku}-${round.honba}`}>
                  <Text fontWeight="bold">{`${roundPrefix} ${(round.kyoku % 4) + 1}국 ${round.honba}본장`}</Text>
                  {ending === undefined && (<Text>진행 중</Text>)}
                  {ending?.type === 'yuugyoku' && (
                    <Text>
                      {ending.tenpai.length === 0 && '전원 노텐'}
                      {ending.tenpai.length === 4 && '전원 텐'}
                      {ending.tenpai.length !== 0 && ending.tenpai.length !== 4 && `텐파이: ${ending.tenpai.join(', ')}`}
                      . {ending.note}
                    </Text>
                  )}
                  {ending?.type === 'ron' && (() => {
                    const { payees, payer, note } = ending;
                    const infoText = payees.map((p) => {
                      const isOya = eswn.indexOf(p.name) === round.kyoku % 4;
                      const pointTxt = (() => {
                        if (p.point.type === 'yakuman') {
                          if (p.point.multiplier === 1) return '역만';
                          return `${p.point.multiplier}배 역만`;
                        }
                        if (game.mode === 'fan') return `${p.point.fan}판`;
                        return `${p.point.fu}부 ${p.point.fan}판`;
                      })();
                      const ronScore = (() => {
                        if (p.point.type === 'yakuman') return (isOya ? 48000 : 36000) * p.point.multiplier + round.honba * 300;
                        return fufanToRonScore(game.mode, p.point.fu, p.point.fan, isOya) + round.honba * 300;
                      })();
                      return `${p.name} (${pointTxt}, ${ronScore})`;
                    }).join(', ');
                    return (
                      <Text>
                        론: {infoText}, 방총: {payer} {note}
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
                        if (point.type === 'yakuman') return `${16000 * point.multiplier + round.honba * 100}∀`;
                        return `${fufanToTsumoScoreOya(game.mode, point.fu, point.fan) + round.honba * 100}∀`;
                      }
                      if (point.type === 'yakuman') return `${8000 * point.multiplier + round.honba * 100}-${16000 * point.multiplier + round.honba * 100}`;
                      const { oya, kodomo } = fufanToTsumoScoreKodomo(game.mode, point.fu, point.fan);
                      return `${kodomo + round.honba * 100}-${oya + round.honba * 100}`;
                    })();
                    return (
                      <Text>
                        쯔모: {player} ({pointTxt}, {tsumoScore}) {note}
                      </Text>
                    );
                  })()}
                </HStack>
              );
            })}
            {lastRound.ending === undefined && (
              <>
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
                  <Button onClick={() => setAgariModal({ open: true, game })}>화료</Button>
                  <Button onClick={() => setYuugyokuModal({ open: true, game })}>유국</Button>
                  <Button onClick={() => endGame(game.id)}>종료</Button>
                </HStack>
              </>
            )}
            {game.rounds.length > 1 && (
              <Button
                onClick={() => {
                  if (lastRound.ending !== undefined) {
                    // Finished game. Re-end last round with same ending.
                    // endCurrentRound will append new ongoing round
                    endCurrentRound(game.id, lastRound.ending);
                  } else {
                    // Unfinished game. Remove current ongoing round and make previous one as ongoing
                    // This will not be triggered in very first round due to button rendering condition
                    setGame(game.id, {
                      ...game,
                      rounds: game.rounds.slice(0, -1).map((r, rIdx) => (rIdx === game.rounds.length - 2 ? {
                        ...r,
                        ending: undefined,
                      } : r)),
                    });
                  }
                }}
              >
                실행 취소
              </Button>
            )}
          </VStack>
        );
      })}
      <Button onClick={onModalOpen}>게임 추가</Button>

      <NewGameModal
        open={modalOpen}
        onClose={onModalClose}
        onAddGame={addGame}
      />
      <AgariModal
        open={agariModal.open}
        game={agariModal.game}
        onClose={onAgariModalClose}
        onSave={onAgariModalSave}
      />
      <YuugyokuModal
        open={yuugyokuModal.open}
        game={yuugyokuModal.game}
        onClose={onYuugyokuModalClose}
        onSave={onYuugyokuModalSave}
      />
    </VStack>
  );
};

export default Log;
