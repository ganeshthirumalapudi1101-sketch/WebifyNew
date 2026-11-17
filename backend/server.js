import "dotenv/config";

import express from "express";
import cors from "cors";
import JSZip from "jszip";
import multer from "multer";
import path from "path";

import { generateWebsiteSpec } from "./ai.js";
import { generateWebsiteFiles } from "./websiteGenerator.js";

const app = express();

/* =========================================
   APP CONFIGURATION
========================================= */

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

// Website files can contain uploaded images encoded as Base64.
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({
  extended: true,
  limit: "10mb"
}));

/* =========================================
   IMAGE UPLOAD CONFIGURATION
========================================= */

const storage = multer.memoryStorage();

const upload = multer({
  storage,

  limits: {
    fileSize: 3 * 1024 * 1024, // 3 MB per image
    files: 8
  },

  fileFilter: (req, file, callback) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif"
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return callback(
        new Error(
          "Only JPG, PNG, WEBP and GIF images are supported."
        )
      );
    }

    callback(null, true);
  }
});

/* =========================================
   HELPER FUNCTIONS
========================================= */

function parseJSON(value, fallback = {}) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return fallback;
  }

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function removeEmptyValues(object = {}) {
  return Object.fromEntries(
    Object.entries(object).filter(([key, value]) => {
      if (value === undefined || value === null) {
        return false;
      }

      if (
        typeof value === "string" &&
        !value.trim()
      ) {
        return false;
      }

      return true;
    })
  );
}

function getRequestData(req) {
  return {
    idea: String(req.body.idea || "").trim(),

    answers: parseJSON(
      req.body.answers,
      {}
    ),

    history: parseJSON(
      req.body.history,
      []
    ),

    design: parseJSON(
      req.body.design,
      {}
    ),

    businessType: String(
      req.body.businessType || ""
    ).trim()
  };
}

/* =========================================
   CONVERT UPLOADED IMAGES
========================================= */

function convertUploadedImages(files = []) {
  return files.map((file, index) => {
    const base64 = file.buffer.toString("base64");

    const dataUrl =
      `data:${file.mimetype};base64,${base64}`;

    return {
      name: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: dataUrl,
      index
    };
  });
}

/* =========================================
   NORMALIZE WEBSITE SPECIFICATION
========================================= */

function normalizeWebsiteSpec(
  spec,
  requestData,
  uploadedImages = []
) {
  const {
    answers = {},
    design = {},
    businessType = ""
  } = requestData;

  const aiBusiness = spec.business || {};

  // Preserve AI values while prioritizing form values.
  const business = {
    ...aiBusiness,
    ...removeEmptyValues(answers)
  };

  business.name =
    answers.businessName ||
    answers.name ||
    aiBusiness.name ||
    aiBusiness.businessName ||
    "My Business";

  business.type =
    businessType ||
    answers.businessType ||
    aiBusiness.type ||
    "Business";

  business.tagline =
    answers.tagline ||
    aiBusiness.tagline ||
    "";

  business.description =
    answers.about ||
    answers.description ||
    aiBusiness.description ||
    aiBusiness.about ||
    "";

  business.phone =
    answers.phone ||
    answers.contactNumber ||
    aiBusiness.phone ||
    "";

  business.email =
    answers.email ||
    aiBusiness.email ||
    "";

  business.location =
    answers.location ||
    answers.address ||
    aiBusiness.location ||
    aiBusiness.address ||
    "";

  const website = spec.website || {};

  const theme = {
    ...(website.theme || {}),
    ...removeEmptyValues(design)
  };

  const seo = {
    ...(spec.seo || {}),

    title:
      spec.seo?.title ||
      business.name,

    description:
      spec.seo?.description ||
      business.description ||
      business.tagline ||
      ""
  };

  return {
    ...spec,

    // Keep the original form data available to the generator.
    answers,

    history: requestData.history,

    businessType:
      businessType ||
      business.type,

    business,

    design,

    // Actual uploaded image data, not just metadata.
    images: uploadedImages,

    website: {
      ...website,
      theme
    },

    seo
  };
}

/* =========================================
   HEALTH CHECK
========================================= */

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    service: "Webify AI",
    status: "running",

    providers: {
      openai: Boolean(process.env.OPENAI_API_KEY),
      groq: Boolean(process.env.GROQ_API_KEY)
    },

    endpoints: [
      "/api/health",
      "/api/analyze",
      "/api/generate",
      "/api/export"
    ]
  });
});

/* =========================================
   ANALYZE WEBSITE REQUIREMENTS
========================================= */

app.post("/api/analyze", async (req, res) => {
  try {
    const requestData = getRequestData(req);

    const {
      idea,
      answers,
      history,
      design,
      businessType
    } = requestData;

    if (!idea) {
      return res.status(400).json({
        success: false,
        error: "Please describe what you want to build."
      });
    }

    const result = await generateWebsiteSpec({
      idea,
      answers,
      history,
      design,
      businessType
    });

    if (!result || typeof result !== "object") {
      throw new Error(
        "AI returned an invalid website specification."
      );
    }

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error("ANALYZE ERROR:", error);

    res.status(500).json({
      success: false,

      error:
        error.message ||
        "AI could not analyze the requirements."
    });
  }
});

