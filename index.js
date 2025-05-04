const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { body, param, validationResult } = require("express-validator");
const cors = require("cors");
const mongoose = require("mongoose");
const Url = require("./models/Url");  // Import Mongoose model

const app = express();
const PORT = process.env.PORT || 3000;

const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

// Middleware
app.use(express.json());
app.use(cors());

// Connection to MongoDB
mongoose
  .connect("mongodb+srv://maryamsar01:JwBrXiCGlEFyRTfc@cluster0.nahqyrl.mongodb.net/urlshortener?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log(" Connected to MongoDB Atlas"))
  .catch((err) => console.error(" MongoDB connection error:", err));

//Function to generate random short codes
function generateShortCode(length = 6) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Ensuring short code uniqueness in MongoDB
async function getUniqueShortCode() {
  let shortCode;
  let exists = true;

  while (exists) {
    shortCode = generateShortCode();
    exists = await Url.exists({ shortCode });
  }

  return shortCode;
}

// Validating URL format
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

// 3.1 Creating Short URL
app.post(
  "/shorten",
  [
    body("url")
      .notEmpty()
      .withMessage("URL is required")
      .custom((value) => {
        if (!isValidUrl(value)) {
          throw new Error("Invalid URL format");
        }
        return true;
      }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { url } = req.body;
    const id = uuidv4();
    const shortCode = await getUniqueShortCode();
    const now = new Date().toISOString();

    const newEntry = new Url({
      id,
      url,
      shortCode,
      createdAt: now,
      updatedAt: now,
    });

    await newEntry.save();

    res.status(201).json({
      id,
      url,
      shortCode,
      createdAt: now,
      updatedAt: now,
    });
  }
);

// 3.2 Retrieve Original URL
app.get(
  "/shorten/:shortCode",
  [param("shortCode").notEmpty().withMessage("Short code is required")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { shortCode } = req.params;
    const urlEntry = await Url.findOne({ shortCode });

    if (!urlEntry) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    // Increment access count
    urlEntry.accessCount += 1;
    await urlEntry.save();

    res.status(200).json({
      id: urlEntry.id,
      url: urlEntry.url,
      shortCode: urlEntry.shortCode,
      createdAt: urlEntry.createdAt,
      updatedAt: urlEntry.updatedAt,
    });
  }
);

// 3.3 Update Short URL
app.put(
  "/shorten/:shortCode",
  [
    param("shortCode").notEmpty().withMessage("Short code is required"),
    body("url")
      .notEmpty()
      .withMessage("URL is required")
      .custom((value) => {
        if (!isValidUrl(value)) {
          throw new Error("Invalid URL format");
        }
        return true;
      }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { shortCode } = req.params;
    const { url } = req.body;

    const urlEntry = await Url.findOne({ shortCode });

    if (!urlEntry) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    // Update the entry
    urlEntry.url = url;
    urlEntry.updatedAt = new Date().toISOString();
    await urlEntry.save();

    res.status(200).json({
      id: urlEntry.id,
      url: urlEntry.url,
      shortCode: urlEntry.shortCode,
      createdAt: urlEntry.createdAt,
      updatedAt: urlEntry.updatedAt,
    });
  }
);

// 3.4 Delete Short URL
app.delete(
  "/shorten/:shortCode",
  [param("shortCode").notEmpty().withMessage("Short code is required")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { shortCode } = req.params;

    const result = await Url.findOneAndDelete({ shortCode });

    if (!result) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    res.status(204).send();
  }
);

// 3.5 Get URL Statistics
app.get(
  "/statistics/:shortCode",
  [param("shortCode").notEmpty().withMessage("Short code is required")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { shortCode } = req.params;
    const urlEntry = await Url.findOne({ shortCode });

    if (!urlEntry) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    res.status(200).json({
      id: urlEntry.id,
      url: urlEntry.url,
      shortCode: urlEntry.shortCode,
      createdAt: urlEntry.createdAt,
      updatedAt: urlEntry.updatedAt,
      accessCount: urlEntry.accessCount,
    });
  }
);

// Redirect endpoint 
app.get("/r/:shortCode", async (req, res) => {
  const { shortCode } = req.params;
  const urlEntry = await Url.findOne({ shortCode });

  if (!urlEntry) {
    return res.status(404).send("Short URL not found");
  }

  // Increment access count
  urlEntry.accessCount += 1;
  await urlEntry.save();

  // Redirect to the original URL
  res.redirect(urlEntry.url);
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`URL Shortener API running on port ${PORT}`);
});
