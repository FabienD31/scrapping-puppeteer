const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.goto('https://www.imdb.com/movies-coming-soon/2022-07');
    const movies = await page.evaluate(() => {
        let movies = [];
        let list = document.querySelectorAll("#main > div > div.list.detail > div.list_item");
        for (elem of list) {
            movies.push({
                img: elem.querySelector("img").src,
                title: elem.querySelector("h4 > a").innerText,
            })
        }
        return movies;
    });
    console.log(movies);
    await browser.close();
    
})();