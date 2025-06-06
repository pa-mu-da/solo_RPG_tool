
// --- Start of components/RulebookPanel.js content (Placeholder) ---
const RulebookPanel = ({ rulebookSections }) => {
  const [selectedSectionId, setSelectedSectionId] = React.useState(null);

  React.useEffect(() => {
    if (rulebookSections && rulebookSections.length > 0) {
        const currentSelectionExists = rulebookSections.some(s => s.id === selectedSectionId);
        if (!selectedSectionId || !currentSelectionExists) {
            setSelectedSectionId(rulebookSections[0].id);
        }
    } else if ((!rulebookSections || rulebookSections.length === 0) && selectedSectionId) {
        setSelectedSectionId(null);
    }
  }, [rulebookSections, selectedSectionId]);

  const selectedSection = rulebookSections && rulebookSections.find(s => s.id === selectedSectionId);

  return React.createElement('div', { className: "bg-slate-800 p-3 sm:p-4 rounded-lg shadow-lg" },
    React.createElement('h3', { className: "text-lg sm:text-xl font-semibold mb-3 text-sky-400" }, "ルールブック"),
    rulebookSections && rulebookSections.length > 0 ? (
      React.createElement('div', { className: "flex flex-col gap-3" },
        React.createElement('select', ({
          value: selectedSectionId || '',
          onChange: (e) => setSelectedSectionId(e.target.value),
          className: "w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-sm"
        }),
          rulebookSections.map(section => (
            React.createElement('option', { key: section.id, value: section.id }, section.title)
          ))
        ),
        React.createElement('div', { className: "bg-slate-700 p-3 rounded-md border border-slate-600 max-h-96 overflow-y-auto custom-scrollbar" },
          selectedSection ? (
            React.createElement(React.Fragment, null,
              React.createElement('h4', { className: "text-md font-semibold text-sky-300 mb-2" }, selectedSection.title),
              React.createElement('div', { className: "text-sm text-slate-200 whitespace-pre-wrap break-words" }, selectedSection.content)
            )
          ) : (
            React.createElement('p', { className: "text-sm text-slate-400" }, "セクションを選択してください。")
          )
        )
      )
    ) : (
      React.createElement('p', { className: "text-sm text-slate-400" }, "ルールブックセクションがありません。ゲームデータパッケージを読み込むか、作成ツールで追加してください。")
    )
  );
};
// --- End of components/RulebookPanel.js content ---
