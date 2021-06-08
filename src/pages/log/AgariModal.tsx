/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable max-len */
import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  HStack,
  VStack,
  Button,
  Input,
  Text,
  Heading,
  Select,
} from '@chakra-ui/react';

import {
  AgariPoint, Game, GameMode, RoundEnding,
} from './types';

type AgariInfo = {
  type: 'ron',
  payer: string,
} | {
  type: 'tsumo',
};
type AgariPlayer = {
  name: string,
  point: AgariPoint,
};

type AgariPlayerEditorProps = {
  agariPlayer: AgariPlayer,
  setAgariPlayer: (newV: AgariPlayer) => void,
  eswn: string[],
  gameMode: GameMode | undefined,
  showNone: boolean,
};
const AgariPlayerEditor: React.FC<AgariPlayerEditorProps> = ({
  agariPlayer, setAgariPlayer, eswn, gameMode, showNone,
}) => {
  const { point } = agariPlayer;
  return (
    <>
      {showNone && (
        <Button
          colorScheme={agariPlayer.name === '' ? 'telegram' : undefined}
          onClick={() => setAgariPlayer({ ...agariPlayer, name: '' })}
        >
          없음
        </Button>
      )}
      <HStack>
        {eswn.map((name) => {
          const isSelected = name === agariPlayer.name;
          return (
            <Button
              key={name}
              colorScheme={isSelected ? 'telegram' : undefined}
              onClick={() => setAgariPlayer({ ...agariPlayer, name })}
            >
              {name}
            </Button>
          );
        })}
      </HStack>
      <HStack>
        <Button
          colorScheme={agariPlayer.point.type === 'normal' ? 'telegram' : undefined}
          onClick={() => setAgariPlayer({ ...agariPlayer, point: { type: 'normal', fan: 1, fu: 30 } })}
        >
          일반 화료
        </Button>
        <Button
          colorScheme={agariPlayer.point.type === 'yakuman' ? 'telegram' : undefined}
          onClick={() => setAgariPlayer({ ...agariPlayer, point: { type: 'yakuman', multiplier: 1 } })}
        >
          역만
        </Button>
      </HStack>
      {point.type === 'normal' && (
        <HStack>
          {gameMode === 'fufan' && (
            <Select
              value={point.fu}
              onChange={(e) => setAgariPlayer({ ...agariPlayer, point: { ...point, fu: Number(e.target.value) } })}
            >
              {new Array(10).fill(null).map((_, idx) => (
                // eslint-disable-next-line react/no-array-index-key
                <option key={idx} value={10 * idx + 20}>{`${10 * idx + 20}부`}</option>
              ))}
            </Select>
          )}
          <Select
            value={point.fan}
            onChange={(e) => setAgariPlayer({ ...agariPlayer, point: { ...point, fan: Number(e.target.value) } })}
          >
            {new Array(36).fill(null).map((_, idx) => (
              // eslint-disable-next-line react/no-array-index-key
              <option key={idx} value={idx + 1}>{`${idx + 1}판`}</option>
            ))}
          </Select>
        </HStack>
      )}
      {point.type === 'yakuman' && (
        <Select
          value={point.multiplier}
          onChange={(e) => setAgariPlayer({ ...agariPlayer, point: { ...point, multiplier: Number(e.target.value) } })}
        >
          {new Array(6).fill(null).map((_, idx) => (
            // eslint-disable-next-line react/no-array-index-key
            <option key={idx} value={idx + 1}>{`${idx + 1}배 역만`}</option>
          ))}
        </Select>
      )}
    </>
  );
};

type AgariModalProps = {
  open: boolean,
  game: Game | null,
  onClose: () => void,
  onSave: (ending: RoundEnding) => void,
};

