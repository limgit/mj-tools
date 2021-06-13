export type ShuuIro = 'm' | 's' | 'p';
export type JiIro = 'z';
export type Iro = ShuuIro | JiIro;
export type Machi = 'ryanmen' | 'shanpon' | 'kanchan' | 'penchan' | 'tanki';
export type AgariType = 'tsumo' | 'ron';

export type Tile = {
  i: Iro,
  n: number,
};
export type Atama = {
  i: Iro,
  n: number,
};
export type Mentsu = {
  type: 'shun',
  i: ShuuIro,
  startN: number,
  open: boolean,
} | {
  type: 'ko',
  i: Iro,
  n: number,
  open: boolean,
} | {
  type: 'kan',
  i: Iro,
  n: number,
  open: boolean,
};
