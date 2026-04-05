(function bootstrapSite() {
  const defaults = {
    brandName: "CrooLyyPage",
    profileName: "CrooLyyCheck",
    githubUsername: "CrooLyyCheck",
    githubFeaturedRepo: "croolyypage",
    githubUrl: "https://github.com/CrooLyyCheck",
    youtubeUrl: "https://www.youtube.com/@CrooLyyCheck",
    youtubeChannelId: "UCw6x5qESjqASdduL1L6yiKQ",
    youtubeFeedPath: "/api/youtube-feed",
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

  setupRevealAnimations();
  setupTopbarState();
  initGitHubCard(config);
  initYouTubeEmbed(config);

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

  async function initGitHubCard(siteConfig) {
    const card = document.querySelector("[data-github-card]");

    if (!card) {
      return;
    }

    const username = siteConfig.githubUsername || extractGithubUsername(siteConfig.githubUrl);
    const loading = card.querySelector("[data-github-loading]");
    const content = card.querySelector("[data-github-content]");
    const fallback = card.querySelector("[data-github-fallback]");

    if (!username) {
      if (loading) {
        loading.classList.add("is-hidden");
      }

      if (fallback) {
        fallback.classList.remove("is-hidden");
      }

      return;
    }

    try {
      const [userResponse, reposResponse] = await Promise.all([
        fetch(`https://api.github.com/users/${encodeURIComponent(username)}`),
        fetch(
          `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=12`,
        ),
      ]);

      if (!userResponse.ok || !reposResponse.ok) {
        throw new Error("GitHub API request failed");
      }

      const user = await userResponse.json();
      const repos = await reposResponse.json();
      const featuredRepo =
        repos.find((repo) => repo.name === siteConfig.githubFeaturedRepo) ||
        repos.find((repo) => !repo.fork) ||
        repos[0];

      fillText(card, "[data-github-login]", `@${user.login}`);
      fillText(
        card,
        "[data-github-bio]",
        user.bio || "Publiczny profil, aktualne repozytoria i szybki podglad aktywnych projektow.",
      );
      fillText(card, "[data-github-repos]", `${user.public_repos} repo`);
      fillText(card, "[data-github-followers]", `${user.followers} followers`);

      const avatar = card.querySelector("[data-github-avatar]");

      if (avatar) {
        avatar.setAttribute("src", user.avatar_url);
        avatar.setAttribute("alt", `Avatar ${user.login}`);
      }

      if (featuredRepo) {
        const repoLink = card.querySelector("[data-github-repo-link]");

        if (repoLink) {
          repoLink.textContent = featuredRepo.name;
          repoLink.setAttribute("href", featuredRepo.html_url);
          repoLink.setAttribute("target", "_blank");
          repoLink.setAttribute("rel", "noreferrer");
        }

        fillText(
          card,
          "[data-github-repo-description]",
          featuredRepo.description || "Repozytorium bez opisu, ale aktywnie utrzymywane.",
        );
        fillText(
          card,
          "[data-github-repo-language]",
          featuredRepo.language || "Brak jezyka w API",
        );
        fillText(
          card,
          "[data-github-repo-updated]",
          `aktualizacja ${formatRelativeDate(featuredRepo.pushed_at)}`,
        );
      }

      if (loading) {
        loading.classList.add("is-hidden");
      }

      if (content) {
        content.classList.remove("is-hidden");
      }
    } catch {
      if (loading) {
        loading.classList.add("is-hidden");
      }

      if (fallback) {
        fallback.classList.remove("is-hidden");
      }
    }
  }

  async function initYouTubeEmbed(siteConfig) {
    const frame = document.querySelector("[data-youtube-embed]");
    const fallback = document.querySelector("[data-youtube-fallback]");

    if (!frame) {
      return;
    }

    try {
      const latestVideo =
        (await fetchLatestEmbeddableVideo(siteConfig.youtubeChannelId, siteConfig.youtubeFeedPath)) ||
        resolveConfiguredYouTubeVideo(siteConfig.youtubeEmbedUrl);

      if (!latestVideo || !latestVideo.embedUrl) {
        throw new Error("No embeddable video found");
      }

      frame.setAttribute("src", latestVideo.embedUrl);
      frame.classList.remove("is-hidden");

      if (fallback) {
        fallback.classList.add("is-hidden");
      }

      fillText(document, "[data-youtube-title]", latestVideo.title || "Najnowszy material z kanalu");

      document.querySelectorAll("[data-youtube-video-link]").forEach((link) => {
        const href = latestVideo.watchUrl || siteConfig.youtubeUrl;
        link.setAttribute("href", href);
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noreferrer");
      });
    } catch {
      frame.remove();

      if (fallback) {
        fallback.classList.remove("is-hidden");
      }

      fillText(document, "[data-youtube-title]", "Nie udalo sie pobrac latest uploadu");

      document.querySelectorAll("[data-youtube-video-link]").forEach((link) => {
        link.setAttribute("href", siteConfig.youtubeUrl);
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noreferrer");
        link.textContent = "Otworz kanal";
      });
    }
  }

  async function fetchLatestEmbeddableVideo(channelId, feedPath) {
    if (!channelId || !feedPath) {
      return null;
    }

    const feedUrl = `${feedPath}?channel_id=${encodeURIComponent(channelId)}`;
    const response = await fetch(feedUrl, {
      headers: {
        Accept: "application/xml, text/xml",
      },
    });

    if (!response.ok) {
      throw new Error("Feed request failed");
    }

    const xml = await response.text();
    const documentXml = new DOMParser().parseFromString(xml, "application/xml");
    const entries = Array.from(documentXml.getElementsByTagName("entry"));

    for (const entry of entries) {
      const videoId = getNodeText(entry, "videoId");
      const title = getNodeText(entry, "title");
      const watchUrl = getAlternateLink(entry, videoId);

      if (!videoId || !watchUrl) {
        continue;
      }

      const oembed = await resolveOEmbedVideo(watchUrl);

      if (oembed) {
        return {
          title: oembed.title || title,
          watchUrl,
          embedUrl: extractIframeSrc(oembed.html) || `https://www.youtube.com/embed/${videoId}?rel=0`,
        };
      }
    }

    return null;
  }

  async function resolveOEmbedVideo(watchUrl) {
    const oembedUrl = new URL("https://www.youtube.com/oembed");
    oembedUrl.searchParams.set("url", watchUrl);
    oembedUrl.searchParams.set("format", "json");

    const response = await fetch(oembedUrl.toString());

    if (!response.ok) {
      return null;
    }

    return response.json();
  }

  function resolveConfiguredYouTubeVideo(embedUrl) {
    if (!embedUrl) {
      return null;
    }

    const normalized = normalizeYouTubeEmbedUrl(embedUrl);

    if (!normalized) {
      return null;
    }

    return {
      title: "Material ustawiony recznie w config.js",
      watchUrl: embedUrl,
      embedUrl: normalized,
    };
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

  function normalizeYouTubeEmbedUrl(value) {
    if (!value) {
      return "";
    }

    try {
      const parsed = new URL(value);
      const host = parsed.hostname.replace(/^www\./, "");

      if (host === "youtube.com" || host === "youtube-nocookie.com") {
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

  function getNodeText(parent, localName) {
    const node =
      parent.getElementsByTagName(localName)[0] || parent.getElementsByTagNameNS("*", localName)[0];

    return node ? node.textContent.trim() : "";
  }

  function getAlternateLink(entry, videoId) {
    const links = Array.from(entry.getElementsByTagName("link"));
    const alternate = links.find((link) => link.getAttribute("rel") === "alternate");

    if (alternate) {
      return alternate.getAttribute("href");
    }

    return videoId ? `https://www.youtube.com/watch?v=${videoId}` : "";
  }

  function extractIframeSrc(html) {
    const match = html ? html.match(/src="([^"]+)"/i) : null;
    return match ? match[1] : "";
  }

  function formatRelativeDate(dateString) {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays <= 0) {
      return "dzisiaj";
    }

    if (diffDays === 1) {
      return "wczoraj";
    }

    if (diffDays < 7) {
      return `${diffDays} dni temu`;
    }

    const diffWeeks = Math.floor(diffDays / 7);

    if (diffWeeks < 5) {
      return `${diffWeeks} tyg. temu`;
    }

    const diffMonths = Math.floor(diffDays / 30);

    if (diffMonths < 12) {
      return `${diffMonths} mies. temu`;
    }

    return `${Math.floor(diffMonths / 12)} lat temu`;
  }

  function fillText(root, selector, value) {
    root.querySelectorAll(selector).forEach((node) => {
      node.textContent = value;
    });
  }
})();
