(function bootstrapWebsite() {
  const yearNode = document.getElementById("currentYear");

  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }

  const revealTargets = [
    ...document.querySelectorAll(".section"),
    ...document.querySelectorAll(".preview-card"),
  ];

  for (const node of revealTargets) {
    node.setAttribute("data-reveal", "");
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) {
        continue;
      }

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  }, {
    threshold: 0.18,
    rootMargin: "0px 0px -8% 0px",
  });

  for (const node of revealTargets) {
    observer.observe(node);
  }
}());
