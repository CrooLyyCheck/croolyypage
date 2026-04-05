(function bootstrapSite() {
  const defaults = {
    brandName: "CrooLyyPage",
    profileName: "CrooLyyCheck",
    githubUrl: "https://github.com/CrooLyyCheck",
    youtubeUrl: "https://www.youtube.com/@CrooLyyCheck",
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
})();
