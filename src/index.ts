const escape: Record<any, string> = {
  42: ".*",
  46: ".",
  47: "\\/",
};

export function parse(input: string) {
  let reg = "";
  if (input[0] === "/") reg += "^";

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
  };
}

export function pathToRegExp(input: string) {
  const { params, regex } = parse(input);

  return (url: string): Record<string, string> | null => {
    regex.lastIndex = 0;
    const res = regex.exec(url.toLowerCase());
    if (res === null) return null;

    // get parameters
    const found: Record<string, string> = {};
    for (let i = 1; i < res.length; i++) {
      const item = res[i];
      if (item) {
        found[params[i - 1]] = item;
      }
    }

    return found;
  };
}
