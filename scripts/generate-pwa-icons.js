import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [192, 512];
const inputPath = join(__dirname, "../public/logo.png");
const outputDir = join(__dirname, "../public");

async function generateIcons() {
  for (const size of sizes) {
    await sharp(inputPath)
      .resize(size, size, {
        fit: "contain",
        background: { r: 254, g: 252, b: 232, alpha: 1 }, // food-yellow-50
      })
      .png()
      .toFile(join(outputDir, `pwa-${size}x${size}.png`));

    console.log(`✅ Generated pwa-${size}x${size}.png`);
  }

  // Generate favicon
  await sharp(inputPath)
    .resize(32, 32, {
      fit: "contain",
      background: { r: 254, g: 252, b: 232, alpha: 1 },
    })
    .png()
    .toFile(join(outputDir, "favicon.ico"));

  console.log("✅ Generated favicon.ico");
  console.log("\n🎉 All PWA icons generated successfully!");
}

generateIcons().catch(console.error);
