
// --- Start of components/PlayLog.js content ---
const PlayLogEntryItem = ({ 
  entry, 
  isActuallyEditing,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  editingText, 
  setEditingText, 
  editingStyle, 
  setEditingStyle,
  currentTheme 
}) => {
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (isActuallyEditing) {
      const timerId = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const currentValLength = inputRef.current.value.length;
          inputRef.current.setSelectionRange(currentValLength, currentValLength);
        }
      }, 0);
      return () => clearTimeout(timerId);
    }
  }, [isActuallyEditing]);

  const handleSave = () => {
    if (editingText.trim() === '') {
        alert("内容は空にできません。");
        return;
    }
    onSaveEdit(entry.id, editingText, editingStyle);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onCancelEdit();
    }
  };
  
  const baseClasses = "py-1 px-2 rounded break-words whitespace-pre-wrap w-full text-sm sm:text-base";
  const headingClasses = entry.type === 'heading' ? 'text-lg sm:text-xl font-semibold mt-3 mb-1 text-teal-300' : '';
  
  const currentStyle = {};
  if (entry.style?.color) {
    currentStyle.color = entry.style.color;
  }
  if (entry.style?.fontWeight) {
    currentStyle.fontWeight = entry.style.fontWeight;
  }
  
  const editingColorHex = editingStyle?.color || getDefaultLogTextColorForTheme(currentTheme);
  const editingIsBold = editingStyle?.fontWeight === 'bold';
  const themeColors = THEME_SPECIFIC_PLAYLOG_COLORS[currentTheme] || THEME_SPECIFIC_PLAYLOG_COLORS.dark;


  return React.createElement('div', { className: `group relative ${entry.type === 'heading' ? 'pt-2' : ''}` },
    isActuallyEditing ? (
      React.createElement('div', { className: "bg-tertiary p-2 rounded-md shadow-lg" }, 
        React.createElement('textarea', ({
          ref: inputRef,
          value: editingText,
          onChange: (e) => setEditingText(e.target.value),
          onKeyDown: handleKeyDown,
          className: "w-full p-2 bg-secondary text-primary border border-primary rounded-md resize-y custom-scrollbar text-sm sm:text-base",
          rows: Math.max(2, editingText.split('\n').length),
          'aria-label': "ログエントリー編集"
        })),
        entry.type === 'normal' && (
          React.createElement('div', { className: "mt-2 flex flex-wrap items-center gap-2" },
            React.createElement('span', {className: "text-xs text-muted"}, "色:"),
            Object.entries(themeColors).map(([colorName, colorHex]) => 
              React.createElement('button', ({
                key: colorName,
                type: "button",
                onClick: () => setEditingStyle(prev => ({ ...prev, color: colorHex })),
                className: `w-5 h-5 rounded-sm border-2 ${editingColorHex === colorHex ? 'border-sky-400 ring-1 ring-sky-400' : 'border-transparent hover:border-slate-400'}`,
                style: { backgroundColor: colorHex },
                title: colorName,
                'aria-label': `色を${colorName}に設定`
              }))
            ),
            React.createElement('label', { htmlFor: `edit-bold-${entry.id}`, className: "text-xs text-muted ml-2 flex items-center gap-1 cursor-pointer" },
              React.createElement('input', ({
                type: "checkbox",
                id: `edit-bold-${entry.id}`,
                checked: editingIsBold,
                onChange: (e) => setEditingStyle(prev => ({ ...prev, fontWeight: e.target.checked ? 'bold' : 'normal' })),
                className: "form-checkbox h-3.5 w-3.5 text-sky-500 bg-secondary border-primary rounded focus:ring-sky-500 cursor-pointer"
              })),
              "太字"
            )
          )
        ),
        React.createElement('div', { className: "mt-2 flex gap-2 items-center" },
          React.createElement('button', ({ onClick: handleSave, className: "px-3 py-1 accent-green-bg text-white hover:bg-green-500 rounded text-xs flex items-center gap-1" }),
            React.createElement(SaveIcon, { className: "w-3 h-3" }), " 保存"
          ),
          React.createElement('button', ({ onClick: onCancelEdit, className: "px-3 py-1 bg-tertiary hover:bg-tertiary-hover text-primary rounded text-xs" }),
            "キャンセル"
          ),
          React.createElement('button', ({
              onClick: () => onDelete(entry.id),
              className: "px-3 py-1 accent-red-bg text-white hover:bg-red-500 rounded text-xs flex items-center gap-1 ml-auto",
              title: "投稿を削除"
          }),
            React.createElement(TrashIcon, { className: "w-3 h-3" }), " 削除"
          )
        )
      )
    ) : (
      React.createElement('div', { className: `${baseClasses} ${headingClasses}`, style: currentStyle },
        entry.content
      )
    ),
    !isActuallyEditing && (
      React.createElement('div', { className: "absolute top-0 right-0 flex opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-secondary/80 rounded-bl-md" },
        React.createElement('button', ({
          onClick: () => onStartEdit(entry),
          className: "p-1 accent-sky-text hover:text-sky-300",
          title: "編集",
          'aria-label': "このエントリーを編集"
        }),
          React.createElement(EditIcon, { className: "w-4 h-4" })
        ),
        React.createElement('button', ({
          onClick: () => onDelete(entry.id),
          className: "p-1 accent-red-text hover:text-red-300",
          title: "削除",
          'aria-label': "このエントリーを削除"
        }),
          React.createElement(TrashIcon, { className: "w-4 h-4" })
        )
      )
    )
  );
};

