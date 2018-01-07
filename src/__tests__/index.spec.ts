import { parse, PathRegExp } from "../index";

describe("parse", () => {
  it("should escape /", () => {
    expect(parse("foo/").regex).toEqual(/foo\//);
    expect(parse("foo/bar/").regex).toEqual(/foo\/bar\//);
  });

  it("should add ^ if beginning", () => {
    expect(parse("/foo/")).toEqual({
      regex: /^\/foo\//,
      absolute: true,
      params: [],
    });
  });

  it("should parse parameters", () => {
    expect(parse("foo/:name")).toEqual({
      regex: /foo\/(\w+)/,
      absolute: false,
      params: ["name"],
    });
    expect(parse("foo/:name/bar")).toEqual({
      regex: /foo\/(\w+)\/bar/,
      absolute: false,
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
    expect(new PathRegExp("foo/").match("foo2/bar")).toEqual(null);
  });

  it("should convert to lowercase", () => {
    expect(new PathRegExp("fOo/*").match("FOO/asd")).toEqual({
      absolute: false,
      path: "fOo/*",
      matched: "foo/asd",
      params: {},
    });
  });

  it("should return no parameters", () => {
    expect(new PathRegExp("foo/*/bar").match("foo/bar/bar")).toEqual({
      matched: "foo/bar/bar",
      path: "foo/*/bar",
      absolute: false,
      params: {},
    });
  });

  it("should return parameters", () => {
    expect(new PathRegExp("foo/*").match("foo/bar/bob")).toEqual({
      matched: "foo/bar/bob",
      path: "foo/*",
      absolute: false,
      params: {},
    });
    expect(new PathRegExp("foo/").match("foo/bar/bob")).toEqual({
      matched: "foo/",
      path: "foo/",
      absolute: false,
      params: {},
    });
    expect(new PathRegExp("foo/:name/bob").match("foo/bar/bob")).toEqual({
      matched: "foo/bar/bob",
      path: "foo/:name/bob",
      absolute: false,
      params: {
        name: "bar",
      },
    });

    expect(new PathRegExp("foo/:name/*/:foo").match("foo/bar/bob/foo")).toEqual(
      {
        path: "foo/:name/*/:foo",
        absolute: false,
        matched: "foo/bar/bob/foo",
        params: {
          name: "bar",
          foo: "foo",
        },
      },
    );
  });
});
