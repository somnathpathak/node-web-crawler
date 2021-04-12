const chai = require("chai");
const expect = chai.expect

const BASIC_LINKS_PAGE = "https://www.webfx.com/blog/images/assets/cdn.sixrevisions.com/0435-01_html5_download_attribute_demo/samp/htmldoc.html"
const RELATIVE_LINKS_PAGE = "https://somnathpathak.github.io/web/"
const CrawlerService = require("../src/helpers/crawler");

describe("Crawler Service", () => {
    let crawlerService;

    beforeEach(() => {
        crawlerService = new CrawlerService();
    });

    it("should find and crawl URLs found on the pages in the queue", async () => {
        crawlerService.start(BASIC_LINKS_PAGE);
        const siteMap = await crawlerService.end();
        expect(siteMap.pages[0].internalUrls.length).to.equal(0);
        expect(siteMap.pages[0].externalUrls.length).to.equal(2);
        expect(siteMap.pages[0].imageUrls.length).to.equal(0);
    });


    it("should not crawl external URLs", async () => {
        crawlerService.start(BASIC_LINKS_PAGE);
        const siteMap = await crawlerService.end();
        expect(siteMap.pages.length).to.equal(1);
    });

    it("should crawl relative/internal urls", async () => {
        crawlerService.start(RELATIVE_LINKS_PAGE);
        const siteMap = await crawlerService.end();
        expect(siteMap.pages.length).to.equal(7);
    });
})
