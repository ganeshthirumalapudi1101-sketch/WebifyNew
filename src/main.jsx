
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import JSZip from "jszip";
import {
  ArrowRight,
  Bot,
  Check,
  Gamepad2,
  Globe2,
  Image as ImageIcon,
  Layers3,
  Menu,
  MessageSquareText,
  MousePointer2,
  Palette,
  Play,
  Rocket,
  Sparkles,
  WandSparkles,
  X,
  Zap,
  Download,
} from "lucide-react";
import "./styles.css";

const API =
  import.meta.env.VITE_API_URL || "https://webifybackend.onrender.com:5000/api";

const HERO_VIDEO = import.meta.env.VITE_HERO_VIDEO_URL || "";

const missions = [
  { id: "idea", label: "Describe", icon: MessageSquareText },
  { id: "customize", label: "Customize", icon: WandSparkles },
  { id: "generate", label: "Generate", icon: Zap },
  { id: "launch", label: "Launch", icon: Rocket },
];

const starterIdeas = [
  "A futuristic kids gaming center with arcade games, birthday parties, snacks and weekend events.",
  "A South Indian vegetarian restaurant with thali, breakfast, family dining and online reservations.",
  "A modern construction company showing completed projects, services, testimonials and quote requests.",
];

const fieldTemplates = {
  restaurant: [
    ["businessName", "Restaurant name", "text"],
    ["tagline", "Short tagline", "text"],
    ["cuisine", "Cuisine / specialties", "text"],
    ["menu", "Menu items", "textarea"],
    ["location", "Location / address", "textarea"],
    ["hours", "Opening hours", "text"],
    ["phone", "Phone / WhatsApp", "text"],
    ["cta", "Main call-to-action", "text"],
  ],

  gaming: [
    ["businessName", "Gaming center name", "text"],
    ["tagline", "Game-world tagline", "text"],
    ["games", "Games / attractions", "textarea"],
    ["ageGroup", "Target age group", "text"],
    ["packages", "Packages / pricing", "textarea"],
    ["location", "Location", "textarea"],
    ["phone", "Phone / WhatsApp", "text"],
    ["cta", "Main call-to-action", "text"],
  ],

  construction: [
    ["businessName", "Company name", "text"],
    ["tagline", "Company tagline", "text"],
    ["services", "Services", "textarea"],
    ["projects", "Featured projects", "textarea"],
    ["areas", "Service areas", "text"],
    ["phone", "Phone / WhatsApp", "text"],
    ["cta", "Main call-to-action", "text"],
  ],

  advocate: [
    ["businessName", "Advocate / law firm name", "text"],
    ["tagline", "Professional tagline", "text"],
    ["specialization", "Areas of legal practice", "textarea"],
    ["experience", "Years of experience", "text"],
    ["about", "Professional introduction", "textarea"],
    ["location", "Office address", "textarea"],
    ["phone", "Contact number", "text"],
    ["cta", "Main call-to-action", "text"],
  ],

  ca: [
    ["businessName", "CA firm name", "text"],
    ["tagline", "Professional tagline", "text"],
    ["services", "Accounting and tax services", "textarea"],
    ["experience", "Professional experience", "text"],
    ["about", "About your firm", "textarea"],
    ["location", "Office location", "textarea"],
    ["phone", "Contact number", "text"],
    ["cta", "Main call-to-action", "text"],
  ],

  portfolio: [
    ["businessName", "Your name", "text"],
    ["tagline", "Professional headline", "text"],
    ["about", "About yourself", "textarea"],
    ["services", "Skills and services", "textarea"],
    ["projects", "Portfolio projects", "textarea"],
    ["phone", "Contact information", "text"],
    ["cta", "Main call-to-action", "text"],
  ],

  generic: [
    ["businessName", "Business / brand name", "text"],
    ["tagline", "Tagline", "text"],
    ["about", "What should visitors know?", "textarea"],
    ["services", "Main products or services", "textarea"],
    ["location", "Location", "text"],
    ["phone", "Phone / WhatsApp", "text"],
    ["cta", "Main call-to-action", "text"],
  ],
};

