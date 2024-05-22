import { useEffect, useRef, useState } from 'react';
import { PLAYER } from '../../piece/piece.type';
import { TDirectionType, TSourceDestination } from './useBoardLogic.type';
import io from 'socket.io-client';

const socket = io.connect('http://localhost:3001');

const initialBoard = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [2, 2, 2, 2, 2, 2, 2, 2],
  [2, 2, 2, 2, 2, 2, 2, 2],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const boardGame = [initialBoard];

export const useBoardLogic = () => {
  const [currentBoardIndex, setCurrentBoardIndex] = useState(0);
  const pieceSource = useRef('');

  useEffect(() => {
    socket.emit('join_room', 11);

    socket.on('receive_message', (board: number[][]) => {
      boardGame.push(board);
      setCurrentBoardIndex((prev) => prev + 1);
    });
  }, []);

  const updateTable = (board: number[][]) => {
    socket.emit('update_board', { board, room: 11 });
  };

  const movePiece = (pieceDestination: string) => {
    const currentBoard = boardGame[boardGame.length - 1];
    const [sourcePiece, sourceY, sourceX] = pieceSource.current.split('-');
    const [destinationPiece, destinationY, destinationX] =
      pieceDestination.split('-');

    if (sourcePiece === destinationPiece) return;

    const allMandatoryMoves = findLongestPath(
      Number(sourcePiece),
      Number(sourceY),
      Number(sourceX),
      currentBoard
    );

    if (allMandatoryMoves.length > 0) {
      const allowMove = checkIfMoveAllowed(
        [allMandatoryMoves[0]],
        Number(destinationY),
        Number(destinationX)
      );

      if (!allowMove) return false;

      const oldBoard = JSON.parse(JSON.stringify(currentBoard));
      const newBoard = oldBoard;
      const dir = Number(sourcePiece) === PLAYER.BLACK ? 1 : -1;

      newBoard[Number(sourceY)][Number(sourceX)] = 0;

      if (Number(sourceX) < Number(destinationX)) {
        newBoard[Number(destinationY)][Number(destinationX) - 1] = 0;
      } else if (Number(sourceX) > Number(destinationX)) {
        newBoard[Number(sourceY)][Number(destinationX) + 1] = 0;
      } else {
        newBoard[Number(destinationY) - 1 * dir][Number(destinationX)] = 0;
      }

      newBoard[Number(destinationY)][Number(destinationX)] =
        Number(sourcePiece);

      boardGame.push(newBoard);
      setCurrentBoardIndex(currentBoardIndex + 1);
      updateTable(newBoard);

      return;
    }

    const allowedMoves = findAllowedMoves(
      Number(sourcePiece),
      Number(sourceY),
      Number(sourceX),
      currentBoard
    );

    const allowMove = checkIfMoveAllowed(
      allowedMoves,
      Number(destinationY),
      Number(destinationX)
    );

    if (!allowMove) return;

    const oldBoard = JSON.parse(JSON.stringify(currentBoard));

    const newBoard = oldBoard;

    newBoard[Number(sourceY)][Number(sourceX)] = 0;
    newBoard[Number(destinationY)][Number(destinationX)] = Number(sourcePiece);

    // check if the destination is allowed

    boardGame.push(newBoard);
    setCurrentBoardIndex(currentBoardIndex + 1);

    updateTable(newBoard);
  };

  const checkIfMoveAllowed = (
    allowedMoves: TSourceDestination[],
    destinationX: number,
    destinationY: number
  ) =>
    allowedMoves.some((elem) => {
      if (elem.toRow === destinationX && elem.toCol === destinationY) {
        return true;
      }

      return false;
    });
  /**
   *
   * @param player
   * @param board
   */
  const findAllAllowedMoves = (player: PLAYER, board: number[][]): [] => {
    let allAllowedMoves: [] = [];

    Array(8)
      .fill('')
      .forEach((_, indexRow) => {
        Array(8)
          .fill('')
          .forEach((_, indexCol) => {
            allAllowedMoves = [
              ...allAllowedMoves,
              ...findAllowedMoves(player, indexRow, indexCol, board),
            ];
          });
      });

    return allAllowedMoves;
  };

  /**
   *
   * @param player
   * @param row
   * @param col
   * @param board
   * @returns
   */
  const findAllowedMoves = (
    player: PLAYER,
    row: number,
    col: number,
    board: number[][]
  ): [] => {
    let path = [];

    const dir = player === PLAYER.BLACK ? row + 1 : row - 1;

    //down
    if (board?.[row]?.[col] === player && board?.[dir]?.[col] === 0) {
      path = [...path, { fromRow: row, fromCol: col, toRow: dir, toCol: col }];
    }

    //check right
    if (board?.[row]?.[col] === player && board?.[row]?.[col + 1] === 0) {
      path = [
        ...path,
        { fromRow: row, fromCol: col, toRow: row, toCol: col + 1 },
      ];
    }

    //check left
    if (board?.[row]?.[col] === player && board?.[row]?.[col - 1] === 0) {
      path = [
        ...path,
        { fromRow: row, fromCol: col, toRow: row, toCol: col - 1 },
      ];
    }

    return path;
  };

  /**
   *
   * @param player
   * @param row
   * @param col
   * @param board
   * @param path
   * @param direction
   * @returns
   */
  const findLongestPath = (
    player: PLAYER,
    row: number,
    col: number,
    board: number[][],
    path = [],
    direction?: TDirectionType
  ) => {
    if (row < 0 || row > 8 || col < 0 || col > 8) return path;

    const oppositePlayer =
      player === PLAYER.WHITE ? PLAYER.BLACK : PLAYER.WHITE;

    let longestPath = path;

    const dir = player === PLAYER.BLACK ? 1 : -1;

    //down or up
    if (
      board?.[row + 1 * dir]?.[col] === oppositePlayer &&
      board?.[row + 1 * dir]?.[col] === oppositePlayer &&
      board?.[row + 2 * dir]?.[col] === 0 &&
      (!direction || direction != 'up')
    ) {
      const newPath = [
        ...path,
        { fromRow: row, fromCol: col, toRow: row + 2 * dir, toCol: col },
      ];

      const downPath = findLongestPath(
        player,
        row + 2,
        col,
        board,
        newPath,
        'down'
      );

      if (downPath.length > longestPath.length) {
        longestPath = downPath;
      }
    }

    //check right
    if (
      board?.[row]?.[col + 1] === oppositePlayer &&
      board?.[row]?.[col + 1] === oppositePlayer &&
      board?.[row]?.[col + 2] === 0 &&
      (!direction || direction != 'left')
    ) {
      const newPath = [
        ...path,
        { fromRow: row, fromCol: col, toRow: row, toCol: col + 2 },
      ];

      const rightPath = findLongestPath(
        player,
        row,
        col + 2,
        board,
        newPath,
        'right'
      );

      if (rightPath.length > longestPath.length) {
        longestPath = rightPath;
      }
    }

    //check left
    if (
      board?.[row]?.[col - 1] === oppositePlayer &&
      board?.[row]?.[col - 1] === oppositePlayer &&
      board?.[row]?.[col - 2] === 0 &&
      (!direction || direction != 'right')
    ) {
      const newPath = [
        ...path,
        { fromRow: row, fromCol: col, toRow: row, toCol: col - 2 },
      ];

      const leftPath = findLongestPath(
        player,
        row,
        col - 2,
        board,
        newPath,
        'left'
      );

      if (leftPath.length > longestPath.length) {
        longestPath = leftPath;
      }
    }

    return longestPath;
  };

  return {
    currentBoardIndex,
    setCurrentBoardIndex,
    movePiece,
    boardGame,
    pieceSource,
  };
};
