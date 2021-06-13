import {
  Tile, Atama, Mentsu, Machi, AgariType, Shuntsu,
} from './types';

function toStr(tile: Tile) {
  return `${tile.n}${tile.i}`;
}
function toStrList(handList: Tile[]) {
  return handList.map(toStr);
}
function isShuntsu(mentsu: Mentsu): mentsu is Shuntsu {
  return mentsu.type === 'shun';
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
  totalTileList: Tile[],
): Yaku | undefined {
  // is all tiles green?
  if (!totalTileList.every((t) => t.i === 's' || (t.i === 'z' && t.n === 6))) return undefined;
  return { name: '녹일색', counter: 1 };
}

export function checkTsuisou(
  totalTileList: Tile[],
): Yaku | undefined {
  // is all tiles jihai?
  if (!totalTileList.every((t) => t.i === 'z')) return undefined;
  return { name: '자일색', counter: 1 };
}

export function checkChinroutou(
  totalTileList: Tile[],
): Yaku | undefined {
  // is all tiles 1 or 9?
  if (!totalTileList.every((t) => t.i !== 'z' && (t.n === 1 || t.n === 9))) return undefined;
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
/* 2 fan */
// double riichi -> flag
export function checkChiitoi(
  atama: Atama[],
): Yaku | undefined {
  let r = true;
  if (atama.length !== 7) return undefined;
  for (let i = 0; i < atama.length - 1; i += 1) {
    const atama1 = atama[i]!;
    for (let j = 0; j < atama.length; j += 1) {
      const atama2 = atama[j]!;
      if (atama1.i === atama2.i && atama1.n === atama2.n) r = false;
    }
  }
  if (!r) return undefined;
  return { name: '치또이츠', counter: 2 };
}

export function checkSanshoku(
  mentsuList: Mentsu[], isMenzen: boolean,
): Yaku | undefined {
  const shuntsuOnly = mentsuList.filter(isShuntsu);
  if (shuntsuOnly.length < 3) return undefined;
  const isSanshoku = (s1: Shuntsu, s2: Shuntsu, s3: Shuntsu) => {
    return (
      s1.i !== s2.i && s2.i !== s3.i && s3.i !== s1.i
      && s1.startN === s2.startN && s2.startN === s3.startN && s3.startN === s1.startN
    );
  };
  if (shuntsuOnly.length === 3) {
    const s1 = shuntsuOnly[0]!;
    const s2 = shuntsuOnly[1]!;
    const s3 = shuntsuOnly[2]!;
    if (!isSanshoku(s1, s2, s3)) return undefined;
  }
  if (shuntsuOnly.length === 4) {
    const s1 = shuntsuOnly[0]!;
    const s2 = shuntsuOnly[1]!;
    const s3 = shuntsuOnly[2]!;
    const s4 = shuntsuOnly[3]!;
    if (!isSanshoku(s1, s2, s3) && !isSanshoku(s1, s2, s4) && !isSanshoku(s1, s3, s4) && !isSanshoku(s2, s3, s4)) {
      return undefined;
    }
  }
  return { name: '삼색동순', counter: isMenzen ? 2 : 1 };
}

export function checkIttsu(
  mentsuList: Mentsu[], isMenzen: boolean,
): Yaku | undefined {
  const shuntsuOnly = mentsuList.filter(isShuntsu);
  if (shuntsuOnly.length < 3) return undefined;
  const isIttsu = (s1: Shuntsu, s2: Shuntsu, s3: Shuntsu) => {
    const starts = [s1.startN, s2.startN, s3.startN].sort();
    return (
      s1.i === s2.i && s2.i === s3.i
      && starts[0] === 1 && starts[1] === 4 && starts[2] === 7
    );
  };
  if (shuntsuOnly.length === 3) {
    const s1 = shuntsuOnly[0]!;
    const s2 = shuntsuOnly[1]!;
    const s3 = shuntsuOnly[2]!;
    if (!isIttsu(s1, s2, s3)) return undefined;
  }
  if (shuntsuOnly.length === 4) {
    const s1 = shuntsuOnly[0]!;
    const s2 = shuntsuOnly[1]!;
    const s3 = shuntsuOnly[2]!;
    const s4 = shuntsuOnly[3]!;
    if (!isIttsu(s1, s2, s3) && !isIttsu(s1, s2, s4) && !isIttsu(s1, s3, s4) && !isIttsu(s2, s3, s4)) {
      return undefined;
    }
  }
  return { name: '일기통관', counter: isMenzen ? 2 : 1 };
}

/* 1 fan */
export function checkMenzenTsumo(
  isMenzen: boolean, agariType: AgariType,
): Yaku | undefined {
  if (isMenzen && agariType === 'tsumo') return { name: '멘젠쯔모', counter: 1 };
  return undefined;
}

// riichi -> flag
// ippatsu -> flag

export function checkFinfuu(
  atama: Atama, mentsuList: Mentsu[], machi: Machi, isMenzen: boolean, roundWind: number, selfWind: number,
): Yaku | undefined {
  // Menzen
  if (!isMenzen) return undefined;
  // Atama -> Not yakuhai
  if (atama.i === 'z' && atama.n === roundWind) return undefined;
  if (atama.i === 'z' && atama.n === selfWind) return undefined;
  if (atama.i === 'z' && [5, 6, 7].includes(atama.n)) return undefined;
  // Mentsu -> all shuntsu
  if (!mentsuList.every((m) => m.type === 'shun')) return undefined;
  // Ryanmen machi
  if (machi !== 'ryanmen') return undefined;
  return { name: '핑후', counter: 1 };
}

export function checkIipeko(
  mentsuList: Mentsu[], isMenzen: boolean,
): Yaku | undefined {
  if (!isMenzen) return undefined;
  // TODO: Check ryanpeko
  let r = false;
  for (let i = 0; i < mentsuList.length - 1; i += 1) {
    const mentsu1 = mentsuList[i]!;
    for (let j = i + 1; j < mentsuList.length; j += 1) {
      const mentsu2 = mentsuList[j]!;
      if (mentsu1.type === 'shun' && mentsu2.type === 'shun'
        && mentsu1.startN === mentsu2.startN) r = true;
    }
  }
  if (!r) return undefined;
  return { name: '이페코', counter: 1 };
}

export function checkYakuhai(
  mentsuList: Mentsu[], roundWind: number, selfWind: number,
): Yaku[] | undefined {
  const windToStr = (wind: number) => {
    if (wind === 1) return '동';
    if (wind === 2) return '남';
    if (wind === 3) return '서';
    return '북';
  };
  const ret = [
    mentsuList.some((m) => m.i === 'z' && m.n === roundWind) ? `장풍: ${windToStr(roundWind)}` : '',
    mentsuList.some((m) => m.i === 'z' && m.n === selfWind) ? `자풍: ${windToStr(selfWind)}` : '',
    mentsuList.some((m) => m.i === 'z' && m.n === 5) ? '역패: 백' : '',
    mentsuList.some((m) => m.i === 'z' && m.n === 6) ? '역패: 발' : '',
    mentsuList.some((m) => m.i === 'z' && m.n === 7) ? '역패: 중' : '',
  ].filter((x) => x !== '');
  if (ret.length === 0) return undefined;
  return ret.map((x) => ({ name: x, counter: 1 }));
}

export function checkTanyao(
  totalTileList: Tile[],
): Yaku | undefined {
  if (!totalTileList.every((t) => t.i !== 'z' && t.n >= 2 && t.n <= 8)) return undefined;
  return { name: '탕야오', counter: 1 };
}

// rinshan -> flag
// chankan -> flag
// haiteitsumo -> flag
// haiteiron -> flag
