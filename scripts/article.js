import { readPreference, savePreference } from "./storage.js";

const COMMENTS_KEY_PREFIX = "my-little-library-comments:";

function showMessage(message) {
    let toast = document.querySelector(".site-toast");
    if (!toast) {
        toast = document.createElement("p");
        toast.className = "site-toast";
        toast.setAttribute("role", "status");
        document.body.append(toast);
    }

    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(Number(toast.dataset.timeout));
    toast.dataset.timeout = String(window.setTimeout(() => {
        toast.classList.remove("is-visible");
    }, 2800));
}

async function copyArticleLink() {
    try {
        await navigator.clipboard.writeText(window.location.href);
        showMessage("Link copied!");
    } catch (error) {
        console.error("Could not copy the article link using the Clipboard API.", error);
        const temporaryInput = document.createElement("textarea");
        temporaryInput.value = window.location.href;
        temporaryInput.setAttribute("readonly", "");
        temporaryInput.style.position = "fixed";
        temporaryInput.style.opacity = "0";
        document.body.append(temporaryInput);
        temporaryInput.select();

        try {
            if (!document.execCommand("copy")) {
                throw new Error("The browser did not copy the article link.");
            }
            showMessage("Link copied!");
        } catch (fallbackError) {
            console.error("Could not copy the article link.", fallbackError);
            showMessage("Unable to copy the link. Please copy the page URL manually.");
        } finally {
            temporaryInput.remove();
        }
    }
}

function commentStorageKey() {
    return `${COMMENTS_KEY_PREFIX}${location.pathname}`;
}

function readComments() {
    const stored = readPreference(commentStorageKey(), []);
    return Array.isArray(stored)
        ? stored.filter((comment) =>
            comment
            && typeof comment.author === "string"
            && typeof comment.message === "string"
            && typeof comment.date === "string")
        : [];
}

function initializeComments(container) {
    const section = document.createElement("section");
    section.className = "comments-section";
    section.setAttribute("aria-labelledby", "comments-title");
    section.innerHTML = `
        <h2 id="comments-title">Reader comments</h2>
        <p class="comments-note">Comments are saved in this browser for this demonstration.</p>
        <form class="comment-form">
            <label for="comment-author">Your name</label>
            <input id="comment-author" name="author" maxlength="60" required>
            <label for="comment-message">Your comment</label>
            <textarea id="comment-message" name="message" rows="4" maxlength="1000" required></textarea>
            <button type="submit">Add comment</button>
        </form>
        <ol class="comment-list" aria-live="polite"></ol>
    `;

    const form = section.querySelector(".comment-form");
    const list = section.querySelector(".comment-list");
    if (!(form instanceof HTMLFormElement) || !(list instanceof HTMLOListElement)) {
        return;
    }

    const renderComments = () => {
        list.replaceChildren();
        for (const comment of readComments()) {
            const item = document.createElement("li");
            const heading = document.createElement("div");
            const author = document.createElement("strong");
            const time = document.createElement("time");
            const message = document.createElement("p");
            const parsedDate = new Date(comment.date);

            author.textContent = comment.author;
            if (!Number.isNaN(parsedDate.getTime())) {
                time.dateTime = comment.date;
                time.textContent = parsedDate.toLocaleString();
            }
            heading.append(author, time);
            message.textContent = comment.message;
            item.append(heading, message);
            list.append(item);
        }
        if (list.childElementCount === 0) {
            const emptyMessage = document.createElement("li");
            emptyMessage.className = "comments-empty";
            emptyMessage.textContent = "Be the first to leave a comment.";
            list.append(emptyMessage);
        }
    };

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const data = new FormData(form);
        const author = String(data.get("author") ?? "").trim();
        const message = String(data.get("message") ?? "").trim();
        if (!author || !message) {
            form.reportValidity();
            return;
        }

        const comments = readComments();
        comments.push({ author, message, date: new Date().toISOString() });
        savePreference(commentStorageKey(), comments);
        form.reset();
        renderComments();
    });

    renderComments();
    container.append(section);
}

export function initializeArticle() {
    const article = document.querySelector(".article-page");
    const reviewSections = article?.querySelector(".review-sections");
    if (!article || !reviewSections || article.querySelector(".article-interactions")) {
        return;
    }

    const interactions = document.createElement("section");
    interactions.className = "article-interactions";
    interactions.setAttribute("aria-label", "Article actions");
    interactions.innerHTML = `
        <section class="share-section" aria-labelledby="share-title">
            <h2 id="share-title">Share this review</h2>
            <div class="share-buttons">
                <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" data-network="Facebook">Facebook</a>
                <a href="https://x.com/" target="_blank" rel="noopener noreferrer" data-network="X">X</a>
                <a href="https://www.whatsapp.com/" target="_blank" rel="noopener noreferrer" data-network="WhatsApp">WhatsApp</a>
            </div>
        </section>
    `;
    reviewSections.append(interactions);
    initializeComments(interactions);

    interactions.querySelectorAll("[data-network]").forEach((link) => {
        link.addEventListener("click", () => {
            void copyArticleLink();
        });
    });
}
