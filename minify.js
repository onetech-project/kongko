const fs = require("fs");
const minify = require("minify");

const options = {
  css: {
    compatibility: "*",
  },
  js: {
    ecma: 5,
  },
};

const dir = "./public";

const minifyCode = (path) => {
  fs.readdir(path, { encoding: "utf-8" }, (err, files) => {
    // console.log(err || files);
    if (err) throw err;
    files.map((file) => {
      const innerPath = `${path}/${file}`;
      fs.lstat(innerPath, (err, stat) => {
        // console.log(err || stat);
        if (err) throw err;
        if (
          stat.isFile() &&
          (innerPath.includes("js") || innerPath.includes("css"))
        ) {
          // console.log(fs.readFileSync(innerPath, { encoding: "utf-8" }));
          minify(innerPath, options)
            .then((res) =>
              fs.writeFile(
                `${innerPath}`,
                res,
                { encoding: "utf-8" },
                (err, res) => console.log(err || res)
              )
            )
            .catch(console.error);
        }
        if (stat.isDirectory()) minifyCode(innerPath);
      });
    });
  });
};

minifyCode(dir);
