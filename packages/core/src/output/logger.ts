function error(message: string): void {
  process.stderr.write(`error: ${message}\n`);
}

function warn(message: string): void {
  process.stderr.write(`warn: ${message}\n`);
}

function hint(message: string): void {
  process.stderr.write(`hint: ${message}\n`);
}

function verbose(message: string): void {
  if (process.stdout.isTTY === true) {
    process.stderr.write(`${message}\n`);
  }
}

export const logger = { error, warn, hint, verbose };
