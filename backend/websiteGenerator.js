// ============================================
// WEBIFY AI - COMPLETE WEBSITE GENERATOR
// ============================================

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function clean(value) {
  if (value === null || value === undefined) return "";

  if (typeof value === "object" && !Array.isArray(value)) {
    return String(
      value.title || value.name || value.label || value.value || ""
    ).trim();
  }

  return String(value).trim();
}

function firstValue(...values) {
  for (const value of values) {
    if (Array.isArray(value)) {
      if (value.length) return value;
      continue;
    }

    const result = clean(value);
    if (result) return value;
  }

  return "";
}

function slug(value = "") {
  return clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "generic";
}

function toList(value) {
  if (Array.isArray(value)) {
    return value
      .map(item => {
        if (
          typeof item === "string" ||
          typeof item === "number"
        ) {
          return String(item);
        }

        return (
          item?.title ||
          item?.name ||
          item?.label ||
          item?.description ||
          item?.details ||
          ""
        );
      })
      .map(clean)
      .filter(Boolean);
  }

  if (typeof value !== "string") return [];

  return value
    .split(/\n|,|;/)
    .map(item => item.trim())
    .filter(Boolean);
}

function safeColor(value, fallback) {
  const color = clean(value);

  const valid =
    /^#[0-9a-f]{3,4}([0-9a-f]{3,4})?$/i.test(color) ||
    /^(rgb|rgba|hsl|hsla)\([\d\s.,%+\-/]+\)$/i.test(color) ||
    /^[a-z]{3,20}$/i.test(color);

  return valid ? color : fallback;
}

