/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import {
  Box,
  Button,
  Heading,
  Input,
  Img,
  Text,
  Link,
  HStack,
  VStack,
} from '@chakra-ui/react';
import { parseInput, calcScore } from './utils';
import { Tile } from './types';

const TileImg: React.FC<{ tile: Tile | null, }> = ({ tile }) => {
  const s = tile === null ? 'back' : `${tile.n}${tile.i}`;
  return (
    <Box overflow="hidden" position="relative" width="42px" height="64px">
      <Img
        src={`imgs/${s}.png`}
        display="block"
        position="absolute"
        left="-11px"
        width="64px !important"
        minWidth="64px !important"
        maxWidth="64px !important"
        height="64px !important"
      />
    </Box>
  );
};

// hand.nakimentsu.nakimentsu/agaripai/meta/roundwind/selfwind/dora
// meta: a = tsumo, b = ron
const Calc: React.FC = () => {
  const [input, setInput] = React.useState('');
  const [result, setResult] = React.useState<ReturnType<typeof parseInput>>();

  const onClickCalc = () => {
    setResult(parseInput(input));
  };

  return (
    <VStack mb={8}>
      <Heading size="md">점수 계산기</Heading>
      <Text>아래에 화료한 패를 입력해 주세요.</Text>
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <Button onClick={onClickCalc}>계산하기</Button>
      {result !== undefined && (
        result.ok ? (() => {
          const score = calcScore(result.hand, result.nakiTiles, result.agariTile, result.agariType);
          return (
            <VStack mt={8}>
              <Heading size="md">결과</Heading>
              <HStack>
                <VStack>
                  <Text>손패</Text>
                  <HStack spacing={0}>
                    {result.hand.map((t) => <TileImg key={Math.random()} tile={t} />)}
                  </HStack>
                </VStack>
                {result.nakiTiles.map((n, i) => (
                  <VStack key={Math.random()}>
                    <Text>{`후로 ${i + 1}`}</Text>
                    <HStack spacing={0}>
                      {n.tiles.map((t, k) => (
                        <TileImg key={Math.random()} tile={!n.open && (k === 0 || k === 3) ? null : t} />
                      ))}
                    </HStack>
                  </VStack>
                ))}
              </HStack>
              <Text>오름패 {result.agariType === 'tsumo' ? '쯔모' : '론'}</Text>
              <TileImg tile={result.agariTile} />
              {score.type === 'error' && (
                <Text>{score.msg}</Text>
              )}
              {score.type === 'yakuman' && (
                <>
                  <Heading size="md">역</Heading>
                  {score.list.map((y) => <Text>{y}</Text>)}
                  <Heading size="lg">{score.multiplier === 1 ? '역만' : `${score.multiplier}배 역만`}</Heading>
                </>
              )}
            </VStack>
          );
        })() : (
          <Text>{result.msg}</Text>
        )
      )}
      <Text pt={12}>
        패 이미지는&nbsp;
        <Link href="http://www.martinpersson.org/" color="green.400" isExternal>여기</Link>
        에서 가져옴
      </Text>
    </VStack>
  );
};

export default Calc;
