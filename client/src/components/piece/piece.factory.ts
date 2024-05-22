export const getIfSquareColored = (rowIndex: number, colIndex: number) => {
  if (rowIndex % 2 !== 0) {
    return colIndex % 2 === 0;
  } else {
    return colIndex % 2 !== 0;
  }
};
