import { describe, it, expect } from "vitest";
import { parseCSVLine, parseMultiValueField } from "./csvParser";

describe("parseCSVLine", () => {
  it("splits a simple comma-separated line", () => {
    expect(parseCSVLine("a,b,c")).toEqual(["a", "b", "c"]);
  });

  it("trims whitespace around each field", () => {
    expect(parseCSVLine(" a , b ,c ")).toEqual(["a", "b", "c"]);
  });

  it("keeps commas inside quoted fields", () => {
    expect(parseCSVLine('a,"b,c",d')).toEqual(["a", "b,c", "d"]);
  });

  it('unescapes doubled quotes ("") inside a quoted field', () => {
    expect(parseCSVLine('"a ""quoted"" word",b')).toEqual([
      'a "quoted" word',
      "b",
    ]);
  });

  it("produces an empty trailing field for a trailing comma", () => {
    expect(parseCSVLine("a,")).toEqual(["a", ""]);
  });

  it("returns a single empty field for an empty line", () => {
    expect(parseCSVLine("")).toEqual([""]);
  });
});

describe("parseMultiValueField", () => {
  it("splits on semicolons and trims each value", () => {
    expect(parseMultiValueField("wifi; pool ;gym")).toEqual([
      "wifi",
      "pool",
      "gym",
    ]);
  });

  it("drops empty segments", () => {
    expect(parseMultiValueField("a;;b")).toEqual(["a", "b"]);
    expect(parseMultiValueField(" ; ; ")).toEqual([]);
  });

  it("returns an empty array for empty/falsy input", () => {
    expect(parseMultiValueField("")).toEqual([]);
    expect(parseMultiValueField(undefined as unknown as string)).toEqual([]);
  });
});
