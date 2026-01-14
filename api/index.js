import mysql from "mysql2/promise";

function escapeHtml(s = "") {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default async function handler(req, res) {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: "SG",
      // Si tu MySQL exige SSL, descomenta y ajusta:
      // ssl: { rejectUnauthorized: true }
    });

    const [rows] = await conn.execute("select * from s_customer");

    const trs = rows
      .map(
        (r) => `
        <tr>
          <td>${escapeHtml(r.name)}</td>
          <td>${escapeHtml(r.credit_rating)}</td>
          <td>${escapeHtml(r.address)}</td>
          <td>${escapeHtml(r.city)}</td>
          <td>${escapeHtml(r.state)}</td>
          <td>${escapeHtml(r.country)}</td>
          <td>${escapeHtml(r.zip_code)}</td>
        </tr>`
      )
      .join("");

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Customer Catalog</title>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css" crossorigin="anonymous">
</head>
<body>
  <div class="container">
    <div class="jumbotron">
      <h1 class="display-4">Customer Catalog</h1>
      <p class="lead">Customer Catalog Sample Application</p>
      <hr class="my-4">
      <p>Sample application connected to a MySQL database to list a customer catalog</p>
    </div>

    <table class="table table-striped table-responsive">
      <thead>
        <tr>
          <th>Name</th>
          <th>Credit Rating</th>
          <th>Address</th>
          <th>City</th>
          <th>State</th>
          <th>Country</th>
          <th>Zip</th>
        </tr>
      </thead>
      <tbody>
        ${trs}
      </tbody>
    </table>
  </div>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  } finally {
    try {
      if (conn) await conn.end();
    } catch {}
  }
}
