# Fast Path To RegExp

Ultra small (just **350 bytes**) and super fast library for converting paths
to `RegExp`. Only implements a subset of [path-to-regexp](https://github.com/pillarjs/path-to-regexp).

```txt
:myparam -> named parameters, f.ex. /bar/:foo
* -> wildcard catchall, f.ex. /bar/*/foo
```

## Usage

Installation:

```bash
# via npm
npm install --save @marvinh/path-to-regexp

# via yarn
yarn add @marvinh/path-to-regexp
```

```js
import { PathRegExp } from "@marvinh/path-to-regexp";

const Path = new PathRegExp("foo/:bar/*/bob");

// Returns params on match
Path.match("foo/asd/a/");
// -> {
//  matched: "", // The remaining part if any
//  params: { bar: "asd" }
// }
```

## License

`MIT`, see [License file](./LICENSE.md).
