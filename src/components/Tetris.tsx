import React, { useState, useEffect, useRef } from "react";

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
type Cell = string | null;

interface Position {
  x: number;
  y: number;
}

interface Tetromino {
  shape: number[][][];
  color: string;
}

const TETROMINOES: { [key: string]: Tetromino } = {
  I: {
    shape: [
      [
        [0, 1],
        [1, 1],
        [2, 1],
        [3, 1],
      ],
      [
        [2, 0],
        [2, 1],
        [2, 2],
        [2, 3],
      ],
    ],
    color: "#00FFFF",
  },
  J: {
    shape: [
      [
        [0, 0],
        [0, 1],
        [1, 1],
        [2, 1],
      ],
      [
        [1, 0],
        [2, 0],
        [1, 1],
        [1, 2],
      ],
      [
        [0, 1],
        [1, 1],
        [2, 1],
        [2, 2],
      ],
      [
        [1, 0],
        [1, 1],
        [0, 2],
        [1, 2],
      ],
    ],
    color: "#0000FF",
  },
  L: {
    shape: [
      [
        [2, 0],
        [0, 1],
        [1, 1],
        [2, 1],
      ],
      [
        [1, 0],
        [1, 1],
        [1, 2],
        [2, 2],
      ],
      [
        [0, 1],
        [1, 1],
        [2, 1],
        [0, 2],
      ],
      [
        [0, 0],
        [1, 0],
        [1, 1],
        [1, 2],
      ],
    ],
    color: "#FFA500",
  },
  O: {
    shape: [
      [
        [1, 0],
        [2, 0],
        [1, 1],
        [2, 1],
      ],
    ],
    color: "#FFFF00",
  },
  S: {
    shape: [
      [
        [1, 0],
        [2, 0],
        [0, 1],
        [1, 1],
      ],
      [
        [1, 0],
        [1, 1],
        [2, 1],
        [2, 2],
      ],
    ],
    color: "#00FF00",
  },
  T: {
    shape: [
      [
        [1, 0],
        [0, 1],
        [1, 1],
        [2, 1],
      ],
      [
        [1, 0],
        [1, 1],
        [2, 1],
        [1, 2],
      ],
      [
        [0, 1],
        [1, 1],
        [2, 1],
        [1, 2],
      ],
      [
        [1, 0],
        [0, 1],
        [1, 1],
        [1, 2],
      ],
    ],
    color: "#FF00FF",
  },
  Z: {
    shape: [
      [
        [0, 0],
        [1, 0],
        [1, 1],
        [2, 1],
      ],
      [
        [2, 0],
        [1, 1],
        [2, 1],
        [1, 2],
      ],
    ],
    color: "#FF0000",
  },
};

const randomTetromino = (): {
  tetromino: Tetromino;
  position: Position;
  rotation: number;
} => {
  const types = Object.keys(TETROMINOES);
  const randType = types[Math.floor(Math.random() * types.length)];
  const tetromino = TETROMINOES[randType];
  const position = { x: Math.floor(BOARD_WIDTH / 2) - 2, y: 0 };
  return { tetromino, position, rotation: 0 };
};

const createBoard = (): Cell[][] =>
  Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null));

