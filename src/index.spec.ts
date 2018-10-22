import { parse, PathRegExp, createUrl } from "./index";

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
    expect(parse("foo/*").regex).toEqual(/foo\/(.*)/);
    expect(parse("foo/*/asdf").regex).toEqual(/foo\/(.*)\/asdf/);

    expect(parse("foo/*/asdf")).toEqual({
      regex: /foo\/(.*)\/asdf/,
      absolute: false,
      params: ["*"],
    });
  });

  it("should not lowercase parameters", () => {
    expect(parse("foo/:ID")).toEqual({
      regex: /foo\/(\w+)/,
      absolute: false,
      params: ["ID"],
    });
    expect(parse("foo/:ID/bar")).toEqual({
      regex: /foo\/(\w+)\/bar/,
      absolute: false,
      params: ["ID"],
    });
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
      params: {
        "*": "asd",
      },
    });
  });

  it("should return no parameters", () => {
    expect(new PathRegExp("foo/*/bar").match("foo/bar/bar")).toEqual({
      matched: "foo/bar/bar",
      path: "foo/*/bar",
      absolute: false,
      params: {
        "*": "bar",
      },
    });
  });

  it("should return parameters", () => {
    expect(new PathRegExp("foo/*").match("foo/bar/bob")).toEqual({
      matched: "foo/bar/bob",
      path: "foo/*",
      absolute: false,
      params: {
        "*": "bar/bob",
      },
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
          "*": "bob",
        },
      },
    );
  });

  it("should match only if exact route", () => {
    expect(new PathRegExp("/").match("/", true)).toEqual({
      absolute: true,
      matched: "/",
      params: {},
      path: "/",
    });
    expect(new PathRegExp("/").match("/foo", true)).toEqual(null);
    expect(new PathRegExp("/").match("bar/foo", true)).toEqual(null);
  });
});

describe("createUrl", () => {
  it("should work without parameters", () => {
    const reg = new PathRegExp("/foo/bar");
    expect(createUrl(reg)).toEqual("/foo/bar");
  });

  it("should replace parameters", () => {
    const reg = new PathRegExp("/foo/:id");
    expect(createUrl(reg, { id: 123 })).toEqual("/foo/123");
  });

  it("should replace *", () => {
    const reg = new PathRegExp("/foo/*");
    expect(createUrl(reg, { "*": 123 })).toEqual("/foo/123");
  });
});
