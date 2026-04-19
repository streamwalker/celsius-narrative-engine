export interface ParsedPanel {
  text: string;
  panelNumber: number;
}

export interface ParsedPage {
  pageNumber: number;
  isOdd: boolean;
  panels: ParsedPanel[];
  rawText: string;
}

export function parseScriptPages(script: string): ParsedPage[] {
  const pageRegex = /^(PAGE\s+(\d+))/gim;
  const pages: ParsedPage[] = [];
  const matches: { index: number; pageNumber: number; marker: string }[] = [];

  let match: RegExpExecArray | null;
  while ((match = pageRegex.exec(script)) !== null) {
    matches.push({ index: match.index, pageNumber: parseInt(match[2], 10), marker: match[1] });
  }

  if (matches.length === 0) return [];

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i + 1].index : script.length;
    const rawText = script.slice(start, end).trimEnd();
    const pageNumber = matches[i].pageNumber;

    const panelRegex = /^(\d+)\s*[-–—]/gm;
    const panelMatches: { index: number; panelNumber: number }[] = [];
    let pm: RegExpExecArray | null;
    while ((pm = panelRegex.exec(rawText)) !== null) {
      panelMatches.push({ index: pm.index, panelNumber: parseInt(pm[1], 10) });
    }

    const panels: ParsedPanel[] = [];
    for (let j = 0; j < panelMatches.length; j++) {
      const pStart = panelMatches[j].index;
      const pEnd = j + 1 < panelMatches.length ? panelMatches[j + 1].index : rawText.length;
      panels.push({
        text: rawText.slice(pStart, pEnd).trimEnd(),
        panelNumber: panelMatches[j].panelNumber,
      });
    }

    pages.push({
      pageNumber,
      isOdd: pageNumber % 2 !== 0,
      panels,
      rawText,
    });
  }

  return pages;
}
