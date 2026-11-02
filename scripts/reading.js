export function initializeReadingTools() {
    const progress = document.createElement("div");
    progress.className = "reading-progress";
    progress.setAttribute("role", "progressbar");
    progress.setAttribute("aria-label", "Reading progress");
    progress.setAttribute("aria-valuemin", "0");
    progress.setAttribute("aria-valuemax", "100");
    progress.setAttribute("aria-valuenow", "0");
    progress.innerHTML = '<span class="reading-progress-fill"></span>';
    document.body.prepend(progress);

    const backToTop = document.createElement("button");
    backToTop.className = "back-to-top";
    backToTop.type = "button";
    backToTop.textContent = "Back to top";
    backToTop.setAttribute("aria-label", "Back to top");
    backToTop.disabled = true;
    document.body.append(backToTop);

    const fill = progress.querySelector(".reading-progress-fill");
    const updateProgress = () => {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const percentage = scrollableHeight > 0
            ? Math.min(100, Math.round((window.scrollY / scrollableHeight) * 100))
            : 0;

        if (fill instanceof HTMLElement) {
            fill.style.width = `${percentage}%`;
        }
        progress.setAttribute("aria-valuenow", String(percentage));
        const isVisible = window.scrollY > 400;
        backToTop.classList.toggle("is-visible", isVisible);
        backToTop.disabled = !isVisible;
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
    updateProgress();
}
