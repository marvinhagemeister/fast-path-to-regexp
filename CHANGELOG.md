# Changelog

## 3.0.0

- **breaking:** URLs are now case-sensitive to be complient with the RFC3986
- Add support for custom variables in query parameters (`/foo?bar=:id`)
- Switch back from `mjs` to `js` for better ecosystem compatibility

## 2.0.0

- **breaking:** Refactored exact match handling.
- Normalize trailing slash 👍
- Allow `.-_` in variable names 💯

## 1.0.2

- Add `umd` and `mjs` output formats.

## 1.0.1

- Fix invalid es exports.

## 1.0.0

- Parse `*` as a standard parameter
- Add `createUrl()` function which can be used to construct a url by a regex

## 0.0.5

- `exact` should be an arg of `match()`

## 0.0.4

- Add support for `exact` matches.

## 0.0.3

- Return all useful data on `match()` to prevent object creations down the road.

## 0.0.2

- Return `null` if no match was possible.

## 0.0.1

- initial Release