function detectType(idea) {
  const s = idea.toLowerCase();

  if (/advocate|lawyer|law firm|legal|attorney/.test(s))
    return "advocate";

  if (/chartered accountant|\bca\b|accountant|accounting|tax consultant/.test(s))
    return "ca";

  if (/portfolio|developer|designer|freelancer|personal website/.test(s))
    return "portfolio";

  if (/restaurant|hotel|cafe|food|biryani|bakery|dining|tiffin/.test(s))
    return "restaurant";

  if (/game|gaming|arcade|kids|children|play zone|fun zone/.test(s))
    return "gaming";

  if (/construction|builder|architect|real estate|interior/.test(s))
    return "construction";

  return "generic";
}

function buildDefaultAnswers(type) {
  const result = {};

  for (const [id] of fieldTemplates[type]) {
    result[id] = "";
  }

  return result;
}

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [idea, setIdea] = useState("");
  const [step, setStep] = useState(0);
  const [businessType, setBusinessType] = useState("generic");
  const [answers, setAnswers] = useState(
    buildDefaultAnswers("generic")
  );

  const [gallery, setGallery] = useState([]);
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sound, setSound] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [toast, setToast] = useState("");
  const [website, setWebsite] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  const heroRef = useRef(null);

  const fields = useMemo(
    () => fieldTemplates[businessType] || fieldTemplates.generic,
    [businessType]
  );

  const aiQuestions = useMemo(
    () =>
      fields.map(([id, question, type]) => ({
        id,
        question,
        type,
      })),
    [fields]
  );

  useEffect(() => {
    const move = (e) => {
      setPointer({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };

    window.addEventListener("pointermove", move);

    return () => window.removeEventListener("pointermove", move);
  }, []);

  useEffect(() => {
    const reveal = () => {
      document
        .querySelectorAll(".reveal:not(.revealed)")
        .forEach((el) => {
          const r = el.getBoundingClientRect();

          if (r.top < window.innerHeight * 0.9) {
            el.classList.add("revealed");
          }
        });
    };

    reveal();

    window.addEventListener("scroll", reveal, {
      passive: true,
    });

    return () => window.removeEventListener("scroll", reveal);
  }, []);

  const showToast = (message) => {
    setToast(message);

    window.setTimeout(() => {
      setToast("");
    }, 2500);
  };

  const startMission = () => {
    if (!idea.trim()) {
      showToast("Tell Webify what you want to build first.");
      return;
    }

    const type = detectType(idea);

    setBusinessType(type);
    setAnswers(buildDefaultAnswers(type));
    setWebsite(null);
    setError("");
    setHistory([{ role: "user", content: idea }]);
    setStep(1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const updateAnswer = (id, value) => {
    setAnswers((old) => ({
      ...old,
      [id]: value,
    }));
  };

  const handleGallery = (event) => {
    const files = Array.from(event.target.files || []);

    setGallery(files);
  };
  const [design, setDesign] = useState({
    style: "",
    primary: "",
    secondary: "",
    accent: "",
    background: "",
    text: "",
    font: ""
  });

  const updateDesign = (key, value) => {
    setDesign((old) => ({
      ...old,
      [key]: value
    }));
  };

  const generateWebsite = async () => {
    setStep(2);
    setStatus("working");
    setProgress(10);
    setError("");

    let progressTimer;

    try {
      progressTimer = window.setInterval(() => {
        setProgress((old) => {
          if (old >= 90) {
            return old;
          }

          return Math.min(old + 5, 90);
        });
      }, 500);

      const formData = new FormData();

      formData.append("idea", idea);
      formData.append("answers", JSON.stringify(answers));
      formData.append("history", JSON.stringify(history));
      formData.append("businessType", businessType);

      gallery.forEach((file) => {
        formData.append("images", file);
      });

      const response = await fetch(`${API}/generate`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Website generation failed."
        );
      }

      if (!data.files || !data.files["index.html"]) {
        throw new Error(
          "Backend response does not contain index.html."
        );
      }

      setWebsite(data);
      setProgress(100);
      setStatus("done");

      setTimeout(() => {
        setStep(3);
      }, 600);
    } catch (err) {
      setStatus("idle");
      setError(err.message || "Something went wrong.");

      setStep(1);
    } finally {
      if (progressTimer) {
        clearInterval(progressTimer);
      }
    }
  };

  const openPreview = () => {
    if (!website?.files) {
      showToast("Generate your website before opening preview.");
      return;
    }

    setPreviewOpen(true);
  };


  const downloadWebsite = async () => {
    if (!website?.files) {
      showToast("Generate your website first.");
      return;
    }

    try {
      const zip = new JSZip();

      // Create a safe project name
      const projectName = (
        answers.businessName || "webify-generated-website"
      )
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      // Add all generated project files
      Object.entries(website.files).forEach(([filename, content]) => {
        zip.file(filename, content);
      });

      // Add the submitted business information
      zip.file(
        "webify-config.json",
        JSON.stringify(
          {
            idea,
            businessType,
            business: answers,
            generatedAt: new Date().toISOString()
          },
          null,
          2
        )
      );

      // Add README if backend did not generate one
      if (!website.files["README.md"]) {
        zip.file(
          "README.md",
          `# ${answers.businessName || "Generated Website"}

Generated using Webify.

## Project files

Open index.html to view the website.

Customize styles.css and script.js to make changes.
`
        );
      }

      // Generate ZIP
      const blob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 6
        }
      });

      // Download ZIP
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `${projectName}-website.zip`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);

      showToast("Website project ZIP downloaded!");
    } catch (error) {
      console.error("ZIP generation error:", error);
      showToast("Unable to create website ZIP.");
    }
  };


  const createAnother = () => {
    setStep(0);
    setStatus("idle");
    setProgress(0);
    setWebsite(null);
    setError("");
    setDesign({
      style: "",
      primary: "",
      secondary: "",
      accent: "",
      background: "",
      text: "",
      font: ""
    });
    setIdea("");
    setGallery([]);
    setAnswers(buildDefaultAnswers("generic"));
    setBusinessType("generic");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div
      className="app"
      style={{
        "--mouse-x": `${pointer.x * 18}px`,
        "--mouse-y": `${pointer.y * 12}px`,
      }}
    >
      <Background />

      <header className="navbar">
        <a
          className="brand"
          href="#top"
          onClick={() => setMobileOpen(false)}
        >
          <span className="brand-orb">
            <Sparkles size={19} />
          </span>

          <span>WEBIFY</span>

          <span className="brand-status">GAME LAB</span>
        </a>

        <nav className={mobileOpen ? "nav-links open" : "nav-links"}>
          <a href="#top" onClick={() => setMobileOpen(false)}>Home</a>
          <a href="#mission" onClick={() => setMobileOpen(false)}>Build</a>
          <a href="#how" onClick={() => setMobileOpen(false)}>How it works</a>
          <a href="#preview" onClick={() => setMobileOpen(false)}>Preview</a>
        </nav>

        <div className="nav-actions">
          <button
            className="sound-btn"
            onClick={() => setSound(!sound)}
            title="Toggle UI sound"
          >
            {sound ? "🔊" : "🔇"}
          </button>

          <button
            className="nav-cta"
            onClick={() =>
              document
                .getElementById("mission")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <Rocket size={17} /> Start Building
          </button>
        </div>

        <button
          className="mobile-menu"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </header>

      <main id="top">
        <section className="hero" ref={heroRef}>
          <div className="hero-video-wrap">
            {HERO_VIDEO ? (
              <video
                className="hero-video"
                autoPlay
                muted
                loop
                playsInline
                src={HERO_VIDEO}
              />
            ) : (
              <img
                className="hero-image"
                src="/assets/hero-reference.jpg"
                alt=""
              />
            )}
          </div>

          <div className="hero-overlay" />
          <div className="hero-grid" />
          <div className="scanline" />

          <div className="hero-content reveal revealed">
            <div className="mission-badge">
              <span className="pulse-dot" />
              AI CREATION LAB · ONLINE
            </div>

            <h1>
              BUILD A WEBSITE
              <span>LIKE A GAME.</span>
            </h1>

            <p>
              Enter your idea. Your AI crew studies it, builds the right
              requirements, creates the visual experience and gets your
              website ready to launch.
            </p>

            <div className="hero-actions">
              <button
                className="game-button primary"
                onClick={() =>
                  document
                    .getElementById("mission")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                <Gamepad2 size={21} />
                Start Mission
                <ArrowRight size={19} />
              </button>

              <button
                className="game-button ghost"
                onClick={() =>
                  document
                    .getElementById("how")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                <Play size={18} />
                Watch How It Works
              </button>
            </div>

            <div className="hero-stats">
              <span><Zap size={15} /> AI guided</span>
              <span><Globe2 size={15} /> Responsive</span>
              <span><Palette size={15} /> Animated</span>
              <span><Rocket size={15} /> Export ready</span>
            </div>
          </div>

          <div className="hero-character character-main" aria-hidden="true">
            <img src="/assets/hero-reference.jpg" alt="" />
          </div>

          <div className="floating-chip chip-one">
            <Sparkles size={15} /> AI CREW
          </div>

          <div className="floating-chip chip-two">
            <Zap size={15} /> BUILD XP +100
          </div>

          <div className="floating-chip chip-three">
            <Check size={15} /> READY
          </div>
        </section>

        <MissionBar step={step} />

        <section id="mission" className="content-section">
          {step === 0 && (
            <div className="mission-panel reveal">
              <PanelHeader
                number="01"
                icon={<Gamepad2 />}
                title="Start Your Mission"
                subtitle="Tell the AI crew what you want to build."
              />

              <textarea
                className="mission-input"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Example: I want a professional advocate website with practice areas, about section, testimonials and appointment booking..."
              />

              <div className="suggestions">
                {starterIdeas.map((item) => (
                  <button
                    key={item}
                    onClick={() => setIdea(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="mission-footer">
                <span>
                  <Bot size={17} />
                  Webify will create business-specific questions.
                </span>

                <button
                  className="game-button primary"
                  onClick={startMission}
                >
                  Start Mission <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

        
{step === 1 && (
  <div className="mission-panel reveal revealed">

    <PanelHeader
      number="02"
      icon={<WandSparkles />}
      title="Customize Your Website"
      subtitle="Enter your business information and choose your website design."
    />

    {/* BUSINESS INFORMATION FORM */}

    <div className="form-section">
      <h3>01. Business Information</h3>
      <p>Fill in the details that should appear on your website.</p>

      <div className="business-form-grid">
        {fields.map(([id, question, type]) => (
          <label className="field" key={id}>
            <span>{question}</span>

            {type === "textarea" ? (
              <textarea
                value={answers[id] || ""}
                onChange={(e) =>
                  updateAnswer(id, e.target.value)
                }
                placeholder={`Enter ${question.toLowerCase()}`}
                rows={4}
              />
            ) : (
              <input
                type="text"
                value={answers[id] || ""}
                onChange={(e) =>
                  updateAnswer(id, e.target.value)
                }
                placeholder={`Enter ${question.toLowerCase()}`}
              />
            )}
          </label>
        ))}
      </div>
    </div>

    {/* IMAGE UPLOAD */}

    <div className="form-section">
      <h3>02. Website Images</h3>
      <p>Upload your business logo, products, projects or gallery photos.</p>

      <label className="upload-box">
        <ImageIcon size={30} />

        <strong>Upload Images</strong>
        <span>Select multiple images from your device.</span>

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleGallery}
        />
      </label>

      {gallery.length > 0 && (
        <div className="uploaded-files">
          {gallery.map((file, index) => (
            <div key={`${file.name}-${index}`}>
              <Check size={15} />
              {file.name}
            </div>
          ))}
        </div>
      )}
    </div>

    {/* WEBSITE DESIGN */}

    <div className="form-section">
      <h3>03. Website Design</h3>
      <p>Choose your own style, colors and typography.</p>

      <label className="field">
        <span>Website Style</span>

        <select
          value={design.style}
          onChange={(e) =>
            updateDesign("style", e.target.value)
          }
        >
          <option value="">Choose a style</option>
          <option value="modern">Modern</option>
          <option value="minimal">Minimal</option>
          <option value="luxury">Luxury</option>
          <option value="corporate">Corporate</option>
          <option value="creative">Creative</option>
          <option value="playful">Playful</option>
          <option value="gaming">Gaming / Esports</option>
          <option value="elegant">Elegant</option>
        </select>
      </label>

      <div className="color-grid">
        {[
          ["primary", "Primary Color"],
          ["secondary", "Secondary Color"],
          ["accent", "Accent Color"],
          ["background", "Background Color"],
          ["text", "Text Color"]
        ].map(([key, label]) => (
          <label className="field color-field" key={key}>
            <span>{label}</span>

            <div className="color-input-row">
              <input
                type="color"
                value={
                  /^#[0-9A-Fa-f]{6}$/.test(design[key])
                    ? design[key]
                    : "#808080"
                }
                onChange={(e) =>
                  updateDesign(key, e.target.value)
                }
              />

              <input
                type="text"
                value={design[key]}
                placeholder="#RRGGBB"
                maxLength={7}
                onChange={(e) =>
                  updateDesign(key, e.target.value)
                }
              />
            </div>
          </label>
        ))}
      </div>

      <label className="field">
        <span>Font Family</span>

        <select
          value={design.font}
          onChange={(e) =>
            updateDesign("font", e.target.value)
          }
        >
          <option value="">Choose a font</option>
          <option value="Inter">Inter</option>
          <option value="Poppins">Poppins</option>
          <option value="Roboto">Roboto</option>
          <option value="Montserrat">Montserrat</option>
          <option value="Playfair Display">Playfair Display</option>
          <option value="Lora">Lora</option>
        </select>
      </label>
    </div>

    {/* ERROR MESSAGE */}

    {error && (
      <div className="form-error">
        {error}
      </div>
    )}

    {/* FORM ACTIONS */}

    <div className="mission-footer">
      <span>
        <Sparkles size={17} />
        Your information will be used to generate your website.
      </span>

      <button
        className="game-button primary"
        onClick={() => {
          const requiredDesign = [
            "style",
            "primary",
            "secondary",
            "accent",
            "background",
            "text",
            "font"
          ];

          const missingDesign = requiredDesign.filter(
            (key) => !design[key]?.trim()
          );

          if (missingDesign.length > 0) {
            setError(
              "Please select your website style, all five colors and font."
            );
            return;
          }

          const invalidColor = requiredDesign
            .filter((key) =>
              ["primary", "secondary", "accent", "background", "text"].includes(key)
            )
            .some((key) =>
              !/^#[0-9A-Fa-f]{6}$/.test(design[key])
            );

          if (invalidColor) {
            setError("Please enter valid HEX colors, for example #2563EB.");
            return;
          }

          setError("");
          generateWebsite();
        }}
      >
        Generate My Website
        <WandSparkles size={18} />
      </button>
    </div>

  </div>
)}

          {step === 2 && (
            <GenerationPanel
              progress={progress}
              status={status}
            />
          )}

          {step === 3 && (
            <div id="preview" className="result-panel reveal revealed">
              <PanelHeader
                number="04"
                icon={<Rocket />}
                title="Website Ready!"
                subtitle="Mission complete. Your generated website is ready."
              />

              <div className="achievement">
                <div className="achievement-icon">
                  <Rocket size={34} />
                </div>

                <div>
                  <span>ACHIEVEMENT UNLOCKED</span>

                  <h2>
                    {answers.businessName || "Your Website"} is ready to launch.
                  </h2>

                  <p>
                    Responsive layout · Business-specific content ·
                    Export-ready structure
                  </p>
                </div>
              </div>

              <div className="preview-placeholder">
                <div className="preview-screen">
                  <span className="preview-tag">LIVE PREVIEW</span>

                  <h3>
                    {answers.businessName || "YOUR WEBSITE"}
                  </h3>

                  <p>
                    {answers.tagline || "Built by Webify AI Game Lab."}
                  </p>

                  <button onClick={openPreview}>
                    Open Interactive Preview <ArrowRight size={17} />
                  </button>
                </div>
              </div>

              {website?.files && (
                <div className="generated-website">
                  <h3>Generated Website</h3>
                  <LivePreview files={website.files} />
                </div>
              )}

              <div className="mission-footer">
                <button
                  className="secondary-button"
                  onClick={createAnother}
                >
                  Create Another
                </button>

                <button
                  className="game-button primary"
                  onClick={openPreview}
                >
                  <Globe2 size={18} /> Open Preview
                </button>

                <button
                  className="game-button primary"
                  onClick={downloadWebsite}
                >
                  <Download size={18} /> Export
                </button>
              </div>
            </div>
          )}
        </section>

        <section id="how" className="content-section reveal">
          <SectionTitle
            kicker="HOW THE GAME WORKS"
            title="Four levels. One finished website."
          />

          <div className="level-grid">
            {missions.map((m, i) => {
              const Icon = m.icon;

              return (
                <div className="level-card" key={m.id}>
                  <div className="level-number">
                    LEVEL {String(i + 1).padStart(2, "0")}
                  </div>

                  <div className="level-icon">
                    <Icon size={24} />
                  </div>

                  <h3>{m.label}</h3>

                  <p>
                    {i === 0 && "Describe your business in normal language."}
                    {i === 1 && "Answer intelligent questions designed for your business."}
                    {i === 2 && "Let the AI crew turn your answers into a website."}
                    {i === 3 && "Preview the result and prepare it for launch."}
                  </p>

                  <span className="level-arrow">↗</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="content-section reveal">
          <div className="game-world">
            <div className="world-copy">
              <div className="mission-badge dark">
                WEBIFY GAME WORLD
              </div>

              <h2>Every website gets its own personality.</h2>

              <p>
                Restaurant, gaming center, construction company, advocate,
                CA, school, portfolio or something completely different —
                Webify can adapt the questions, structure and visual direction.
              </p>

              <button
                className="game-button primary"
                onClick={() =>
                  document
                    .getElementById("mission")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                <Sparkles size={18} /> Build My World
              </button>
            </div>

            <div className="world-visual">
              <div className="world-orbit orbit-a" />
              <div className="world-orbit orbit-b" />
              <div className="world-core">
                <Bot size={54} />
              </div>
              <span className="world-token token-a">HTML</span>
              <span className="world-token token-b">CSS</span>
              <span className="world-token token-c">AI</span>
              <span className="world-token token-d">UX</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div>
          <span className="brand-orb small">
            <Sparkles size={14} />
          </span>
          WEBIFY GAME LAB
        </div>

        <span>Build. Play. Launch.</span>
      </footer>

      {previewOpen && (
        <PreviewModal
          files={website?.files}
          answers={answers}
          businessType={businessType}
          onClose={() => setPreviewOpen(false)}
        />
      )}

      {toast && (
        <div className="toast">
          <MousePointer2 size={16} /> {toast}
        </div>
      )}
    </div>
  );
}

function LivePreview({ files }) {
  const html = files?.["index.html"] || "";
  const css = files?.["styles.css"] || "";
  const js = files?.["script.js"] || "";

  const documentHTML = html
    .replace("</head>", `<style>${css}</style></head>`)
    .replace("</body>", `<script>${js}<\/script></body>`);

  return (
    <iframe
      title="Webify Live Website"
      srcDoc={documentHTML}
      style={{
        width: "100%",
        height: "750px",
        border: 0,
        borderRadius: "20px",
        background: "#fff",
      }}
      sandbox="allow-scripts allow-forms"
    />
  );
}

function Background() {
  return (
    <>
      <div className="ambient-grid" />

      <div className="particles">
        {Array.from({ length: 34 }).map((_, i) => (
          <i key={i} style={{ "--i": i }} />
        ))}
      </div>

      <div className="light-beam beam-a" />
      <div className="light-beam beam-b" />
    </>
  );
}

function MissionBar({ step }) {
  return (
    <div className="mission-bar">
      {missions.map((m, i) => {
        const Icon = m.icon;
        const active = i <= step;

        return (
          <div
            className={active ? "mission-step active" : "mission-step"}
            key={m.id}
          >
            <span><Icon size={16} /></span>

            <div>
              <small>
                LEVEL {String(i + 1).padStart(2, "0")}
              </small>
              <strong>{m.label}</strong>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PanelHeader({ number, icon, title, subtitle }) {
  return (
    <div className="panel-header">
      <div className="panel-number">{number}</div>

      <div className="panel-icon">{icon}</div>

      <div>
        <div className="panel-kicker">MISSION</div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}

function SectionTitle({ kicker, title }) {
  return (
    <div className="section-title">
      <span>{kicker}</span>
      <h2>{title}</h2>
    </div>
  );
}

function GenerationPanel({ progress, status }) {
  const steps = [
    ["Analyzing your idea", progress > 12],
    ["Designing the game world", progress > 35],
    ["Building content", progress > 58],
    ["Adding motion", progress > 78],
    ["Preparing launch", progress >= 100],
  ];

  return (
    <div className="generation-panel reveal revealed">
      <div className="generation-stage">
        <div className="scan-ring ring-1" />
        <div className="scan-ring ring-2" />

        <div className="ai-bot">
          <Bot size={50} />
        </div>

        <div className="worker worker-a">🟡</div>
        <div className="worker worker-b">🟡</div>
        <div className="worker worker-c">🟡</div>
        <div className="energy energy-a">✦</div>
        <div className="energy energy-b">⚡</div>
      </div>

      <div className="generation-copy">
        <div className="mission-badge dark">
          <span className="pulse-dot" /> AI CREW WORKING
        </div>

        <h2>
          {status === "done"
            ? "Mission complete!"
            : "Building your website..."}
        </h2>

        <p>
          The AI crew is turning your idea into a responsive,
          animated web experience.
        </p>

        <div className="xp-bar">
          <span style={{ width: `${progress}%` }} />
        </div>

        <div className="xp-row">
          <strong>{progress}%</strong>
          <span>WEBSITE XP</span>
        </div>

        <div className="generation-list">
          {steps.map(([label, done]) => (
            <div
              className={done ? "gen-item done" : "gen-item"}
              key={label}
            >
              <span>
                {done ? (
                  <Check size={15} />
                ) : (
                  <span className="mini-spinner" />
                )}
              </span>
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PreviewModal({
  files,
  answers,
  businessType,
  onClose,
}) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="preview-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-top">
          <div>
            <span className="live-dot" />
            LIVE WEBSITE PREVIEW
          </div>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="site-preview">
          <LivePreview files={files} />
        </div>

        <div className="modal-bottom">
          <span>
            {businessType.toUpperCase()} WEBSITE · LIVE PREVIEW
          </span>

          <strong>
            {answers.businessName || "Your Website"}
          </strong>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
