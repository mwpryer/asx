export function hint(message: string): void {
  process.stderr.write(`hint: ${message}\n`);
}
