import { parse, pathToRegExp } from "../regex";

describe("parse", () => {
  it("should escape /", () => {
    expect(parse("foo/").regex).toEqual(/foo\//);
    expect(parse("foo/bar/").regex).toEqual(/foo\/bar\//);
  });

  it("should add ^ if beginning", () => {
    expect(parse("/foo/").regex).toEqual(/^\/foo\//);
  });

  it("should parse parameters", () => {
    expect(parse("foo/:name")).toEqual({
      regex: /foo\/(\w+)/,
      params: ["name"],
    });
    expect(parse("foo/:name/bar")).toEqual({
      regex: /foo\/(\w+)\/bar/,
      params: ["name"],
    });
  });

  it("should parse *", () => {
    expect(parse("foo/*").regex).toEqual(/foo\/.*/);
    expect(parse("foo/*/asdf").regex).toEqual(/foo\/.*\/asdf/);
  });
});

describe("pathToRegex", () => {
  it("should not match", () => {
    expect(pathToRegExp("foo/")("foo2/bar")).toEqual(null);
  });

  it("should convert to lowercase", () => {
    expect(pathToRegExp("fOo/*")("FOO/asd")).toEqual({});
  });

  it("should return no parameters", () => {
    expect(pathToRegExp("foo/*")("foo/bar")).toEqual({});
    expect(pathToRegExp("foo/*/bar")("foo/bar/bar")).toEqual({});
  });

  it("should return parameters", () => {
    expect(pathToRegExp("foo/:name/bob")("foo/bar/bob")).toEqual({
      name: "bar",
    });

    expect(pathToRegExp("foo/:name/*/:foo")("foo/bar/bob/foo")).toEqual({
      name: "bar",
      foo: "foo",
    });
  });
});
