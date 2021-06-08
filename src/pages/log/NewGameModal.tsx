import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  VStack,
  HStack,
  Text,
  Input,
  Button,
} from '@chakra-ui/react';

import { GameMode } from './types';

type NewGameModalProps = {
  open: boolean,
  onClose: () => void,
  onAddGame: (mode: GameMode, eswn: [string, string, string, string]) => void,
};

const NewGameModal: React.FC<NewGameModalProps> = ({
  open, onClose, onAddGame,
}) => {
  const DEFAULT = ['', '', '', ''];
  const [modalInputs, setModalInputs] = React.useState(DEFAULT);
  const setModalInputsIdx = (newV: string, idx: number) => {
    setModalInputs(modalInputs.map((e, i) => (i === idx ? newV : e)));
  };
  const onCreate = (mode: GameMode) => {
    onAddGame(mode, modalInputs as [string, string, string, string]);
    setModalInputs(DEFAULT);
    onClose();
  };
  return (
    <Modal isOpen={open} onClose={onClose}>
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
            <Button onClick={() => onCreate('fan')}>생성(판)</Button>
            <Button disabled onClick={() => onCreate('fufan')}>생성(부판)</Button>
            <Button onClick={onClose}>닫기</Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NewGameModal;
