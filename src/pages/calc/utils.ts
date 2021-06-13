/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-continue */
import {
  AgariType,
  Atama,
  Iro, Machi, Mentsu, ShuuIro, Tile,
} from './types';
import {
  checkChinroutou,
  checkChuuren,
  checkDaisangen,
  checkDaisuusii,
  checkFinfuu,
  checkIipeko,
  checkIttsu,
  checkKokushi,
  checkMenzenTsumo,
  checkRyuuisou,
  checkSanshoku,
  checkShosuusii,
  checkSuuanko,
  checkSuukantsu,
  checkTanyao,
  checkTsuisou,
  checkYakuhai,
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
  agariType: AgariType,
  roundWind: number,
  selfWind: number,
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
    roundWind: roundWind === undefined ? 1 : Number(roundWind),
    selfWind: selfWind === undefined ? 1 : Number(selfWind),
    dora: dora === undefined ? null : strToTile(dora),
  };
}

function purifyAka(tile: Tile): Tile;
function purifyAka(tiles: Tile[]): Tile[];
function purifyAka(t: any): any {
  const helper = (tile: Tile) => {
    if (tile.i === 'z') return tile;
    return {
      i: tile.i,
      n: tile.n === 0 ? 5 : tile.n,
    };
  };
  if (Array.isArray(t)) {
    return t.map((tile) => helper(tile));
  }
  return helper(t);
}

