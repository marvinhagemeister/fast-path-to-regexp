import { parse, PathRegExp, createUrl } from "./index";

describe("parse", () => {
  it("should escape /", () => {
    expect(parse("foo/bar").regex).toEqual(/foo\/bar\//);
    expect(parse("foo/bar/bob").regex).toEqual(/foo\/bar\/bob\//);
  });

  it("should normalize ending slash", () => {
    expect(parse("foo/").regex).toEqual(/foo\//);
    expect(parse("foo/:id/").regex).toEqual(/foo\/([\w-_.]+)\//);
  });

  it("should add ^ if beginning", () => {
    expect(parse("/foo/")).toEqual({
      regex: /^\/foo\//,
      absolute: true,
      params: [],
      exact: false,
    });
  });

  it("should parse parameters", () => {
    expect(parse("foo/:name")).toEqual({
      regex: /foo\/([\w-_.]+)\//,
      absolute: false,
      params: ["name"],
      exact: false,
    });
    expect(parse("foo/:name/bar")).toEqual({
      regex: /foo\/([\w-_.]+)\/bar\//,
      absolute: false,
      params: ["name"],
      exact: false,
    });
  });

  it("should parse *", () => {
    expect(parse("foo/*").regex).toEqual(/foo\/(.*)\//);
    expect(parse("foo/*/asdf").regex).toEqual(/foo\/(.*)\/asdf\//);

    expect(parse("foo/*/asdf")).toEqual({
      regex: /foo\/(.*)\/asdf\//,
      absolute: false,
      params: ["*"],
      exact: false,
    });
  });

  it("should not lowercase parameters", () => {
    expect(parse("foo/:ID")).toEqual({
      regex: /foo\/([\w-_.]+)\//,
      absolute: false,
      params: ["ID"],
      exact: false,
    });
    expect(parse("foo/:ID/bar")).toEqual({
      regex: /foo\/([\w-_.]+)\/bar\//,
      absolute: false,
      params: ["ID"],
      exact: false,
    });
  });
});

describe("pathToRegex", () => {
  it("should not match", () => {
    expect(new PathRegExp("foo/").match("foo2/bar")).toEqual(null);
  });

  it("should be case sensitive", () => {
    expect(new PathRegExp("fOo/*").match("FOO/asd")).toEqual(null);
    expect(new PathRegExp("fOo/*").match("fOo/asd")).toEqual({
      absolute: false,
      path: "fOo/*",
      matched: "fOo/asd",
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
      matched: "foo",
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

  it("should match parameters with 'special' characters", () => {
    expect(new PathRegExp("foo/:p1.P2-p3_").match("foo/bar.asd/")).toEqual({
      matched: "foo/bar.asd",
      path: "foo/:p1.P2-p3_",
      absolute: false,
      params: {
        "p1.P2-p3_": "bar.asd",
      },
    });
    expect(
      new PathRegExp("foo/:p1.P2-p3_", true).match("foo/bar.asd/"),
    ).toEqual({
      matched: "foo/bar.asd",
      path: "foo/:p1.P2-p3_",
      absolute: false,
      params: {
        "p1.P2-p3_": "bar.asd",
      },
    });

    expect(
      new PathRegExp("foo/:p1.P2-p3_", true).match("foo/bar.asd/asd"),
    ).toEqual(null);
  });

  it("should match only if exact route", () => {
    expect(new PathRegExp("/", true).match("/")).toEqual({
      absolute: true,
      matched: "/",
      params: {},
      path: "/",
    });
    expect(new PathRegExp("/", true).match("/foo")).toEqual(null);
    expect(new PathRegExp("/", true).match("bar/foo")).toEqual(null);
  });

  it("should match exact route with parameters", () => {
    expect(new PathRegExp("/:foo/bar", true).match("/aa-bb--cc/bar")).toEqual({
      absolute: true,
      matched: "/aa-bb--cc/bar",
      params: {
        foo: "aa-bb--cc",
      },
      path: "/:foo/bar",
    });
  });

  it("should match route with query parameters", () => {
    expect(new PathRegExp("/foo?bar=:id", true).match("/foo?bar=123")).toEqual({
      absolute: true,
      matched: "/foo?bar=123",
      params: {
        id: "123",
      },
      path: "/foo?bar=:id",
    });
  });

  it("should match route with query parameters #2", () => {
    expect(
      new PathRegExp("/foo?bar=:id&bob=:id2", true).match(
        "/foo?bar=123&bob=abc",
      ),
    ).toEqual({
      absolute: true,
      matched: "/foo?bar=123&bob=abc",
      params: {
        id: "123",
        id2: "abc",
      },
      path: "/foo?bar=:id&bob=:id2",
    });
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
