document.addEventListener("DOMContentLoaded", async () => {
  const browsers = document.querySelectorAll(".mva-course-material-browser");

  for (const browser of browsers) {
    const course = browser.dataset.course;
    const manifestUrl = `/course-materials/${course}/manifest.json`;

    try {
      const response = await fetch(manifestUrl, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const manifest = await response.json();
      const grouped = new Map();

      for (const item of manifest.files || []) {
        const area = item.area || "other-content";
        if (!grouped.has(area)) grouped.set(area, []);
        grouped.get(area).push(item);
      }

      for (const section of browser.querySelectorAll(".mva-material-area")) {
        const area = section.dataset.area;
        const loading = section.querySelector(".mva-material-loading");
        const list = section.querySelector(".mva-material-tree");
        const files = grouped.get(area) || [];

        if (loading) loading.remove();

        if (!files.length) {
          const empty = document.createElement("li");
          empty.className = "mva-material-empty";
          empty.textContent = "No public files have been released in this area.";
          list.appendChild(empty);
          continue;
        }

        for (const file of files) {
          const item = document.createElement("li");
          const link = document.createElement("a");
          link.href = file.url;
          link.textContent = file.path;
          link.target = "_blank";
          link.rel = "noopener";
          item.appendChild(link);

          if (file.size) {
            const size = document.createElement("span");
            size.className = "mva-material-size";
            size.textContent = ` (${file.size})`;
            item.appendChild(size);
          }

          list.appendChild(item);
        }
      }
    } catch (error) {
      for (const loading of browser.querySelectorAll(".mva-material-loading")) {
        loading.textContent = "No published manifest is available yet.";
      }
      console.warn(`Could not load ${manifestUrl}`, error);
    }
  }
});
