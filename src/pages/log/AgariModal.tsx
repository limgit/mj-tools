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
  Grid,
  GridItem,
  Heading,
  Select,
} from '@chakra-ui/react';

import { AgariPoint, Game, RoundEnding } from './types';

type AgariInfo = {
  type: 'ron',
  target: string,
} | {
  type: 'tsumo',
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
  const [agariPlayer, setAgariPlayer] = React.useState('');
  const DEFAULT_INFO: AgariInfo = { type: 'tsumo' };
  const [agariInfo, setAgariInfo] = React.useState<AgariInfo>(DEFAULT_INFO);
  const DEFAULT_POINT: AgariPoint = { type: 'normal', fan: 1, fu: 30 };
  const [agariPoint, setAgariPoint] = React.useState<AgariPoint>(DEFAULT_POINT);
  const [note, setNote] = React.useState('');
  const eswn = game?.eswn ?? [] as string[];
  const onCloseInternal = () => {
    setAgariPlayer('');
    setAgariInfo(DEFAULT_INFO);
    setAgariPoint(DEFAULT_POINT);
    onClose();
  };
  const onSaveInternal = () => {
    if (agariPlayer === '') return;
    if (agariInfo.type === 'ron' && agariInfo.target === '') return;

    onSave(agariInfo.type === 'ron' ? {
      type: 'ron',
      player: agariPlayer,
      target: agariInfo.target,
      point: agariPoint,
      note,
    } : {
      type: 'tsumo',
      player: agariPlayer,
      point: agariPoint,
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
          <VStack>
            <Heading size="md">화료자</Heading>
            <Grid templateColumns="repeat(2, 1fr)" gap={2}>
              {eswn.map((name) => {
                const isSelected = name === agariPlayer;
                return (
                  <GridItem key={name}>
                    <Button
                      colorScheme={isSelected ? 'telegram' : undefined}
                      onClick={() => setAgariPlayer(name)}
                    >
                      {name}
                    </Button>
                  </GridItem>
                );
              })}
            </Grid>
            <Heading size="sm">화료 정보</Heading>
            <HStack>
              <Button
                colorScheme={agariInfo.type === 'tsumo' ? 'telegram' : undefined}
                onClick={() => setAgariInfo({ type: 'tsumo' })}
              >
                쯔모
              </Button>
              <Button
                colorScheme={agariInfo.type === 'ron' ? 'telegram' : undefined}
                onClick={() => setAgariInfo({ type: 'ron', target: '' })}
              >
                론
              </Button>
            </HStack>
            {agariInfo.type === 'ron' && (
              <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                {eswn.map((name) => {
                  const isSelected = name === agariInfo.target;
                  return (
                    <GridItem key={name}>
                      <Button
                        colorScheme={isSelected ? 'telegram' : undefined}
                        onClick={() => setAgariInfo({ type: 'ron', target: name })}
                        disabled={name === agariPlayer}
                      >
                        {name}
                      </Button>
                    </GridItem>
                  );
                })}
              </Grid>
            )}
            <Heading size="md">화료 점수</Heading>
            <HStack>
              <Button
                colorScheme={agariPoint.type === 'normal' ? 'telegram' : undefined}
                onClick={() => setAgariPoint({ type: 'normal', fan: 1, fu: 30 })}
              >
                일반 화료
              </Button>
              <Button
                colorScheme={agariPoint.type === 'yakuman' ? 'telegram' : undefined}
                onClick={() => setAgariPoint({ type: 'yakuman', multiplier: 1 })}
              >
                역만
              </Button>
            </HStack>
            {agariPoint.type === 'normal' && (
              <HStack>
                {game?.mode === 'fufan' && (
                  <Select
                    value={agariPoint.fu}
                    onChange={(e) => setAgariPoint({ ...agariPoint, fu: Number(e.target.value) })}
                  >
                    {new Array(10).fill(null).map((_, idx) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <option key={idx} value={10 * idx + 20}>{`${10 * idx + 20}부`}</option>
                    ))}
                  </Select>
                )}
                <Select
                  value={agariPoint.fan}
                  onChange={(e) => setAgariPoint({ ...agariPoint, fan: Number(e.target.value) })}
                >
                  {new Array(36).fill(null).map((_, idx) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <option key={idx} value={idx + 1}>{`${idx + 1}판`}</option>
                  ))}
                </Select>
              </HStack>
            )}
            {agariPoint.type === 'yakuman' && (
              <Select
                value={agariPoint.multiplier}
                onChange={(e) => setAgariPoint({ type: 'yakuman', multiplier: Number(e.target.value) })}
              >
                {new Array(6).fill(null).map((_, idx) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <option key={idx} value={idx + 1}>{`${idx + 1}배 역만`}</option>
                ))}
              </Select>
            )}
            <HStack>
              <Text flexShrink={0}>비고</Text>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </HStack>
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
