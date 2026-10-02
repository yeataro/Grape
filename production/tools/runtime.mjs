if (process.version !== "v25.5.0")
  throw new Error(
    "Grape S01 requires Node.js 25.5.0; effective runtime: " + process.version,
  );
