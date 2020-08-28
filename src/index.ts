export interface MatchResult {
  path: string;
  absolute: boolean;
  matched: string;
  params: Record<string, string>;
}

const enum CHARS {
  ASTERIKS = 42,
  COLON = 58,
  DOT = 46,
  SLASH = 47,
  QUESTION_MARK = 63,
  AMPERSAND = 38,
}

const escape: Record<any, string> = {
  [CHARS.ASTERIKS]: "(.*)",
  [CHARS.DOT]: ".",
  [CHARS.SLASH]: "\\/",
  [CHARS.QUESTION_MARK]: "\\?",
  [CHARS.AMPERSAND]: "\\&",
};

export function parse(input: string, exact = false) {
  const str = normalize(input);
  let reg = "";
  let absolute = false;
  if (str[0] === "/") {
    reg += "^";
    absolute = true;
  }

  const params: string[] = [];
  let param = -1;
  const len = str.length;
  for (let i = 0; i < len; i++) {
    const char = str.charCodeAt(i);
    if (char === CHARS.COLON) {
      param = i + 1;
    } else if (param !== -1) {
      const isDelimiter =
        char === CHARS.SLASH ||
        char === CHARS.AMPERSAND ||
        char === CHARS.QUESTION_MARK;
      const isEnd = i === len - 1;
      if (isDelimiter || isEnd) {
        params.push(input.slice(param, isEnd && !isDelimiter ? len : i));
        reg += "([\\w-_.]+)" + (isDelimiter ? escape[char] : "");
        param = -1;
      }
    } else {
      const n = escape[char];
      reg += n ? n : str[i];
      if (char === CHARS.ASTERIKS) params.push("*");
    }
  }

  if (exact) reg += "$";

  return {
    regex: new RegExp(reg),
    params,
    absolute,
    exact,
  };
}

function normalize(url: string) {
  // Normalize url
  return url.length > 1 &&
    (url.charCodeAt(url.length - 1) === CHARS.SLASH || url.indexOf("?") > -1)
    ? url
    : url + "/";
}

export class PathRegExp {
  public regex: RegExp;
  public params: string[];
  public absolute: boolean;

  constructor(public path: string, exact = false) {
    const res = parse(path, exact);
    this.regex = res.regex;
    this.params = res.params;
    this.absolute = res.absolute;
  }

  match(url: string): MatchResult | null {
    const { regex, params } = this;
    url = normalize(url);

    regex.lastIndex = 0;
    const res = regex.exec(url);
    // No match
    if (res === null) return null;

    const match = res[0];
    const out: MatchResult = {
      matched:
        match.charCodeAt(match.length - 1) === CHARS.SLASH
          ? match.slice(0, -1)
          : match,
      params: {},
      path: this.path,
      absolute: this.absolute,
    };

    // get parameters
    for (let i = 1; i < res.length; i++) {
      const item = res[i];
      if (item) {
        out.params[params[i - 1]] = item;
      }
    }

    return out;
  }
}

/**
 * Build an url from a PathRegExp instance with custom parameters.
 */
export function createUrl(
  reg: PathRegExp,
  params: Record<string, string | number> = {},
) {
  let path = reg.path;

  for (let i = 0; i < reg.params.length; i++) {
    const name = reg.params[i];
    const needle = name === "*" ? "*" : ":" + name;
    path = path.replace(needle, params[name] as any);
  }

  return path;
}
