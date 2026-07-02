// Gerado automaticamente — testes de correção do Simulador de Sistema de Arquivos.
"use strict";
const nodeFs = require("fs");
let passed = 0;
const errors = [];
function check(cond, msg) { if (cond) passed++; else errors.push(msg); }
function throws(fn, msg) { try { fn(); errors.push(msg + " (nao lancou Error)"); } catch (e) { passed++; } }

let FileSystem;
try {
  ({ FileSystem } = require("./repo/src/filesystem"));
} catch (e) {
  errors.push("Nao foi possivel importar src/filesystem.js: " + e.message);
}

function run() {
  if (!FileSystem) return;
  const vfs = new FileSystem();

  // ── mkdir / touch / pwd ──────────────────────────────────────────────────
  check(vfs.pwd() === "/", "pwd() inicial deveria ser '/'");
  vfs.mkdir("/docs");
  vfs.mkdir("/docs/sub");
  vfs.touch("/docs/readme.txt", "ola mundo");
  vfs.touch("/docs/sub/notas.txt", "anotacoes");

  // ── ls ───────────────────────────────────────────────────────────────────
  const root = vfs.ls("/");
  check(Array.isArray(root), "ls('/') deveria retornar um array");
  check(root.includes("docs"), "ls('/') deveria conter 'docs'");
  const docs = vfs.ls("/docs");
  check(docs.includes("readme.txt"), "ls('/docs') deveria conter 'readme.txt'");
  check(docs.includes("sub"), "ls('/docs') deveria conter 'sub'");

  // ── cd / pwd ─────────────────────────────────────────────────────────────
  vfs.cd("/docs");
  check(vfs.pwd() === "/docs", "cd('/docs') deveria mudar pwd para '/docs'");
  vfs.cd("..");
  check(vfs.pwd() === "/", "cd('..') a partir de /docs deveria voltar para '/'");
  vfs.cd("docs/sub");
  check(vfs.pwd() === "/docs/sub", "cd relativo 'docs/sub' deveria funcionar");
  throws(() => vfs.cd("/inexistente"), "cd para diretorio inexistente deveria lancar Error");

  // ── cat / write ──────────────────────────────────────────────────────────
  vfs.cd("/");
  check(vfs.cat("/docs/readme.txt") === "ola mundo", "cat('/docs/readme.txt') deveria retornar 'ola mundo'");
  vfs.write("/docs/readme.txt", "novo conteudo");
  check(vfs.cat("/docs/readme.txt") === "novo conteudo", "write deveria sobrescrever o arquivo");
  vfs.write("/docs/novo.txt", "criado via write");
  check(vfs.ls("/docs").includes("novo.txt"), "write deveria criar arquivo se nao existir");
  throws(() => vfs.cat("/inexistente.txt"), "cat em arquivo inexistente deveria lancar Error");
  throws(() => vfs.cat("/docs"), "cat em diretorio deveria lancar Error");

  // ── rm / rmdir ───────────────────────────────────────────────────────────
  vfs.rm("/docs/novo.txt");
  check(!vfs.ls("/docs").includes("novo.txt"), "rm deveria remover o arquivo");
  throws(() => vfs.rm("/docs"), "rm em diretorio deveria lancar Error");
  throws(() => vfs.rmdir("/docs"), "rmdir em diretorio nao vazio deveria lancar Error");
  vfs.mkdir("/vazio");
  vfs.rmdir("/vazio");
  check(!vfs.ls("/").includes("vazio"), "rmdir deveria remover diretorio vazio");

  // ── cp ───────────────────────────────────────────────────────────────────
  vfs.cp("/docs/readme.txt", "/copia.txt");
  check(vfs.cat("/copia.txt") === "novo conteudo", "cp deveria copiar conteudo do arquivo");
  check(vfs.cat("/docs/readme.txt") === "novo conteudo", "cp nao deveria remover o original");

  // ── mv ───────────────────────────────────────────────────────────────────
  vfs.mv("/copia.txt", "/movido.txt");
  check(vfs.cat("/movido.txt") === "novo conteudo", "mv deveria mover o arquivo");
  check(!vfs.ls("/").includes("copia.txt"), "mv deveria remover o arquivo original");

  // ── find ─────────────────────────────────────────────────────────────────
  const found = vfs.find("readme");
  check(Array.isArray(found), "find deveria retornar um array");
  check(found.some((p) => p.includes("readme")), "find('readme') deveria encontrar /docs/readme.txt");
  const none = vfs.find("zzznaoexiste");
  check(Array.isArray(none) && none.length === 0, "find sem resultados deveria retornar array vazio");
}

try { run(); } catch (e) { errors.push("erro de execucao: " + String((e && e.message) || e)); }
const ok = errors.length === 0;
const output = (ok ? (passed + " verificacoes OK") : errors.slice(0, 6).join("; ")).replace(/[\r\n"]/g, " ").slice(0, 400);
if (process.env.GITHUB_OUTPUT) nodeFs.appendFileSync(process.env.GITHUB_OUTPUT, "passed=" + ok + "\noutput=" + output + "\n");
console.log("passed=" + ok);
console.log("output=" + output);
