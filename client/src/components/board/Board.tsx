import React from 'react';
import { Piece } from '../piece/Piece';
import { useBoardLogic } from './hooks/useBoardLogic';

const Board = () => {
  const {
    currentBoardIndex,
    boardGame,
    movePiece,
    pieceSource,
    setCurrentBoardIndex,
  } = useBoardLogic();

  return (
    <div>
      <div className=" flex flex-row">
        <div>
          {Array(8)
            .fill()
            .map((elem, index) => (
              <div className=" pr-3 h-20 text-end border-2">{index + 1}</div>
            ))}
        </div>
        <div>
          {boardGame[currentBoardIndex]?.map((elem, rowIndex) => (
            <div
              className=" flex"
              key={'dama-board-wrapper' + rowIndex}
            >
              {elem.map((piece, colIndex) => {
                const key = `${piece}-${rowIndex}-${colIndex}`;
                return (
                  <Piece
                    key={key}
                    id={`${piece}-${rowIndex}-${colIndex}`}
                    onDragStart={() => {
                      pieceSource.current = key;
                    }}
                    onClick={() => {}}
                    onDrop={() => {
                      console.log('key', key);
                      movePiece(key);
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className=" flex flex-row pl-7">
        {Array(8)
          .fill()
          .map((elem, index) => (
            <div className=" pl-3 w-20  border-2">{index + 1}</div>
          ))}
      </div>

      <button onClick={() => setCurrentBoardIndex(currentBoardIndex - 1)}>
        Prev
      </button>
      <button onClick={() => setCurrentBoardIndex(currentBoardIndex + 1)}>
        Next
      </button>
    </div>
  );
};

export { Board };
