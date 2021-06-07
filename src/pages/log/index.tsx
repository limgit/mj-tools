import React from 'react';
import {
  VStack,
  HStack,
  Button,
  Input,
  Heading,
  Text,
} from '@chakra-ui/react';

import { getItem, setItem } from '@/storage';

const PLAYER_LIST_KEY = 'playerList';

const Log: React.FC = () => {
  const [playerList, setPlayerList] = React.useState<string[]>([]);
  const [playerInput, setPlayerInput] = React.useState('');

  React.useEffect(() => {
    // Initial loading of storage data
    const pList = getItem<string[]>(PLAYER_LIST_KEY);
    setPlayerList(pList ?? []);
  }, []);

  const onAddPlayer = () => {
    if (playerInput !== '') {
      const newPlayerList = [...playerList, playerInput];
      setPlayerList(newPlayerList);
      setItem(PLAYER_LIST_KEY, newPlayerList);
      setPlayerInput('');
    }
  };
  const onResetPlayer = () => {
    setPlayerList([]);
    setItem(PLAYER_LIST_KEY, []);
  };

  return (
    <VStack>
      <Heading size="sm">플레이어 목록</Heading>
      {playerList.length === 0 ? <Text>없음</Text> : <Text>{playerList.join(', ')}</Text>}
      <Input value={playerInput} onChange={(e) => setPlayerInput(e.target.value)} />
      <HStack>
        <Button onClick={onAddPlayer}>추가</Button>
        <Button onClick={onResetPlayer}>초기화</Button>
      </HStack>
    </VStack>
  );
};

export default Log;
