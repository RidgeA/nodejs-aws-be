export interface Logger {
  log(string: string): void
}

export class ConsoleLogger implements Logger {
  log(message: string): void {
    console.log(message);
  }
}

export class NoopLogger implements Logger {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  log(): void {
  }
}
