import {Cnsl} from './cnsl.interface';
import {join,compact} from 'es-toolkit/compat';
import {InspectOptions} from "node:util";

export class CnslClass implements Cnsl {
  private _queue: Function[] = [];

  private _groups: {[grpIdent: string]: Cnsl} = {};

  private isGroupClosed = false;

  private scope?: string;

  constructor(
    groupTitle?: string,
    collapsed?: boolean,
    private parentScope?: string,
    private parentAddToQueue?: Function,
    private groupEndCallback?: Function
  ) {
    if (groupTitle !== undefined) {
      this.addToQueue((): void => {
        if (collapsed) {
          console.groupCollapsed.apply(console, [groupTitle]);
        } else {
          console.group.apply(console, [groupTitle]);
        }
      });
    }
  }

  public scoped(scope: string): this {
    this.scope = scope;

    return this;
  }

  public grouped(groupTitle: string, groupFunc: (cnsl: Cnsl) => void, collapsed = false): void {
    let newGroup: Cnsl = this.createGroup(this.scopedMessage(groupTitle), collapsed);

    groupFunc(newGroup);
    newGroup.groupEnd();
  }

  public group(groupTitle: string, collapsed = false): Cnsl {
    return this.createGroup(this.scopedMessage(groupTitle), collapsed);
  }

  public groupEnd(): void {
    if (!this.isGroupClosed) {
      this.addToQueue((): void => {
        console.groupEnd.apply(console);
      });

      if (this.parentAddToQueue !== undefined) {
        this.parentAddToQueue(() => {
          this._queue.forEach((func: Function) => func());
        });
      }

      if (this.groupEndCallback !== undefined) {
        this.groupEndCallback();
      }

      this.isGroupClosed = true;
    }
  }

  public assert(test: boolean, message: string, ...optionalParams: any[]): this {
    this.addToQueue((): void => {
      console.assert.apply(console, [test, this.scopedMessage(message), optionalParams]);
    });
    return this;
  }

  public clear(): this {
    this.addToQueue((): void => {
      console.clear.apply(console);
    });
    return this;
  }

  public count(countTitle: string): this {
    this.addToQueue((): void => {
      console.count.apply(console, [countTitle]);
    });
    return this;
  }

  public debug(message: string, ...optionalParams: any[]): this {
    this.addToQueue((): void => {
      console.debug.apply(console, [this.scopedMessage(message), optionalParams]);
    });
    return this;
  }

  public dir(value: any, options?:InspectOptions): this {
    this.addToQueue((): void => {
      console.dir.apply(console, [options]);
    });
    return this;
  }

  public dirxml(value: any): this {
    this.addToQueue((): void => {
      console.dirxml.apply(console, [value]);
    });
    return this;
  }

  public error(message: any, ...optionalParams: any[]): this {
    this.addToQueue((): void => {
      console.error.apply(console, [this.scopedMessage(message), ...optionalParams]);
    });
    return this;
  }

  public info(message: any, ...optionalParams: any[]): this {
    this.addToQueue((): void => {
      console.info.apply(console, [this.scopedMessage(message), optionalParams]);
    });
    return this;
  }

  public log(message: any, ...optionalParams: any[]): this {
    this.addToQueue((): void => {
      console.log.apply(console, [this.scopedMessage(message), optionalParams]);
    });
    return this;
  }

  public profile(reportName: string): this {
    this.addToQueue((): void => {
      console.profile.apply(console, [reportName]);
    });
    return this;
  }

  public profileEnd(): this {
    this.addToQueue((): void => {
      console.profileEnd.apply(console);
    });
    return this;
  }

  public time(timerName: string): this {
    this.addToQueue((): void => {
      console.time.apply(console, [timerName]);
    });
    return this;
  }

  public timeEnd(timerName: string): this {
    this.addToQueue((): void => {
      console.timeEnd.apply(console, [timerName]);
    });
    return this;
  }

  public trace(message: any, ...optionalParams: any[]): this {
    this.addToQueue((): void => {
      console.trace.apply(console, [this.scopedMessage(message), optionalParams]);
    });
    return this;
  }

  public warn(message: any, ...optionalParams: any[]): this {
    this.addToQueue((): void => {
      console.warn.apply(console, [this.scopedMessage(message), optionalParams]);
    });
    return this;
  }

  private createGroup(groupTitle: string, collapsed: boolean): Cnsl {
    let returnedGroup: Cnsl;

    if (groupTitle in this._groups) {
      returnedGroup = this._groups[groupTitle];
    } else {
      returnedGroup = new CnslClass(
        groupTitle,
        collapsed,
        join(compact([this.parentScope, this.scope]), ' | '),
        (func: Function) => {
          this.addToQueue(func);
        },
        () => {
          delete this._groups[groupTitle];
        }
      );
      this._groups[groupTitle] = returnedGroup;
    }

    return returnedGroup;
  }

  protected addToQueue(func: Function): void {
    if (!this.isGroupClosed) {
      this._queue.push(func);

      if (this.parentAddToQueue === undefined) {
        this.triggerQueue();
      }
    }
  }

  private triggerQueue(): void {
    this._queue.forEach((func: Function) => {
      func();
    });
    this._queue = [];
  }

  private scopedMessage(message: string): string {
    message = this.scope ? this.scope + ' | ' + message : message;
    message = this.parentScope ? this.parentScope + ' | ' + message : message;
    return message;
  }
}

export const cnsl: Cnsl = new CnslClass();
