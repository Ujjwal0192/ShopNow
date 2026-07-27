const { Readable } = require("stream");

const escapeCSVValue = (val) => {
  const str = String(val ?? "");
  return `"${str.replace(/"/g, '""')}"`;
};

/**
 * Streams CSV rows to the response as they're generated instead of building
 * one giant string in memory first. For a few hundred rows the difference
 * is invisible; for a real export (thousands of orders) the old version
 * held the entire CSV as one string in Node's heap before sending a single
 * byte. This holds one row in memory at a time.
 *
 * `rows` can be a plain array (kept for callers with small result sets) or
 * an async generator / anything Readable.from() accepts, so a caller doing
 * a paginated DB cursor read doesn't have to load everything up front either
 * — the memory-efficiency claim only holds end-to-end if the caller streams
 * from the DB too, not just from this function outward.
 */
const streamCSVResponse = (res, filename, headers, rows) => {
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  res.write(headers.map(escapeCSVValue).join(",") + "\n");

  const source = Readable.from(rows);

  source.on("data", (row) => {
    const line = headers.map((h) => escapeCSVValue(row[h])).join(",") + "\n";
    res.write(line);
  });

  source.on("end", () => res.end());

  source.on("error", (err) => {
    // Headers are already sent by this point (streaming), so we can't send
    // a clean JSON error — the best we can do is end the response and log
    // it. This is a real, documented limitation of streaming exports: you
    // trade "can send a proper error mid-stream" for "doesn't blow up
    // memory on large exports."
    console.error("CSV export stream error:", err);
    res.end();
  });
};

module.exports = { streamCSVResponse, escapeCSVValue };
