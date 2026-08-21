export type Player = {
  playerId: string;
  username: string;
  balance: number;
  ready: boolean;
};

export type Ticket = {
  type: "bonus" | "malus";
  value: number;
};

export type Bet = {
  chipValue: number;
  target: string;
};

export type Result = {
  playerId: string;
  username?: string;
  result: "win" | "lose" | "tie";
  balanceBefore: number;
  gain: number;
  balanceAfter: number;
};

export type ServerMessage = {
  type: string;
  [key: string]: any;
};

export type JsonLog = {
  id: number;
  direction: "sent" | "received" | "system";
  data: any;
  timestamp: string;
};