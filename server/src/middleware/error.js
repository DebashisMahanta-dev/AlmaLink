export const errorHandler = (err, req, res, next) => {
  if (err?.message?.includes("Only PDF")) {
    return res.status(400).json({ message: err.message });
  }
  if (err?.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File too large. Max 2MB." });
  }
  return res.status(500).json({ message: "Server error" });
};
