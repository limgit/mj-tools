// TODO: Rewrite this code. This code is for fast MVP

/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/naming-convention */
import React from 'react';
import {
  VStack,
  HStack,
  Button,
  Input,
  Heading,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  useDisclosure,
} from '@chakra-ui/react';

import { getItem, setItem } from '@/storage';

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

function fufanToRonPoint(mode: GameMode, fu: number, fan: number, isOya: boolean) {
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
function fufanToTsumoPointOya(mode: GameMode, fu: number, fan: number) {
  // All points
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
function fufanToTsumoPointKodomo(mode: GameMode, fu: number, fan: number) {
  // All points
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

const Log: React.FC = () => {
  const { isOpen: modalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  const [modalInputs, setModalInputs] = React.useState(['', '', '', '']);
  const [gameList, _setGameList] = React.useState<Game[]>([]);

  const setGameList = (newV: Game[]) => {
    _setGameList(newV);
    setItem(GAME_LIST_KEY, newV);
  };
  const setModalInputsIdx = (newV: string, idx: number) => {
    setModalInputs(modalInputs.map((e, i) => (i === idx ? newV : e)));
  };

  React.useEffect(() => {
    // Initial loading of storage data
    const gList = getItem<Game[]>(GAME_LIST_KEY);
    _setGameList(gList ?? []);
  }, []);

  const onAddGame = (mode: GameMode) => {
    setGameList([
      ...gameList,
      {
        id: gameList.length === 0 ? 1 : gameList[gameList.length - 1]!.id + 1,
        mode,
        eswn: [modalInputs[0]!, modalInputs[1]!, modalInputs[2]!, modalInputs[3]!],
        rounds: [],
      },
    ]);
    setModalInputs(['', '', '', '']);
    onModalClose();
  };

  return (
    <VStack>
      {gameList.map((game) => {
        const { eswn } = game;
        let score = [25000, 25000, 25000, 25000];
        let deposit = 0;
        // Calculating points
        game.rounds.forEach((round) => {
          // Handling riichi
          eswn.forEach((name, idx) => {
            if (round.riichi.includes(name)) {
              score[idx] -= 1000; deposit += 1000;
            }
          });
          // Handling round end
          const { ending } = round;
          if (ending === undefined) return;
          if (ending.type === 'yuugyoku') {
            const { tenpai } = ending;
            const notenCount = 4 - tenpai.length;
            if (notenCount !== 0 && notenCount !== 4) {
              const tenpaiRyo = 3000 / notenCount;
              eswn.forEach((name, idx) => {
                score[idx] += (tenpai.includes(name) ? 3000 / (4 - notenCount) : -tenpaiRyo);
              });
            }
          } else if (ending.type === 'ron') {
            const { point } = ending;
            const playerIdx = eswn.indexOf(ending.player);
            const targetIdx = eswn.indexOf(ending.target);
            const isOya = playerIdx === round.kyoku % 4;
            const movingPoint = (() => {
              if (point.type === 'normal') return fufanToRonPoint(game.mode, point.fu, point.fan, isOya);
              return (isOya ? 48000 : 36000) * point.multiplier;
            })();
            score[targetIdx] -= movingPoint + round.kyoku * 300;
            score[playerIdx] += (movingPoint + deposit + round.kyoku * 300);
            deposit = 0;
          } else {
            // tsumo
            const { point } = ending;
            const playerIdx = eswn.indexOf(ending.player);
            const isOya = playerIdx === round.kyoku % 4;
            if (isOya) {
              const perPlayerPoint = (() => {
                if (point.type === 'normal') return fufanToTsumoPointOya(game.mode, point.fu, point.fan);
                return 16000 * point.multiplier;
              })();
              score = score.map((e, idx) => {
                if (idx === playerIdx) return e + perPlayerPoint * 3 + deposit + round.kyoku * 300;
                return e - (perPlayerPoint + round.kyoku * 100);
              });
              deposit = 0;
            } else {
              const perPlayerPoint = (() => {
                if (point.type === 'normal') return fufanToTsumoPointKodomo(game.mode, point.fu, point.fan);
                return { oya: 16000 * point.multiplier, kodomo: 8000 * point.multiplier };
              })();
              score = score.map((e, idx) => {
                if (idx === round.kyoku % 4) return e - (perPlayerPoint.oya + round.kyoku * 100);
                if (idx === playerIdx) return e + perPlayerPoint.oya + perPlayerPoint.kodomo * 2 + deposit + round.kyoku * 300;
                return e - (perPlayerPoint.kodomo + round.kyoku * 100);
              });
              deposit = 0;
            }
          }
        });
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
            {/* TODO: Round display + Round editor */}
          </VStack>
        );
      })}
      <Button onClick={onModalOpen}>게임 추가</Button>

      <Modal isOpen={modalOpen} onClose={onModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>새 게임 생성</ModalHeader>
          <ModalBody>
            <VStack>
              <HStack>
                <Text>동:</Text>
                <Input value={modalInputs[0]} onChange={(e) => setModalInputsIdx(e.target.value, 0)} />
              </HStack>
              <HStack>
                <Text>남:</Text>
                <Input value={modalInputs[1]} onChange={(e) => setModalInputsIdx(e.target.value, 1)} />
              </HStack>
              <HStack>
                <Text>서:</Text>
                <Input value={modalInputs[2]} onChange={(e) => setModalInputsIdx(e.target.value, 2)} />
              </HStack>
              <HStack>
                <Text>북:</Text>
                <Input value={modalInputs[3]} onChange={(e) => setModalInputsIdx(e.target.value, 3)} />
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack>
              <Button onClick={() => onAddGame('fan')}>생성(판)</Button>
              <Button disabled onClick={() => onAddGame('fufan')}>생성(부판)</Button>
              <Button onClick={onModalClose}>닫기</Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default Log;
