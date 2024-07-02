import { marked } from "marked";
import fs from "fs";
import path from "path";
const postsDir = "./posts";
const buildDir = "./build";

fs.rm(buildDir, { recursive: true }, (err) => {
  if (err) {
    console.log(err);
  }
  console.log("Directory deleted!");
  fs.mkdir(buildDir, {}, (err) => {
    if (err) {
      return console.log(err);
    }
    console.log("Directory Created!");
    fs.readdir(postsDir, (err, files) => {
      if (err) {
        throw new Error(err);
      }
      files.forEach((file) => {
        const filePath = path.join(postsDir, file);
        fs.readFile(filePath, { encoding: "utf-8" }, (err, data) => {
          const html = marked.parse(data);
          const htmlFilePath =
            filePath.substring(0, file.lastIndexOf(".")) + ".html";
          fs.writeFile(`build/${htmlFilePath}`, html, (err) => {
            if (err) {
              return console.log(err);
            }
            console.log("The file was saved!");
          });
        });
      });
    });
  });
});
