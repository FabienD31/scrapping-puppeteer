import puppeteer from "puppeteer-extra";
import fs from "fs";
import { collection, addDoc } from "firebase/firestore";
import db from "./server.js";

// add stealth plugin and use defaults (all evasion techniques)
import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

let nbPage = 2;
let category = "soins";

(async () => {
  let nb = 1;
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  while (nb <= nbPage) {
    console.log("page : " + nb);
    await page.goto(
      `https://www.parapharmacielafayette.com/fr/cp/${category}.html?page=${nb}`
    );
    const linkListProduct = await page.evaluate(() => {
      let products = [];
      let list = document.querySelectorAll("#listing > article");
      for (elem of list) {
        products.push({
          link: elem.querySelector("h3 > a")?.href,
        });
      }
      return products;
    });
    await ScrapDetailAndcreateJSON(linkListProduct, browser);
    nb++;
  }
  await browser.close();
})();

async function ScrapDetailAndcreateJSON(products, browser) {
  let json = [];
  for (let element of products) {
    const pageDetail = await browser.newPage();
    try {
      await pageDetail.goto(`${element.link}`);
      console.count("produit : ");
      const detailProduct = await pageDetail.evaluate(() => {
        let list = document.querySelectorAll("#fiche > div");
        let productDetail = {};
        for (elem of list) {
          productDetail = {
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
            usingAdvice: elem.querySelector("#type_info_prio_6_1 > p")
              ?.innerText,
            description: elem.querySelector("#type_info_prio_11_1 > p")
              ?.innerText,
            composition: elem.querySelector(
              "div.div_table_informations > div > div:nth-child(3) > div.content_zone_desc.tabcontent"
            )?.innerText,
          };
        }
        return productDetail;
      });
      json.push(detailProduct);
      sendDataToFirebase(detailProduct);
    } catch (error) {
      throw error;
    }
    await pageDetail.close();
  }

  fs.appendFileSync(
    `./${category}.json`,
    JSON.stringify(Object.assign(json, json))
  );
}

async function sendDataToFirebase(data) {
  try {
    const docRef = await addDoc(collection(db, `${category}`), data);
  } catch (e) {
    throw e;
  }
}
