export type GameMode = 'fan' | 'fufan';
export type Game = {
  id: number,
  mode: GameMode,
  eswn: [string, string, string, string],
  rounds: {
    kyoku: number,
    honba: number,
    riichi: string[],
    ending: {
      type: 'yuugyoku',
      tenpai: string[],
      note: string,
    } | {
      type: 'ron',
      player: string,
      target: string,
      point: {
        type: 'yakuman',
        multiplier: number,
      } | {
        type: 'normal',
        fan: number,
        fu: number, // Ignored in fan mode
      },
      note: string,
    } | {
      type: 'tsumo',
      player: string,
      point: {
        type: 'yakuman',
        multiplier: number,
      } | {
        type: 'normal',
        fan: number,
        fu: number, // Ignored in fan mode
      },
      note: string,
    } | undefined, // round still going
  }[],
};
