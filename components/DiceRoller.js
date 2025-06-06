// --- Start of components/DiceRoller.js content ---
const DiceRoller = ({ diceRollHistory, setDiceRollHistory, addLogEntry }) => {
  const [diceCommand, setDiceCommand] = React.useState('1d20');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [isHistoryExpanded, setIsHistoryExpanded] = React.useState(false);

  const handleRollDice = React.useCallback(async () => {
    if (!diceCommand.trim()) {
      setError("ダイスコマンドを入力してください。");
      if (typeof addLogEntry === 'function') {
          addLogEntry("ダイスロール試行: コマンドが空です。", 'normal', { color: THEME_SPECIFIC_PLAYLOG_COLORS[document.documentElement.className.includes('dark') ? 'dark' : document.documentElement.className.replace('theme-','') || 'light']?.yellow || '#facc15' });
      } else {
          console.error("DiceRoller: addLogEntry is not a function (when command is empty).");
      }
      return;
    }

    setIsLoading(true);
    setError(null);
    
    await new Promise(resolve => setTimeout(resolve, 50)); 

    const result = parseAndRollDice(diceCommand);

    if (typeof addLogEntry !== 'function') {
        console.error("DiceRoller: addLogEntry is not a function before processing roll result.");
        setError("内部エラー: ログ機能が利用できません。"); 
        setIsLoading(false);
        return;
    }

    if ('error' in result) {
      setError(result.error);
      addLogEntry(`ダイスロールエラー (${diceCommand}): ${result.error}`, 'normal', { color: THEME_SPECIFIC_PLAYLOG_COLORS[document.documentElement.className.includes('dark') ? 'dark' : document.documentElement.className.replace('theme-','') || 'light']?.red || '#f87171' });
    } else {
      const newRoll = {
        id: crypto.randomUUID(),
        command: result.command,
        individualRolls: result.individualRolls,
        total: result.total,
        timestamp: new Date().toISOString(),
        isD66: result.isD66 || false,
      };

      setDiceRollHistory(prev => [newRoll, ...prev.slice(0, 19)]);
      
      let rollDetailsString = newRoll.individualRolls.join(', ');
      if (newRoll.isD66) {
        rollDetailsString = `${newRoll.individualRolls[0]}, ${newRoll.individualRolls[1]}`;
      }
      
      addLogEntry(`ダイスロール (${newRoll.command}): ${newRoll.total} (${rollDetailsString})`);
    }
    setIsLoading(false);
  }, [diceCommand, addLogEntry, setDiceRollHistory, setError, setIsLoading]);


  const handleSubmit = (e) => {
    e.preventDefault();
    handleRollDice().catch(err => {
        console.error("Error during dice roll execution:", err);
        setError("ダイスロール中に予期せぬエラーが発生しました。");
        setIsLoading(false); 
        if (typeof addLogEntry === 'function') {
            addLogEntry(`重大なダイスロールエラー: ${err.message || '不明なエラー'}`, 'normal', { color: THEME_SPECIFIC_PLAYLOG_COLORS[document.documentElement.className.includes('dark') ? 'dark' : document.documentElement.className.replace('theme-','') || 'light']?.red || '#f87171' });
        } else {
            console.error("DiceRoller: addLogEntry is not a function (during critical error handling).");
        }
    });
  };

  return React.createElement('div', { className: "bg-slate-800 p-3 sm:p-4 rounded-lg shadow-lg" },
    React.createElement('h3', { className: "text-lg sm:text-xl font-semibold mb-3 text-sky-400" }, "ダイスローラー"),
    React.createElement('form', { onSubmit: handleSubmit, className: "flex gap-2 mb-3" },
      React.createElement('input', ({
        type: "text",
        value: diceCommand,
        onChange: (e) => setDiceCommand(e.target.value),
        placeholder: "例: 2d6+3, 1d100, 4dF, d66",
        className: "flex-1 p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-sm disabled:opacity-50",
        disabled: isLoading,
        'aria-label': "ダイスコマンド入力"
      })),
      React.createElement('button', ({
        type: "submit",
        className: "px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center",
        disabled: isLoading,
        title: "ダイスを振る",
        'aria-label': "ダイスを振る"
      }),
        isLoading ? React.createElement(LoadingSpinner, { size: "sm" }) : React.createElement(React.Fragment, null, 
            React.createElement(CubeIcon, { className: "w-5 h-5 mr-1 sm:mr-2" }), 
            React.createElement('span', {className: "hidden sm:inline"}, "振る"), 
            React.createElement(SendIcon, {className: "w-4 h-4 sm:hidden"})
        )
      )
    ),
    error && React.createElement('div', { role: "alert", className: "mb-2 p-2 bg-red-900/50 border border-red-700 rounded-md text-red-300 text-xs flex items-start gap-2" },
      React.createElement(AlertTriangleIcon, { className: "w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" }),
      React.createElement('span', null, error)
    ),
    diceRollHistory.length > 0 && React.createElement('div', null,
      React.createElement('button', ({ 
        onClick: () => setIsHistoryExpanded(!isHistoryExpanded), 
        className: "text-sm text-slate-400 hover:text-slate-300 flex items-center gap-1 mb-1",
        'aria-expanded': isHistoryExpanded,
        'aria-controls': "dice-roll-history-list"
      }),
        "ロール履歴 ", isHistoryExpanded ? React.createElement(ChevronUpIcon, { className: "w-4 h-4" }) : React.createElement(ChevronDownIcon, { className: "w-4 h-4" }), ` (${diceRollHistory.length})`
      ),
      isHistoryExpanded && React.createElement('div', { id: "dice-roll-history-list", className: "max-h-40 overflow-y-auto space-y-1 bg-slate-700/70 p-2 rounded custom-scrollbar text-xs" },
        diceRollHistory.map(roll => (
          React.createElement('div', { key: roll.id, className: "border-b border-slate-600 pb-1 mb-1 last:border-b-0 last:mb-0" },
            React.createElement('span', { className: "font-semibold text-teal-300" }, `${roll.command}: `),
            React.createElement('span', { className: "text-slate-200" }, roll.total),
            React.createElement('span', { className: "text-slate-400 ml-1" }, 
              roll.isD66 ? `(${roll.individualRolls[0]}, ${roll.individualRolls[1]})` : `(${roll.individualRolls.join(', ')})`
            ),
            React.createElement('span', { className: "text-slate-500 text-xxs block" }, new Date(roll.timestamp).toLocaleTimeString())
          )
        ))
      )
    )
  );
};
// --- End of components/DiceRoller.js content ---
