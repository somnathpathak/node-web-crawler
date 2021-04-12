const hostname = "127.0.0.1";
const port = 3000;

const server = require("./src/controller");

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

module.exports = server;
