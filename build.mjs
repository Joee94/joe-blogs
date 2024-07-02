import { marked } from "marked";
import fs from "fs/promises";
import path from "path";
import { parse } from "node-html-parser";

const postsDir = "./posts";
const buildDir = "./build";
const filesToCopy = ["./index.css", "./index.js"];

const getPreviewHTML = ({ filePath, firstHeading, secondHeading }) => {
  return `
<li>
    <article>
      <a href="${filePath}">
          <header>
              <h2>${firstHeading}</h2>
              <p>${secondHeading}</p>
          </header>
          <figure>
              <img src="path/to/image1.jpg" alt="Description of image 1">
              <figcaption>Optional caption for the image</figcaption>
          </figure>
        </a>
    </article>
</li>`;
};

const processMarkdownFiles = async () => {
  try {
    // Remove the build directory if it exists
    await fs.rm(buildDir, { recursive: true, force: true });
    console.log("Directory deleted!");

    // Create the build directory
    await fs.mkdir(buildDir, { recursive: true });
    console.log("Directory Created!");

    // Read files from posts directory
    const files = await fs.readdir(postsDir);

    // Parse index.html
    const indexHtml = await fs.readFile("./index.html", { encoding: "utf-8" });
    const root = parse(indexHtml);
    const list = root.getElementById("post-list");

    for (const file of files) {
      const filePath = path.join(postsDir, file);

      // Read and parse markdown file
      const postMd = await fs.readFile(filePath, { encoding: "utf-8" });
      const html = marked.parse(postMd);
      const htmlFilePath = path.join(buildDir, `${path.parse(file).name}.html`);

      // Write HTML file to build directory
      await fs.writeFile(htmlFilePath, html);
      console.log("The file was saved!");

      const tokens = marked.lexer(postMd);
      const firstHeading =
        tokens.find((token) => token.type === "heading" && token.depth === 1)
          ?.text || "";
      const secondHeading =
        tokens.find((token) => token.type === "heading" && token.depth === 2)
          ?.text || "";

      // Append preview HTML to list
      list.appendChild(
        parse(getPreviewHTML({ firstHeading, secondHeading, filePath }))
      );
    }

    // Write updated index.html to build directory
    await fs.writeFile(path.join(buildDir, "index.html"), root.toString());
    console.log("The index.html was saved!");

    // Copy additional files
    for (const file of filesToCopy) {
      await fs.copyFile(file, path.join(buildDir, path.basename(file)));
      console.log(file + " copied");
    }
  } catch (err) {
    console.error(err);
  }
};

// Execute the script
processMarkdownFiles();
