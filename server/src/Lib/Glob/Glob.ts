import FastGlob from "fast-glob";
import pm from "picomatch";
import { URI } from "vscode-uri";

/**
 *
 */
export namespace Glob {
  const opt: pm.PicomatchOptions = {
    contains: true,
  };

  /**
   *
   * @param source
   * @param ignores
   * @returns
   */
  export function Excludes(source: string[], ignores: string[]): string[] {
    return source.filter((x) => !pm.isMatch(x, ignores, opt));
  }

  /**
   *
   * @param source
   * @param patterns
   * @returns
   */
  export function IsMatch(source: string, patterns: string[]): boolean {
    return pm.isMatch(source, patterns, opt);
  }

  /**
   *
   */
  export function GetFiles(source: string | string[], ignores: string[] | undefined = undefined): string[] {
    let entries = FastGlob.sync(source, { onlyFiles: true, absolute: true });

    if (ignores && ignores.length > 0) entries = Excludes(entries, ignores);
    return entries.map((item) => URI.file(item).toString());
  }
}
