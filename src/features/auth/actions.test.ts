import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import ts from 'typescript';

function hasModifier(node: ts.Node, kind: ts.SyntaxKind) {
  return (
    ts.canHaveModifiers(node) &&
    ts.getModifiers(node)?.some(modifier => modifier.kind === kind) === true
  );
}

function isRuntimeExport(statement: ts.Statement) {
  if (ts.isExportDeclaration(statement)) return !statement.isTypeOnly;
  if (ts.isExportAssignment(statement)) return true;
  if (ts.isInterfaceDeclaration(statement)) return false;
  if (ts.isTypeAliasDeclaration(statement)) return false;
  return hasModifier(statement, ts.SyntaxKind.ExportKeyword);
}

describe('auth Server Actions module', () => {
  it('exports only async functions from the use server file', () => {
    const filename = join(process.cwd(), 'src/features/auth/actions.ts');
    const source = ts.createSourceFile(
      filename,
      readFileSync(filename, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    );
    const runtimeExports = source.statements.filter(isRuntimeExport);

    expect(runtimeExports).toHaveLength(2);
    for (const statement of runtimeExports) {
      expect(ts.isFunctionDeclaration(statement)).toBe(true);
      expect(hasModifier(statement, ts.SyntaxKind.AsyncKeyword)).toBe(true);
    }
  });
});
