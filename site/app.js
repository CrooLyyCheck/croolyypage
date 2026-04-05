(function bootstrapSite() {
  const defaults = {
    brandName: "CrooLyyPage",
    profileName: "CrooLyyCheck",
    githubUsername: "CrooLyyCheck",
    githubUrl: "https://github.com/CrooLyyCheck",
    youtubeUrl: "https://www.youtube.com/@CrooLyyCheck",
    youtubeChannelId: "UCw6x5qESjqASdduL1L6yiKQ",
    youtubeUploadsPlaylistId: "",
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

  const githubUsername = config.githubUsername || extractGithubUsername(config.githubUrl);
  const githubPreviewUrl = githubUsername
    ? `https://github-readme-stats.vercel.app/api?username=${encodeURIComponent(githubUsername)}&show_icons=true&hide_border=true&bg_color=00000000&title_color=f3f4fb&text_color=b9c0d4&icon_color=e8a838&ring_color=8a72d8`
    : "";

  document.querySelectorAll("[data-github-preview]").forEach((image) => {
    if (!githubPreviewUrl) {
      image.remove();
      return;
    }

    image.setAttribute("src", githubPreviewUrl);
    image.setAttribute("alt", `Podglad GitHub dla ${githubUsername}`);
  });

  const youtubeEmbedUrl = buildYouTubeEmbedUrl(config);
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

  document.querySelectorAll("[data-youtube-status]").forEach((node) => {
    node.textContent = hasYouTubeEmbed
      ? "Automatycznie bierze pierwszy film z uploadow"
      : "Brak playlisty lub poprawnego linku do embeda";
  });

  setupRevealAnimations();
  setupTopbarState();

  function setupRevealAnimations() {
    const items = Array.from(document.querySelectorAll(".reveal"));

    if (!items.length) {
      return;
    }

    items.forEach((item) => {
      const delay = Number(item.getAttribute("data-reveal-delay") || 0);
      item.style.setProperty("--reveal-delay", `${delay}s`);
    });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    items.forEach((item) => observer.observe(item));
  }

  function setupTopbarState() {
    const topbar = document.querySelector("[data-topbar]");

    if (!topbar) {
      return;
    }

    const syncTopbar = () => {
      topbar.classList.toggle("is-scrolled", window.scrollY > 10);
    };

    syncTopbar();
    window.addEventListener("scroll", syncTopbar, { passive: true });
  }

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

  function buildYouTubeEmbedUrl(siteConfig) {
    if (siteConfig.youtubeEmbedUrl) {
      return normalizeYouTubeEmbedUrl(siteConfig.youtubeEmbedUrl);
    }

    const uploadsPlaylistId =
      siteConfig.youtubeUploadsPlaylistId || buildUploadsPlaylistId(siteConfig.youtubeChannelId);

    if (uploadsPlaylistId) {
      return `https://www.youtube.com/embed?listType=playlist&list=${encodeURIComponent(uploadsPlaylistId)}&rel=0`;
    }

    return normalizeYouTubeEmbedUrl(siteConfig.youtubeUrl);
  }

  function buildUploadsPlaylistId(channelId) {
    if (!channelId || !channelId.startsWith("UC") || channelId.length < 3) {
      return "";
    }

    return `UU${channelId.slice(2)}`;
  }

  function normalizeYouTubeEmbedUrl(value) {
    if (!value) {
      return "";
    }

    try {
      const parsed = new URL(value);
      const host = parsed.hostname.replace(/^www\./, "");

      if (host === "youtube.com" || host === "youtube-nocookie.com") {
        if (parsed.pathname === "/embed") {
          const playlistId = parsed.searchParams.get("list");

          if (playlistId) {
            return `https://www.youtube.com/embed?listType=playlist&list=${encodeURIComponent(playlistId)}&rel=0`;
          }
        }

        if (parsed.pathname.startsWith("/embed/")) {
          return `https://www.youtube.com${parsed.pathname}${parsed.search}`;
        }

        if (parsed.pathname === "/watch") {
          const id = parsed.searchParams.get("v");

          if (id) {
            return `https://www.youtube.com/embed/${encodeURIComponent(id)}?rel=0`;
          }
        }

        const shortsMatch = parsed.pathname.match(/^\/shorts\/([^/?]+)/);

        if (shortsMatch) {
          return `https://www.youtube.com/embed/${encodeURIComponent(shortsMatch[1])}?rel=0`;
        }
      }

      if (host === "youtu.be") {
        const id = parsed.pathname.replace("/", "");

        if (id) {
          return `https://www.youtube.com/embed/${encodeURIComponent(id)}?rel=0`;
        }
      }
    } catch {
      return "";
    }

    return "";
  }
})();