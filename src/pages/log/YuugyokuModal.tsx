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
} from '@chakra-ui/react';

import { Game } from './types';

type YuugyokuModalProps = {
  open: boolean,
  game: Game | null,
  onClose: () => void,
  onSave: (tenpai: string[], note: string) => void,
};

const YuugyokuModal: React.FC<YuugyokuModalProps> = ({
  open, game, onClose, onSave,
}) => {
  const [tenpaiList, setTenpaiList] = React.useState<string[]>([]);
  const [note, setNote] = React.useState('');
  const eswn = game?.eswn ?? [] as string[];
  const onCloseInternal = () => {
    setTenpaiList([]);
    onClose();
  };
  const onSaveInternal = () => {
    onSave(tenpaiList, note);
    onCloseInternal();
  };
  return (
    <Modal isOpen={open} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>유국</ModalHeader>
        <ModalBody>
          <VStack>
            <Grid templateColumns="repeat(2, 1fr)" gap={2}>
              {eswn.map((name) => {
                const isTen = tenpaiList.includes(name);
                return (
                  <GridItem key={name}>
                    <Button
                      colorScheme={isTen ? 'telegram' : undefined}
                      // eslint-disable-next-line max-len
                      onClick={() => setTenpaiList(isTen ? tenpaiList.filter((e) => e !== name) : [...tenpaiList, name])}
                    >
                      {`${name} ${isTen ? '텐' : '노텐'}`}
                    </Button>
                  </GridItem>
                );
              })}
            </Grid>
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

export default YuugyokuModal;
