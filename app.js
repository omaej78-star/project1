import { z } from "https://cdn.jsdelivr.net/npm/zod@3.24.2/+esm";

const STORAGE_KEY = "john-omae-portfolio.projects.v1";
const ALLOWED_CATEGORIES = ["Data Analysis", "Machine Learning", "Python", "SQL"];

const safeHttpUrl = z
  .string()
  .trim()
  .min(1, "A URL is required.")
  .max(2048, "URL is too long.")
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  }, "Use a complete http:// or https:// URL.")
  .transform((value) => new URL(value).href);

const optionalSafeHttpUrl = z
  .string()
  .trim()
  .max(2048, "URL is too long.")
  .transform((value) => (value ? value : undefined))
  .pipe(safeHttpUrl.optional());

const projectSchema = z.object({
  id: z.string().min(1).max(128),
  title: z.string().trim().min(2, "Enter a title of at least 2 characters.").max(80, "Keep the title under 80 characters."),
  description: z.string().trim().min(12, "Tell visitors a little more (at least 12 characters).").max(600, "Keep the description under 600 characters."),
  category: z.enum(ALLOWED_CATEGORIES),
  link: safeHttpUrl,
  imageUrl: optionalSafeHttpUrl,
  createdAt: z.string().datetime(),
});

const projectInputSchema = projectSchema.omit({ id: true, createdAt: true });

const sampleProjects = [
  {
    id: "sample-sql-cleaning",
    title: "SQL Data Cleaning Lab",
    description: "Standardized a messy customer dataset by resolving duplicates, normalizing dates, and documenting every transformation for reliable reporting.",
    category: "SQL",
    link: "https://github.com/https://",
    imageUrl: undefined,
    createdAt: "2026-08-14T08:30:00.000Z",
  },
  {
    id: "sample-python-eda",
    title: "Python EDA: Global Store",
    description: "Explored sales patterns with pandas and matplotlib, then translated the findings into clear questions for a stakeholder dashboard.",
    category: "Python",
    link: "https://github.com/",
    imageUrl: undefined,
    createdAt: "2026-08-03T08:30:00.000Z",
  },
  {
    id: "sample-cohort-analysis",
    title: "Customer Cohort Analysis",
    description: "Mapped retention by signup month to identify the customer segments and time periods that deserve a closer look.",
    category: "Data Analysis",
    link: "https://github.com/",
    imageUrl: undefined,
    createdAt: "2026-07-18T08:30:00.000Z",
  },
];

const elements = {
  form: document.querySelector("#project-form"),
  panel: document.querySelector("#project-form-panel"),
  openForm: document.querySelector("#open-form-button"),
  closeForm: document.querySelector("#close-form-button"),
  grid: document.querySelector("#project-grid"),
  count: document.querySelector("#project-count"),
  status: document.querySelector("#form-status"),
  reset: document.querySelector("#reset-button"),
};

let projects = loadProjects();

function loadProjects() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return sampleProjects;

    const parsed = JSON.parse(saved);
    const validProjects = z.array(projectSchema).safeParse(parsed);
    return validProjects.success ? validProjects.data : sampleProjects;
  } catch {
    return sampleProjects;
  }
}

function persistProjects() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return true;
  } catch {
    setStatus("This browser could not save your project. Check its storage settings.", "error");
    return false;
  }
}

function setStatus(message = "", type = "neutral") {
  elements.status.textContent = message;
  elements.status.className = `min-h-5 text-sm ${type === "error" ? "text-rose-300" : type === "success" ? "text-emerald-300" : "text-slate-400"}`;
}

function setFormOpen(isOpen) {
  elements.panel.classList.toggle("hidden", !isOpen);
  elements.openForm.setAttribute("aria-expanded", String(isOpen));
  if (isOpen) {
    elements.panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    window.setTimeout(() => elements.form.querySelector("#title").focus(), 150);
  }
}

function categoryClasses(category) {
  return {
    "Data Analysis": "border-cyan-400/20 bg-cyan-400/10 text-cyan-200",
    "Machine Learning": "border-violet-400/20 bg-violet-400/10 text-violet-200",
    Python: "border-amber-400/20 bg-amber-400/10 text-amber-200",
    SQL: "border-teal-400/20 bg-teal-400/10 text-teal-200",
  }[category];
}

