#!/usr/bin/env node
const exec = require("child_process").exec;
const getSize = require("get-folder-size");
const { sprintf } = require("sprintf");

let [ target ] = process.argv.slice(2);
if (!target) {
  target = process.cwd();
}
if (target[target.length - 1] === "/") {
  target = target.substring(0, target.length - 1);
}

const regex = 'node_modules$';
const command = `find ${target} -type d | grep "${regex}"`;

let total = 0;
let longest;

exec(command, (error, stdout, stderr) => {
  const roots = stdout.split("\n").filter(path => {
    const hasTwo = !!path.match(/node_modules.*node_modules/);
    return path !== "" && !hasTwo;
  });

  const labels = roots.map(path => path.substring(target.length + 1));

  longest = labels.reduce((prev,cur) => {
    return prev.length > cur.length ? prev : cur;
  }, "");

  roots.forEach((path, i) => {
    getSize(path, (error, size) => {
      total += size;
      console.log(sprintf(`%5dM %s`, size / 1024 / 1024, labels[i]));
    });
  });
});

process.on('exit', () => {
  console.log(sprintf(`%5dM %s`, total / 1024 / 1024, "TOTAL"));
});
