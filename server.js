const express = require("express");
const cors = require("cors");

const app = express();

// 🔥 필수 설정
app.use(cors());
app.use(express.json());

// 테스트용 기본 라우트
app.get("/", (req, res) => {
  res.send("MANA server running");
});

// ✅ 회원가입 API
app.post("/signup", (req, res) => {
  const { email, password } = req.body;

  console.log("signup 요청:", email);

  res.json({
    success: true,
    message: "signup API 동작함",
    email: email
  });
});

// 서버 실행
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
