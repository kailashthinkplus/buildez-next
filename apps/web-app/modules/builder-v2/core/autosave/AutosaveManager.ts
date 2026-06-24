export class AutosaveManager {

  private timeout?: NodeJS.Timeout;

  schedule(fn: () => void) {

    clearTimeout(this.timeout);

    this.timeout = setTimeout(fn, 600);
  }

}