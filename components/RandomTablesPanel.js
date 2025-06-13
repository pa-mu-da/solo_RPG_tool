
// --- Start of components/RandomTablesPanel.js content ---
const matchRollToEntry = (total, rollValueStr) => {
  if (!rollValueStr || rollValueStr.trim() === '') return false;

  const trimmedStr = rollValueStr.trim();
  const rangeMatch = trimmedStr.match(/^(\d+)-(\d+)$/);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1], 10);
    const max = parseInt(rangeMatch[2], 10);
    return total >= min && total <= max;
  }
  const plusMatch = trimmedStr.match(/^(\d+)\+$/);
  if (plusMatch) {
    const min = parseInt(plusMatch[1], 10);
    return total >= min;
  }
  const minusMatch = trimmedStr.match(/^(\d+)-$/);
  if (minusMatch) {
    const max = parseInt(minusMatch[1], 10);
    return total <= max;
  }
  const exactMatch = trimmedStr.match(/^(\d+)$/);
  if (exactMatch) {
    const val = parseInt(exactMatch[1], 10);
    return total === val;
  }
  return false; 
};

const RandomTablesPanel = ({ tables, setTables, addLogEntry, currentTheme }) => {
  const [selectedTableId, setSelectedTableId] = React.useState(null);
  const [rollResult, setRollResult] = React.useState(null);
  const [rollDetails, setRollDetails] = React.useState(null);
  const fileInputRef = React.useRef(null);
  const [editingTableNameId, setEditingTableNameId] = React.useState(null);
  const [tableNameInput, setTableNameInput] = React.useState("");
  const [editingDiceCmdId, setEditingDiceCmdId] = React.useState(null);
  const [diceCmdInput, setDiceCmdInput] = React.useState("");
  const [editingEntry, setEditingEntry] = React.useState({ tableId: null, entryId: null, rollValue: '', value: '' });

  // For log formatting settings
  const [currentLogTextColor, setCurrentLogTextColor] = React.useState(getDefaultLogTextColorForTheme(currentTheme));
  const [currentLogTextBold, setCurrentLogTextBold] = React.useState(false);


  React.useEffect(() => {
    if (tables && tables.length > 0) {
      const currentSelectionExists = tables.some(t => t.id === selectedTableId);
      if (!selectedTableId || !currentSelectionExists) { 
        const firstTable = tables[0];
        setSelectedTableId(firstTable.id);
        setCurrentLogTextColor(firstTable.logTextColor || getDefaultLogTextColorForTheme(currentTheme));
        setCurrentLogTextBold(firstTable.logTextBold || false);
        setRollResult(null); 
        setRollDetails(null);
        setEditingTableNameId(null);
        setEditingDiceCmdId(null);
        cancelEditEntry(); 
      } else {
        // Update format controls if selected table changes
        const currentTable = tables.find(t => t.id === selectedTableId);
        if (currentTable) {
          setCurrentLogTextColor(currentTable.logTextColor || getDefaultLogTextColorForTheme(currentTheme));
          setCurrentLogTextBold(currentTable.logTextBold || false);
        }
      }
    } else { 
      if (selectedTableId !== null) {
        setSelectedTableId(null);
        setCurrentLogTextColor(getDefaultLogTextColorForTheme(currentTheme));
        setCurrentLogTextBold(false);
        setRollResult(null); 
        setRollDetails(null);
        setEditingTableNameId(null); 
        setEditingDiceCmdId(null);
        cancelEditEntry();
      }
    }
  }, [tables, selectedTableId, currentTheme]); 

  React.useEffect(() => {
    const table = tables.find(t => t.id === selectedTableId);
    if (table) {
        if (editingTableNameId !== table.id) {
            setTableNameInput(table.name);
        }
        if (editingDiceCmdId !== table.id) {
            setDiceCmdInput(table.diceCommand || "");
        }
        // These are now handled in the effect above to avoid conflicts when table selection changes
        // setCurrentLogTextColor(table.logTextColor || getDefaultLogTextColorForTheme(currentTheme));
        // setCurrentLogTextBold(table.logTextBold || false);
    } else {
        setTableNameInput("");
        setDiceCmdInput("");
        setEditingTableNameId(null); 
        setEditingDiceCmdId(null);
    }
  }, [selectedTableId, tables, editingTableNameId, editingDiceCmdId, currentTheme]);

  const handleLogTextColorChange = (newColor) => {
    setCurrentLogTextColor(newColor);
    if (selectedTableId) {
      setTables(prev => prev.map(t => t.id === selectedTableId ? { ...t, logTextColor: newColor } : t));
    }
  };

  const handleLogTextBoldChange = (isBold) => {
    setCurrentLogTextBold(isBold);
    if (selectedTableId) {
      setTables(prev => prev.map(t => t.id === selectedTableId ? { ...t, logTextBold: isBold } : t));
    }
  };

  const handleImportCSV = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      parseCSV(file)
        .then((parsedData) => { 
          if (parsedData.entries.length === 0) {
            alert("CSVファイルが空か、有効なデータが含まれていません。");
            return;
          }
          const newTable = {
            id: crypto.randomUUID(),
            name: file.name.replace(/\.csv$/i, '') || `新規テーブル ${tables.length + 1}`,
            diceCommand: parsedData.diceCommand,
            entries: parsedData.entries.map((entry) => ({ 
              id: crypto.randomUUID(),
              value: entry.value,
              rollValue: entry.rollValue,
            })),
            logTextColor: getDefaultLogTextColorForTheme(currentTheme),
            logTextBold: false,
          };
          setTables(prevTables => [...prevTables, newTable]);
          alert(`テーブル「${newTable.name}」がインポートされました。${parsedData.diceCommand ? `ダイスコマンド: ${parsedData.diceCommand}` : ''}`);
        })
        .catch(error => {
          console.error("CSVの解析に失敗しました:", error);
          alert(`CSVの解析に失敗しました: ${error.message}`);
        });
      if (event.target) event.target.value = ''; 
    }
  };

  const handleRollTable = () => {
    if (!selectedTableId) return;
    const table = tables.find(t => t.id === selectedTableId);
    if (!table || table.entries.length === 0) {
      setRollResult("テーブルが空か、選択されていません。");
      setRollDetails(null);
      return;
    }

    setRollResult(null);
    setRollDetails(null);
    
    if (typeof addLogEntry !== 'function') {
        console.error("RandomTablesPanel: addLogEntry is not a function.");
        setRollResult("内部エラー: ログ機能が利用できません。");
        return;
    }
    
    const logStyle = { 
        color: table.logTextColor || getDefaultLogTextColorForTheme(currentTheme), 
        bold: table.logTextBold || false 
    };

    if (table.diceCommand) {
      const diceRoll = parseAndRollDice(table.diceCommand);
      if ('error' in diceRoll) { 
        setRollResult(`ダイスエラー: ${diceRoll.error}`);
        addLogEntry(`ランダムテーブル「${table.name}」ダイスエラー (${table.diceCommand}): ${diceRoll.error}`, 'normal', { color: THEME_SPECIFIC_PLAYLOG_COLORS[currentTheme]?.red || '#f87171' });
        return;
      }

      const matchingEntries = table.entries.filter(entry => matchRollToEntry(diceRoll.total, entry.rollValue));
      
      if (matchingEntries.length > 0) {
        const resultEntry = matchingEntries[Math.floor(Math.random() * matchingEntries.length)];
        setRollDetails({
          command: table.diceCommand,
          rolls: diceRoll.individualRolls,
          total: diceRoll.total,
          resultValue: resultEntry.value
        });
        addLogEntry(`ランダムテーブル「${table.name}」 (${table.diceCommand} -> ${diceRoll.total}): ${resultEntry.value}`, 'normal', logStyle);
      } else {
        setRollDetails({
          command: table.diceCommand,
          rolls: diceRoll.individualRolls,
          total: diceRoll.total,
          resultValue: "該当なし"
        });
        addLogEntry(`ランダムテーブル「${table.name}」 (${table.diceCommand} -> ${diceRoll.total}): 該当なし`, 'normal', { ...logStyle, color: THEME_SPECIFIC_PLAYLOG_COLORS[currentTheme]?.yellow || '#facc15' });
      }
    } else {
      const randomIndex = Math.floor(Math.random() * table.entries.length);
      const result = table.entries[randomIndex].value;
      setRollResult(result);
      addLogEntry(`ランダムテーブル「${table.name}」の結果: ${result}`, 'normal', logStyle);
    }
  };

  const handleAddTable = () => {
    const newTableName = prompt("新しいテーブル名を入力してください:", `新規テーブル ${tables.length + 1}`);
    if (newTableName) {
      const newTable = {
        id: crypto.randomUUID(),
        name: newTableName,
        entries: [{ id: crypto.randomUUID(), value: "サンプル項目1", rollValue: "" }],
        diceCommand: "",
        logTextColor: getDefaultLogTextColorForTheme(currentTheme),
        logTextBold: false,
      };
      setTables(prev => [...prev, newTable]);
    }
  };

  const handleDeleteTable = (tableIdToDelete) => {
    // window.confirm removed
    setTables(prev => prev.filter(t => t.id !== tableIdToDelete));
  };
  
  const startEditTableName = (table) => {
    setEditingTableNameId(table.id);
    setTableNameInput(table.name);
    setEditingDiceCmdId(null); 
    cancelEditEntry(); 
  };

  const handleTableNameBlur = (tableId) => {
    const currentTable = tables.find(t => t.id === tableId);
    if (tableNameInput.trim() === "") {
      alert("テーブル名は空にできません。");
      if (currentTable) setTableNameInput(currentTable.name); 
      return;
    }
    if (currentTable && tableNameInput.trim() !== currentTable.name) {
        setTables(prev => prev.map(t => t.id === tableId ? { ...t, name: tableNameInput.trim() } : t));
    }
  };
  
  const saveTableNameAndExitEdit = (tableId) => {
    if (tableNameInput.trim() === "") {
        alert("テーブル名は空にできません。");
        return;
    }
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, name: tableNameInput.trim() } : t));
    setEditingTableNameId(null);
  }
  
  const cancelEditTableName = () => {
    const table = tables.find(t => t.id === editingTableNameId);
    if (table) setTableNameInput(table.name);
    setEditingTableNameId(null);
  };

  const startEditDiceCmd = (table) => {
    setEditingDiceCmdId(table.id);
    setDiceCmdInput(table.diceCommand || "");
    setEditingTableNameId(null); 
    cancelEditEntry(); 
  };
  
  const handleDiceCmdBlur = (tableId) => {
    const currentTable = tables.find(t => t.id === tableId);
    if (currentTable && diceCmdInput.trim() !== (currentTable.diceCommand || "")) {
        setTables(prev => prev.map(t => t.id === tableId ? { ...t, diceCommand: diceCmdInput.trim() } : t));
    }
  };

  const saveDiceCmdAndExitEdit = (tableId) => {
     setTables(prev => prev.map(t => t.id === tableId ? { ...t, diceCommand: diceCmdInput.trim() } : t));
    setEditingDiceCmdId(null);
  }

  const cancelEditDiceCmd = () => {
    const table = tables.find(t => t.id === editingDiceCmdId);
    if (table) setDiceCmdInput(table.diceCommand || "");
    setEditingDiceCmdId(null);
  };

  const handleAddEntry = (tableId) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    let newRollValue = "";
    let newValue = "新しい項目";

    if (table.diceCommand) {
        const rollVal = prompt("新しい項目の出目/範囲を入力してください (例: 7, 2-5, 10+):");
        if (rollVal === null) return;
        newRollValue = rollVal;
        const val = prompt("新しい項目の内容を入力してください:");
        if (val === null) return;
        newValue = val;
    } else {
        const val = prompt("新しい項目を入力してください:");
        if (val === null) return;
        newValue = val;
    }
    
    setTables(prev => prev.map(t => {
      if (t.id === tableId) {
        const newEntry = { 
            id: crypto.randomUUID(), 
            value: newValue, 
            rollValue: newRollValue || undefined 
        };
        return { ...t, entries: [...t.entries, newEntry] };
      }
      return t;
    }));
  };

  const startEditEntry = (tableId, entry) => {
    setEditingEntry({ tableId, entryId: entry.id, rollValue: entry.rollValue || '', value: entry.value });
    setEditingTableNameId(null); 
    setEditingDiceCmdId(null);
  };

  const handleEditingEntryChange = (field, value) => {
    setEditingEntry(prev => ({ ...prev, [field]: value }));
  };
  
  const saveEditEntry = () => {
    if (!editingEntry.tableId || !editingEntry.entryId) return;
    if (editingEntry.value.trim() === "") {
        alert("項目内容は空にできません。");
        return;
    }
    const table = tables.find(t => t.id === editingEntry.tableId);
    if (table && table.diceCommand && editingEntry.rollValue.trim() === "") {
        alert("ダイスコマンドが設定されているテーブルでは、出目/範囲は空にできません。");
        return;
    }

    setTables(prev => prev.map(t => {
      if (t.id === editingEntry.tableId) {
        return { 
          ...t, 
          entries: t.entries.map(e => 
            e.id === editingEntry.entryId 
            ? { ...e, value: editingEntry.value.trim(), rollValue: editingEntry.rollValue.trim() || undefined } 
            : e
          ) 
        };
      }
      return t;
    }));
    setEditingEntry({ tableId: null, entryId: null, rollValue: '', value: '' });
  };
  
  const cancelEditEntry = () => {
    setEditingEntry({ tableId: null, entryId: null, rollValue: '', value: '' });
  };

  const handleDeleteEntry = (tableId, entryId) => {
    // window.confirm removed
    setTables(prev => prev.map(t => {
        if (t.id === tableId) {
        return { ...t, entries: t.entries.filter(e => e.id !== entryId) };
        }
        return t;
    }));
  };

  const selectedTable = tables.find(t => t.id === selectedTableId);

  return React.createElement('div', { className: "bg-slate-800 p-3 sm:p-4 rounded-lg shadow-lg" },
    React.createElement('h3', { className: "text-lg sm:text-xl font-semibold mb-3 text-sky-400" }, "ランダムテーブル"),
    React.createElement('div', { className: "flex gap-2 mb-3" },
      React.createElement('button', ({
        onClick: () => fileInputRef.current?.click(),
        className: "flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium rounded-md transition-colors"
      }),
        React.createElement(UploadIcon, { className: "w-4 h-4" }), " CSVインポート"
      ),
      React.createElement('input', ({ type: "file", accept: ".csv", ref: fileInputRef, onChange: handleImportCSV, className: "hidden" })),
      React.createElement('button', ({
        onClick: handleAddTable,
        className: "px-3 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-md transition-colors",
        title: "新しいテーブルを追加"
      }),
        React.createElement(PlusIcon, { className: "w-4 h-4" })
      )
    ),
    tables.length > 0 && React.createElement('div', { className: "mb-3" },
      React.createElement('label', { htmlFor: "tableSelect", className: "block text-sm font-medium text-slate-300 mb-1" }, "テーブル選択"),
      React.createElement('select', ({
        id: "tableSelect",
        value: selectedTableId || '',
        onChange: (e) => { 
            const newSelectedId = e.target.value;
            setSelectedTableId(newSelectedId); 
            // The useEffect for [tables, selectedTableId] will update formatting controls
        },
        className: "w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-sm"
      }),
        tables.map(table => React.createElement('option', { key: table.id, value: table.id }, table.name))
      )
    ),
    selectedTable && React.createElement('div', { className: "mb-3 p-2 border border-slate-700 rounded-md" },
      React.createElement('div', { className: "flex justify-between items-center mb-1" },
        editingTableNameId === selectedTable.id ? (
            React.createElement('div', {className: "flex items-center gap-1 w-full"},
                React.createElement('input', ({ 
                    type: "text", 
                    value: tableNameInput, 
                    onChange: (e) => setTableNameInput(e.target.value),
                    onBlur: () => handleTableNameBlur(selectedTable.id),
                    onKeyDown: (e) => e.key === 'Enter' ? saveTableNameAndExitEdit(selectedTable.id) : e.key === 'Escape' ? cancelEditTableName() : null,
                    className: "flex-grow text-md font-semibold bg-slate-600 text-sky-300 focus:ring-1 focus:ring-sky-500 rounded px-1 py-0.5",
                    autoFocus: true
                })),
                React.createElement('button', ({ onClick: () => saveTableNameAndExitEdit(selectedTable.id), className: "p-1 text-green-400 hover:text-green-300", title: "保存"}), React.createElement(SaveIcon, {className: "w-4 h-4"})),
            )
        ) : (
            React.createElement('h4', ({ 
                className: "text-md font-semibold text-sky-300 cursor-pointer hover:bg-slate-600 px-1 py-0.5 rounded truncate",
                onClick: () => startEditTableName(selectedTable),
                title: `テーブル名を編集: ${selectedTable.name}`
            }), selectedTable.name)
        ),
        React.createElement('button', ({
            onClick: () => handleDeleteTable(selectedTable.id),
            className: "p-1 text-red-400 hover:text-red-300 ml-2 flex-shrink-0",
            title: "このテーブルを削除"
        }),
            React.createElement(TrashIcon, { className: "w-4 h-4" })
        )
      ),
      React.createElement('div', { className: "flex items-center gap-2 mb-1 text-xs" },
        React.createElement('span', {className: "text-slate-400"}, "ダイスコマンド:"),
        editingDiceCmdId === selectedTable.id ? (
            React.createElement('div', {className: "flex items-center gap-1 w-full"},
                React.createElement('input', ({ 
                    type: "text", 
                    value: diceCmdInput, 
                    onChange: (e) => setDiceCmdInput(e.target.value),
                    onBlur: () => handleDiceCmdBlur(selectedTable.id),
                    onKeyDown: (e) => e.key === 'Enter' ? saveDiceCmdAndExitEdit(selectedTable.id) : e.key === 'Escape' ? cancelEditDiceCmd() : null,
                    className: "flex-grow bg-slate-600 text-slate-200 focus:ring-1 focus:ring-sky-500 rounded px-1 py-0.5 text-xs",
                    placeholder: "例: 2d6, 1d100+10",
                    autoFocus: true
                })),
                 React.createElement('button', ({ onClick: () => saveDiceCmdAndExitEdit(selectedTable.id), className: "p-1 text-green-400 hover:text-green-300", title: "保存"}), React.createElement(SaveIcon, {className: "w-3 h-3"})),
            )
        ) : (
             React.createElement('span', ({
                className: `text-slate-200 cursor-pointer hover:bg-slate-600 px-1 py-0.5 rounded truncate ${!selectedTable.diceCommand ? 'italic text-slate-500' : ''}`,
                onClick: () => startEditDiceCmd(selectedTable),
                title: "ダイスコマンドを編集"
             }), selectedTable.diceCommand || "設定なし (項目数でロール)")
        )
      ),
      React.createElement('div', { className: "flex items-center gap-2 mb-2 text-xs" },
        React.createElement('label', { htmlFor: `tableLogColor-${selectedTable.id}`, className: "text-slate-400" }, "ログ文字色:"),
        React.createElement('input', ({
          type: "color",
          id: `tableLogColor-${selectedTable.id}`,
          value: currentLogTextColor,
          onChange: (e) => handleLogTextColorChange(e.target.value),
          className: "p-0.5 h-6 w-8 bg-slate-600 border border-slate-500 rounded cursor-pointer"
        })),
        React.createElement('label', { htmlFor: `tableLogBold-${selectedTable.id}`, className: "text-slate-400 ml-2 flex items-center gap-1 cursor-pointer" },
          React.createElement('input', ({
            type: "checkbox",
            id: `tableLogBold-${selectedTable.id}`,
            checked: currentLogTextBold,
            onChange: (e) => handleLogTextBoldChange(e.target.checked),
            className: "form-checkbox h-3.5 w-3.5 text-sky-500 bg-slate-600 border-slate-500 rounded focus:ring-sky-500 cursor-pointer"
          })),
          "太字"
        )
      ),
      React.createElement('div', { className: "max-h-48 overflow-y-auto custom-scrollbar space-y-1 pr-1 mb-2" },
        selectedTable.entries.map((entry) => (
          editingEntry.tableId === selectedTable.id && editingEntry.entryId === entry.id ? (
            React.createElement('div', { key: entry.id, className: "p-1.5 bg-slate-500 rounded" },
              selectedTable.diceCommand && React.createElement('input', ({
                type: "text",
                value: editingEntry.rollValue,
                onChange: (e) => handleEditingEntryChange('rollValue', e.target.value),
                placeholder: "出目/範囲",
                className: "w-full p-1 text-xs bg-slate-600 border border-slate-400 rounded-sm focus:ring-1 focus:ring-sky-500 mb-1"
              })),
              React.createElement('textarea', ({
                value: editingEntry.value,
                onChange: (e) => handleEditingEntryChange('value', e.target.value),
                placeholder: "項目内容",
                className: "w-full p-1 text-xs bg-slate-600 border border-slate-400 rounded-sm focus:ring-1 focus:ring-sky-500 resize-y custom-scrollbar",
                rows: Math.max(1, editingEntry.value.split('\n').length)
              })),
              React.createElement('div', {className: "flex gap-1 mt-1"},
                React.createElement('button', ({onClick: saveEditEntry, className: "px-2 py-0.5 text-xs bg-green-600 hover:bg-green-500 text-white rounded"}), "保存"),
                React.createElement('button', ({onClick: cancelEditEntry, className: "px-2 py-0.5 text-xs bg-slate-600 hover:bg-slate-400 text-white rounded"}), "キャンセル")
              )
            )
          ) : (
            React.createElement('div', { key: entry.id, className: "flex items-start gap-1 group p-0.5 hover:bg-slate-600/50 rounded" },
              selectedTable.diceCommand && React.createElement('span', { 
                  className: "w-16 text-left text-xs text-slate-400 p-1 border border-transparent rounded-sm truncate flex-shrink-0",
                  title: entry.rollValue 
              }, entry.rollValue || '-'),
              React.createElement('span', { 
                  className: "flex-grow p-1 text-xs text-slate-200 whitespace-pre-wrap break-words border border-transparent rounded-sm",
                  style: { overflowWrap: 'anywhere', wordBreak: 'break-all' } 
              }, entry.value),
              React.createElement('div', { className: "flex flex-col items-center opacity-20 group-hover:opacity-100 transition-opacity ml-auto flex-shrink-0" },
                React.createElement('button', ({ 
                    onClick: () => startEditEntry(selectedTable.id, entry),
                    className: "p-0.5 text-sky-400 hover:text-sky-300",
                    title: "この項目を編集"
                }), React.createElement(EditIcon, { className: "w-3 h-3" })),
                React.createElement('button', ({
                    onClick: () => handleDeleteEntry(selectedTable.id, entry.id),
                    className: "p-0.5 text-red-500 hover:text-red-400",
                    title: "この項目を削除"
                }), React.createElement(TrashIcon, { className: "w-3 h-3" }))
              )
            )
          )
        ))
      ),
      React.createElement('button', ({
        onClick: () => handleAddEntry(selectedTable.id),
        className: "mt-1 w-full flex items-center justify-center gap-1 px-2 py-1 bg-sky-700 hover:bg-sky-600 text-white text-xs font-medium rounded-md transition-colors"
      }),
        React.createElement(PlusIcon, { className: "w-3 h-3" }), " 項目追加"
      )
    ),
    selectedTable && React.createElement('button', ({
      onClick: handleRollTable,
      disabled: !selectedTableId || !selectedTable || selectedTable.entries.length === 0,
      className: "w-full flex items-center justify-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    }),
      React.createElement(CubeIcon, { className: "w-5 h-5" }), ` ${selectedTable ? `「${selectedTable.name}」を振る` : "テーブルを振る"}`
    ),
    (rollResult || rollDetails) && React.createElement('div', { className: "mt-3 p-2 bg-slate-700 rounded-md" },
      React.createElement('p', { className: "text-sm text-slate-300" }, "結果:"),
      rollDetails ? (
        React.createElement('div', null,
          React.createElement('p', { className: "text-xs text-slate-400" }, 
            `${rollDetails.command} -> ロール: ${rollDetails.rolls.join(', ')} = 合計: ${rollDetails.total}`
          ),
          React.createElement('p', { className: "font-semibold text-teal-300 text-md whitespace-pre-wrap break-words" }, rollDetails.resultValue)
        )
      ) : (
        React.createElement('p', { className: "font-semibold text-teal-300 text-md whitespace-pre-wrap break-words" }, rollResult)
      )
    ),
    tables.length === 0 && React.createElement('p', { className: "text-sm text-slate-400 text-center mt-2" }, "テーブルがありません。CSVをインポートするか、新規作成してください。")
  );
};
// --- End of components/RandomTablesPanel.js content ---
