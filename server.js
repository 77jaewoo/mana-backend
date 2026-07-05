const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("MANA server running");
});


// ✅ 여기 추가 (핵심)
app.post("/signup", (req, res) => {
  const { email, password } = req.body;

  console.log("signup 요청:", email);

  res.json({
    success: true,
    message: "signup API 동작함",
    email: email
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
