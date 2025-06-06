
// --- Start of components/ResourceTrackerPanel.js content (Placeholder) ---
const ResourceTrackerPanel = ({ trackers: trackersProp, setTrackers, addLogEntry }) => {
  const trackers = Array.isArray(trackersProp) ? trackersProp : []; 

  const [newTrackerName, setNewTrackerName] = React.useState('');
  const [newTrackerValue, setNewTrackerValue] = React.useState(0);
  const [changeReason, setChangeReason] = React.useState({}); 

  React.useEffect(() => {
    console.log("[ResourceTrackerPanel useEffect] trackersProp updated. New length:", trackersProp?.length, "Content:", JSON.parse(JSON.stringify(trackersProp)));
  }, [trackersProp]);

  const handleAddTracker = (e) => {
    e.preventDefault();
    if (!newTrackerName.trim()) {
      alert("リソース名を入力してください。");
      return;
    }
    const initialVal = parseInt(String(newTrackerValue), 10) || 0;
    const newTrackerObject = {
      id: crypto.randomUUID(),
      name: newTrackerName.trim(),
      value: initialVal,
      pendingValue: initialVal, 
      history: [],
    };
    
    console.log("[ResourceTrackerPanel handleAddTracker] Current trackers before add (from component scope):", JSON.parse(JSON.stringify(trackers)));
    const updatedTrackers = [...trackers, newTrackerObject];
    console.log("[ResourceTrackerPanel handleAddTracker] Updated trackers list to be sent to addLogEntry:", JSON.parse(JSON.stringify(updatedTrackers)));
    addLogEntry(
      `リソース「${newTrackerObject.name}」を追加しました (初期値: ${initialVal})`,
      'normal',
      {},
      { resourceTrackers: updatedTrackers }
    );

    setNewTrackerName('');
    setNewTrackerValue(0);
  };

  const handleDeleteTracker = (trackerId) => {
    console.log(`%c[ResourceTrackerPanel handleDeleteTracker] Called for ID: ${trackerId}. Current trackersProp:`, "color: red;", JSON.parse(JSON.stringify(trackersProp)), "Current component scope 'trackers':", JSON.parse(JSON.stringify(trackers)));
    const trackerToDelete = trackers.find(t => t.id === trackerId);
    console.log(`%c[ResourceTrackerPanel handleDeleteTracker] Tracker to delete object:`, "color: red;", JSON.parse(JSON.stringify(trackerToDelete)));

    if (trackerToDelete) {
      // Confirmation is removed to allow deletion in sandboxed environments
      // const confirmDelete = window.confirm(`リソース「${trackerToDelete.name}」を本当に削除しますか？`);
      // console.log(`%c[ResourceTrackerPanel handleDeleteTracker] Confirmation result: ${confirmDelete}`, "color: red;");
      // if (confirmDelete) { // This condition is now always true for the block below
        const updatedTrackers = trackers.filter(t => t.id !== trackerId);
        console.log(`%c[ResourceTrackerPanel handleDeleteTracker] Filtered 'updatedTrackers' (to be sent to addLogEntry):`, "color: red;", JSON.parse(JSON.stringify(updatedTrackers)));
        addLogEntry(
          `リソース「${trackerToDelete.name}」を削除しました`,
          'normal',
          {},
          { resourceTrackers: updatedTrackers }
        );
        console.log(`%c[ResourceTrackerPanel handleDeleteTracker] addLogEntry called for deletion of '${trackerToDelete.name}'.`, "color: red;");
      // }
    } else if (trackers.length > 0) { 
        console.warn(`[ResourceTrackerPanel handleDeleteTracker] Tracker with id ${trackerId} not found in current (sanitized) trackers list. Original prop was:`, trackersProp, "Sanitized trackers:", trackers);
    } else {
        console.log("[ResourceTrackerPanel handleDeleteTracker] Trackers array is empty or tracker not found (ID:", trackerId, "). Original prop:", trackersProp, "Sanitized trackers:", trackers);
    }
  };
  
  const updatePendingValue = (trackerId, change) => {
    setTrackers(prevTrackersState => 
      (Array.isArray(prevTrackersState) ? prevTrackersState : []).map(tracker => 
        tracker.id === trackerId 
          ? { ...tracker, pendingValue: tracker.pendingValue + change } 
          : tracker
      )
    );
  };

  const handleApplyChange = (trackerId) => {
    const trackerToUpdate = trackers.find(t => t.id === trackerId);
    if (!trackerToUpdate) {
        console.warn(`[ResourceTrackerPanel handleApplyChange] Tracker with ID ${trackerId} not found.`);
        return;
    }

    const originalValue = trackerToUpdate.value;
    const newValue = trackerToUpdate.pendingValue; 
    const actualChange = newValue - originalValue;
    const reasonForChange = changeReason[trackerId] || "";

    if (actualChange !== 0) {
      const changeText = actualChange > 0 ? `+${actualChange}` : String(actualChange);
      let logMessage = `リソース「${trackerToUpdate.name}」変更: ${changeText} (結果: ${newValue})`;
      if (reasonForChange.trim()) {
        logMessage += ` 理由: ${reasonForChange.trim()}`;
      }
      
      const updatedTrackersFromApply = trackers.map(t => {
        if (t.id === trackerId) {
          const newHistoryEntry = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            change: actualChange,
            previousValue: originalValue,
            newValue: newValue,
            reason: reasonForChange.trim(),
          };
          return { 
            ...t, 
            value: newValue, 
            pendingValue: newValue, 
            history: [newHistoryEntry, ...(t.history || []).slice(0, 19)] 
          };
        }
        return t;
      });
      console.log("[ResourceTrackerPanel handleApplyChange] Updated trackers for apply:", JSON.parse(JSON.stringify(updatedTrackersFromApply)));
      addLogEntry(
        logMessage,
        'normal',
        {}, 
        { resourceTrackers: updatedTrackersFromApply }
      );
    }
    setChangeReason(prev => ({...prev, [trackerId]: ""}));
  };

  return React.createElement('div', { className: "bg-slate-800 p-3 sm:p-4 rounded-lg shadow-lg" },
    React.createElement('h3', { className: "text-lg sm:text-xl font-semibold mb-3 text-sky-400" }, "リソーストラッカー"),
    React.createElement('form', { onSubmit: handleAddTracker, className: "mb-4 p-3 bg-slate-700/50 rounded-md" },
        React.createElement('div', { className: "flex flex-col sm:flex-row gap-2 mb-2"},
            React.createElement('input', ({
                type: "text",
                value: newTrackerName,
                onChange: (e) => setNewTrackerName(e.target.value),
                placeholder: "リソース名 (例: HP, MP)",
                className: "flex-grow p-2 bg-slate-600 border border-slate-500 rounded-md focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-sm"
            })),
            React.createElement('input', ({
                type: "number",
                value: newTrackerValue,
                onChange: (e) => setNewTrackerValue(parseInt(String(e.target.value), 10)),
                placeholder: "初期値",
                className: "w-full sm:w-24 p-2 bg-slate-600 border border-slate-500 rounded-md focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-sm"
            }))
        ),
        React.createElement('button', ({
            type: "submit",
            className: "w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-md transition-colors"
        }), React.createElement(PlusIcon, {className: "w-4 h-4"}), "リソース追加")
    ),
    trackers && trackers.length > 0 ? ( 
      React.createElement('div', { className: "space-y-3" },
        trackers.map(tracker => ( 
          React.createElement('div', { key: tracker.id, className: "p-3 bg-slate-700 rounded-md" },
            React.createElement('div', { className: "flex justify-between items-center mb-1" },
              React.createElement('span', { className: "text-md font-semibold text-slate-200" }, tracker.name),
              React.createElement('button', ({
                onClick: () => handleDeleteTracker(tracker.id),
                className: "p-1 text-red-400 hover:text-red-300",
                title: `「${tracker.name}」を削除`
              }), React.createElement(TrashIcon, { className: "w-4 h-4" }))
            ),
            React.createElement('div', { className: "flex items-center gap-2 mb-2" },
              React.createElement('button', { onClick: () => updatePendingValue(tracker.id, -1), className: "p-1.5 bg-red-700 hover:bg-red-600 text-white rounded-md" }, React.createElement(MinusIcon, { className: "w-4 h-4" })),
              React.createElement('span', { className: "text-xl font-bold text-teal-300 w-12 text-center" }, tracker.pendingValue),
              React.createElement('button', { onClick: () => updatePendingValue(tracker.id, 1), className: "p-1.5 bg-green-700 hover:bg-green-600 text-white rounded-md" }, React.createElement(PlusIcon, { className: "w-4 h-4" }))
            ),
            React.createElement('input', ({
                type: "text",
                value: changeReason[tracker.id] || "",
                onChange: (e) => setChangeReason(prev => ({...prev, [tracker.id]: e.target.value})),
                placeholder: "変更理由 (任意)",
                className: "w-full p-1.5 bg-slate-600 border border-slate-500 rounded-md focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-xs mb-2"
            })),
            React.createElement('button', ({
                onClick: () => handleApplyChange(tracker.id),
                className: "w-full mt-1 flex items-center justify-center gap-2 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium rounded-md transition-colors"
              }), React.createElement(CheckIcon, {className: "w-3 h-3"}), "反映")
          )
        ))
      )
    ) : (
      React.createElement('p', { className: "text-sm text-slate-400 text-center" }, "リソーストラッカーはありません。")
    )
  );
};
// --- End of components/ResourceTrackerPanel.js content ---
