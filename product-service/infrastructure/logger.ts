import { injectable } from "tsyringe";

export interface Logger {
  log(string: string): void
}

@injectable()
export class ConsoleLogger implements Logger {
  log(message: string): void {
    console.log(message);
  }
}

@injectable()
export class NoopLogger implements Logger {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  log(): void {
  }
}
