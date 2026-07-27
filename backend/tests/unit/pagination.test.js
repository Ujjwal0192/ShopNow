const { sanitizePagination, MAX_LIMIT } = require("../../src/utils/pagination");

describe("sanitizePagination", () => {
  test("returns defaults when nothing is provided", () => {
    expect(sanitizePagination({}, 12)).toEqual({ page: 1, limit: 12 });
  });

  test("passes through valid page and limit", () => {
    expect(sanitizePagination({ page: 3, limit: 20 })).toEqual({ page: 3, limit: 20 });
  });

  test("caps a limit above MAX_LIMIT", () => {
    // this is the exact ?limit=999999 case from the review
    expect(sanitizePagination({ page: 1, limit: 999999 })).toEqual({ page: 1, limit: MAX_LIMIT });
  });

  test("clamps page below 1 up to 1", () => {
    expect(sanitizePagination({ page: -5, limit: 10 })).toEqual({ page: 1, limit: 10 });
    expect(sanitizePagination({ page: 0, limit: 10 })).toEqual({ page: 1, limit: 10 });
  });

  test("falls back to default limit on non-numeric input", () => {
    expect(sanitizePagination({ page: "abc", limit: "xyz" }, 12)).toEqual({ page: 1, limit: 12 });
  });

  test("handles undefined page/limit object entirely", () => {
    expect(sanitizePagination(undefined, 12)).toEqual({ page: 1, limit: 12 });
  });
});