const EditableTitle = ({ title, onTitleChange }) => {
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [editTitleText, setEditTitleText] = React.useState(title);
  const titleInputRef = React.useRef(null);

  React.useEffect(() => {
    setEditTitleText(title);
  }, [title]);

  React.useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleSaveTitle = () => {
    if (editTitleText.trim() === '') {
      onTitleChange("プレイログ"); 
    } else {
      onTitleChange(editTitleText.trim());
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setEditTitleText(title);
      setIsEditingTitle(false);
    }
  };

  if (isEditingTitle) {
    return React.createElement('input', ({
      ref: titleInputRef,
      type: 'text',
      value: editTitleText,
      onChange: (e) => setEditTitleText(e.target.value),
      onBlur: handleSaveTitle,
      onKeyDown: handleTitleKeyDown,
      className: "text-xl sm:text-2xl font-semibold accent-teal-text bg-transparent border-b-2 border-teal-500 focus:outline-none w-full sm:w-auto",
      maxLength: 50,
      'aria-label': "プレイログタイトル編集"
    }));
  }

  return React.createElement('h2', ({
    className: "text-xl sm:text-2xl font-semibold accent-teal-text cursor-pointer hover:border-b-2 hover:border-teal-500/50 py-1",
    onClick: () => setIsEditingTitle(true),
    title: "クリックしてタイトルを編集"
  }), title || "プレイログ");
};

