

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// PREDEFINED_COLORS is now mainly for mapping old colorKey values during data migration
// and potentially for other UI elements that might need a fixed palette.
// For log entries, direct color hex codes will be used via a color picker.
export const PREDEFINED_COLORS = {
  default: 'text-slate-100', // Kept for reference, but actual color will be theme-dependent
  red: 'text-red-400',
  blue: 'text-blue-400',
  green: 'text-green-400',
  yellow: 'text-yellow-400',
  purple: 'text-purple-400',
};

export const THEME_SPECIFIC_PLAYLOG_COLORS = {
  dark: {
    default: '#f1f5f9', // slate-100 (general text on dark)
    red: '#f87171', blue: '#60a5fa', green: '#4ade80', yellow: '#facc15', purple: '#c084fc',
  },
  light: {
    default: '#0f172a', // slate-900 (general text on light)
    red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#eab308', purple: '#a855f7',
  },
  earth: { 
    default: '#f3eade', // general text on earth
    red: '#cb6d51', blue: '#7ba7ab', green: '#8f9d63', yellow: '#d9a740', purple: '#a78b99',
  },
  pastel: { 
    default: '#374151', // gray-700 (general text on pastel)
    red: '#f06292', blue: '#64b5f6', green: '#81c784', yellow: '#fff176', purple: '#ba68c8',
  },
};

// Default text colors for new random table log entries, based on theme
export const getDefaultLogTextColorForTheme = (theme) => {
  return THEME_SPECIFIC_PLAYLOG_COLORS[theme]?.default || '#000000';
};


export const THEME_EXPORT_PAGE_STYLES = {
  dark: { bodyBackground: '#0f172a', bodyColor: THEME_SPECIFIC_PLAYLOG_COLORS.dark.default, headingColor: '#38bdf8', hrColor: '#334155', preBackground: '#1e293b', preColor: THEME_SPECIFIC_PLAYLOG_COLORS.dark.default, timestampColor: '#64748b' },
  light: { bodyBackground: '#f8fafc', bodyColor: THEME_SPECIFIC_PLAYLOG_COLORS.light.default, headingColor: '#0284c7', hrColor: '#cbd5e1', preBackground: '#f1f5f9', preColor: THEME_SPECIFIC_PLAYLOG_COLORS.light.default, timestampColor: '#64748b' },
  earth: { bodyBackground: '#2a2017', bodyColor: THEME_SPECIFIC_PLAYLOG_COLORS.earth.default, headingColor: '#f59e0b', hrColor: '#5a442b', preBackground: '#4d4033', preColor: THEME_SPECIFIC_PLAYLOG_COLORS.earth.default, timestampColor: '#a18870' },
  pastel: { bodyBackground: '#eff6ff', bodyColor: THEME_SPECIFIC_PLAYLOG_COLORS.pastel.default, headingColor: '#a78bfa', hrColor: '#d1d5db', preBackground: '#f5f3ff', preColor: THEME_SPECIFIC_PLAYLOG_COLORS.pastel.default, timestampColor: '#6b7280' },
};

export const DEFAULT_GAME_DATA_PACKAGE_STRUCTURE = {
  manifest: {
    gameTitle: "無題のゲーム",
    author: "不明な作者",
    version: "1.0.0",
    description: "",
    srgdVersion: "1.0", 
  },
  characterSheetTemplate: {
    statsLabel: "能力値・詳細",
    defaultStatsContent: "",
    baseStats: ["体力", "技術", "知力", "魅力"], 
    customFieldTemplates: [
        { id: crypto.randomUUID(), label: "背景", type: "textarea"},
        { id: crypto.randomUUID(), label: "所持金", type: "number"}
    ], 
  },
  rulebookSections: [], 
  randomTables: [], // Default random tables now include logTextColor and logTextBold in their structure implicitly via validation
  resourceTrackerTemplates: [], 
};
