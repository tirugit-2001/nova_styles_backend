class Apperror extends Error {
  public statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message || "An error occurred");
    this.statusCode = statusCode;
    this.name = "Apperror";
    // Ensure message is set
    if (!this.message) {
      this.message = message || "An error occurred";
    }
  }
}

export default Apperror;
