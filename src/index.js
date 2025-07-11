const styles = {
  pageContainer: {
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem"
  },
  cardContainer: {
    width: "100%",
    maxWidth: "28rem",
    backgroundColor: "white",
    borderRadius: "0.75rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    padding: "1.5rem"
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    textAlign: "center",
    color: "#1f2937",
    marginBottom: "1.5rem"
  },
  connectButton: {
    padding: "0.75rem 1.5rem",
    borderRadius: "0.5rem",
    fontWeight: "500",
    color: "white",
    backgroundColor: "#2563eb",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.2s"
  },
  statusIndicator: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    marginBottom: "1rem"
  },
  statusDot: {
    width: "0.75rem",
    height: "0.75rem",
    borderRadius: "9999px",
    backgroundColor: "#10b981"
  },
  statusText: {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#4b5563"
  },
  contentBox: {
    backgroundColor: "#f3f4f6",
    padding: "1rem",
    borderRadius: "0.5rem"
  },
  actionButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#e5e7eb",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#374151",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.2s"
  },
  disabledButton: {
    opacity: 0.5,
    cursor: "not-allowed"
  },
  dataDisplay: {
    padding: "0.75rem",
    backgroundColor: "#f9fafb",
    borderRadius: "0.375rem",
    marginTop: "0.5rem",
    fontSize: "0.875rem",
    fontFamily: "monospace",
    color: "#1f2937"
  },
  tokenButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#8b5cf6",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#ffffff",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.2s"
  },
  errorDisplay: {
    padding: "0.75rem",
    backgroundColor: "#fee2e2",
    borderRadius: "0.375rem",
    marginTop: "0.5rem",
    fontSize: "0.875rem",
    color: "#b91c1c"
  },


  transferContainer: {
    marginTop: "1rem"
  },
  transferButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "rgb(245 158 11)",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#ffffff",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.2s"
  },
  disabledTransferButton: {
    backgroundColor: "#e5e7eb",
    color: "#9ca3af",
    cursor: "not-allowed",
    opacity: 0.5
  },
  transferResponse: {
    padding: "0.75rem",
    backgroundColor: "#f9fafb",
    borderRadius: "0.375rem",
    marginTop: "0.5rem",
    wordBreak: "break-all",
    fontSize: "0.875rem",
    fontFamily: "monospace",
    color: "#1f2937"
  }
};