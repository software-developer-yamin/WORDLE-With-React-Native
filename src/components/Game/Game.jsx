import * as Clipboard from "expo-clipboard";
import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { CLEAR, colors, colorsToEmoji, ENTER } from "../../constants";
import { copyArray, getDayOfTheYear } from "../../utils";
import words from "../../words";
import Keyboard from "../Keyboard";
import styles from "./GameStyles";

const NUMBER_OF_TRIES = 6;

const dayOfTheYear = getDayOfTheYear();

const Game = () => {
  const word = words[dayOfTheYear];
  const letters = word.split("");

  const [rows, setRows] = useState(
    new Array(NUMBER_OF_TRIES).fill(new Array(letters.length).fill(""))
  );
  const [curRow, setCurRow] = useState(0);
  const [curCol, setCurCol] = useState(0);
  const [gameState, setGameState] = useState(""); // won, lost and playing

  useEffect(() => {
    if (curRow > 0) {
      checkGameState();
    }
  }, [curRow]);

  const checkGameState = () => {
    if (checkIfWon() && gameState !== "won") {
      Alert.alert("Congratulations!", "You have won!", [
        { text: "Share", onPress: shareScore },
      ]);
      setGameState("won");
    } else if (checkIfLost() && gameState !== "lost") {
      Alert.alert("You lost!", "Please try again next time!");
      setGameState("lost");
    }
  };

  const shareScore = () => {
    const textMap = rows
      .map((row, i) =>
        row.map((cell, j) => colorsToEmoji[getCellBGColor(i, j)]).join("")
      )
      .filter((row) => row)
      .join("\n");
    const textToScore = `Wordle \n${textMap}`;
    Clipboard.setString(textToScore);
    Alert.alert("Copied successfully", "Share your score on you social media");
  };

  const checkIfWon = () => {
    const row = rows[curRow - 1];
    return row.every((letter, i) => letter === letters[i]);
  };

  const checkIfLost = () => !checkIfWon() && curRow === rows.length;

  const onKeyPressed = (key) => {
    const updatedRows = copyArray(rows);

    if (key === CLEAR) {
      const prevCol = curCol - 1;
      if (prevCol >= 0) {
        updatedRows[curRow][prevCol] = "";
        setRows(updatedRows);
        setCurCol(prevCol);
      }
      return;
    }

    if (key === ENTER) {
      if (curCol === rows[0].length) {
        setCurRow(curRow + 1);
        setCurCol(0);
      }
      return;
    }

    if (curCol < rows[0].length) {
      updatedRows[curRow][curCol] = key;
      setRows(updatedRows);
      setCurCol(curCol + 1);
    }
  };

  const isCellActive = (row, cell) => row === curRow && cell === curCol;

  const getCellBGColor = (row, col) => {
    const letter = rows[row][col];

    if (row >= curRow) return colors.black;

    if (letter === letters[col]) return colors.primary;

    if (letters.includes(letter)) return colors.secondary;

    return colors.darkgrey;
  };

  const getAllLettersWithColor = (color) =>
    rows.flatMap((row, i) =>
      row.filter((cell, j) => getCellBGColor(i, j) === color)
    );

  const greenCaps = getAllLettersWithColor(colors.primary);
  const yellowCaps = getAllLettersWithColor(colors.secondary);
  const grayCaps = getAllLettersWithColor(colors.darkgrey);

  return (
    <>
      <ScrollView style={styles.map}>
        {rows.map((row, i) => (
          <View key={`row-${i}`} style={styles.row}>
            {row.map((letter, j) => (
              <View
                key={`cell-${i}-${j}`}
                style={[
                  styles.cell,
                  {
                    borderColor: isCellActive(i, j)
                      ? colors.grey
                      : colors.darkgrey,
                    backgroundColor: getCellBGColor(i, j),
                  },
                ]}
              >
                <Text style={styles.cellText}>{letter.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      <Keyboard
        onKeyPressed={onKeyPressed}
        greenCaps={greenCaps}
        yellowCaps={yellowCaps}
        greyCaps={grayCaps}
      />
    </>
  );
};

export default Game;
