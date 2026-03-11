import fs from "fs";
import os from "os";
import path from "path";

export type Config = {
  dbUrl: string;
  currentUserName: string;
}

export function setUser(username: string) {
  const config = readConfig();
  config.currentUserName = username;
  writeConfig(config);
}

export function readConfig(): Config {
  const configPath = getConfigFilePath();
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  return validateConfig(config);
}

function getConfigFilePath(): string {
  return path.join(os.homedir(), ".gatorconfig.json");
}

function writeConfig(cfg: Config): void {
  const rawConfig = {
    db_url: cfg.dbUrl,
    current_user_name: cfg.currentUserName,
  };
  fs.writeFileSync(getConfigFilePath(), JSON.stringify(rawConfig, null, 2), { encoding: "utf-8" });
}

function validateConfig(rawConfig: any): Config {
  if (!rawConfig.db_url || typeof rawConfig.db_url !== "string") {
    throw new Error("db_url is required in config file");
  }
  if (
    !rawConfig.current_user_name ||
    typeof rawConfig.current_user_name !== "string"
  ) {
    throw new Error("current_user_name is required in config file");
  }

  const config: Config = {
    dbUrl: rawConfig.db_url,
    currentUserName: rawConfig.current_user_name,
  };

  return config;
}
