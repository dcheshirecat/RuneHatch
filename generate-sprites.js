#!/usr/bin/env node
/**
 * Runehatch Sprite Generator
 * Connects to a local Automatic1111 (AUTOMATIC1111/stable-diffusion-webui) instance
 * and generates all egg + creature sprites for the game.
 *
 * Usage:
 *   1. Start Automatic1111 with: --api --listen
 *   2. Run: node generate-sprites.js
 *   3. Find output in: assets/sprites/
 */

const fs = require("fs");
const path = require("path");
const https = require("http"); // local A1111 is HTTP

// ── Config ────────────────────────────────────────────────────────────────────
const A1111_HOST = "127.0.0.1";
const A1111_PORT = 7860;
const OUTPUT_DIR = path.join(__dirname, "assets", "sprites");

const IMAGE_SIZE = 512; // square sprites — resize in-app as needed
const STEPS = 30;
const CFG_SCALE = 7;
const SAMPLER = "DPM++ 2M Karras";

// Shared style appended to every prompt
const STYLE_SUFFIX = [
  "glowing runic engravings",
  "ancient mystical creature",
  "bioluminescent runes etched into skin",
  "dark fantasy",
  "black background",
  "centered composition",
  "game sprite",
  "highly detailed",
  "concept art",
  "magical aura",
  "neon rune glow",
].join(", ");

const NEGATIVE_PROMPT = [
  "text",
  "watermark",
  "signature",
  "blurry",
  "low quality",
  "human",
  "person",
  "ugly",
  "deformed",
  "extra limbs",
  "photorealistic",
  "nsfw",
].join(", ");

