process.env.NODE_ENV = process.env.NODE_ENV || "production";
process.env.COMUNICATEA_BASE_PATH = process.env.COMUNICATEA_BASE_PATH || "/comunicatea";

require("./dist/server.cjs");
