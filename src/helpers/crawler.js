const axios = require("axios");
const cheerio = require("cheerio");
const { URL } = require("url");
const { queue } = require("async");

const DEFAULT_DOMAIN = "https://wiprodigital.com";

class Crawler {
    constructor(params) {
        if (typeof params !== "object") {
            params = {};
        }
        this._crawlExternal = params.crawlExternal || false;
        this._workers = params.workers || 4;
        this._pagesVisited = {};
        this._queue = queue(this._crawlPage, this._workers);
        this._domain = undefined;
        this._baseUrl = undefined;
        this._siteMap = undefined;
    }

    _setDomain = (url) => {
        this._domain = url;
        const domainUrl = new URL(url);
        this._baseUrl = domainUrl.protocol + "//" + domainUrl.hostname;
    }

    _wasCrawled = (url) => {
        if (!url) {
            url = "";
        }

        if (typeof url !== "string") {
            url = url.toString();
        }

        if (this._pagesVisited[url]) {
            return true;
        }

        return false;
    }

    _parsePageInfo = (html) => {
        const $ = cheerio.load(html);
        let page = {
            "title": $("title").text()
        }
        const allLinks = this._collectLinks($);
        const staticUrls = this._collectStaticUrls($);
        page.internalUrls = allLinks.internalLinks;
        page.externalUrls = allLinks.externalLinks;
        page.imageUrls = staticUrls.images;
        this._siteMap.pages.push(page);
    }

    _crawlPage = async (url) => {
        console.log(`Visiting page ${url}`);
        let response;
        try {
            response = await axios.get(url);
            console.log(`Status code: ${response.status}`);

            if (response.status !== 200) {
                callback();
                return;
            }

            this._parsePageInfo(response.data);
        } catch (error) {
            console.error(`Error visiting page: ${url}`);
            console.error(error);
        } finally {
            return;
        }
    }

    _collectLinks = ($) => {
        const allLinks = {
            internalLinks: [],
            externalLinks: []
        }
        let urls = $("a");
        Object.keys(urls).forEach((item) => {
            if (urls[item].type === "tag") {
                let href = urls[item].attribs.href;
                if (!href) {
                    return;
                }
                if (href.startsWith(this._domain) || href === this._domain || href.startsWith("/")) {
                    let internalPageUrl;
                    if (href.startsWith("/")) {
                        internalPageUrl = this._baseUrl + href;
                    } else {
                        internalPageUrl = href;
                    }
                    allLinks.internalLinks.push(internalPageUrl);

                    // Add internal urls for visit, if not visited before
                    if (!this._wasCrawled(internalPageUrl)) {
                        // console.log(`Found new page: ${internalPageUrl}`);
                        this._pagesVisited[internalPageUrl] = true;
                        this._queue.push(internalPageUrl);
                    }
                } else {
                    allLinks.externalLinks.push(href);
                }
            }
        });
        return allLinks;
    }

    _collectStaticUrls = ($) => {
        let staticContentLinks = {
            images: []
        };
        $("img").each(function (i, image) {
            staticContentLinks.images.push($(image).attr("src"));
        });
        return staticContentLinks;
    }

    start = (domain) => {
        let domainUrl = domain || DEFAULT_DOMAIN;
        domainUrl = domainUrl.replace(/\/?$/, "/");
        this._setDomain(domainUrl);
        this._siteMap = {
            domain: domainUrl,
            pages: []
        }
        this._pagesVisited[this._domain] = true;
        this._queue.push(this._domain);
    }

    end = async () => {
        await this._queue.drain();
        return this._siteMap;
    }

}

module.exports = Crawler;