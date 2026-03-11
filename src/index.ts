import { readConfig, setUser } from "./config.js";

function main() {
  setUser("Farul");
  const cfg = readConfig();
  console.log(cfg);
}

main();