const AgariModal: React.FC<AgariModalProps> = ({
  open, game, onClose, onSave,
}) => {
  const DEFAULT_AGARI_PLAYER: AgariPlayer = { name: '', point: { type: 'normal', fan: 1, fu: 30 } };
  const [agariPlayer, setAgariPlayer] = React.useState<AgariPlayer>(DEFAULT_AGARI_PLAYER);
  const [moreAgaris, setMoreAgaris] = React.useState<AgariPlayer[]>([DEFAULT_AGARI_PLAYER, DEFAULT_AGARI_PLAYER]);
  const DEFAULT_INFO: AgariInfo = { type: 'tsumo' };
  const [agariInfo, setAgariInfo] = React.useState<AgariInfo>(DEFAULT_INFO);
  const [note, setNote] = React.useState('');
  const eswn = game?.eswn ?? [] as string[];
  const onCloseInternal = () => {
    setAgariPlayer(DEFAULT_AGARI_PLAYER);
    setMoreAgaris([DEFAULT_AGARI_PLAYER, DEFAULT_AGARI_PLAYER]);
    setAgariInfo(DEFAULT_INFO);
    setNote('');
    onClose();
  };
  const onSaveInternal = () => {
    if (agariPlayer.name === '') return;
    if (agariInfo.type === 'ron' && agariInfo.payer === '') return;

    const filtered = moreAgaris.filter((e) => e.name !== '');
    onSave(agariInfo.type === 'ron' ? {
      type: 'ron',
      payer: agariInfo.payer,
      payees: [
        agariPlayer,
        ...filtered,
      ],
      note,
    } : {
      type: 'tsumo',
      player: agariPlayer.name,
      point: agariPlayer.point,
      note,
    });
    onCloseInternal();
  };

  return (
    <Modal isOpen={open} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>화료</ModalHeader>
        <ModalBody>
          <VStack spacing={8}>
            <HStack>
              <Button
                colorScheme={agariInfo.type === 'tsumo' ? 'telegram' : undefined}
                onClick={() => setAgariInfo({ type: 'tsumo' })}
              >
                쯔모
              </Button>
              <Button
                colorScheme={agariInfo.type === 'ron' ? 'telegram' : undefined}
                onClick={() => setAgariInfo({ type: 'ron', payer: '' })}
              >
                론
              </Button>
            </HStack>
            <VStack>
              <Heading size="md">화료 정보</Heading>
              <AgariPlayerEditor
                agariPlayer={agariPlayer}
                setAgariPlayer={setAgariPlayer}
                eswn={eswn}
                gameMode={game?.mode}
                showNone={false}
              />
            </VStack>
            {agariInfo.type === 'ron' && (
              <>
                <VStack>
                  <Heading size="md">방총 정보</Heading>
                  <HStack>
                    {eswn.map((name) => {
                      const isSelected = name === agariInfo.payer;
                      return (
                        <Button
                          key={name}
                          colorScheme={isSelected ? 'telegram' : undefined}
                          onClick={() => setAgariInfo({ type: 'ron', payer: name })}
                          disabled={name === agariPlayer.name || moreAgaris.map((e) => e.name).includes(name)}
                        >
                          {name}
                        </Button>
                      );
                    })}
                  </HStack>
                </VStack>
                {moreAgaris.map((e, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <VStack key={i}>
                    <Heading size="md">추가 화료 정보 {i + 1}</Heading>
                    <AgariPlayerEditor
                      agariPlayer={e}
                      setAgariPlayer={(newV) => setMoreAgaris(moreAgaris.map((x, j) => (j === i ? newV : x)))}
                      eswn={eswn}
                      gameMode={game?.mode}
                      showNone
                    />
                  </VStack>
                ))}
              </>
            )}
            <VStack>
              <Heading size="md">기타</Heading>
              <HStack>
                <Text flexShrink={0}>비고</Text>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </HStack>
            </VStack>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack>
            <Button onClick={onSaveInternal}>저장</Button>
            <Button onClick={onCloseInternal}>닫기</Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AgariModal;
