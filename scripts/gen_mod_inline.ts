await Deno.readTextFile("./src_js/mod.ts").then((file) =>
  file.replace("../lib/dbase_js.js", "../lib_inline/dbase_js.js")
).then((file) => Deno.writeTextFileSync("./src_js/mod_inline.ts", file));
