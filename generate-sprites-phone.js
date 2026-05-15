#!/usr/bin/env node
/**
 * Runehatch Sprite Generator — Phone-friendly version
 *
 * Uses Replicate API (stable-diffusion) + GitHub API to:
 *   1. Generate all egg + creature sprites via Replicate (~$0.01 each)
 *   2. Commit the PNG files directly to your GitHub repo
 *
 * Run this once from Replit (replit.com) on your phone:
 *   1. Create a new Replit → Node.js
 *   2. Paste this file in as index.js
 *   3. Set the three env vars below in Replit's Secrets panel
 *   4. Hit Run — sprites get committed straight to your repo
 *
 * Required secrets (add in Replit → Secrets):
 *   REPLICATE_API_TOKEN  — from replicate.com/account
 *   GITHUB_TOKEN         — from github.com → Settings → Developer settings
 *                          → Personal access tokens → Fine-grained
 *                          → give Contents: read+write on your repo
 *   GITHUB_REPO          — e.g. "yourname/runehatch"
 */

const https = require("https");

const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO;

// ── Validation ────────────────────────────────────────────────────────────────
if (!REPLICATE_TOKEN || !GITHUB_TOKEN || !GITHUB_REPO) {
  console.error("❌ Missing environment variables. Set these in Replit Secrets:");
  console.error("   REPLICATE_API_TOKEN, GITHUB_TOKEN, GITHUB_REPO");
  process.exit(1);
}

// ── Prompts ───────────────────────────────────────────────────────────────────
const STYLE =
  "glowing runic engravings, bioluminescent runes etched into surface, dark fantasy, pure black background, centered composition, game sprite art, highly detailed, magical aura, neon rune glow, concept art";

const NEG =
  "text, watermark, blurry, low quality, human, person, ugly, deformed, photorealistic, nsfw, busy background, gradient background";

const SPRITES = [
  { id: "egg_ember",        prompt: `volcanic obsidian egg, glowing orange-red runes, ember fire energy crackling around it, ${STYLE}` },
  { id: "egg_tide",         prompt: `deep ocean blue translucent egg, glowing cyan runes, water droplets and tidal energy, ${STYLE}` },
  { id: "egg_void",         prompt: `pitch black egg with purple dimensional rift cracks, glowing violet runes, dark matter swirling, ${STYLE}` },
  { id: "egg_storm",        prompt: `grey-white egg crackling with lightning, glowing yellow runes, electric sparks arcing, ${STYLE}` },
  { id: "egg_shadow",       prompt: `dark purple matte egg, glowing indigo runes, shadowy tendrils wisping off it, ${STYLE}` },
  { id: "egg_crystal",      prompt: `pale blue translucent crystalline egg, glowing ice-blue runes, prismatic light refracting, ${STYLE}` },
  { id: "creature_ember",   prompt: `small mythical ember drake, molten lava scales, glowing orange runes on wings, fire breathing, compact dragon creature, ${STYLE}` },
  { id: "creature_tide",    prompt: `small mythical tide serpent, iridescent blue-green scales, glowing cyan runes along spine, sleek aquatic creature, ${STYLE}` },
  { id: "creature_void",    prompt: `small mythical void wraith, semi-transparent dark body with starfield inside, glowing purple runes floating around it, ${STYLE}` },
  { id: "creature_storm",   prompt: `small mythical storm hawk, white and gold feathers crackling with electricity, glowing yellow runes on wings, ${STYLE}` },
  { id: "creature_shadow",  prompt: `small mythical shadow lynx, dark purple-black fur, glowing indigo runes across haunches, shadow camouflage, ${STYLE}` },
  { id: "creature_crystal", prompt: `small mythical crystal golem, body made of pale blue translucent crystal formations, glowing ice runes carved into facets, ${STYLE}` },
];

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function request(options, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : undefined;
    const req = https.request(
      { ...options, headers: { "Content-Type": "application/json", "Content-Length": data ? Buffer.byteLength(data) : 0, ...options.headers } },
      (res) => {
        let raw = "";
        res.on("data", (c) => (raw += c));
        res.on("end", () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
          catch { resolve({ status: res.statusCode, body: raw }); }
        });
      }
    );
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

