const { URL } = require("url");
const { parse: parseQuery } = require("querystring");
const CrawlerService = require("./helpers/crawler");

const invalidRequest = function (req, res) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain");
    res.end("Invalid Request");
};

const crawl = async function (req, res) {
    const baseURL = `http://${req.headers.host}/`;
    const reqUrl = new URL(req.url, baseURL);
    const query = parseQuery(reqUrl.search.substr(1));

    let startingUrl = undefined;
    if (query.url) {
        startingUrl = query.url;
    }

    // Initialize crawler service
    const crawlerService = new CrawlerService();
    crawlerService.start(startingUrl);
    crawlerService.end().then((response) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(response));
    }).catch(error => {
        console.error("Crawler Service Errored", error);
    });
};

module.exports = {
    invalidRequest,
    crawl
};