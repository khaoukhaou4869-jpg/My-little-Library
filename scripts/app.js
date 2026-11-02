import { initializeArticle } from "./article.js";
import { initializeLibrary } from "./library.js";
import { initializeReadingTools } from "./reading.js";
import { getTheme, saveTheme } from "./storage.js";
import { initializeSpa } from "./navigation.js";

function applyTheme(theme) {
    const selectedTheme = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = selectedTheme;
    const button = document.querySelector(".theme-toggle");
    if (button instanceof HTMLButtonElement) {
        button.textContent = selectedTheme === "dark" ? "Light mode" : "Dark mode";
        button.setAttribute("aria-pressed", String(selectedTheme === "dark"));
    }
}

function initializeTheme() {
    const navigation = document.querySelector(".header-nav");
    if (!navigation) {
        return;
    }

    let button = navigation.querySelector(".theme-toggle");
    if (!(button instanceof HTMLButtonElement)) {
        button = document.createElement("button");
        button.className = "theme-toggle";
        button.type = "button";
        button.addEventListener("click", () => {
            const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
            saveTheme(nextTheme);
            applyTheme(nextTheme);
        });
        navigation.prepend(button);
    }
    applyTheme(getTheme());
}

function updateHomeLinks() {
    const onArticle = /\/Articles\/[^/]+\.html$/i.test(location.pathname);
    const onHomePage = /\/My_little_Library\.html$/i.test(location.pathname);
    const homePath = onArticle ? "../My_little_Library.html" : "My_little_Library.html";
    const homeHref = onHomePage ? "#home" : `${homePath}#home`;
    const aboutPath = onArticle ? "../about.html" : "about.html";

    document.querySelectorAll(".wordmark, .footer-wordmark").forEach((link) => {
        link.setAttribute("href", homeHref);
    });
    document.querySelectorAll(".header-nav a, .footer-nav a").forEach((link) => {
        const label = link.textContent?.trim().toLocaleLowerCase();
        if (label === "home") {
            link.setAttribute("href", homeHref);
        } else if (label === "about") {
            link.setAttribute("href", aboutPath);
        } else if (label === "contact") {
            link.setAttribute("href", onArticle ? `${homePath}#contact` : "#contact");
        }
    });
    document.querySelector(".search")?.setAttribute("action", homePath);
}

function initializePage() {
    initializeTheme();
    updateHomeLinks();
    initializeLibrary();
    initializeArticle();
}

async function navigateTo(destination, addHistoryEntry) {
    try {
        const response = await fetch(destination.href);
        if (!response.ok) {
            throw new Error(`Navigation failed: ${response.status} ${response.statusText}`);
        }

        const documentText = await response.text();
        const nextDocument = new DOMParser().parseFromString(documentText, "text/html");
        const nextMain = nextDocument.querySelector("main");
        const currentMain = document.querySelector("main");
        if (!nextMain || !currentMain) {
            throw new Error(`The requested page has no main content: ${destination.href}`);
        }

        if (addHistoryEntry) {
            history.pushState({}, "", destination.href);
        }
        currentMain.replaceChildren(...Array.from(nextMain.childNodes));
        document.title = nextDocument.title;
        initializePage();
        window.dispatchEvent(new Event("resize"));
        window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
        console.error("Could not load the requested page as a SPA route.", error);
        location.assign(destination.href);
    }
}

initializeReadingTools();
initializePage();
initializeSpa(navigateTo);
