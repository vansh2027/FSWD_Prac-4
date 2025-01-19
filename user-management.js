const http = require("http");
const fs = require("fs");
const path = require("path");

const usersFilePath = path.join(__dirname, "users.json");

function readUsersFile() {
  if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, "[]"); 
  }
  return JSON.parse(fs.readFileSync(usersFilePath, "utf-8"));
}

function writeUsersFile(data) {
  fs.writeFileSync(usersFilePath, JSON.stringify(data, null, 2));
}

const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  if (url.startsWith("/users")) {

    if (method === "GET" && url === "/users") {
      const users = readUsersFile();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(users));

    } else if (method === "POST" && url === "/users") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        try {
          const newUser = JSON.parse(body);

          if (!newUser.name || !newUser.email) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ error: "Missing required fields: name, email" })
            );
            return;
          }

          const users = readUsersFile();
          const id = users.length ? users[users.length - 1].id + 1 : 1; 
          newUser.id = id;
          users.push(newUser);

          writeUsersFile(users);

          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "User added", user: newUser }));
        } catch (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid JSON data" }));
        }
      });

    } else if (method === "DELETE" && url.startsWith("/users/")) {
      const id = parseInt(url.split("/")[2], 10);
      if (isNaN(id)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid user ID" }));
        return;
      }

      const users = readUsersFile();
      const filteredUsers = users.filter((user) => user.id !== id);

      if (filteredUsers.length === users.length) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "User not found" }));
        return;
      }

      writeUsersFile(filteredUsers);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: `User with ID ${id} deleted` }));

    } else {
      res.writeHead(405, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Method not allowed" }));
    }

  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Endpoint not found" }));
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http:
});
