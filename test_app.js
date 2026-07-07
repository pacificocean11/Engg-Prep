const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('./www/index.html', 'utf8');

const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("error", (error) => {
  console.error("JSDOM Error:", error);
});
virtualConsole.on("jsdomError", (error) => {
  console.error("JSDOM jsdomError:", error);
});
virtualConsole.on("log", (log) => {
  console.log("JSDOM Log:", log);
});

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  resources: "usable",
  virtualConsole
});
