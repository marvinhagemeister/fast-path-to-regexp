import Benchmark from "benchmarkjs-pretty";
import * as pathToRegExp from "path-to-regexp";
import * as urlPattern from "url-pattern";
import { PathRegExp as custom, PathRegExp } from "../src/index";

const v1 = "/foo/:bar/*/:bob/boof";
const v2 = "/foo/:bar/(.*)/:bob/boof";
const url = "/foo/v1/bar/foo/v2/boof";

let matches1 = 0;
let matches2 = 0;
let matches3 = 0;

export async function run() {
  return new Benchmark("Convert Path To RegExp")
    .add("path-to-regexp", () => {
      const keys: any[] = [];
      const regex = pathToRegExp(v2, keys);
      if (regex.test(url)) {
        matches1++;
      }
    })
    .add("url-pattern", () => {
      if (new urlPattern(v1).match(url)) {
        matches2++;
      }
    })
    .add("custom", () => {
      if (new PathRegExp(v1).match(url)) {
        matches3++;
      }
    })
    .run();
}

run();