function safeFont(value) {
  const font = clean(value);

  return /^[a-zA-Z0-9\s,'-]{2,60}$/.test(font)
    ? font
    : "Inter";
}

function safeImage(value) {
  const image = clean(value);

  // Allow uploaded Base64 images.
  if (
    /^data:image\/(jpeg|png|webp|gif);base64,[a-z0-9+/=]+$/i.test(image)
  ) {
    return image;
  }

  // Allow external and local image paths.
  if (
    /^(https?:\/\/|\.\/|images\/|assets\/)/i.test(image)
  ) {
    return escapeHTML(image);
  }

  return "";
}

// ============================================
// BUSINESS DETAILS
// ============================================

function getBusiness(spec = {}) {
  const answers = spec.answers || {};
  const aiBusiness = spec.business || {};

  const pick = (answerKey, ...fallbacks) =>
    firstValue(answers[answerKey], ...fallbacks);

  const business = {
    ...aiBusiness,
    ...answers,

    name:
      clean(
        pick(
          "businessName",
          answers.name,
          aiBusiness.name,
          aiBusiness.businessName
        )
      ) || "Your Business",

    type: clean(
      firstValue(
        spec.businessType,
        answers.businessType,
        aiBusiness.type,
        "Business"
      )
    ),

    tagline: clean(
      pick("tagline", aiBusiness.tagline)
    ),

    description: clean(
      pick(
        "about",
        answers.description,
        aiBusiness.description,
        aiBusiness.about,
        aiBusiness.introduction
      )
    ),

    phone: clean(
      pick(
        "phone",
        answers.contactNumber,
        aiBusiness.phone,
        aiBusiness.contactNumber
      )
    ),

    email: clean(
      pick("email", aiBusiness.email)
    ),

    location: clean(
      pick(
        "location",
        answers.address,
        aiBusiness.location,
        aiBusiness.address
      )
    ),

    hours: clean(
      pick(
        "hours",
        answers.openingHours,
        aiBusiness.hours,
        aiBusiness.openingHours
      )
    ),

    experience: clean(
      pick("experience", aiBusiness.experience)
    ),

    cta: clean(
      pick("cta", aiBusiness.cta)
    ) || "Contact Us",

    services: firstValue(
      answers.services,
      answers.specialization,
      aiBusiness.services,
      aiBusiness.specialization,
      aiBusiness.legalServices
    ),

    specialization: firstValue(
      answers.specialization,
      answers.services,
      aiBusiness.specialization,
      aiBusiness.services
    ),

    projects: firstValue(
      answers.projects,
      aiBusiness.projects,
      aiBusiness.featuredProjects
    ),

    packages: firstValue(
      answers.packages,
      answers.pricing,
      aiBusiness.packages,
      aiBusiness.pricing,
      aiBusiness.membershipPlans
    ),

    menu: firstValue(
      answers.menu,
      answers.menuItems,
      aiBusiness.menu,
      aiBusiness.menuItems,
      aiBusiness.specialDishes
    ),

    cuisine: clean(
      pick("cuisine", aiBusiness.cuisine)
    ),

    games: firstValue(
      answers.games,
      aiBusiness.games
    ),

    events: firstValue(
      answers.events,
      aiBusiness.events,
      aiBusiness.tournaments
    ),

    facilities: firstValue(
      answers.facilities,
      aiBusiness.facilities
    ),

    areas: firstValue(
      answers.areas,
      answers.serviceAreas,
      aiBusiness.areas,
      aiBusiness.serviceAreas
    ),

    process: firstValue(
      answers.process,
      aiBusiness.process
    ),

    professionalBackground: clean(
      pick(
        "professionalBackground",
        aiBusiness.professionalBackground
      )
    ),

    approach: clean(
      pick("approach", aiBusiness.approach)
    ),

    legalServices: firstValue(
      answers.legalServices,
      answers.assistance,
      aiBusiness.legalServices,
      aiBusiness.assistance
    ),

    products: firstValue(
      answers.products,
      aiBusiness.products
    ),

    features: firstValue(
      answers.features,
      aiBusiness.features
    ),

    servicesDescription: clean(
      pick(
        "servicesDescription",
        aiBusiness.servicesDescription
      )
    ),

    valueProposition: clean(
      pick(
        "valueProposition",
        aiBusiness.valueProposition
      )
    ),

    gallery: Array.isArray(answers.gallery)
      ? answers.gallery
      : aiBusiness.gallery || [],

    faqs: Array.isArray(answers.faqs)
      ? answers.faqs
      : aiBusiness.faqs || []
  };

  const additionalFields = [
    "ageGroup",
    "specialDishes",
    "specialties",
    "tournaments",
    "membershipPlans",
    "serviceAreas",
    "professionalTitle",
    "certifications",
    "website",
    "socialLinks",
    "heroImage"
  ];

  for (const key of additionalFields) {
    business[key] = firstValue(
      answers[key],
      aiBusiness[key]
    );
  }

  return business;
}

// ============================================
// DESIGN SETTINGS
// ============================================

function getDesign(spec = {}) {
  const design = {
    ...(spec.website?.theme || {}),
    ...(spec.design || {})
  };

  return {
    style: slug(
      design.style || design.layout || "modern"
    ),

    primary: safeColor(
      design.primary,
      "#2563eb"
    ),

    secondary: safeColor(
      design.secondary,
      "#1e293b"
    ),

    accent: safeColor(
      design.accent,
      "#38bdf8"
    ),

    background: safeColor(
      design.background,
      "#f8fafc"
    ),

    text: safeColor(
      design.text,
      "#0f172a"
    ),

    muted: safeColor(
      design.muted,
      "#64748b"
    ),

    font: safeFont(design.font)
  };
}

// ============================================
// HTML COMPONENTS
// ============================================

function makeCard(title, description, index) {
  return `
    <article class="info-card">
      <span class="card-index">
        ${String(index + 1).padStart(2, "0")}
      </span>

      <h3>${escapeHTML(title)}</h3>

      <p>${escapeHTML(description || title)}</p>
    </article>
  `;
}

function makeCards(items, fallbackTitle) {
  const list = Array.isArray(items)
    ? items
    : toList(items);

  if (!list.length) {
    return `
      <div class="empty-content">
        <p>
          Contact us to learn more about
          ${escapeHTML(fallbackTitle)}.
        </p>
      </div>
    `;
  }

  return `
    <div class="card-grid">
      ${list.map((item, index) => {
        const title =
          typeof item === "string"
            ? item
            : item.title ||
              item.name ||
              `Item ${index + 1}`;

        const description =
          typeof item === "string"
            ? ""
            : item.description ||
              item.details ||
              "";

        return makeCard(
          title,
          description,
          index
        );
      }).join("")}
    </div>
  `;
}

function makeSection({
  id,
  eyebrow,
  title,
  description,
  content
}) {
  return `
    <section
      class="site-section"
      id="${escapeHTML(id)}"
    >
      <div class="container">

        <div class="section-heading">
          <span class="eyebrow">
            ${escapeHTML(eyebrow || "")}
          </span>

          <h2>${escapeHTML(title)}</h2>

          ${
            description
              ? `<p>${escapeHTML(description)}</p>`
              : ""
          }
        </div>

        ${content || ""}

      </div>
    </section>
  `;
}

// ============================================
// BUSINESS-SPECIFIC SECTIONS
// ============================================

function getBusinessSections(
  business,
  type,
  spec = {}
) {
  const sections = [];

  const add = section => sections.push(section);

  const services = toList(
    firstValue(
      business.services,
      business.specialization,
      business.games
    )
  );

  const projects = toList(
    firstValue(
      business.projects,
      business.featuredProjects
    )
  );

  const packages = toList(
    firstValue(
      business.packages,
      business.pricing,
      business.membershipPlans
    )
  );

  const menu = toList(
    firstValue(
      business.menu,
      business.menuItems,
      business.specialDishes
    )
  );

  const events = toList(
    firstValue(
      business.events,
      business.tournaments
    )
  );

  const about =
    business.description ||
    business.about ||
    business.introduction;

  // ABOUT SECTION

  add({
    id: "about",
    eyebrow: "ABOUT US",

    title:
      type === "portfolio"
        ? "About me"
        : "Get to know us",

    description:
      about || business.tagline,

    content: `
      <div class="about-layout">

        <div class="about-copy">
          <h3>${escapeHTML(business.name)}</h3>

          <p>
            ${escapeHTML(
              about ||
              "Get in touch with us to learn more."
            )}
          </p>

          ${
            business.experience
              ? `
                <p>
                  <strong>Experience:</strong>
                  ${escapeHTML(business.experience)}
                </p>
              `
              : ""
          }

          ${
            business.location
              ? `
                <p>
                  <strong>Location:</strong>
                  ${escapeHTML(business.location)}
                </p>
              `
              : ""
          }
        </div>

        <div class="about-highlight">
          <span>OUR APPROACH</span>

          <h3>
            ${escapeHTML(
              business.tagline ||
              "Focused on your needs"
            )}
          </h3>
        </div>

      </div>
    `
  });

  // GAMING WEBSITE

  if (type === "gaming") {
    add({
      id: "games",
      eyebrow: "THE GAME WORLD",
      title: "Games and attractions",
      description:
        "Explore the activities and attractions available at our gaming center.",
      content: makeCards(
        services,
        "games and attractions"
      )
    });

    add({
      id: "pricing",
      eyebrow: "PLAY YOUR WAY",
      title: "Packages and pricing",
      description:
        "Explore the packages available.",
      content: makeCards(
        packages,
        "packages and pricing"
      )
    });

    add({
      id: "events",
      eyebrow: "WHAT'S HAPPENING",
      title: "Tournaments and events",
      description:
        "Discover upcoming activities and special events.",
      content: makeCards(
        events,
        "events"
      )
    });

    add({
      id: "facilities",
      eyebrow: "YOUR VISIT",
      title: "Facilities",
      description:
        "Facilities available to visitors.",
      content: makeCards(
        toList(business.facilities),
        "facilities"
      )
    });
  }

  // RESTAURANT WEBSITE

  else if (type === "restaurant") {
    add({
      id: "menu",
      eyebrow: "FOOD AND DRINK",
      title: "Our menu",
      description:
        "Explore the dishes and specialties provided by our restaurant.",
      content: makeCards(
        menu,
        "menu"
      )
    });

    add({
      id: "specialties",
      eyebrow: "OUR SPECIALTIES",
      title: "Popular choices",
      description: business.cuisine || "",
      content: makeCards(
        toList(
          firstValue(
            business.specialDishes,
            business.specialties
          )
        ),
        "special dishes"
      )
    });

    add({
      id: "visit",
      eyebrow: "PLAN YOUR VISIT",
      title: "Visit our restaurant",

      description: business.hours
        ? `Opening hours: ${business.hours}`
        : "Contact us for opening hours and reservations.",

      content: `
        <div class="detail-panel">

          ${
            business.location
              ? `
                <p>
                  <strong>Address:</strong>
                  ${escapeHTML(business.location)}
                </p>
              `
              : ""
          }

          ${
            business.hours
              ? `
                <p>
                  <strong>Opening hours:</strong>
                  ${escapeHTML(business.hours)}
                </p>
              `
              : ""
          }

        </div>
      `
    });
  }

  // CONSTRUCTION WEBSITE

  else if (type === "construction") {
    add({
      id: "services",
      eyebrow: "WHAT WE DO",
      title: "Our services",
      description:
        "Explore our construction and development services.",
      content: makeCards(
        services,
        "construction services"
      )
    });

    add({
      id: "projects",
      eyebrow: "OUR WORK",
      title: "Featured projects",
      description:
        "A selection of projects supplied by the business.",
      content: makeCards(
        projects,
        "projects"
      )
    });

    add({
      id: "process",
      eyebrow: "HOW WE WORK",
      title: "Our working process",

      description:
        typeof business.process === "string"
          ? business.process
          : "Learn about our process.",

      content: makeCards(
        toList(business.process),
        "working process"
      )
    });

    add({
      id: "areas",
      eyebrow: "WHERE WE WORK",
      title: "Service areas",
      description:
        "Areas served by our team.",

      content: `
        <div class="detail-panel">
          <p>
            ${escapeHTML(
              clean(
                firstValue(
                  business.areas,
                  business.serviceAreas
                )
              ) ||
              "Contact us to confirm whether we serve your area."
            )}
          </p>
        </div>
      `
    });
  }

  // ADVOCATE WEBSITE

  else if (type === "advocate") {
    add({
      id: "practice",
      eyebrow: "LEGAL EXPERTISE",
      title: "Areas of legal practice",
      description:
        "Explore the legal practice areas provided by the professional.",
      content: makeCards(
        services,
        "legal practice areas"
      )
    });

    add({
      id: "experience",
      eyebrow: "PROFESSIONAL BACKGROUND",
      title: "Professional experience",

      description:
        business.experience || "",

      content: `
        <div class="detail-panel">

          ${
            business.experience
              ? `<h3>${escapeHTML(business.experience)}</h3>`
              : ""
          }

          <p>
            ${escapeHTML(
              business.professionalBackground ||
              "Contact the office for professional background and appointment information."
            )}
          </p>

        </div>
      `
    });

    add({
      id: "approach",
      eyebrow: "CLIENT SUPPORT",
      title: "How we can assist",

      description:
        business.approach ||
        "Discuss your legal requirements during a consultation.",

      content: makeCards(
        toList(
          firstValue(
            business.legalServices,
            business.assistance
          )
        ),
        "legal assistance"
      )
    });
  }

  // CHARTERED ACCOUNTANT WEBSITE

  else if (type === "ca") {
    add({
      id: "services",
      eyebrow: "OUR EXPERTISE",
      title: "Accounting and tax services",
      description:
        "Explore the services provided by this firm.",
      content: makeCards(
        services,
        "accounting and tax services"
      )
    });

    add({
      id: "expertise",
      eyebrow: "PROFESSIONAL EXPERIENCE",
      title: "Our experience",

      description:
        business.experience || "",

      content: `
        <div class="detail-panel">
          <p>
            ${escapeHTML(
              business.professionalBackground ||
              "Contact the firm to discuss your accounting requirements."
            )}
          </p>
        </div>
      `
    });

    add({
      id: "process",
      eyebrow: "WORKING TOGETHER",
      title: "How we work",

      description:
        typeof business.process === "string"
          ? business.process
          : "Contact the firm to discuss the next steps.",

      content: makeCards(
        toList(business.process),
        "working process"
      )
    });
  }

  // PORTFOLIO WEBSITE

  else if (type === "portfolio") {
    add({
      id: "skills",
      eyebrow: "MY EXPERTISE",
      title: "Skills and services",
      description:
        "Explore the skills and services listed in this portfolio.",
      content: makeCards(
        services,
        "skills and services"
      )
    });

    add({
      id: "projects",
      eyebrow: "SELECTED WORK",
      title: "Featured projects",
      description:
        "Projects provided for this portfolio.",
      content: makeCards(
        projects,
        "portfolio projects"
      )
    });

    add({
      id: "experience",
      eyebrow: "MY JOURNEY",
      title: "Experience and background",

      description:
        business.experience || "",

      content: `
        <div class="detail-panel">
          <p>
            ${escapeHTML(
              business.professionalBackground ||
              about ||
              "Contact me for more information."
            )}
          </p>
        </div>
      `
    });
  }

  // GENERIC BUSINESS WEBSITE

  else {
    add({
      id: "services",
      eyebrow: "WHAT WE OFFER",
      title: "Our products and services",

      description:
        business.servicesDescription || "",

      content: makeCards(
        services.length
          ? services
          : toList(business.products),
        "products and services"
      )
    });

    add({
      id: "features",
      eyebrow: "WHY WORK WITH US",
      title: "What we offer",

      description:
        business.valueProposition || "",

      content: makeCards(
        toList(business.features),
        "business features"
      )
    });
  }

  // IMAGE GALLERY

  const galleryInput = [
    ...(Array.isArray(spec.images)
      ? spec.images
      : []),

    ...(Array.isArray(business.gallery)
      ? business.gallery
      : [])
  ];

  const gallery = galleryInput
    .map(item =>
      safeImage(
        typeof item === "string"
          ? item
          : item?.url || item?.src || ""
      )
    )
    .filter(Boolean);

  if (gallery.length) {
    add({
      id: "gallery",
      eyebrow: "OUR GALLERY",
      title: "A closer look",
      description:
        "Images supplied for this website.",

      content: `
        <div class="gallery-grid">

          ${gallery.map((image, index) => `
            <figure class="gallery-item">

              <img
                src="${image}"
                alt="${escapeHTML(business.name)} gallery image ${index + 1}"
                loading="lazy"
              >

            </figure>
          `).join("")}

        </div>
      `
    });
  }

  // FAQ SECTION

  const faqs = Array.isArray(business.faqs)
    ? business.faqs
    : [];

  if (faqs.length) {
    add({
      id: "faq",
      eyebrow: "QUESTIONS",
      title: "Frequently asked questions",
      description: "",

      content: `
        <div class="faq-list">

          ${faqs.map((faq, index) => `
            <details class="faq-item">

              <summary>
                ${
                  escapeHTML(
                    typeof faq === "string"
                      ? faq
                      : faq.question ||
                        `Question ${index + 1}`
                  )
                }
              </summary>

              <p>
                ${
                  escapeHTML(
                    typeof faq === "string"
                      ? ""
                      : faq.answer || ""
                  )
                }
              </p>

            </details>
          `).join("")}

        </div>
      `
    });
  }

  return sections;
}

// ============================================
// NAVIGATION AND CONTACT
// ============================================

function makeContactLink(business) {
  const phone = clean(business.phone)
    .replace(/[^\d+]/g, "");

  const email = clean(business.email);

  if (phone) return `tel:${phone}`;

  if (email) return `mailto:${email}`;

  return "#contact";
}

function makeNavigation(sections) {
  return sections
    .map(section => `
      <a href="#${escapeHTML(section.id)}">
        ${escapeHTML(section.title)}
      </a>
    `)
    .join("");
}

// ============================================
// RESPONSIVE CSS GENERATOR
// ============================================

function generateCSS(design) {
  return `
:root {
  --primary: ${design.primary};
  --secondary: ${design.secondary};
  --accent: ${design.accent};
  --background: ${design.background};
  --text: ${design.text};
  --muted: ${design.muted};
  --font: "${design.font}", system-ui, sans-serif;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  scroll-padding-top: 90px;
}

body {
  margin: 0;
  background: var(--background);
  color: var(--text);
  font-family: var(--font);
  line-height: 1.65;
}

button,
input,
textarea {
  font: inherit;
}

img {
  max-width: 100%;
}

a {
  color: inherit;
}

.container {
  width: min(1180px, calc(100% - 40px));
  margin-inline: auto;
}

/* HEADER */

.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--background);
  border-bottom: 1px solid
    color-mix(in srgb, var(--text), transparent 85%);
}

.nav-inner {
  min-height: 76px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.brand {
  text-decoration: none;
  font-size: 1.2rem;
  font-weight: 800;
}

.site-nav {
  display: flex;
  align-items: center;
  gap: 22px;
}

.site-nav a {
  text-decoration: none;
  font-size: .92rem;
  opacity: .8;
}

.site-nav a:hover {
  color: var(--primary);
  opacity: 1;
}

/* BUTTONS */

.nav-cta,
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 13px 22px;
  border: 1px solid var(--primary);
  border-radius: 8px;
  background: var(--primary);
  color: #fff;
  text-decoration: none;
  font-weight: 700;
  cursor: pointer;
  transition: transform .2s, opacity .2s;
}

.nav-cta:hover,
.button:hover {
  transform: translateY(-2px);
  opacity: .9;
}

.button-outline {
  background: transparent;
  color: var(--text);
  border-color: var(--text);
}

.menu-toggle {
  display: none;
  border: 1px solid var(--text);
  border-radius: 8px;
  background: transparent;
  color: var(--text);
  padding: 9px 12px;
  cursor: pointer;
}

/* HERO */

.hero {
  min-height: 640px;
  display: flex;
  align-items: center;
  padding: 100px 0;
  position: relative;
  overflow: hidden;
}

.hero-inner {
  position: relative;
  z-index: 2;
  max-width: 850px;
}

.eyebrow {
  display: inline-block;
  color: var(--accent);
  font-size: .78rem;
  font-weight: 800;
  letter-spacing: .16em;
  text-transform: uppercase;
}

.hero h1 {
  max-width: 900px;
  margin: 20px 0;
  font-size: clamp(2.8rem, 7vw, 6.5rem);
  line-height: 1.02;
  letter-spacing: -.055em;
}

.hero-description {
  max-width: 680px;
  color: var(--muted);
  font-size: 1.12rem;
}

.hero-actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 30px;
}

.hero-meta {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  margin-top: 40px;
  color: var(--muted);
  font-size: .9rem;
}

.hero-image {
  position: absolute;
  inset: 0 0 0 auto;
  width: 48%;
  height: 100%;
  object-fit: cover;
  opacity: .28;
  mask-image: linear-gradient(to right, transparent, black 35%);
}

/* DESIGN STYLES */

.style-minimal .hero {
  min-height: 540px;
}

.style-editorial .hero h1 {
  max-width: 760px;
  font-family: Georgia, serif;
  font-weight: 500;
}

.style-creative .hero {
  min-height: 700px;
}

.style-luxury .hero {
  text-align: center;
}

.style-luxury .hero-inner {
  margin-inline: auto;
}

.style-luxury .hero-actions,
.style-luxury .hero-meta {
  justify-content: center;
}

/* SECTIONS */

.site-section {
  padding: 100px 0;
}

.section-heading {
  max-width: 760px;
  margin-bottom: 42px;
}

.section-heading h2 {
  margin: 12px 0;
  font-size: clamp(2.1rem, 5vw, 4.2rem);
  line-height: 1.1;
  letter-spacing: -.04em;
}

.section-heading p {
  color: var(--muted);
  line-height: 1.8;
}

/* ABOUT */

.about-layout {
  display: grid;
  grid-template-columns: 1.3fr .7fr;
  gap: 28px;
  align-items: stretch;
}

.about-copy,
.about-highlight,
.detail-panel {
  padding: 34px;
  border: 1px solid
    color-mix(in srgb, var(--text), transparent 82%);
  border-radius: 14px;
}

.about-copy p,
.detail-panel p {
  color: var(--muted);
}

.about-highlight {
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: color-mix(in srgb, var(--primary), transparent 92%);
}

.about-highlight span {
  color: var(--accent);
  font-size: .75rem;
  letter-spacing: .12em;
}

.about-highlight h3 {
  font-size: 1.8rem;
}

/* CARDS */

.card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.info-card {
  min-height: 190px;
  padding: 28px;
  border: 1px solid
    color-mix(in srgb, var(--text), transparent 82%);
  border-radius: 14px;
  background: color-mix(in srgb, var(--text), transparent 97%);
  transition: transform .25s, border-color .25s;
}

.info-card:hover {
  transform: translateY(-5px);
  border-color: var(--primary);
}

.card-index {
  color: var(--accent);
  font-size: .82rem;
  font-weight: 800;
}

.info-card h3 {
  margin: 16px 0 8px;
  font-size: 1.25rem;
}

.info-card p {
  color: var(--muted);
  white-space: pre-line;
}

.empty-content {
  padding: 24px;
  border: 1px dashed var(--muted);
  border-radius: 12px;
  color: var(--muted);
}

/* GALLERY */

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.gallery-item {
  margin: 0;
  height: 260px;
  overflow: hidden;
  border-radius: 12px;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .4s;
}

.gallery-item:hover img {
  transform: scale(1.06);
}

/* FAQ */

.faq-list {
  display: grid;
  gap: 12px;
}

.faq-item {
  padding: 20px;
  border: 1px solid
    color-mix(in srgb, var(--text), transparent 82%);
  border-radius: 10px;
}

.faq-item summary {
  cursor: pointer;
  font-weight: 700;
}

.faq-item p {
  color: var(--muted);
}

/* CONTACT */

.contact-section {
  padding: 100px 0;
}

.contact-card {
  padding: 60px;
  border-radius: 18px;
  border: 1px solid
    color-mix(in srgb, var(--text), transparent 80%);
  background: color-mix(in srgb, var(--primary), transparent 93%);
}

.contact-card h2 {
  font-size: clamp(2rem, 5vw, 4rem);
  line-height: 1.1;
}

.contact-card p {
  color: var(--muted);
}

.contact-details {
  display: flex;
  gap: 22px;
  flex-wrap: wrap;
  margin: 24px 0;
}

.contact-details a {
  color: var(--accent);
  text-decoration: none;
}

.contact-form {
  display: grid;
  gap: 14px;
  max-width: 650px;
  margin-top: 30px;
}

.contact-form input,
.contact-form textarea {
  width: 100%;
  padding: 14px;
  border: 1px solid
    color-mix(in srgb, var(--text), transparent 70%);
  border-radius: 8px;
  background: var(--background);
  color: var(--text);
}

.contact-form textarea {
  min-height: 120px;
  resize: vertical;
}

.form-message {
  color: var(--muted);
  font-size: .9rem;
}

/* FOOTER */

.site-footer {
  padding: 30px 0;
  border-top: 1px solid
    color-mix(in srgb, var(--text), transparent 85%);
}

.footer-inner {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  color: var(--muted);
}

/* ANIMATIONS */

.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity .6s ease, transform .6s ease;
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* TABLET */

@media (max-width: 900px) {
  .menu-toggle {
    display: inline-flex;
  }

  .site-nav {
    display: none;
    position: absolute;
    top: 76px;
    left: 0;
    right: 0;
    padding: 22px;
    flex-direction: column;
    align-items: stretch;
    background: var(--background);
    border-bottom: 1px solid var(--muted);
  }

  .site-nav.open {
    display: flex;
  }

  .nav-cta {
    display: none;
  }

  .card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .about-layout {
    grid-template-columns: 1fr;
  }
}

/* MOBILE */

@media (max-width: 600px) {
  .container {
    width: min(100% - 28px, 1180px);
  }

  .hero {
    min-height: 570px;
    padding: 75px 0;
  }

  .hero-image {
    width: 100%;
    opacity: .12;
  }

  .site-section {
    padding: 70px 0;
  }

  .card-grid,
  .gallery-grid {
    grid-template-columns: 1fr;
  }

  .gallery-item {
    height: 230px;
  }

  .contact-card {
    padding: 28px;
  }

  .hero-meta {
    gap: 12px;
  }
}

/* ACCESSIBILITY */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: .01ms !important;
    transition-duration: .01ms !important;
  }

  .reveal {
    opacity: 1;
    transform: none;
  }
}
`;
}

// ============================================
// JAVASCRIPT GENERATOR
// ============================================

function generateJS(business) {
  const phone = clean(business.phone)
    .replace(/[^\d]/g, "");

  const email = clean(business.email);

  return `
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-nav");

menuButton?.addEventListener("click", () => {
  const open = navigation?.classList.toggle("open") || false;

  menuButton.setAttribute(
    "aria-expanded",
    String(open)
  );
});

navigation?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navigation.classList.remove("open");

    menuButton?.setAttribute(
      "aria-expanded",
      "false"
    );
  });
});

// Scroll animations

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: .12 }
  );

  document
    .querySelectorAll(".site-section")
    .forEach(section => {
      section.classList.add("reveal");
      observer.observe(section);
    });
}

// Contact form

const contactForm = document.querySelector("#contact-form");

contactForm?.addEventListener("submit", event => {
  event.preventDefault();

  const form = new FormData(contactForm);

  const name = String(form.get("name") || "").trim();
  const contact = String(form.get("contact") || "").trim();
  const message = String(form.get("message") || "").trim();

  if (!name || !contact || !message) {
    alert("Please complete all fields.");
    return;
  }

  const subject = encodeURIComponent(
    "Website enquiry from " + name
  );

  const body = encodeURIComponent(
    "Name: " + name +
    "\\nContact: " + contact +
    "\\n\\nMessage:\\n" + message
  );

  const email = ${JSON.stringify(email)};
  const phone = ${JSON.stringify(phone)};

  if (email) {
    window.location.href =
      "mailto:" + email +
      "?subject=" + subject +
      "&body=" + body;

    return;
  }

  if (phone) {
    const whatsappMessage = encodeURIComponent(
      "Website enquiry\\n" +
      "Name: " + name +
      "\\nContact: " + contact +
      "\\nMessage: " + message
    );

    window.open(
      "https://wa.me/" + phone +
      "?text=" + whatsappMessage,
      "_blank",
      "noopener,noreferrer"
    );

    return;
  }

  alert(
    "The business owner has not provided an email address or WhatsApp number. Please use the contact details shown on the website."
  );
});
}
`;
}

// ============================================
// MAIN WEBSITE GENERATOR
// ============================================

export function generateWebsiteFiles(spec = {}) {
  const business = getBusiness(spec);
  const design = getDesign(spec);

  let type = slug(
    spec.businessType ||
    business.type ||
    "generic"
  );

  // Normalize business type names.

  if (
    ["chartered-accountant", "accountant", "accounting"].includes(type)
  ) {
    type = "ca";
  }

  if (
    ["lawyer", "legal", "law-firm"].includes(type)
  ) {
    type = "advocate";
  }

  const sections = getBusinessSections(
    business,
    type,
    spec
  );

  const nav = makeNavigation(sections);

  const contactLink = makeContactLink(business);

  const heroImage = safeImage(
    firstValue(
      business.heroImage,
      spec.heroImage
    )
  );

  const heroStyle = heroImage
    ? `style="background-image:linear-gradient(90deg,var(--background),transparent),url('${heroImage}');background-size:cover;background-position:center"`
    : "";

  const sectionHTML = sections
    .map(makeSection)
    .join("\n");

  const title = escapeHTML(
    spec.seo?.title || business.name
  );

  const description = escapeHTML(
    spec.seo?.description ||
    business.description ||
    business.tagline ||
    ""
  );

  const fontFamily = encodeURIComponent(
    design.font
  ).replace(/%20/g, "+");

  // ==========================================
  // HTML
  // ==========================================

  const html = `<!DOCTYPE html>
<html lang="en">

<head>

  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <meta
    name="description"
    content="${description}"
  >

  <meta
    name="theme-color"
    content="${escapeHTML(design.background)}"
  >

  <title>${title}</title>

  <link
    rel="preconnect"
    href="https://fonts.googleapis.com"
  >

  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin
  >

  <link
    href="https://fonts.googleapis.com/css2?family=${fontFamily}:wght@400;500;600;700;800&display=swap"
    rel="stylesheet"
  >

  <link rel="stylesheet" href="styles.css">

</head>

<body class="style-${escapeHTML(design.style)}">

  <header class="site-header">

    <div class="container nav-inner">

      <a class="brand" href="#top">
        ${escapeHTML(business.name)}
      </a>

      <nav class="site-nav" aria-label="Main navigation">
        ${nav}
      </nav>

      <a class="nav-cta" href="#contact">
        ${escapeHTML(business.cta)}
      </a>

      <button
        class="menu-toggle"
        type="button"
        aria-label="Toggle navigation"
        aria-expanded="false"
      >
        Menu
      </button>

    </div>

  </header>

  <main id="top">

    <section class="hero" ${heroStyle}>

      ${
        heroImage
          ? ""
          : '<div class="hero-image" aria-hidden="true"></div>'
      }

      <div class="container hero-inner">

        <span class="eyebrow">
          ${escapeHTML(business.type)}
        </span>

        <h1>
          ${escapeHTML(
            business.tagline || business.name
          )}
        </h1>

        <p class="hero-description">
          ${escapeHTML(
            business.description ||
            "Contact us to learn more about our business and services."
          )}
        </p>

        <div class="hero-actions">

          <a class="button" href="#contact">
            ${escapeHTML(business.cta)}
          </a>

          <a class="button button-outline" href="#about">
            Discover more
          </a>

        </div>

        <div class="hero-meta">

          ${
            business.location
              ? `<span>${escapeHTML(business.location)}</span>`
              : ""
          }

          ${
            business.hours
              ? `<span>${escapeHTML(business.hours)}</span>`
              : ""
          }

          ${
            business.experience
              ? `<span>${escapeHTML(business.experience)}</span>`
              : ""
          }

        </div>

      </div>

    </section>

    ${sectionHTML}

    <section
      class="contact-section"
      id="contact"
    >

      <div class="container">

        <div class="contact-card">

          <span class="eyebrow">
            GET IN TOUCH
          </span>

          <h2>
            Let's talk about what you need.
          </h2>

          <p>
            Send an enquiry using the form below
            or contact the business directly.
          </p>

          <div class="contact-details">

            ${
              business.phone
                ? `
                  <a href="tel:${escapeHTML(
                    business.phone.replace(/[^\d+]/g, "")
                  )}">
                    ${escapeHTML(business.phone)}
                  </a>
                `
                : ""
            }

            ${
              business.email
                ? `
                  <a href="mailto:${escapeHTML(business.email)}">
                    ${escapeHTML(business.email)}
                  </a>
                `
                : ""
            }

            ${
              business.location
                ? `<span>${escapeHTML(business.location)}</span>`
                : ""
            }

          </div>

          <form
            class="contact-form"
            id="contact-form"
          >

            <input
              name="name"
              type="text"
              placeholder="Your name"
              autocomplete="name"
              required
            >

            <input
              name="contact"
              type="text"
              placeholder="Your phone or email"
              required
            >

            <textarea
              name="message"
              placeholder="How can we help?"
              required
            ></textarea>

            <button
              class="button"
              type="submit"
            >
              Send enquiry
            </button>

            <p class="form-message">
              Your enquiry will open your email app
              or WhatsApp using the contact details
              provided by the business.
            </p>

          </form>

          ${
            business.phone || business.email
              ? `
                <p>
                  <a href="${escapeHTML(contactLink)}">
                    Contact ${escapeHTML(business.name)}
                  </a>
                </p>
              `
              : ""
          }

        </div>

      </div>

    </section>

  </main>

  <footer class="site-footer">

    <div class="container footer-inner">

      <strong>
        ${escapeHTML(business.name)}
      </strong>

      <span>
        Website created with Webify
      </span>

    </div>

  </footer>

  <script src="script.js"></script>

</body>
</html>`;

  // ==========================================
  // CSS AND JS
  // ==========================================

  const css = generateCSS(design);

  const js = generateJS(business);

  // ==========================================
  // README
  // ==========================================

  const readme = `# ${business.name}

Website generated with Webify.

## Preview

Open index.html in a browser.

## Files

- index.html: Website structure and content
- styles.css: Responsive layout and selected theme colors
- script.js: Mobile navigation, reveal animations and contact form behavior
- webify-config.json: Business and design configuration used for generation

## Contact form

The contact form opens the business email application when an email address is provided. Otherwise, it opens WhatsApp when a phone number is provided.

This is a static contact workflow; it does not save enquiries to a database.

For database-backed enquiries, appointment booking, online payments or customer accounts, connect a backend service.

## Customization

Edit styles.css to customize the appearance and index.html to change the content.
`;

  // ==========================================
  // RETURN WEBSITE FILES
  // ==========================================

  return {
    "index.html": html,

    "styles.css": css,

    "script.js": js,

    "README.md": readme,

    "webify-config.json": JSON.stringify(
      {
        businessType: type,
        business,
        design,
        generatedAt: new Date().toISOString()
      },
      null,
      2
    )
  };
}