// ── Replicate: generate image ─────────────────────────────────────────────────
async function generateImage(prompt) {
  // Start prediction
  const start = await request(
    {
      hostname: "api.replicate.com",
      path: "/v1/models/stability-ai/stable-diffusion/predictions",
      method: "POST",
      headers: { Authorization: `Bearer ${REPLICATE_TOKEN}` },
    },
    {
      input: {
        prompt,
        negative_prompt: NEG,
        width: 512,
        height: 512,
        num_inference_steps: 30,
        guidance_scale: 7.5,
        scheduler: "DPMSolverMultistep",
      },
    }
  );

  if (start.status !== 201) {
    throw new Error(`Replicate start failed: ${JSON.stringify(start.body)}`);
  }

  const predictionId = start.body.id;

  // Poll until done
  for (let attempt = 0; attempt < 60; attempt++) {
    await sleep(3000);
    const poll = await request(
      {
        hostname: "api.replicate.com",
        path: `/v1/predictions/${predictionId}`,
        method: "GET",
        headers: { Authorization: `Bearer ${REPLICATE_TOKEN}` },
      }
    );

    const { status, output, error } = poll.body;
    if (status === "succeeded" && output?.[0]) return output[0]; // image URL
    if (status === "failed") throw new Error(`Replicate failed: ${error}`);
  }

  throw new Error("Replicate timed out after 3 minutes");
}

// ── Download image as base64 ──────────────────────────────────────────────────
function downloadAsBase64(url) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const mod = parsed.protocol === "https:" ? https : require("http");
    mod.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadAsBase64(res.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks).toString("base64")));
      res.on("error", reject);
    }).on("error", reject);
  });
}

// ── GitHub: commit file ───────────────────────────────────────────────────────
async function commitToGitHub(filename, base64Content) {
  const filePath = `assets/sprites/${filename}.png`;

  // Check if file already exists (need its SHA to update)
  const existing = await request({
    hostname: "api.github.com",
    path: `/repos/${GITHUB_REPO}/contents/${filePath}`,
    method: "GET",
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, "User-Agent": "runehatch-sprite-gen" },
  });

  const sha = existing.status === 200 ? existing.body.sha : undefined;

  const result = await request(
    {
      hostname: "api.github.com",
      path: `/repos/${GITHUB_REPO}/contents/${filePath}`,
      method: "PUT",
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, "User-Agent": "runehatch-sprite-gen" },
    },
    {
      message: `🎨 Add generated sprite: ${filename}`,
      content: base64Content,
      ...(sha ? { sha } : {}),
    }
  );

  if (result.status !== 200 && result.status !== 201) {
    throw new Error(`GitHub commit failed: ${JSON.stringify(result.body)}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n🥚 Runehatch Sprite Generator (Phone Edition)\n");
  console.log(`📦 Repo:     ${GITHUB_REPO}`);
  console.log(`🎨 Sprites:  ${SPRITES.length} to generate\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < SPRITES.length; i++) {
    const { id, prompt } = SPRITES[i];
    process.stdout.write(`[${i + 1}/${SPRITES.length}] ${id} — generating...`);

    try {
      const imageUrl = await generateImage(prompt);
      process.stdout.write(" downloading...");
      const base64 = await downloadAsBase64(imageUrl);
      process.stdout.write(" committing to GitHub...");
      await commitToGitHub(id, base64);
      console.log(" ✅");
      success++;
    } catch (err) {
      console.log(` ❌ ${err.message}`);
      failed++;
    }
  }

  console.log(`\n────────────────────────────────────────`);
  console.log(`✅ Done: ${success}/${SPRITES.length} sprites committed to ${GITHUB_REPO}`);
  if (failed > 0) console.log(`❌ Failed: ${failed} (re-run to retry — already done ones are skipped)`);
  console.log(`\nYour GitHub Action will now rebuild the APK with real art!\n`);
}

main().catch((err) => {
  console.error("💥 Fatal:", err.message);
  process.exit(1);
});
