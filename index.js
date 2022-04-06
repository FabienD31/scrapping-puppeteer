const puppeteer = require("puppeteer-extra");
const fs = require("fs");

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

let nbPage = 1;
let category = "veterinaire";

(async () => {
  let nb = 1;
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  while (nb <= nbPage) {
    console.log("page : " + nb);
    await page.goto(
      `https://www.parapharmacielafayette.com/fr/cp/${category}.html?page=${nb}`
    );
    const choco = await page.evaluate(() => {
      let products = [];
      let list = document.querySelectorAll("#listing > article");
      for (elem of list) {
        products.push({
          link: elem.querySelector("h3 > a")?.href,
        });
      }
      return products;
    });
    ScrapDetailAndcreateJSON(choco);
    nb++;
  }
  await browser.close();
})();

async function ScrapDetailAndcreateJSON(products) {
  //   let obj = Object.assign({}, products);
  // console.log(obj);
  const browser2 = await puppeteer.launch({ headless: true });
  const pageDetail = await browser2.newPage();
  await pageDetail.goto(
    `https://www.parapharmacielafayette.com/fr/p/dermorens-creme-mains-seches-abimees-75-ml-F61012.html`
    // `${products.link}`
  );
  const detailProduct = await pageDetail.evaluate(() => {
    let productsDetail = [];
    let list = document.querySelectorAll("#fiche > div");
    for (elem of list) {
      productsDetail.push({
        ean: elem.querySelector("#type_info_prio_cab_0 > span")?.innerText,
        nameProduct: elem.querySelector("#type_info_prio_12_1")?.innerText,
        nameBrand: elem.querySelector("div.prod_subtitle > a")?.innerText,
        price: elem.querySelector("div.infos_prix_fiche_produit > span")
          ?.innerText,
        urlProduct: elem.querySelector("link")?.href,
        img: elem.querySelector("img")?.src,
        shape: elem.querySelector("#type_info_prio_4_1")?.innerText,
        contenance: elem.querySelector("#type_info_prio_3_1")?.innerText,
        presentation: elem.querySelector("#type_info_prio_5_1")?.innerText,
        usingAdvice: elem.querySelector("#type_info_prio_6_1 > p")?.innerText,
        description: elem.querySelector("#type_info_prio_11_1 > p")?.outerHTML,
        composition: elem.querySelector(
          "div.div_table_informations > div > div:nth-child(3) > div.content_zone_desc.tabcontent"
        )?.innerText,
      });
    }
    return productsDetail;
  });
  console.log(detailProduct);
  await browser2.close();

  //   let json = JSON.stringify(obj);
  //   fs.appendFileSync(`./${category}.json`, json);
  //   fs.writeFileSync(`./${category}.json`, json);
}
