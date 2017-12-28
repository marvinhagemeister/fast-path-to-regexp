# Fast Path To RegExp

Ultra small (just **350 bytes**!) and super fast library for converting paths
to `RegExp`.

## Usage

Installation:

```bash
# via npm
npm install --save @marvinh/path-to-regexp

# via yarn
yarn add @marvinh/path-to-regexp
```

```js
import { pathToRegExp } from "@marvinh/path-to-regexp";

const match = pathToRegExp("foo/:bar/*/bob");

// Returns params on match
match("foo/bar"); // -> null (doesn't match)
match("foo/asd/a/bob"); // -> { bar: "asd" } (match)
```

## License

tba.
