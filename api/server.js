const app = require("./app");
const http = require("http");

const PORT = 3000;

app.set("port", PORT);
const server = http.createServer(app);
server.on("listening", () => {
    console.log(`listening on port ${PORT}`);
});
server.listen(PORT);