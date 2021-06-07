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
} from '@chakra-ui/react';

import { getItem, setItem } from '@/storage';

const PLAYER_LIST_KEY = 'playerList';

const Log: React.FC = () => {
  const [playerList, _setPlayerList] = React.useState<string[]>([]);
  const [playerInput, setPlayerInput] = React.useState('');

  const setPlayerList = (newV: string[]) => {
    _setPlayerList(newV);
    setItem(PLAYER_LIST_KEY, newV);
  };

  React.useEffect(() => {
    // Initial loading of storage data
    const pList = getItem<string[]>(PLAYER_LIST_KEY);
    _setPlayerList(pList ?? []);
  }, []);

  const onAddPlayer = () => {
    if (playerInput !== '') {
      setPlayerList([...playerList, playerInput]);
      setPlayerInput('');
    }
  };
  const onResetPlayer = () => {
    setPlayerList([]);
  };
  const onDeletePlayer = (name: string) => {
    setPlayerList(playerList.filter((e) => e !== name));
  };

  return (
    <VStack>
      <Heading size="md">플레이어 목록</Heading>
      {playerList.length === 0 ? (
        <Text>없음</Text>
      ) : (
        <HStack>
          {playerList.map((e) => (
            <Text onClick={() => onDeletePlayer(e)}>{e}</Text>
          ))}
        </HStack>
      )}
      <Input value={playerInput} onChange={(e) => setPlayerInput(e.target.value)} />
      <HStack>
        <Button onClick={onAddPlayer}>추가</Button>
        <Button onClick={onResetPlayer}>초기화</Button>
      </HStack>
    </VStack>
  );
};

export default Log;
