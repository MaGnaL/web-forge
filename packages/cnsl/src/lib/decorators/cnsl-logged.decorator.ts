import {cnsl} from '../cnsl.class';
import {Cnsl} from '../cnsl.interface';

export function cnslLogged({
  groupTitle,
  groupCollapsed,
}: {groupTitle?: string; groupCollapsed?: boolean} = {}): MethodDecorator {
  return function (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) {
    let originalMethod = descriptor.value; // save a reference to the original method

    // NOTE: Do not use arrow syntax here. Use a function expression in
    // order to use the correct value of `this` in this method
    descriptor.value = function (...args: any[]) {
      let grpCnsl: Cnsl = groupTitle ? cnsl.scoped('').group(groupTitle, groupCollapsed) : cnsl;
      if (groupTitle) {
        grpCnsl.log(
          `Call: ${(target.constructor as any).name}.${propertyKey.toString()}(${JSON.stringify(args)})`
        );
      }

      let result = originalMethod.apply(this, args);

      if (groupTitle) {
        grpCnsl.log(` => ${JSON.stringify(result)}`);
        grpCnsl.groupEnd();
      } else {
        grpCnsl.log(
          `Call: ${(target.constructor as any).name}.${propertyKey.toString()}(${JSON.stringify(
            args
          )}) => ${JSON.stringify(result)}`
        );
      }

      return result;
    };

    return descriptor;
  };
}
