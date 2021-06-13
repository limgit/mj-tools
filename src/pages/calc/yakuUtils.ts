import {
  Tile, Atama, Mentsu, Machi,
} from './types';

function toStr(tile: Tile) {
  return `${tile.n}${tile.i}`;
}
function toStrList(handList: Tile[]) {
  return handList.map(toStr);
}

type Yaku = {
  name: string,
  counter: number, // Yakuman = multiplier, normal = fan
};

// -------
// YAKUMAN
// -------

// tenhou, chihou cannot be handled
export function checkSuuanko(
  mentsuList: Mentsu[], machi: Machi,
): Yaku | undefined {
  if (mentsuList.every((m) => (m.type === 'ko' || m.type === 'kan') && !m.open)) {
    if (machi === 'tanki') {
      return { name: '스안커단기', counter: 2 };
    }
    return { name: '스안커', counter: 2 };
  }
  return undefined;
}

export function checkKokushi(
  fullHandList: Tile[], agariTile: Tile,
): Yaku | undefined {
  const totalTiles = toStrList([...fullHandList, agariTile]);
  const form = [
    '1m', '9m', '1s', '9s', '1p', '9p', '1z', '2z', '3z', '4z', '5z', '6z', '7z',
  ];
  const check1 = form.every((t) => totalTiles.includes(t)) && totalTiles.every((t) => form.includes(t));
  const check2 = form.every((t) => toStrList(fullHandList).includes(t));
  if (check1) {
    if (check2) {
      return { name: '국사무쌍 13면대기', counter: 2 };
    }
    return { name: '국사무쌍', counter: 1 };
  }
  return undefined;
}

export function checkChuuren(
  fullHandList: Tile[], agariTile: Tile, isMenzen: boolean,
): Yaku | undefined {
  if (!isMenzen) return undefined;
  const iro = agariTile.i;
  if (!fullHandList.every((t) => t.i === iro) || iro === 'z') return undefined;
  if (fullHandList.length !== 13) return undefined;
  const fullHandNumbers = fullHandList.map((x) => x.n);
  const totalTileNumbers = [...fullHandNumbers, agariTile.n];
  const countTile = (target: number) => totalTileNumbers.filter((x) => x === target).length;
  const countTile2 = (target: number) => fullHandNumbers.filter((x) => x === target).length;
  const check1 = countTile(1) >= 3 && [2, 3, 4, 5, 6, 7, 8].every((n) => countTile(n) >= 1) && countTile(9) >= 3;
  const check2 = countTile2(1) >= 3 && [2, 3, 4, 5, 6, 7, 8].every((n) => countTile2(n) >= 1) && countTile2(9) >= 3;
  if (check1) {
    if (check2) {
      return { name: '순정구련보등', counter: 2 };
    }
    return { name: '구련보등', counter: 1 };
  }
  return undefined;
}

export function checkRyuuisou(
  atama: Atama, mentsuList: Mentsu[],
): Yaku | undefined {
  // is atama green?
  if (!(atama.i === 's' || (atama.i === 'z' && atama.n === 6))) return undefined;
  // is mentsu all green?
  if (!mentsuList.every((m) => m.i === 's' || (m.i === 'z' && m.n === 6))) return undefined;
  return { name: '녹일색', counter: 1 };
}

export function checkTsuisou(
  atama: Atama, mentsuList: Mentsu[],
): Yaku | undefined {
  // is atama jihai?
  if (atama.i !== 'z') return undefined;
  // is mentsu all jihal?
  if (!mentsuList.every((m) => m.i === 'z')) return undefined;
  return { name: '자일색', counter: 1 };
}

export function checkChinroutou(
  atama: Atama, mentsuList: Mentsu[],
): Yaku | undefined {
  // is atama 1 or 9?
  if (!(atama.n === 1 || atama.n === 9)) return undefined;
  // is mentsu all 1 or 9?
  if (!mentsuList.every((m) => (m.type !== 'shun' && (m.n === 1 || m.n === 9)))) return undefined;
  return { name: '청노두', counter: 1 };
}

export function checkDaisangen(
  mentsuList: Mentsu[],
): Yaku | undefined {
  if (!mentsuList.some((x) => x.i === 'z' && x.n === 5)) return undefined; // No Haku
  if (!mentsuList.some((x) => x.i === 'z' && x.n === 6)) return undefined; // No Hatsu
  if (!mentsuList.some((x) => x.i === 'z' && x.n === 7)) return undefined; // No Chunn
  return { name: '대삼원', counter: 1 };
}

export function checkShosuusii(
  atama: Atama, mentsuList: Mentsu[],
): Yaku | undefined {
  if (!(atama.i === 'z' && atama.n >= 1 && atama.n <= 4)) return undefined;
  if (mentsuList.filter((x) => x.i === 'z' && x.n >= 1 && x.n <= 4).length !== 3) return undefined;
  return { name: '소사희', counter: 1 };
}

export function checkDaisuusii(
  mentsuList: Mentsu[],
): Yaku | undefined {
  if (!mentsuList.every((x) => x.i === 'z' && x.n >= 1 && x.n <= 4)) return undefined;
  return { name: '대사희', counter: 2 };
}

export function checkSuukantsu(
  menstuList: Mentsu[],
): Yaku | undefined {
  if (!menstuList.every((x) => x.type === 'kan')) return undefined;
  return { name: '스깡쯔', counter: 1 };
}

// ------
// NORMAL
// ------