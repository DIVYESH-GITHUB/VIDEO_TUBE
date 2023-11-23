class ApiResponse {
  constructor(statuCode, data, message = "Success") {
    this.statuCode = statuCode;
    this.data = data;
    this.message = message;
  }
}

export { ApiResponse };
