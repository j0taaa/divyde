import sharp from "sharp";
import { mkdir } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [192, 512];

async function generateIcons() {
  const svgPath = join(__dirname, "../public/icons/icon.svg");
  const outputDir = join(__dirname, "../public/icons");

  await mkdir(outputDir, { recursive: true });

  for (const size of sizes) {
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(join(outputDir, `icon-${size}.png`));

    console.log(`Generated icon-${size}.png`);
  }

  console.log("All icons generated!");
}

generateIcons().catch(console.error);
