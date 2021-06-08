export type GameMode = 'fan' | 'fufan';
export type AgariPoint = {
  type: 'yakuman',
  multiplier: number,
} | {
  type: 'normal',
  fan: number,
  fu: number, // Ignored in fan mode
};
export type RoundEnding = {
  type: 'yuugyoku',
  tenpai: string[],
  note: string,
} | {
  type: 'ron',
  player: string,
  target: string,
  point: AgariPoint,
  note: string,
} | {
  type: 'tsumo',
  player: string,
  point: AgariPoint,
  note: string,
};
export type Round = {
  kyoku: number,
  honba: number,
  riichi: string[],
  ending: RoundEnding | undefined, // undefined means round still going
};
export type Game = {
  id: number,
  mode: GameMode,
  eswn: [string, string, string, string],
  rounds: Round[],
};