function getCombinations(hand: Tile[], agariTile: Tile, agariType: AgariType) {
  const res: { atama: Atama, mentsuList: Mentsu[], machi: Machi, }[] = [];
  const totalTiles = purifyAka([...hand, agariTile]).sort((a, b) => {
    if (a.i < b.i) return -1;
    if (a.i > b.i) return 1;
    return a.n - b.n;
  });
  // Rearrange tiles to mentsu (ex. 112233m -> 123m123m)
  function analyzeMentsu(tiles: Tile[]): Tile[][] | undefined {
    if (tiles.length === 0) return [[]];
    let ret: Tile[][] = [];
    const t1 = tiles[0]!;
    if (t1.i !== 'z') {
      // find shuntsu
      const _nextIdx = tiles.slice(1).findIndex((t) => t.i === t1.i && t.n === t1.n + 1);
      if (_nextIdx !== -1) {
        // found next one
        const nextIdx = _nextIdx + 1;
        const t2 = tiles[nextIdx]!;
        const _next2Idx = tiles.slice(nextIdx + 1).findIndex((t) => t.i === t2.i && t.n === t2.n + 1);
        if (_next2Idx !== -1) {
          const next2Idx = _next2Idx + nextIdx + 1;
          const t3 = tiles[next2Idx]!;
          const subHandAnalysis = analyzeMentsu([
            ...tiles.slice(1, nextIdx),
            ...tiles.slice(nextIdx + 1, next2Idx),
            ...tiles.slice(next2Idx + 1),
          ]);
          if (subHandAnalysis !== undefined) {
            ret = ret.concat(subHandAnalysis.map((e) => [t1, t2, t3, ...e]));
          }
        }
      }
    }
    // find kotsu
    const _nextIdx = tiles.slice(1).findIndex((t) => t.i === t1.i && t.n === t1.n);
    if (_nextIdx !== -1) {
      // found next one
      const nextIdx = _nextIdx + 1;
      const t2 = tiles[nextIdx]!;
      const _next2Idx = tiles.slice(nextIdx + 1).findIndex((t) => t.i === t2.i && t.n === t2.n);
      if (_next2Idx !== -1) {
        const next2Idx = _next2Idx + nextIdx + 1;
        const t3 = tiles[next2Idx]!;
        const subHandAnalysis = analyzeMentsu([
          ...tiles.slice(1, nextIdx),
          ...tiles.slice(nextIdx + 1, next2Idx),
          ...tiles.slice(next2Idx + 1),
        ]);
        if (subHandAnalysis !== undefined) {
          ret = ret.concat(subHandAnalysis.map((e) => [t1, t2, t3, ...e]));
        }
      }
    }
    if (ret.length === 0) return undefined;
    return ret;
  }

  // Find atama first
  const foundAtama: Atama[] = [];
  for (let i = 0; i < totalTiles.length - 1; i += 1) {
    const curr = totalTiles[i]!;
    const next = totalTiles[i + 1]!;
    if (!(curr.i === next.i && curr.n === next.n)) continue;
    // Found atama candidate. Check if we already did some work with it
    const found = foundAtama.findIndex((a) => a.i === curr.i && a.n === curr.n) !== -1;
    const nowAtama: Atama = { i: curr.i, n: curr.n };
    if (found) continue;
    foundAtama.push(nowAtama);
    // New atama. Try to make mentsus
    const remainHands = [...totalTiles.slice(0, i), ...totalTiles.slice(i + 2)];
    const analyzed = analyzeMentsu(remainHands);
    analyzed?.forEach((e) => {
      const mentsuCount = e.length / 3;
      // Create mentsu list first, and modify open according to agari tile
      const mentsuList: Mentsu[] = new Array(mentsuCount).fill(null).map((_, ix) => {
        if (e[ix * 3]!.n === e[ix * 3 + 1]!.n) {
          // Kotsu
          return {
            type: 'ko',
            i: e[ix * 3]!.i,
            n: e[ix * 3]!.n,
            open: false, // closed at default
          };
        }
        // shuntsu
        return {
          type: 'shun',
          i: e[ix * 3]!.i as ShuuIro,
          startN: e[ix * 3]!.n,
          open: false, // closed at default
        };
      });
      if (nowAtama.i === agariTile.i && nowAtama.n === agariTile.n) {
        // agariTile could be atama. Add tanki case
        // tanki case doesn't change closeness
        res.push({
          atama: nowAtama,
          mentsuList,
          machi: 'tanki',
        });
      }
      // One of mentsu has agari tile
      mentsuList.forEach((m, ix) => {
        if (m.i !== agariTile.i) return;
        // Same iro with agariTile
        const mL = mentsuList.map((m1, iy) => {
          if (ix === iy) {
            return {
              ...m1,
              open: agariType === 'ron',
            };
          }
          return m1;
        });
        if (m.type === 'shun') {
          if (agariTile.n < m.startN || m.startN + 2 < agariTile.n) return;
          if (m.startN + 1 === agariTile.n) {
            res.push({
              atama: nowAtama,
              mentsuList: mL,
              machi: 'kanchan',
            });
          } else if ((m.startN === agariTile.n && m.startN === 7)
            || (m.startN + 2 === agariTile.n && m.startN === 1)) {
            res.push({
              atama: nowAtama,
              mentsuList: mL,
              machi: 'penchan',
            });
          } else {
            res.push({
              atama: nowAtama,
              mentsuList: mL,
              machi: 'ryanmen',
            });
          }
        } else {
          // ko
          if (m.n !== agariTile.n) return;
          res.push({
            atama: nowAtama,
            mentsuList: mL,
            machi: 'shanpon',
          });
        }
      });
    });
  }
  return res;
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
function cmp(a: CalculationResult, b: CalculationResult): number {
  if (a.type === 'yakuman') {
    if (b.type === 'yakuman') return b.multiplier - a.multiplier;
    return -1;
  }
  if (a.type === 'normal') {
    if (b.type === 'yakuman') return 1;
    if (b.type === 'normal') return b.fan - a.fan; // TODO: Fix this to score
    return -1;
  }
  return 1;
}
export function calcScore(
  hand: Tile[], nakiTiles: NakiTile[], agariTile: Tile, agariType: AgariType,
  roundWind: number, selfWind: number,
): CalculationResult {
  if (hand.length + 1 + nakiTiles.length * 3 !== 14) {
    return { type: 'error', msg: '패의 갯수가 정상적이지 않아 화료 형태를 계산할 수 없습니다.' };
  }
  const isMenzen = nakiTiles.every((n) => !n.open);
  const fullHandTiles = [...hand, ...nakiTiles.reduce((acc, curr) => [...acc, ...curr.tiles], [] as Tile[])];

  let yakumanForm = false;
  let multiplier = 0;
  const yakumanList: string[] = [];

  // Check yakumans that doesn't need to find atama/mentsu
  const kokushi = checkKokushi(purifyAka(fullHandTiles), purifyAka(agariTile));
  if (kokushi !== undefined) {
    yakumanForm = true;
    multiplier += kokushi.counter;
    yakumanList.push(kokushi.name);
  }
  const chuuren = checkChuuren(purifyAka(fullHandTiles), purifyAka(agariTile), isMenzen);
  if (chuuren !== undefined) {
    yakumanForm = true;
    multiplier += chuuren.counter;
    yakumanList.push(chuuren.name);
  }
  const ryuuisou = checkRyuuisou(purifyAka([...fullHandTiles, agariTile]));
  if (ryuuisou !== undefined) {
    yakumanForm = true;
    multiplier += ryuuisou.counter;
    yakumanList.push(ryuuisou.name);
  }
  const tsuisou = checkTsuisou(purifyAka([...fullHandTiles, agariTile]));
  if (tsuisou !== undefined) {
    yakumanForm = true;
    multiplier += tsuisou.counter;
    yakumanList.push(tsuisou.name);
  }
  const chinroutou = checkChinroutou(purifyAka([...fullHandTiles, agariTile]));
  if (chinroutou !== undefined) {
    yakumanForm = true;
    multiplier += chinroutou.counter;
    yakumanList.push(chinroutou.name);
  }

  // Nakimentsu is fixed
  const nakiMentsu: Mentsu[] = nakiTiles.map((t) => {
    const purified = purifyAka(t.tiles);
    if (purified.length === 4) {
      // kantsu
      return {
        type: 'kan',
        i: purified[0]!.i,
        n: purified[0]!.n,
        open: t.open,
      } as Mentsu;
    }
    if (purified[0]!.n === purified[1]!.n) {
      return {
        type: 'ko',
        i: purified[0]!.i,
        n: purified[0]!.n,
        open: t.open,
      } as Mentsu;
    }
    return {
      type: 'shun',
      i: purified[0]!.i,
      startN: Math.min(purified[0]!.n, purified[1]!.n, purified[2]!.n),
      open: t.open,
    } as Mentsu;
  });
  // Get mentsu-atama combination
  const combinations = getCombinations(hand, agariTile, agariType);
  const candidates: CalculationResult[] = combinations.map((c) => {
    const { atama, mentsuList, machi } = c;
    const fullMentsu = [...mentsuList, ...nakiMentsu];
    let isYakuman = yakumanForm;
    let counter = multiplier;
    const yakuList = [...yakumanList];
    // Check yakumans first
    const suuanko = checkSuuanko(fullMentsu, machi);
    if (suuanko !== undefined) {
      isYakuman = true;
      counter += suuanko.counter;
      yakuList.push(suuanko.name);
    }
    const daisangen = checkDaisangen(fullMentsu);
    if (daisangen !== undefined) {
      isYakuman = true;
      counter += daisangen.counter;
      yakuList.push(daisangen.name);
    }
    const shosuusii = checkShosuusii(atama, fullMentsu);
    if (shosuusii !== undefined) {
      isYakuman = true;
      counter += shosuusii.counter;
      yakuList.push(shosuusii.name);
    }
    const daisuusii = checkDaisuusii(fullMentsu);
    if (daisuusii !== undefined) {
      isYakuman = true;
      counter += daisuusii.counter;
      yakuList.push(daisuusii.name);
    }
    const suukantsu = checkSuukantsu(fullMentsu);
    if (suukantsu !== undefined) {
      isYakuman = true;
      counter += suukantsu.counter;
      yakuList.push(suukantsu.name);
    }

    if (isYakuman) {
      return {
        type: 'yakuman',
        multiplier: counter,
        list: yakuList,
      } as CalculationResult;
    }

    // Check normal yakus
    let isFinfuu = false;
    // 1 fan
    const menzenTsumo = checkMenzenTsumo(isMenzen, agariType);
    if (menzenTsumo !== undefined) {
      counter += menzenTsumo.counter;
      yakuList.push(menzenTsumo.name);
    }
    const finfuu = checkFinfuu(atama, fullMentsu, machi, isMenzen, roundWind, selfWind);
    if (finfuu !== undefined) {
      isFinfuu = true;
      counter += finfuu.counter;
      yakuList.push(finfuu.name);
    }
    const iipeko = checkIipeko(fullMentsu, isMenzen);
    if (iipeko !== undefined) {
      counter += iipeko.counter;
      yakuList.push(iipeko.name);
    }
    const yakuhai = checkYakuhai(fullMentsu, roundWind, selfWind);
    if (yakuhai !== undefined) {
      counter += yakuhai.reduce((acc, curr) => acc + curr.counter, 0);
      yakuList.push(...yakuhai.map((e) => e.name));
    }
    const tanyao = checkTanyao(purifyAka(fullHandTiles));
    if (tanyao !== undefined) {
      counter += tanyao.counter;
      yakuList.push(tanyao.name);
    }
    // 2 fan
    const sanshoku = checkSanshoku(fullMentsu, isMenzen);
    if (sanshoku !== undefined) {
      counter += sanshoku.counter;
      yakuList.push(sanshoku.name);
    }
    const ittsu = checkIttsu(fullMentsu, isMenzen);
    if (ittsu !== undefined) {
      counter += ittsu.counter;
      yakuList.push(ittsu.name);
    }

    // Fu calculation
    const fu = (() => {
      if (isFinfuu) {
        if (agariType === 'tsumo') return 20;
        return 30;
      }
      let base = 20;
      if (agariType === 'tsumo') base += 2;
      if (agariType === 'ron' && isMenzen) base += 10;
      if (machi === 'tanki' || machi === 'kanchan' || machi === 'penchan') base += 2;
      if (atama.i === 'z' && atama.n === roundWind) base += 2;
      if (atama.i === 'z' && atama.n === selfWind) base += 2;
      base += fullMentsu.map((m) => {
        if (m.type === 'shun') return 0;
        const isYaochu = m.i === 'z' || m.n === 1 || m.n === 9;
        return 2 * (m.open ? 1 : 2) * (isYaochu ? 2 : 1) * (m.type === 'kan' ? 4 : 1);
      }).reduce((acc, curr) => acc + curr, 0);
      return Math.ceil(base / 10) * 10;
    })();
    return {
      type: 'normal',
      fan: counter,
      fu,
      list: yakuList,
      isMenzen,
    } as CalculationResult;
  }).sort((a, b) => cmp(a, b));

  // TODO: Handle chiitoi case

  const maximum = candidates[0];
  if (maximum === undefined) {
    if (yakumanForm) {
      return {
        type: 'yakuman',
        multiplier,
        list: yakumanList,
      };
    }
    return { type: 'error', msg: '역이 없습니다.' };
  }
  if (maximum.type === 'error') return maximum;
  if (maximum.type === 'yakuman') return maximum;
  if (maximum.fan === 0) return { type: 'error', msg: '역이 없습니다.' };
  return maximum;
}