const generateExportHTMLContent = (playLogTitle, characterSheet, playLogEntries, theme) => {
  const pageStyles = THEME_EXPORT_PAGE_STYLES[theme] || THEME_EXPORT_PAGE_STYLES.dark;
  const defaultLogColor = THEME_SPECIFIC_PLAYLOG_COLORS[theme]?.default || '#000000';


  const escapeHtml = (unsafe) => {
    if (unsafe === null || unsafe === undefined) return '';
    return String(unsafe) 
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  };

  let html = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <title>${escapeHtml(playLogTitle)} - Solo RPG Export</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          margin: 0; 
          padding: 0; 
          background-color: ${pageStyles.bodyBackground}; 
          color: ${pageStyles.bodyColor};
          line-height: 1.6;
        }
        .container { 
          max-width: 800px; 
          margin: 0 auto; 
          padding: 20px; 
          box-sizing: border-box; 
        }
        h1, h2, h3 { color: ${pageStyles.headingColor}; }
        h1 { border-bottom: 2px solid ${pageStyles.hrColor}; padding-bottom: 10px; }
        h2 { margin-top: 30px; border-bottom: 1px solid ${pageStyles.hrColor}; padding-bottom: 5px;}
        h3.custom-field-name, h3.stats-details-heading { margin-top: 20px; margin-bottom: 5px; font-size: 1.1em; }
        h3.log-type-heading { font-size: 1.25em; font-weight: bold; margin-top: 1.5em; margin-bottom: 0.5em; }
        pre { 
          background-color: ${pageStyles.preBackground}; 
          color: ${pageStyles.preColor};
          padding: 15px; 
          border-radius: 5px; 
          white-space: pre-wrap; 
          word-wrap: break-word; 
          font-size: 0.9em;
          margin-top: 0;
        }
        img.character-image { max-width: 200px; max-height: 250px; border-radius: 5px; margin-bottom: 15px; border: 1px solid ${pageStyles.hrColor}; }
        .play-log-entry { margin-bottom: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>キャラクターシート</h1>
        <h2>${escapeHtml(characterSheet.name) || '名称未設定'}</h2>`;

  if (characterSheet.image) {
    html += `<img src="${escapeHtml(characterSheet.image)}" alt="${escapeHtml(characterSheet.name)}" class="character-image" />`;
  }
  
  if (typeof characterSheet.stats === 'string' && characterSheet.stats.trim() !== '') {
     html += `<h3 class="stats-details-heading">${escapeHtml(characterSheet.statsLabel || "能力値・詳細")}</h3><pre>${escapeHtml(characterSheet.stats)}</pre>`;
  } else if (typeof characterSheet.stats === 'string') {
     html += `<h3 class="stats-details-heading">${escapeHtml(characterSheet.statsLabel || "能力値・詳細")}</h3><pre>記載なし</pre>`;
  }

  if (characterSheet.customFields && characterSheet.customFields.length > 0) {
    html += `<h2>カスタム項目</h2>`;
    characterSheet.customFields.forEach(field => {
      html += `<h3 class="custom-field-name">${escapeHtml(field.fieldName)}</h3><pre>${escapeHtml(field.fieldValue) || '記載なし'}</pre>`;
    });
  }

  html += `<h1>${escapeHtml(playLogTitle) || 'プレイログ'}</h1>`;

  playLogEntries.forEach(entry => {
    let entryStyle = `color: ${entry.style?.color || defaultLogColor};`;
    if (entry.style?.fontWeight === 'bold') {
      entryStyle += ' font-weight: bold;';
    }
    
    if (entry.type === 'heading') {
      const headingColor = entry.style?.color || pageStyles.headingColor;
      html += `<h3 class="play-log-entry log-type-heading" style="color: ${headingColor}; ${entry.style?.fontWeight === 'bold' ? 'font-weight: bold;' : ''}">${escapeHtml(entry.content)}</h3>`;
    } else {
      html += `
        <div class="play-log-entry" style="${entryStyle}">
          <span>${escapeHtml(entry.content).replace(/\n/g, '<br>')}</span>
        </div>`;
    }
  });

  html += `
      </div>
    </body>
    </html>`;
  return html; 
};

const PlayLog = ({ 
  playLogEntries, 
  playLogTitle, 
  onPlayLogTitleChange, 
  onAddEntry, 
  onUpdateEntry, 
  onDeleteEntry, 
  onUndo, 
  onRedo, 
  canUndo,
  canRedo,
  characterSheet, 
  currentTheme 
}) => {
  const [currentInput, setCurrentInput] = React.useState('');
  const [currentInputType, setCurrentInputType] = React.useState('normal');
  const [currentInputColor, setCurrentInputColor] = React.useState(getDefaultLogTextColorForTheme(currentTheme));
  const [currentInputBold, setCurrentInputBold] = React.useState(false);

  const [isExporting, setIsExporting] = React.useState(false);
  const logEndRef = React.useRef(null);

  const [editingEntryId, setEditingEntryId] = React.useState(null);
  const [editingEntryText, setEditingEntryText] = React.useState('');
  const [editingEntryStyle, setEditingEntryStyle] = React.useState({ color: getDefaultLogTextColorForTheme(currentTheme), fontWeight: 'normal' });


  React.useEffect(() => {
    if (!editingEntryId) {
      setCurrentInputColor(getDefaultLogTextColorForTheme(currentTheme));
      // Reset bold only if not heading, as headings default to bold
      if(currentInputType !== 'heading') {
        setCurrentInputBold(false);
      }
    }
  }, [currentTheme, editingEntryId, currentInputType]);


  const handleStartEdit = (entry) => {
    setEditingEntryId(entry.id);
    setEditingEntryText(entry.content);
    setEditingEntryStyle({
      color: entry.style?.color || getDefaultLogTextColorForTheme(currentTheme),
      fontWeight: entry.style?.fontWeight || 'normal'
    });
  };

  const handleSaveEdit = (id, content, style) => {
    onUpdateEntry(id, content, style);
    setEditingEntryId(null);
    setEditingEntryText('');
  };

  const handleCancelEdit = () => {
    setEditingEntryId(null);
    setEditingEntryText('');
  };

  const submitCurrentInput = () => {
    if (currentInput.trim() === '') return;
    const styleForEntry = {
        color: currentInputType === 'heading' ? undefined : currentInputColor, 
        fontWeight: currentInputType === 'heading' ? 'bold' : (currentInputBold ? 'bold' : 'normal'),
    };

    if (typeof onAddEntry === 'function') {
        onAddEntry(currentInput, currentInputType, styleForEntry);
    } else {
        console.error("PlayLog: onAddEntry is not a function!");
        alert("エラー: ログエントリーを追加できませんでした。");
    }
    setCurrentInput('');
  };
  
  const handleFormSubmit = (e) => {
    e.preventDefault();
    submitCurrentInput();
  };

  React.useEffect(() => {
    if (playLogEntries && playLogEntries.length > 0) {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [playLogEntries]);
  
  const handleExportHTML = () => {
    setIsExporting(true);
    try {
      const htmlContent = generateExportHTMLContent(playLogTitle, characterSheet, playLogEntries, currentTheme);
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `playlog-${characterSheet?.name?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'session'}-${new Date().toISOString().slice(0,10)}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
        console.error("Error exporting HTML:", error);
        alert("HTMLエクスポート中にエラーが発生しました。");
    } finally {
        setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!window.jspdf || !window.html2canvas) {
      console.error("PDF/Canvas libraries not loaded when trying to export PDF.");
      alert("エクスポートに必要なライブラリが読み込まれていません。ページを再読み込みするか、しばらく待ってから再試行してください。");
      setIsExporting(false);
      return;
    }
    const { jsPDF: JsPDFConstructor } = window.jspdf;
    const localHtml2Canvas = window.html2canvas;

    setIsExporting(true);
    const reportHtml = generateExportHTMLContent(playLogTitle, characterSheet, playLogEntries, currentTheme);
    
    const hiddenDiv = document.createElement('div');
    hiddenDiv.innerHTML = reportHtml;
    hiddenDiv.style.position = 'absolute';
    hiddenDiv.style.left = '0px'; 
    hiddenDiv.style.top = `-${Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, 10000)}px`; 
    hiddenDiv.style.width = '800px'; 
    hiddenDiv.style.visibility = 'hidden'; 
    
    document.body.appendChild(hiddenDiv);
    const captureTarget = hiddenDiv.querySelector('.container'); 

    if (!captureTarget) {
        if (document.body.contains(hiddenDiv)) document.body.removeChild(hiddenDiv);
        setIsExporting(false);
        console.error("PDF export: Could not find .container element within the generated HTML.");
        alert("PDFエクスポートエラー: 内部コンテンツが見つかりません。");
        return;
    }
    
    try {
        await new Promise(resolve => setTimeout(resolve, 700)); 

        const canvas = await localHtml2Canvas(captureTarget, { 
            scale: 2, 
            useCORS: true,
            logging: true, 
            backgroundColor: THEME_EXPORT_PAGE_STYLES[currentTheme]?.bodyBackground || '#ffffff',
            width: captureTarget.scrollWidth,
            height: captureTarget.scrollHeight,
            x: 0, 
            y: 0,
            windowWidth: captureTarget.scrollWidth,
            windowHeight: captureTarget.scrollHeight,
        });
        
        if (canvas.width === 0 || canvas.height === 0) {
            throw new Error("PDF export: html2canvas created an empty canvas (0x0).");
        }
        
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new JsPDFConstructor({ 
            orientation: 'p',
            unit: 'px', 
            format: [canvas.width, canvas.height],
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height, undefined, 'FAST');
        pdf.save(`playlog-${characterSheet?.name?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'session'}-${new Date().toISOString().slice(0,10)}.pdf`);

    } catch (error) {
        console.error("Error during PDF export process:", error);
        alert(`PDFエクスポート中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}。 詳細はコンソールを確認してください。`);
    } finally {
        if (document.body.contains(hiddenDiv)) {
          document.body.removeChild(hiddenDiv);
        }
        setIsExporting(false);
    }
  };
  
  const themeColors = THEME_SPECIFIC_PLAYLOG_COLORS[currentTheme] || THEME_SPECIFIC_PLAYLOG_COLORS.dark;

  return React.createElement('div', { className: "flex flex-col flex-1 bg-secondary p-3 sm:p-4 rounded-lg shadow-xl min-h-0" },
    React.createElement('div', { className: "flex flex-wrap justify-between items-center mb-2 gap-2" },
      React.createElement(EditableTitle, { title: playLogTitle, onTitleChange: onPlayLogTitleChange }),
      React.createElement('div', { className: "flex gap-2 items-center" },
        React.createElement('button', ({
          onClick: onUndo,
          disabled: !canUndo || isExporting,
          className: "p-2 accent-sky-bg hover:accent-sky-bg-hover text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
          'aria-label': "元に戻す",
          title: "元に戻す"
        }), React.createElement(UndoIcon, { className: "w-4 h-4" })
        ),
        React.createElement('button', ({
          onClick: onRedo,
          disabled: !canRedo || isExporting,
          className: "p-2 accent-sky-bg hover:accent-sky-bg-hover text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
          'aria-label': "やり直す",
          title: "やり直す"
        }), React.createElement(RedoIcon, { className: "w-4 h-4" })
        ),
        React.createElement('button', ({
            onClick: handleExportHTML,
            disabled: isExporting,
            className: "p-2 accent-blue-bg hover:bg-blue-500 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1 text-sm",
            title: "HTMLとしてエクスポート"
        }), React.createElement(DocumentArrowDownIcon, { className: "w-4 h-4" }), " HTML")
      )
    ),
    React.createElement('div', { className: "flex-1 w-full bg-tertiary border border-primary rounded-md p-2 overflow-y-auto custom-scrollbar mb-3 space-y-1 min-h-96" },
      playLogEntries.length === 0 && (
        React.createElement('p', { className: "text-muted text-center py-4" }, "ログはありません。")
      ),
      playLogEntries.map(entry => (
        React.createElement(PlayLogEntryItem, {
          key: entry.id,
          entry: entry,
          isActuallyEditing: editingEntryId === entry.id,
          onStartEdit: handleStartEdit,
          onSaveEdit: handleSaveEdit,
          onCancelEdit: handleCancelEdit,
          onDelete: onDeleteEntry,
          editingText: editingEntryId === entry.id ? editingEntryText : '',
          setEditingText: setEditingEntryText,
          editingStyle: editingEntryId === entry.id ? editingEntryStyle : { color: getDefaultLogTextColorForTheme(currentTheme), fontWeight: 'normal'},
          setEditingStyle: setEditingEntryStyle,
          currentTheme: currentTheme 
        })
      )),
      React.createElement('div', { ref: logEndRef })
    ),
    React.createElement('form', { onSubmit: handleFormSubmit, className: "mt-auto" },
      React.createElement('label', { htmlFor: "playLogInput", className: "block text-lg sm:text-xl font-semibold accent-teal-text mb-1" }, "入力欄"),
      React.createElement('textarea', ({
        id: "playLogInput",
        value: currentInput,
        onChange: (e) => setCurrentInput(e.target.value),
        placeholder: "新しいログエントリーを入力 (Shift+Enterで投稿、Enterで改行)...",
        className: "w-full p-2 sm:p-3 bg-tertiary text-primary border border-primary rounded-md resize-y focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base custom-scrollbar",
        rows: 2,
        onKeyDown: (e) => {
          if (e.key === 'Enter' && e.shiftKey) {
            e.preventDefault();
            submitCurrentInput();
          }
        }
      })),
      React.createElement('div', { className: "flex flex-wrap gap-2 mt-2 items-center" },
        React.createElement('button', ({
          type: "button",
          onClick: () => setCurrentInputType(prev => {
            const newType = prev === 'heading' ? 'normal' : 'heading';
            if (newType === 'heading') setCurrentInputBold(true); // Headings are bold by default
            else setCurrentInputBold(false); // Reset bold for normal type
            return newType;
          }),
          className: `px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1 ${currentInputType === 'heading' ? 'accent-teal-bg text-white' : 'bg-tertiary hover:bg-tertiary-hover text-primary'}`,
          title: "見出しとして追加"
        }), 
          React.createElement(HeadingIcon, { className: "w-4 h-4" }), " 見出し ", currentInputType === 'heading' && React.createElement(CheckIcon, { className: "w-3 h-3" })
        ),
        currentInputType === 'normal' && React.createElement(React.Fragment, null, 
            React.createElement('div', {className: "flex items-center gap-1"},
                Object.entries(themeColors).map(([colorName, colorHex]) => 
                  React.createElement('button', ({
                    key: colorName,
                    type: "button",
                    onClick: () => setCurrentInputColor(colorHex),
                    className: `w-6 h-6 rounded-md border-2 ${currentInputColor === colorHex ? 'border-sky-400 ring-2 ring-sky-400' : 'border-transparent hover:border-slate-400'}`,
                    style: { backgroundColor: colorHex },
                    title: `文字色: ${colorName}`,
                    'aria-label': `文字色を${colorName}に設定`
                  }))
                )
            ),
            React.createElement('label', { htmlFor: "logInputBold", className: "px-3 py-1.5 text-sm rounded-md bg-tertiary hover:bg-tertiary-hover text-primary flex items-center gap-1 cursor-pointer", title:"太字" },
                React.createElement('input', ({
                    type: "checkbox",
                    id: "logInputBold",
                    checked: currentInputBold,
                    onChange: (e) => setCurrentInputBold(e.target.checked),
                    className: "form-checkbox h-4 w-4 text-sky-500 bg-secondary border-primary rounded focus:ring-sky-500 cursor-pointer",
                })),
                React.createElement('span', { style: {fontWeight: 'bold'}}, "B")
            )
        ),
        React.createElement('button', ({
          type: "submit",
          className: "px-4 py-2 accent-teal-bg hover:accent-teal-bg-hover text-white font-semibold rounded-md transition-colors shadow-md ml-auto"
        }), "追加")
      )
    )
  );
};
// --- End of components/PlayLog.js content ---