const Tetris: React.FC = () => {
  const [board, setBoard] = useState<Cell[][]>(createBoard());
  const [currentPiece, setCurrentPiece] = useState<{
    tetromino: Tetromino;
    position: Position;
    rotation: number;
  }>(randomTetromino());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Pour le navigateur, le type de l'interval est number
  const gameIntervalRef = useRef<number | null>(null);

  const checkCollision = (
    pos: Position,
    rotation: number,
    board: Cell[][]
  ): boolean => {
    const shape = currentPiece.tetromino.shape[rotation];
    for (let i = 0; i < shape.length; i++) {
      const x = pos.x + shape[i][0];
      const y = pos.y + shape[i][1];
      if (x < 0 || x >= BOARD_WIDTH || y < 0 || y >= BOARD_HEIGHT) return true;
      if (board[y] && board[y][x]) return true;
    }
    return false;
  };

  const mergePiece = (
    board: Cell[][],
    piece: { tetromino: Tetromino; position: Position; rotation: number }
  ): Cell[][] => {
    const newBoard = board.map((row) => row.slice());
    const shape = piece.tetromino.shape[piece.rotation];
    shape.forEach(([xOffset, yOffset]) => {
      const x = piece.position.x + xOffset;
      const y = piece.position.y + yOffset;
      if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
        newBoard[y][x] = piece.tetromino.color;
      }
    });
    return newBoard;
  };

  const clearLines = (
    board: Cell[][]
  ): { board: Cell[][]; linesCleared: number } => {
    const newBoard = board.filter((row) => row.some((cell) => cell === null));
    const linesCleared = BOARD_HEIGHT - newBoard.length;
    for (let i = 0; i < linesCleared; i++) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(null));
    }
    return { board: newBoard, linesCleared };
  };

  const dropPiece = () => {
    const newPos = { ...currentPiece.position, y: currentPiece.position.y + 1 };
    if (!checkCollision(newPos, currentPiece.rotation, board)) {
      setCurrentPiece({ ...currentPiece, position: newPos });
    } else {
      const newBoard = mergePiece(board, currentPiece);
      const { board: clearedBoard, linesCleared } = clearLines(newBoard);
      setScore((prev) => prev + linesCleared * 100);
      const newPiece = randomTetromino();
      if (checkCollision(newPiece.position, newPiece.rotation, clearedBoard)) {
        setGameOver(true);
        if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
      } else {
        setCurrentPiece(newPiece);
        setBoard(clearedBoard);
      }
    }
  };

  useEffect(() => {
    if (gameOver || isPaused) return;
    gameIntervalRef.current = window.setInterval(() => {
      dropPiece();
    }, 500);
    return () => {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    };
  }, [currentPiece, board, gameOver, isPaused]);

  const move = (dir: number) => {
    const newPos = {
      ...currentPiece.position,
      x: currentPiece.position.x + dir,
    };
    if (!checkCollision(newPos, currentPiece.rotation, board)) {
      setCurrentPiece({ ...currentPiece, position: newPos });
    }
  };

  const rotate = () => {
    const newRotation =
      (currentPiece.rotation + 1) % currentPiece.tetromino.shape.length;
    if (!checkCollision(currentPiece.position, newRotation, board)) {
      setCurrentPiece({ ...currentPiece, rotation: newRotation });
    }
  };

  const dropFast = () => {
    let newY = currentPiece.position.y;
    while (
      !checkCollision(
        { ...currentPiece.position, y: newY + 1 },
        currentPiece.rotation,
        board
      )
    ) {
      newY++;
    }
    setCurrentPiece({
      ...currentPiece,
      position: { ...currentPiece.position, y: newY },
    });
    dropPiece();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (gameOver) return;
    switch (e.key) {
      case "ArrowLeft":
        move(-1);
        break;
      case "ArrowRight":
        move(1);
        break;
      case "ArrowUp":
        rotate();
        break;
      case "ArrowDown":
        dropFast();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPiece, board, gameOver]);

  const renderBoard = () => {
    const display = board.map((row) => row.slice());
    const shape = currentPiece.tetromino.shape[currentPiece.rotation];
    shape.forEach(([xOff, yOff]) => {
      const x = currentPiece.position.x + xOff;
      const y = currentPiece.position.y + yOff;
      if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
        display[y][x] = currentPiece.tetromino.color;
      }
    });
    return display.map((row, y) => (
      <div key={y} className="row">
        {row.map((cell, x) => (
          <div
            key={x}
            className="cell"
            style={{ backgroundColor: cell ? cell : "#2a2a2a" }}
          ></div>
        ))}
      </div>
    ));
  };

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const resetGame = () => {
    setBoard(createBoard());
    setCurrentPiece(randomTetromino());
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
  };

  return (
    <div className="tetris-game">
      <div className="game-info">
        <div className="score-display">Score: {score}</div>
        <div className="button-group">
          <button onClick={togglePause}>{isPaused ? "Play" : "Pause"}</button>
          <button onClick={resetGame}>Reset</button>
        </div>
      </div>
      <div className="game-board">
        {renderBoard()}
        {gameOver && <div className="overlay">Game Over</div>}
      </div>
      <div className="t-rex">
        <svg width="100" height="100" viewBox="0 0 64 64">
          <path
            fill="#0ff"
            d="M32 2C15.4 2 2 15.4 2 32s13.4 30 30 30 30-13.4 30-30S48.6 2 32 2zm0 56C18.8 58 8 47.2 8 34S18.8 10 32 10s24 10.8 24 24-10.8 24-24 24z"
          />
          <path
            fill="#0ff"
            d="M32 14a2 2 0 0 0-2 2v14h-6a2 2 0 0 0 0 4h6v14a2 2 0 0 0 4 0V34h6a2 2 0 0 0 0-4h-6V16a2 2 0 0 0-2-2z"
          />
        </svg>
      </div>
    </div>
  );
};

export default Tetris;
