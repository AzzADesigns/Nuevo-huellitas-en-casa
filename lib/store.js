import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const dataPath = (name) => path.join(process.cwd(), "data", name);
export async function readCollection(name) {
  try { return JSON.parse(await readFile(dataPath(name), "utf8")); }
  catch (error) { if (error.code === "ENOENT") return []; throw error; }
}
export async function writeCollection(name, data) {
  await writeFile(dataPath(name), `${JSON.stringify(data, null, 2)}\n`, "utf8");
}
