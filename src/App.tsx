import { useCallback, useEffect, useState } from 'react';
import './App.css';

export interface GameState {
  table: number[];
  currentPlayer: 0 | 1;
  playerScores: number[];
  cursor: number;
  currentScore: number;
  direction: 1 | -1;
  endTurn: boolean;
  isPlaying: boolean;
}

const defaultTable = [100, 5, 5, 5, 5, 5, 100, 5, 5, 5, 5, 5];
const playerActiveStyle = [
  'bg-green-100 hover:bg-green-200',
  'bg-blue-100 hover:bg-blue-200',
];

const defaultGameState: GameState = {
  table: defaultTable,
  currentPlayer: 0,
  playerScores: [0, 0],
  cursor: 0,
  currentScore: 0,
  direction: 1,
  endTurn: false,
  isPlaying: false,
};

function App() {
  const [gameState, setGameState] = useState<GameState>(defaultGameState);

  const resetGame = () => {
    setGameState(defaultGameState);
  };

  const calQuan = (count: number) => {
    return Math.floor(Math.abs(count / 100));
  };

  const calDan = (count: number) => {
    return count % 100;
  };

  const isPlayerCell = (index: number, player: number) => {
    return Math.floor(index / 6) === player && index % 6 > 0;
  };

  const isCurrentPlayerCell = useCallback(
    (index: number) => {
      return Math.floor(index / 6) === gameState.currentPlayer && index % 6 > 0;
    },
    [gameState]
  );

  const nextCell = useCallback(
    (index: number, step: number = 1, direction?: number) => {
      const newIndex = index + (direction ?? gameState.direction) * step;
      return newIndex < 0
        ? newIndex + gameState.table.length
        : newIndex >= gameState.table.length
        ? newIndex - gameState.table.length
        : newIndex;
    },
    [gameState]
  );

  const selectPlayDirection = useCallback(
    (index: number, direction: 1 | -1) => {
      if (gameState.isPlaying) return;
      if (!isCurrentPlayerCell(index)) return;
      if (gameState.table[index] == null || gameState.table[index] <= 0) return;
      const newTable = [...gameState.table];
      newTable[index] = 0;
      setGameState({
        ...gameState,
        table: newTable,
        cursor: nextCell(index, 1, direction),
        currentScore: gameState.table[index],
        direction,
        endTurn: false,
        isPlaying: true,
      });
    },
    [gameState, isCurrentPlayerCell, nextCell]
  );

  useEffect(() => {
    const gamePlay = () => {
      if (!gameState.isPlaying) return;

      if (gameState.currentScore > 0) {
        const newTable = [...gameState.table];
        newTable[gameState.cursor]++;
        setGameState({
          ...gameState,
          table: newTable,
          cursor: nextCell(gameState.cursor),
          currentScore: gameState.currentScore - 1,
        });
        return;
      }

      if (
        gameState.table[gameState.cursor] > 0 &&
        gameState.table[gameState.cursor] < 100 &&
        !gameState.endTurn
      ) {
        const newTable = [...gameState.table];
        newTable[gameState.cursor] = 0;
        setGameState({
          ...gameState,
          table: newTable,
          cursor: nextCell(gameState.cursor),
          currentScore: gameState.table[gameState.cursor],
        });
        return;
      }

      const nextIndex = nextCell(gameState.cursor);
      if (
        gameState.table[gameState.cursor] === 0 &&
        gameState.table[nextIndex] > 0
      ) {
        const newTable = [...gameState.table];
        newTable[nextIndex] = 0;

        const newPlayerScores = [...gameState.playerScores];
        newPlayerScores[gameState.currentPlayer] += gameState.table[nextIndex];
        setGameState({
          ...gameState,
          table: newTable,
          cursor: nextCell(gameState.cursor, 2),
          playerScores: newPlayerScores,
          endTurn: true,
        });

        return;
      }

      if (gameState.table[0] < 100 && gameState.table[6] < 100) {
        const newTable = [...gameState.table];
        const newPlayerScores = [...gameState.playerScores];

        for (const i of gameState.table.keys()) {
          if (isPlayerCell(i, 0)) {
            newPlayerScores[0] += gameState.table[i];
            newTable[i] = 0;
          } else if (isPlayerCell(i, 1)) {
            newPlayerScores[1] += gameState.table[i];
            newTable[i] = 0;
          }
        }

        setGameState({
          ...gameState,
          table: newTable,
          playerScores: newPlayerScores,
          cursor: 0,
          currentScore: 0,
          isPlaying: false,
          endTurn: true,
        });

        return;
      }

      const nextPlayer = gameState.currentPlayer === 0 ? 1 : 0;
      let allEmpty = true;

      for (const i of gameState.table.keys()) {
        if (isPlayerCell(i, nextPlayer) && gameState.table[i] > 0) {
          allEmpty = false;
          break;
        }
      }

      if (allEmpty) {
        const newPlayerScores = [...gameState.playerScores];
        newPlayerScores[nextPlayer] = newPlayerScores[nextPlayer] - 5;

        const newTable = [...gameState.table];

        for (const i of newTable.keys()) {
          if (isPlayerCell(i, nextPlayer)) {
            newTable[i] = 1;
          }
        }

        setGameState({
          ...gameState,
          table: newTable,
          playerScores: newPlayerScores,
          cursor: 0,
          currentScore: 0,
          isPlaying: false,
          endTurn: true,
          currentPlayer: nextPlayer,
        });
      } else {
        setGameState({
          ...gameState,
          cursor: 0,
          currentScore: 0,
          isPlaying: false,
          endTurn: true,
          currentPlayer: nextPlayer,
        });
      }
    };

    const intervalId = setInterval(gamePlay, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, [gameState, nextCell]);

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-start">
          <span className="font-bold">Player 1</span>
          <span>{`Quan: ${calQuan(gameState.playerScores[0])}`}</span>
          <span>{`Dân: ${calDan(gameState.playerScores[0])}`}</span>
        </div>
        <div className="flex flex-col items-start">
          <span className="font-bold">{`Handing: ${gameState.currentScore}`}</span>
          <span>{`currentPlayer: ${gameState.currentPlayer}`}</span>
          <span>{`endTurn: ${gameState.endTurn}`}</span>
          <span>{`isPlaying: ${gameState.isPlaying}`}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-bold">Player 2</span>
          <span>{`Quan: ${calQuan(gameState.playerScores[1])}`}</span>
          <span>{`Dân: ${calDan(gameState.playerScores[1])}`}</span>
        </div>
      </div>
      <div className="flex flex-row">
        <div
          className={`flex items-center justify-center border border-gray-700 w-32 h-64 ${
            gameState.isPlaying && gameState.cursor === 0
              ? '!bg-purple-200'
              : ''
          }`}
        >
          <div className="min-w-max flex flex-col">
            <span>{`Quan: ${calQuan(gameState.table[0])}`}</span>
            <span>{`Dân: ${calDan(gameState.table[0])}`}</span>
          </div>
        </div>
        <div className="grow flex flex-col">
          <div className="flex border border-gray-700 w-32 h-32">
            {gameState.table.map((cell, i) => (
              <div
                key={`cell-${i}`}
                className={`border border-gray-700 w-32 h-32 group items-center justify-center ${
                  !gameState.isPlaying && isCurrentPlayerCell(i)
                    ? playerActiveStyle[gameState.currentPlayer]
                    : ''
                } ${
                  gameState.isPlaying && gameState.cursor === i
                    ? '!bg-purple-200'
                    : ''
                } ${!isPlayerCell(i, 0) ? 'hidden' : 'flex'}`}
              >
                <div className="flex items-center justify-center">
                  {!gameState.isPlaying &&
                    isCurrentPlayerCell(i) &&
                    cell > 0 && (
                      <button
                        className="border hidden group-hover:block"
                        onClick={() => selectPlayDirection(i, -1)}
                      >{`<`}</button>
                    )}
                  <span className="p-2">{cell}</span>
                  {!gameState.isPlaying &&
                    isCurrentPlayerCell(i) &&
                    cell > 0 && (
                      <button
                        className="border hidden group-hover:block"
                        onClick={() => selectPlayDirection(i, 1)}
                      >{`>`}</button>
                    )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex border border-gray-700 w-32 h-32 flex-row-reverse">
            {gameState.table.map((cell, i) => (
              <div
                key={`cell-${i}`}
                className={`flex border border-gray-700 w-32 h-32 group items-center justify-center ${
                  !gameState.isPlaying && isCurrentPlayerCell(i)
                    ? playerActiveStyle[gameState.currentPlayer]
                    : ''
                } ${
                  gameState.isPlaying && gameState.cursor === i
                    ? '!bg-purple-200'
                    : ''
                } ${!isPlayerCell(i, 1) ? 'hidden' : 'flex'}`}
              >
                <div className="flex items-center justify-center">
                  {!gameState.isPlaying &&
                    isCurrentPlayerCell(i) &&
                    cell > 0 && (
                      <button
                        className="border hidden group-hover:block"
                        onClick={() => selectPlayDirection(i, 1)}
                      >{`<`}</button>
                    )}
                  <span className="p-2">{cell}</span>
                  {!gameState.isPlaying &&
                    isCurrentPlayerCell(i) &&
                    cell > 0 && (
                      <button
                        className="border hidden group-hover:block"
                        onClick={() => selectPlayDirection(i, -1)}
                      >{`>`}</button>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div
          className={`flex items-center justify-center border border-gray-700 w-32 h-64 ${
            gameState.isPlaying && gameState.cursor === 6
              ? '!bg-purple-200'
              : ''
          }`}
        >
          <div className="min-w-max flex flex-col">
            <span>{`Quan: ${calQuan(gameState.table[6])}`}</span>
            <span>{`Dân: ${calDan(gameState.table[6])}`}</span>
          </div>
        </div>
      </div>
      <button className="mt-20" onClick={() => resetGame()}>
        Reset Game
      </button>
    </>
  );
}

export default App;
