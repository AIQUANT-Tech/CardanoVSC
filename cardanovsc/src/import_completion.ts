import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

// Class to parse Haskell files
export class HaskellFileParser {
  static parseFunctions(content: string): { name: string; type: string; documentation?: string }[] {
    const functions: { name: string; type: string; documentation?: string }[] = [];
    const haddockRegex = /-- \|([^\n]*)/g;
    const functionRegex = /(?:^|\n)([a-zA-Z_][a-zA-Z0-9_']*)\s*::\s*([^\n]+)/g;

    const haddockMatches = [...content.matchAll(haddockRegex)];
    const haddockMap = new Map<string, string>();

    for (const match of haddockMatches) {
      const comment = match[1].trim();
      const nextLine = content.slice(match.index! + match[0].length).split('\n')[0].trim();
      if (nextLine.startsWith('::')) {
        const functionName = nextLine.split('::')[0].trim();
        haddockMap.set(functionName, comment);
      }
    }

    let match;
    while ((match = functionRegex.exec(content)) !== null) {
      const name = match[1];
      const type = match[2];
      const documentation = haddockMap.get(name);
      functions.push({ name, type, documentation });
    }

    return functions;
  }
}
