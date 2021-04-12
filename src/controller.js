const http = require("http");
const { URL } = require("url");

module.exports = http.createServer((req, res) => {
    const service = require("./service.js");
    const baseURL = `http://${req.headers.host}/`;
    const reqUrl = new URL(req.url, baseURL);
    const method = req.method;

    switch (method) {
        case "GET":
            if (reqUrl.pathname === "/crawl") {
                console.log(`Request Type: ${req.method} Endpoint: ${reqUrl.pathname}`);
                service.crawl(req, res);
            }
            break;

        default:
            console.log(`Request Type: ${req.method} Invalid Endpoint: ${reqUrl.pathname}`);
            service.invalidRequest(req, res);
            break;
    }
});