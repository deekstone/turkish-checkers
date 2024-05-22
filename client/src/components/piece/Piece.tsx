import React from 'react';
import { getIfSquareColored } from './piece.factory';
import { IPieceProp, PLAYER } from './piece.type';

export const Piece = ({ id, onDragStart, onClick, onDrop }: IPieceProp) => {
  const [p, r, c] = id.split('-');
  const piece = Number(p);
  const rowIndex = Number(r);
  const colIndex = Number(c);

  return (
    <div
      key={'piece-' + id}
      className={`w-20 h-20 p-1 border-black border-2 ${
        getIfSquareColored(rowIndex, colIndex) ? 'bg-slate-600' : ''
      }`}
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {piece === PLAYER.WHITE || piece === PLAYER.BLACK ? (
        <div
          id={`${piece}-${rowIndex}-${colIndex}`}
          className={` w-full h-full rounded-full border-2  border-black ${
            piece === PLAYER.BLACK
              ? 'bg-black'
              : piece === PLAYER.WHITE
              ? 'bg-white'
              : ''
          }`}
          draggable={true}
          onDragStart={onDragStart}
        />
      ) : null}
    </div>
  );
};
