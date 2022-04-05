const puppeteer = require('puppeteer-extra')
const fs = require('fs');

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

let nbPage = '3';
let category = "veterinaire";

(async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    let nb = "1";
    while (nb <= nbPage) {    
    console.log("page : " + nb);    
        await page.goto(`https://www.parapharmacielafayette.com/fr/cp/${category}.html?page=${nb}`);
        const choco = await page.evaluate(() => {
            let products = [];
            let list = document.querySelectorAll("#listing > article");
            for (elem of list) {
                products.push({
                    "brand": elem.querySelector("h3 > a > div")?.innerText,
                    "lien": elem.querySelector("h3 > a")?.href,
                    "img": elem.querySelector("img")?.src,
                })
            }
            return products;
        });
        createJSON(choco);
         nb++; 
    }
    await browser.close();
    
})();

function createJSON(products) {
    let json = JSON.stringify(products);
    fs.writeFileSync(`./${category}.json`, json);
}