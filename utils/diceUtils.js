// --- Start of utils/diceUtils.js content ---

const parseAndRollDice = (command) => {
  const originalCommand = command.trim();
  const lowerCommand = originalCommand.toLowerCase();

  const fatePattern = /^(\d*)d[fF]$/;
  const standardPattern = /^(\d*)d(\d+)(?:([+\-])(\d+))?$/;
  const d66Pattern = /^d66$/i; // Case insensitive d66

  let match = lowerCommand.match(d66Pattern);
  if (match) {
    const roll1 = Math.floor(Math.random() * 6) + 1;
    const roll2 = Math.floor(Math.random() * 6) + 1;
    // Ensure rolls are ordered if necessary by game system, typically smaller die first for d66 for a 11-66 range.
    // However, some systems might treat 1,5 as 15 and 5,1 as 51. Here, we'll assume simple concatenation.
    // For a typical d66 that generates a number from 11 to 66, where the first die is tens and second is units:
    const total = parseInt(String(roll1) + String(roll2)); 
    return { command: originalCommand, individualRolls: [roll1, roll2], total, isD66: true };
  }

  match = lowerCommand.match(fatePattern);
  if (match) {
    const numDiceStr = match[1];
    const numDice = numDiceStr ? parseInt(numDiceStr) : 1;

    if (numDice <= 0 || numDice > 100) {
      return { error: "ダイスの数は1から100の間でなければなりません。" };
    }
    
    const individualRolls = Array(numDice).fill(0).map(() => Math.floor(Math.random() * 3) - 1);
    const total = individualRolls.reduce((sum, roll) => sum + roll, 0);
    return { command: originalCommand, individualRolls, total };
  }

  match = lowerCommand.match(standardPattern);
  if (match) {
    const numDiceStr = match[1];
    const sidesStr = match[2];
    const operator = match[3];
    const modifierStr = match[4];

    const numDice = numDiceStr ? parseInt(numDiceStr) : 1;
    const sides = parseInt(sidesStr);
    const modifier = modifierStr ? parseInt(modifierStr) : 0;

    if (numDice <= 0 || numDice > 100) {
      return { error: "ダイスの数は1から100の間でなければなりません。" };
    }
    if (sides <= 1 || sides > 1000) {
      return { error: "ダイスの面は2から1000の間でなければなりません。" };
    }
    if (modifier < 0 || modifier > 1000 ) {
        return { error: "修正値は0から1000の間でなければなりません。"}
    }

    const individualRolls = Array(numDice).fill(0).map(() => Math.floor(Math.random() * sides) + 1);
    let total = individualRolls.reduce((sum, roll) => sum + roll, 0);

    if (operator === '+') {
      total += modifier;
    } else if (operator === '-') {
      total -= modifier;
    }
    return { command: originalCommand, individualRolls, total };
  }

  return { error: "無効なダイスコマンド形式です。例: 2d6, d20+3, 4dF, d66" };
};
// --- End of utils/diceUtils.js content ---
