await Deno.readTextFile("./src_js/mod.ts").then((file) =>
  file.replace("./lib/deno_dbase.js", "./lib_inline/deno_dbase.js")
).then((file) => Deno.writeTextFileSync("./src_js/mod_inline.ts", file));
