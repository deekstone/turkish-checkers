export interface IPieceProp {
  id: string;
  onDragStart: () => void;
  onClick: () => void;
  onDrop: () => void;
}

export const enum PLAYER {
  WHITE = 2,
  BLACK = 1,
}

export type TPlayer = typeof PLAYER;