/* =========================================
   GENERATE COMPLETE WEBSITE
========================================= */

app.post(
  "/api/generate",
  upload.array("images", 8),

  async (req, res) => {
    try {
      const requestData = getRequestData(req);

      const {
        idea,
        answers,
        history,
        design,
        businessType
      } = requestData;

      if (!idea) {
        return res.status(400).json({
          success: false,
          error: "Please describe what you want to build."
        });
      }

      /*
        STEP 1:
        Convert actual uploaded image buffers
        into data URLs.
      */

      const uploadedImages = convertUploadedImages(
        req.files || []
      );

      /*
        STEP 2:
        Generate the AI website specification.
      */

      const aiSpec = await generateWebsiteSpec({
        idea,
        answers,
        history,
        design,
        businessType,

        // AI receives image descriptions/metadata.
        uploadedImages: uploadedImages.map(image => ({
          name: image.name,
          mimeType: image.mimeType,
          size: image.size
        }))
      });

      if (
        !aiSpec ||
        typeof aiSpec !== "object" ||
        Array.isArray(aiSpec)
      ) {
        throw new Error(
          "AI returned an invalid website specification."
        );
      }

      /*
        STEP 3:
        Merge user form details, design and images.
      */

      const spec = normalizeWebsiteSpec(
        aiSpec,
        requestData,
        uploadedImages
      );

      /*
        STEP 4:
        Generate website files.
      */

      const files = generateWebsiteFiles(spec);

      if (
        !files ||
        typeof files !== "object" ||
        Array.isArray(files) ||
        !files["index.html"]
      ) {
        throw new Error(
          "Website generator did not return a valid website."
        );
      }

      /*
        STEP 5:
        Return generated website.
      */

      res.json({
        success: true,

        message: "Website generated successfully.",

        businessType: spec.businessType,

        uploadedImages: uploadedImages.map(image => ({
          name: image.name,
          mimeType: image.mimeType,
          size: image.size
        })),

        spec,

        files
      });

    } catch (error) {
      console.error("GENERATION ERROR:", error);

      res.status(500).json({
        success: false,

        error:
          error.message ||
          "Website generation failed. Please try again."
      });
    }
  }
);

/* =========================================
   EXPORT WEBSITE AS ZIP
========================================= */

app.post("/api/export", async (req, res) => {
  try {
    const {
      files = {},
      projectName = "webify-website"
    } = req.body;

    if (
      !files ||
      typeof files !== "object" ||
      Array.isArray(files) ||
      Object.keys(files).length === 0
    ) {
      return res.status(400).json({
        success: false,
        error: "No website files were provided."
      });
    }

    const zip = new JSZip();

    let addedFiles = 0;

    for (const [filename, content] of Object.entries(files)) {
      // Normalize Windows and Unix path separators.
      const normalizedPath = path.posix.normalize(
        String(filename).replaceAll("\\", "/")
      );

      // Prevent path traversal.
      if (
        normalizedPath === "." ||
        normalizedPath === ".." ||
        normalizedPath.startsWith("../") ||
        path.posix.isAbsolute(normalizedPath)
      ) {
        continue;
      }

      if (typeof content === "string") {
        zip.file(normalizedPath, content);
        addedFiles++;
      }

      else if (
        content &&
        typeof content === "object" &&
        typeof content.data === "string"
      ) {
        zip.file(normalizedPath, content.data, {
          base64: Boolean(content.base64)
        });

        addedFiles++;
      }
    }

    if (addedFiles === 0) {
      return res.status(400).json({
        success: false,
        error: "No valid website files were found."
      });
    }

    const safeProjectName =
      String(projectName)
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 80) ||
      "webify-website";

    const buffer = await zip.generateAsync({
      type: "nodebuffer",

      compression: "DEFLATE",

      compressionOptions: {
        level: 6
      }
    });

    res.setHeader(
      "Content-Type",
      "application/zip"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeProjectName}.zip"`
    );

    res.setHeader(
      "Content-Length",
      buffer.length
    );

    res.send(buffer);

  } catch (error) {
    console.error("EXPORT ERROR:", error);

    res.status(500).json({
      success: false,
      error: "Could not export website."
    });
  }
});

/* =========================================
   404 HANDLER
========================================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "API endpoint not found."
  });
});

/* =========================================
   GLOBAL ERROR HANDLER
========================================= */

app.use((error, req, res, next) => {
  console.error("SERVER ERROR:", error);

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "Each image must be 3 MB or smaller."
      });
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        error: "You can upload a maximum of 8 images."
      });
    }

    return res.status(400).json({
      success: false,
      error: error.message
    });
  }

  if (
    error.message?.includes("Only JPG")
  ) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }

  res.status(500).json({
    success: false,

    error:
      error.message ||
      "An unexpected server error occurred."
  });
});

/* =========================================
   START SERVER
========================================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════╗
║             WEBIFY AI            ║
║           Backend Ready          ║
╠══════════════════════════════════╣
║  Server: http://localhost:${PORT}
║  Health: http://localhost:${PORT}/api/health
╚══════════════════════════════════╝
`);
});