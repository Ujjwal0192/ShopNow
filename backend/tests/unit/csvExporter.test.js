const { escapeCSVValue } = require("../../src/utils/csvExporter");

describe("escapeCSVValue", () => {
  test("wraps a plain value in quotes", () => {
    expect(escapeCSVValue("hello")).toBe('"hello"');
  });

  test("doubles internal quotes (RFC 4180)", () => {
    expect(escapeCSVValue('say "hi"')).toBe('"say ""hi"""');
  });

  test("handles commas inside a value without breaking columns", () => {
    expect(escapeCSVValue("123 Main St, Apt 4")).toBe('"123 Main St, Apt 4"');
  });

  test("handles null/undefined as empty string, not the literal text 'null'", () => {
    expect(escapeCSVValue(null)).toBe('""');
    expect(escapeCSVValue(undefined)).toBe('""');
  });

  test("handles numbers", () => {
    expect(escapeCSVValue(1499)).toBe('"1499"');
  });

  test("handles newlines inside a value (e.g. a multi-line delivery address)", () => {
    expect(escapeCSVValue("Line 1\nLine 2")).toBe('"Line 1\nLine 2"');
  });
});