function initialFor(category) {
  return { "Data Analysis": "DA", "Machine Learning": "ML", Python: "Py", SQL: "SQL" }[category];
}

function createCard(project) {
  const card = document.createElement("article");
  card.className = "group flex min-h-72 flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 transition duration-300 hover:-translate-y-1 hover:border-slate-700 hover:shadow-xl hover:shadow-slate-950/50";

  const visual = document.createElement("div");
  visual.className = "relative grid h-28 place-items-center overflow-hidden border-b border-slate-800 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950";
  if (project.imageUrl) {
    const image = document.createElement("img");
    image.src = project.imageUrl;
    image.alt = "";
    image.loading = "lazy";
    image.referrerPolicy = "no-referrer";
    image.className = "h-full w-full object-cover opacity-70 transition duration-500 group-hover:scale-105";
    image.addEventListener("error", () => image.remove());
    visual.append(image);
  }
  const monogram = document.createElement("span");
  monogram.className = "absolute grid h-12 min-w-12 place-items-center rounded-xl border border-white/10 bg-slate-950/65 px-2 text-sm font-bold tracking-wide text-white backdrop-blur";
  monogram.textContent = initialFor(project.category);
  visual.append(monogram);

  const body = document.createElement("div");
  body.className = "flex flex-1 flex-col p-5";
  const meta = document.createElement("div");
  meta.className = "flex items-center justify-between gap-3";
  const tag = document.createElement("span");
  tag.className = `inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${categoryClasses(project.category)}`;
  tag.textContent = project.category;
  const date = document.createElement("time");
  date.className = "text-xs text-slate-500";
  date.dateTime = project.createdAt;
  date.textContent = new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date(project.createdAt));
  meta.append(tag, date);

  const title = document.createElement("h3");
  title.className = "mt-4 text-lg font-bold tracking-tight text-white";
  title.textContent = project.title;
  const description = document.createElement("p");
  description.className = "mt-2 text-sm leading-6 text-slate-400";
  description.textContent = project.description;

  const footer = document.createElement("div");
  footer.className = "mt-auto flex items-center justify-between gap-3 pt-5";
  const link = document.createElement("a");
  link.href = project.link;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.referrerPolicy = "no-referrer";
  link.className = "inline-flex items-center gap-2 text-sm font-semibold text-teal-300 transition hover:text-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2 focus:ring-offset-slate-900";
  link.textContent = "View project ";
  const arrow = document.createElement("span");
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = "↗";
  link.append(arrow);

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "rounded-lg px-2 py-1 text-xs text-slate-600 transition hover:bg-rose-400/10 hover:text-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-300";
  remove.textContent = "Remove";
  remove.addEventListener("click", () => {
    projects = projects.filter((item) => item.id !== project.id);
    persistProjects();
    renderProjects();
  });
  footer.append(link, remove);
  body.append(meta, title, description, footer);
  card.append(visual, body);
  return card;
}

function renderProjects() {
  elements.grid.replaceChildren(...projects.map(createCard));
  elements.count.textContent = `${projects.length} project${projects.length === 1 ? "" : "s"}`;
}

function projectFromForm() {
  const data = Object.fromEntries(new FormData(elements.form));
  const result = projectInputSchema.safeParse(data);
  if (!result.success) {
    const firstError = result.error.issues[0];
    return { error: firstError.message };
  }
  return {
    value: {
      ...result.data,
      id: typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `project-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      createdAt: new Date().toISOString(),
    },
  };
}

elements.openForm.addEventListener("click", () => setFormOpen(true));
elements.closeForm.addEventListener("click", () => setFormOpen(false));

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  setStatus();
  const result = projectFromForm();
  if (result.error) {
    setStatus(result.error, "error");
    return;
  }

  projects = [result.value, ...projects];
  if (!persistProjects()) {
    projects = projects.filter((project) => project.id !== result.value.id);
    return;
  }
  renderProjects();
  elements.form.reset();
  setStatus("Project saved safely in this browser.", "success");
});

elements.reset.addEventListener("click", () => {
  if (!window.confirm("Restore the three sample projects? Your saved projects in this browser will be replaced.")) return;
  projects = sampleProjects;
  persistProjects();
  renderProjects();
  setStatus("Sample projects restored.", "success");
});

renderProjects();
