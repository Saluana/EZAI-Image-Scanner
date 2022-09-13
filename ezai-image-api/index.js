"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
require("dotenv").config();
var port = process.env.PORT || 8081;
var app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "*",
}));
app.use(express_1.default.json());
var imageai_1 = __importDefault(require("./routes/imageai"));
app.use("/", imageai_1.default);
app.listen(port, function () {
    console.log("Server running on port ".concat(port));
});