// ── Sprite definitions ────────────────────────────────────────────────────────
const SPRITES = [
  // EGGS
  {
    id: "egg_ember",
    type: "egg",
    prompt: `a mystical dragon egg, volcanic obsidian shell, glowing orange-red runes etched across surface, ember and fire energy crackling, ${STYLE_SUFFIX}`,
  },
  {
    id: "egg_tide",
    type: "egg",
    prompt: `a mystical sea creature egg, deep ocean blue translucent shell, glowing cyan runes etched across surface, water droplets and tidal energy, ${STYLE_SUFFIX}`,
  },
  {
    id: "egg_void",
    type: "egg",
    prompt: `a mystical void egg, pitch black shell with purple dimensional rift cracks, glowing violet runes etched across surface, dark matter swirling, ${STYLE_SUFFIX}`,
  },
  {
    id: "egg_storm",
    type: "egg",
    prompt: `a mystical storm egg, grey-white shell crackling with lightning, glowing yellow runes etched across surface, electric sparks arcing, ${STYLE_SUFFIX}`,
  },
  {
    id: "egg_shadow",
    type: "egg",
    prompt: `a mystical shadow egg, dark purple matte shell, glowing indigo runes etched across surface, shadowy tendrils wisping off, ${STYLE_SUFFIX}`,
  },
  {
    id: "egg_crystal",
    type: "egg",
    prompt: `a mystical crystal egg, pale blue translucent crystalline shell, glowing ice-blue runes etched across surface, prismatic light refracting, ${STYLE_SUFFIX}`,
  },

  // CREATURES
  {
    id: "creature_ember",
    type: "creature",
    prompt: `a small mythical ember drake creature, molten lava scales, glowing orange runes tattooed across wings and body, fire breathing, compact quadruped, ${STYLE_SUFFIX}`,
  },
  {
    id: "creature_tide",
    type: "creature",
    prompt: `a small mythical tide serpent creature, iridescent blue-green scales, glowing cyan runes along spine and fins, water manipulation, sleek aquatic body, ${STYLE_SUFFIX}`,
  },
  {
    id: "creature_void",
    type: "creature",
    prompt: `a small mythical void wraith creature, semi-transparent dark body with starfield inside, glowing purple runes floating around it, reality-bending aura, ${STYLE_SUFFIX}`,
  },
  {
    id: "creature_storm",
    type: "creature",
    prompt: `a small mythical storm hawk creature, white and gold feathers crackling with electricity, glowing yellow runes on wings and talons, lightning aura, ${STYLE_SUFFIX}`,
  },
  {
    id: "creature_shadow",
    type: "creature",
    prompt: `a small mythical shadow lynx creature, dark purple-black fur, glowing indigo runes across haunches and ears, shadow camouflage ability, ${STYLE_SUFFIX}`,
  },
  {
    id: "creature_crystal",
    type: "creature",
    prompt: `a small mythical crystal golem creature, body made of pale blue translucent crystal formations, glowing ice runes carved into facets, light prismatic powers, ${STYLE_SUFFIX}`,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request(
      {
        hostname: A1111_HOST,
        port: A1111_PORT,
        path,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(raw));
          } catch {
            reject(new Error(`Bad JSON from A1111: ${raw.slice(0, 200)}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function checkA1111() {
  return new Promise((resolve) => {
    const req = https.request(
      { hostname: A1111_HOST, port: A1111_PORT, path: "/sdapi/v1/sd-models", method: "GET" },
      (res) => resolve(res.statusCode === 200)
    );
    req.on("error", () => resolve(false));
    req.end();
  });
}

function saveBase64Image(base64, filepath) {
  const buffer = Buffer.from(base64, "base64");
  fs.writeFileSync(filepath, buffer);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n🥚 Runehatch Sprite Generator\n");

  // Check A1111 is running
  console.log(`Checking Automatic1111 at http://${A1111_HOST}:${A1111_PORT} ...`);
  const alive = await checkA1111();
  if (!alive) {
    console.error(`\n❌ Could not reach Automatic1111.`);
    console.error(`   Make sure it's running with the --api flag:`);
    console.error(`   python launch.py --api --listen\n`);
    process.exit(1);
  }
  console.log("✅ Automatic1111 is running\n");

  // Create output directory
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`📁 Saving sprites to: ${OUTPUT_DIR}\n`);

  // Generate each sprite
  let success = 0;
  let failed = 0;

  for (let i = 0; i < SPRITES.length; i++) {
    const sprite = SPRITES[i];
    const outputPath = path.join(OUTPUT_DIR, `${sprite.id}.png`);

    // Skip if already exists
    if (fs.existsSync(outputPath)) {
      console.log(`⏭️  [${i + 1}/${SPRITES.length}] ${sprite.id} — already exists, skipping`);
      success++;
      continue;
    }

    process.stdout.write(`🎨 [${i + 1}/${SPRITES.length}] Generating ${sprite.id} ...`);

    try {
      const result = await post("/sdapi/v1/txt2img", {
        prompt: sprite.prompt,
        negative_prompt: NEGATIVE_PROMPT,
        steps: STEPS,
        cfg_scale: CFG_SCALE,
        sampler_name: SAMPLER,
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
        batch_size: 1,
        n_iter: 1,
        send_images: true,
        save_images: false,
      });

      if (!result.images || result.images.length === 0) {
        throw new Error("No images returned");
      }

      saveBase64Image(result.images[0], outputPath);
      console.log(` ✅ saved`);
      success++;
    } catch (err) {
      console.log(` ❌ failed: ${err.message}`);
      failed++;
    }

    // Small delay between requests to avoid overloading
    if (i < SPRITES.length - 1) await sleep(500);
  }

  // Summary
  console.log(`\n────────────────────────────────`);
  console.log(`✅ Generated: ${success}/${SPRITES.length} sprites`);
  if (failed > 0) console.log(`❌ Failed:    ${failed} sprites (re-run to retry)`);
  console.log(`📁 Location:  ${OUTPUT_DIR}`);
  console.log(`\nNext step: run your app and sprites will load automatically!\n`);
}

main().catch((err) => {
  console.error("\n💥 Unexpected error:", err.message);
  process.exit(1);
});
