// Gerado automaticamente — testes de correção do trabalho em grupo.
const http = require("http");
const fs = require("fs");
const PORT = process.env.PORT || 3000;
let passed = 0;
const errors = [];
function check(cond, msg) { if (cond) passed++; else errors.push(msg); }
function req(method, path, opt) {
  opt = opt || {};
  return new Promise((resolve) => {
    const data = opt.body ? JSON.stringify(opt.body) : null;
    const headers = { "Content-Type": "application/json" };
    if (opt.token) headers.Authorization = "Bearer " + opt.token;
    const r = http.request({ host: "127.0.0.1", port: PORT, path: path, method: method, headers: headers, timeout: 8000 }, (res) => {
      let b = ""; res.on("data", (c) => (b += c)); res.on("end", () => {
        let json = null; try { json = b ? JSON.parse(b) : null; } catch (e) {}
        resolve({ status: res.statusCode, body: b, json: json });
      });
    });
    r.on("error", () => resolve({ status: 0, body: "", json: null }));
    r.on("timeout", () => { r.destroy(); resolve({ status: 0, body: "", json: null }); });
    if (data) r.write(data);
    r.end();
  });
}
function idOf(o) { if (!o) return null; return o.id || o._id || o.ID || (o.data && (o.data.id || o.data._id)) || null; }
function arr(o) { if (Array.isArray(o)) return o; if (o && Array.isArray(o.data)) return o.data; if (o && Array.isArray(o.items)) return o.items; return []; }
async function waitForServer() { for (let i = 0; i < 20; i++) { const r = await req("GET", "/"); if (r.status !== 0) return true; await new Promise((s) => setTimeout(s, 1000)); } return false; }

async function runTests() {
  const sfx = Date.now();
  const root = await req("GET", "/"); check(root.status === 200, "GET / deveria responder 200 (veio " + root.status + ")");

  // Autores
  const auth = await req("POST", "/authors", { body: { name: "Machado de Assis", nationality: "Brasileiro" } });
  check([200, 201].includes(auth.status), "POST /authors deveria criar com 200/201 (veio " + auth.status + ")");
  const authorId = idOf(auth.json);
  const authList = await req("GET", "/authors"); check(authList.status === 200, "GET /authors deveria responder 200 (veio " + authList.status + ")");

  // Livros
  const title = "Dom Casmurro " + sfx;
  const book = await req("POST", "/books", { body: { title: title, author_id: authorId, year: 1899, isbn: "isbn" + sfx, quantity: 3 } });
  check([200, 201].includes(book.status), "POST /books deveria criar com 200/201 (veio " + book.status + ")");
  const bookId = idOf(book.json);
  const bookList = await req("GET", "/books"); check(bookList.status === 200, "GET /books deveria responder 200 (veio " + bookList.status + ")");
  check(arr(bookList.json).some((b) => JSON.stringify(b || "").includes(title)), "o livro criado deveria aparecer em GET /books");
  const nf = await req("GET", "/books/99999999"); check(nf.status === 404, "GET /books/:id inexistente deveria responder 404 (veio " + nf.status + ")");

  // Usuários
  const user = await req("POST", "/users", { body: { name: "Alice " + sfx, email: "alice" + sfx + "@x.com" } });
  check([200, 201].includes(user.status), "POST /users deveria criar com 200/201 (veio " + user.status + ")");
  const userId = idOf(user.json);

  // Empréstimos
  if (bookId != null && userId != null) {
    const loan = await req("POST", "/loans", { body: { book_id: bookId, user_id: userId, due_date: "2030-12-31" } });
    check([200, 201].includes(loan.status), "POST /loans deveria registrar emprestimo (veio " + loan.status + ")");
    const loanId = idOf(loan.json);
    const overdue = await req("GET", "/loans/overdue"); check(overdue.status === 200, "GET /loans/overdue deveria responder 200 (veio " + overdue.status + ")");
    if (loanId != null) {
      const ret = await req("PUT", "/loans/" + loanId + "/return", {}); check([200, 201].includes(ret.status), "PUT /loans/:id/return deveria devolver livro (veio " + ret.status + ")");
    }
  }
  const bad = await req("POST", "/books", { body: {} }); check([400, 422].includes(bad.status), "POST /books sem campos deveria responder 400/422 (veio " + bad.status + ")");
}

(async () => {
  const up = await waitForServer();
  if (!up) errors.push("o servidor nao respondeu em GET / dentro do tempo limite");
  else { try { await runTests(); } catch (e) { errors.push("erro de execucao: " + String((e && e.message) || e)); } }
  const ok = errors.length === 0;
  const output = (ok ? (passed + " verificacoes OK") : errors.slice(0, 6).join("; ")).replace(/[\r\n"]/g, " ").slice(0, 400);
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, "passed=" + ok + "\noutput=" + output + "\n");
  console.log("passed=" + ok);
  console.log("output=" + output);
})();
