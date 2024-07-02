import { marked } from "marked";
import matter from "gray-matter";
import fs from "fs/promises";
import path from "path";
import { parse } from "node-html-parser";

const postsDir = "./posts";
const buildDir = "./build";
const filesToCopy = ["./index.css", "./index.js"];

const getPreviewHTML = ({
  filePath,
  title,
  subtitle,
  image,
  imageAlt,
  date,
}) => {
  return `
      <li>
          <article>
            <a href="${filePath}">
                <header>
                    <h2>${title}</h2>
                    <p>${subtitle}</p>
                    <p>${date}</p>
                </header>
                <img src="/public/${image}" alt=${imageAlt}>
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
    await fs.mkdir(path.join(buildDir, "posts"), { recursive: true });
    console.log("Directory Created!");

    // Read files from posts directory
    const files = await fs.readdir(postsDir);

    // Parse index.html
    const indexHtml = await fs.readFile("./index.html", { encoding: "utf-8" });
    const root = parse(indexHtml);
    const list = root.getElementById("post-list");

    for (const file of files.filter((file) => file.includes(".md"))) {
      const filePath = path.join(postsDir, file);

      // Read and parse markdown file
      const postMd = await fs.readFile(filePath, { encoding: "utf-8" });
      const parsed = matter(postMd);
      const metadata = parsed.data; // Metadata extracted from the front matter
      const content = parsed.content; // Markdown content without the front matter
      const html = marked.parse(content);
      const htmlFilePath = path.join(
        buildDir,
        "posts",
        `${path.parse(file).name}.html`
      );

      // Write HTML file to build directory
      await fs.writeFile(htmlFilePath, html);
      console.log("The file was saved!");
      console.log(metadata);
      // Append preview HTML to list
      list.appendChild(
        parse(
          getPreviewHTML({
            ...metadata,
            filePath: path.join("posts", `${path.parse(file).name}.html`),
          })
        )
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
    await fs.cp("posts/images", path.join(buildDir, "public"), {
      recursive: true,
    });
  } catch (err) {
    console.error(err);
  }
};

// Execute the script
processMarkdownFiles();
