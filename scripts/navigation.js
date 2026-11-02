export function initializeSpa(navigateTo) {
    if (location.protocol === "file:") {
        return;
    }

    document.addEventListener("click", (event) => {
        if (!(event.target instanceof Element)) {
            return;
        }

        const link = event.target.closest("a[href]");
        if (!(link instanceof HTMLAnchorElement)
            || link.target
            || link.hasAttribute("download")
            || event.defaultPrevented
            || event.button !== 0
            || event.metaKey
            || event.ctrlKey
            || event.shiftKey
            || event.altKey) {
            return;
        }

        const destination = new URL(link.href, location.href);
        const isLocalPage = destination.origin === location.origin
            && (destination.pathname.endsWith("/My_little_Library.html")
                || /\/Articles\/[^/]+\.html$/i.test(destination.pathname));
        if (!isLocalPage || destination.href === location.href) {
            return;
        }

        event.preventDefault();
        void navigateTo(destination, true);
    });

    window.addEventListener("popstate", () => {
        void navigateTo(new URL(location.href), false);
    });
}
