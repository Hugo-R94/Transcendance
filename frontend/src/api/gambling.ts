export type Player = {
  playerId: string;
  playerNumber: number;
  username: string;
  balance: number;
  ready: boolean;
};

// export type PlayerBet = {
//   playerId: string;
//   playerNumber: number;
//   chipValue: number;
//   target: string;
// };

export type Bet = {
  chipValue: number;
  target: string;
};

export type Ticket = {
  [key: string]: any;
};

export type Result = {
  playerId: string;
  username?: string;
  balanceBefore: number;
  balanceAfter: number;
  [key: string]: any;
};

export type JsonLog = {
  id: number;
  direction: "sent" | "received" | "system";
  data: any;
  timestamp: string;
};

export type ServerMessage = {
  type: string;

  playerId?: string;
  playerNumber?: number;
  username?: string;

  roomId?: string;

  balance?: number;
  balanceBefore?: number;
  balanceAfter?: number;

  ready?: boolean;

  countdown?: number;

  turn?: number;

  chipValue?: number;
  target?: string;

  winningNumber?: number;

  ticket?: Ticket;

  players?: Player[];
  results?: Result[];

  message?: string;

  [key: string]: any;
};