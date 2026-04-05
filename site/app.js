(function bootstrapSite() {
  const defaults = {
    brandName: "CrooLyyPage",
    profileName: "CrooLyyCheck",
    githubUsername: "CrooLyyCheck",
    githubUrl: "https://github.com/CrooLyyCheck",
    youtubeUrl: "https://www.youtube.com/@CrooLyyCheck",
    youtubeEmbedUrl: "",
    contactEmail: "kontakt@croolyypage.pl",
  };

  const config = { ...defaults, ...(window.CROOLYY_PAGE_CONFIG || {}) };
  const socialLinks = {
    github: config.githubUrl,
    youtube: config.youtubeUrl,
  };

  document.querySelectorAll("[data-social-link]").forEach((link) => {
    const type = link.getAttribute("data-social-link");
    const href = socialLinks[type];

    if (href) {
      link.setAttribute("href", href);
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noreferrer");
    }
  });

  const githubUsername = config.githubUsername || extractGithubUsername(config.githubUrl);
  const githubPreviewUrl = githubUsername
    ? `https://github-readme-stats.vercel.app/api?username=${encodeURIComponent(githubUsername)}&show_icons=true&hide_border=true&bg_color=00000000&title_color=132238&text_color=53657c&icon_color=ff6b4a&ring_color=18b8a7`
    : "";

  document.querySelectorAll("[data-github-preview]").forEach((image) => {
    if (!githubPreviewUrl) {
      image.remove();
      return;
    }

    image.setAttribute("src", githubPreviewUrl);
    image.setAttribute("alt", `Podglad GitHub dla ${githubUsername}`);
  });

  const youtubeEmbedUrl = normalizeYouTubeEmbedUrl(config.youtubeEmbedUrl || config.youtubeUrl);
  const hasYouTubeEmbed = Boolean(youtubeEmbedUrl);

  document.querySelectorAll("[data-youtube-embed]").forEach((frame) => {
    if (!hasYouTubeEmbed) {
      frame.remove();
      return;
    }

    frame.setAttribute("src", youtubeEmbedUrl);
    frame.classList.remove("is-hidden");
  });

  document.querySelectorAll("[data-youtube-fallback]").forEach((node) => {
    node.classList.toggle("is-hidden", hasYouTubeEmbed);
  });

  document.querySelectorAll("[data-email-link]").forEach((link) => {
    link.setAttribute("href", `mailto:${config.contactEmail}`);

    if (link.hasAttribute("data-fill-email")) {
      link.textContent = config.contactEmail;
    }
  });

  document.querySelectorAll("[data-profile-name]").forEach((node) => {
    node.textContent = config.profileName;
  });

  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  function extractGithubUsername(url) {
    if (!url) {
      return "";
    }

    try {
      const parsed = new URL(url);
      return (parsed.pathname || "").split("/").filter(Boolean)[0] || "";
    } catch {
      return "";
    }
  }

  function normalizeYouTubeEmbedUrl(value) {
    if (!value) {
      return "";
    }

    try {
      const parsed = new URL(value);
      const host = parsed.hostname.replace(/^www\./, "");

      if (host === "youtube-nocookie.com" || host === "youtube.com") {
        if (parsed.pathname.startsWith("/embed/")) {
          return `https://www.youtube-nocookie.com${parsed.pathname}${parsed.search}`;
        }

        if (parsed.pathname === "/watch") {
          const id = parsed.searchParams.get("v");

          if (id) {
            return `https://www.youtube-nocookie.com/embed/${id}`;
          }
        }

        const shortsMatch = parsed.pathname.match(/^\/shorts\/([^/?]+)/);

        if (shortsMatch) {
          return `https://www.youtube-nocookie.com/embed/${shortsMatch[1]}`;
        }
      }

      if (host === "youtu.be") {
        const id = parsed.pathname.replace("/", "");

        if (id) {
          return `https://www.youtube-nocookie.com/embed/${id}`;
        }
      }
    } catch {
      return "";
    }

    return "";
  }
})();
