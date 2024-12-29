const axios = require('axios');
const cheerio = require('cheerio');

const baseURL = 'https://www.amazon.com/s?k=graphics+card';

async function scrapeAmazonPage(url) {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const products = [];
        $('.s-main-slot .s-result-item').each((index, element) => {
            const title = $(element).find('.a-link-normal h2').text().trim();
            const price = $(element).find('.a-price .a-offscreen').text().trim();
            const link = 'https://www.amazon.com' + $(element).find('h2 .a-link-normal').attr('href');
            const image = $(element).find('.s-image').attr('src');

            if (title && price) {
                products.push({ title, price, link, image });
            }
        });

        return { products, hasNextPage: !!$('.s-pagination-next').attr('href') };
    } catch (error) {
        console.error('Error scraping page:', error.message);
        return { products: [], hasNextPage: false };
    }
}

async function scrapeAmazonAllPages() {
    let currentPage = 1;
    let url = baseURL;
    const allProducts = [];

    while (true) {
        console.log(`Scraping page ${currentPage}...`);
        const { products, hasNextPage } = await scrapeAmazonPage(url);

        allProducts.push(...products);

        if (!hasNextPage) break;

        // Update URL for the next page
        currentPage += 1;
        url = `${baseURL}&page=${currentPage}`;
    }

    console.log(`Scraped ${allProducts.length} products across ${currentPage} pages.`);
    console.log(allProducts);
}

scrapeAmazonAllPages();
