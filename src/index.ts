export interface MatchResult {
  matched: string;
  params: Record<string, string>;
}

const escape: Record<any, string> = {
  42: ".*",
  46: ".",
  47: "\\/",
};

export function parse(input: string) {
  let reg = "";
  let absolute = false;
  if (input[0] === "/") {
    reg += "^";
    absolute = true;
  }

  input = input.toLowerCase();

  const params: string[] = [];
  let param = -1;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    if (char === 58) {
      param = i + 1;
    } else if (param !== -1) {
      const isEnd = i === input.length - 1;
      const isSlash = char === 47;

      if (isSlash || isEnd) {
        params.push(input.slice(param, isEnd ? i + 1 : i));
        reg += "(\\w+)" + (isSlash ? escape[char] : "");
        param = -1;
      }
    } else {
      const n = escape[char];
      reg += n ? n : input[i];
    }
  }

  return {
    regex: new RegExp(reg),
    params,
    absolute,
  };
}

export class PathRegExp {
  public regex: RegExp;
  public params: string[];
  public absolute: boolean;

  constructor(path: string) {
    const res = parse(path);
    this.regex = res.regex;
    this.params = res.params;
    this.absolute = res.absolute;
  }

  match(url: string): MatchResult | null {
    const { regex, params } = this;

    regex.lastIndex = 0;
    const res = regex.exec(url.toLowerCase());
    if (res === null) return null;

    const out: MatchResult = { matched: "", params: {} };
    out.matched = res[0];

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
