import {
  Iro, Tile,
} from './types';
import {
  checkChuuren,
  checkKokushi,
} from './yakuUtils';

function strToTile(str: string): Tile[] {
  let buffer: number[] = [];
  const ret: Tile[] = [];
  for (let i = 0; i < str.length; i += 1) {
    const ch = str.charAt(i);
    if (Number.isNaN(Number(ch))) {
      // str
      const tiles: Tile[] = buffer.map((n) => ({ i: ch as Iro, n }));
      ret.push(...tiles);
      buffer = [];
    } else {
      buffer.push(Number(ch));
    }
  }
  return ret.sort((a, b) => {
    if (a.i < b.i) return -1;
    if (a.i > b.i) return 1;
    const an = a.n === 0 ? 5 : a.n;
    const bn = b.n === 0 ? 5 : b.n;
    return an - bn;
  });
}

type NakiTile = {
  open: boolean,
  tiles: Tile[],
};
type ParseResult = {
  ok: false, msg: string,
} | {
  ok: true,
  hand: Tile[],
  nakiTiles: NakiTile[],
  agariTile: Tile,
  agariType: 'tsumo' | 'ron',
  roundWind: number | null,
  selfWind: number | null,
  dora: Tile[] | null,
};
export function parseInput(input: string): ParseResult {
  const slices = input.split('/');
  if (slices.length < 3) {
    return { ok: false, msg: '최소한 손패, 오름패, 오름정보의 정보가 필요합니다.' };
  }
  const fullHand = slices[0]!;
  const agariTile = strToTile(slices[1]!)[0]!;
  const agariType = slices[2]!;
  const roundWind = slices[3];
  const selfWind = slices[4];
  const dora = slices[5];

  const handSplitted = fullHand.split('.');
  const hand = strToTile(handSplitted[0]!);
  const nakiTiles = handSplitted.slice(1).map((s) => {
    let ankan = false;
    if (s.endsWith('!')) ankan = true;
    const tiles = strToTile(ankan ? s.slice(0, -1) : s);
    return {
      open: !ankan,
      tiles,
    };
  });
  return {
    ok: true,
    hand,
    nakiTiles,
    agariTile,
    agariType: agariType === 'a' ? 'tsumo' : 'ron',
    roundWind: roundWind === undefined ? null : Number(roundWind),
    selfWind: selfWind === undefined ? null : Number(selfWind),
    dora: dora === undefined ? null : strToTile(dora),
  };
}

type CalculationResult = {
  type: 'error',
  msg: string,
} | {
  type: 'yakuman',
  list: string[],
  multiplier: number,
} | {
  type: 'normal',
  list: string[],
  fan: number,
  fu: number,
  isMenzen: boolean,
};
export function calcScore(
  hand: Tile[], nakiTiles: NakiTile[], agariTile: Tile, agariType: 'tsumo' | 'ron',
): CalculationResult {
  console.log(agariType);
  if (hand.length + 1 + nakiTiles.length * 3 !== 14) {
    return { type: 'error', msg: '패의 갯수가 정상적이지 않아 화료 형태를 계산할 수 없습니다.' };
  }
  const isMenzen = nakiTiles.every((n) => !n.open);
  const fullHandTiles = [...hand, ...nakiTiles.reduce((acc, curr) => [...acc, ...curr.tiles], [] as Tile[])];

  let isYakuman = false;
  let counter = 0;
  const yakuList: string[] = [];

  // Check yakuman first
  const kokushi = checkKokushi(fullHandTiles, agariTile);
  if (kokushi !== undefined) {
    isYakuman = true;
    counter += kokushi.counter;
    yakuList.push(kokushi.name);
  }
  const chuuren = checkChuuren(fullHandTiles, agariTile, isMenzen);
  if (chuuren !== undefined) {
    isYakuman = true;
    counter += chuuren.counter;
    yakuList.push(chuuren.name);
  }

  if (isYakuman) {
    return {
      type: 'yakuman',
      multiplier: counter,
      list: yakuList,
    };
  }

  // Not a yakuman
  if (counter === 0) {
    return { type: 'error', msg: '역이 없습니다.' };
  }
  // TODO: Fix here
  return {
    type: 'normal',
    fan: counter,
    fu: 0,
    list: yakuList,
    isMenzen,
  };
}
