const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

// =====================
// Supabase 연결
// =====================
const supabase = createClient(
  "https://uroheuvtwkldvwxniqyr.supabase.co",
  "YOUR_SUPABASE_ANON_KEY"
);

// =====================
// JWT SECRET (아무 문자열 OK)
// =====================
const JWT_SECRET = "mana_secret_key_123";

// =====================
// 기본 라우트
// =====================
app.get("/", (req, res) => {
  res.send("MANA server running");
});

// =====================
// 회원가입 (비밀번호 암호화)
// =====================
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  console.log("signup 요청:", email);

  // 🔐 비밀번호 암호화
  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        email,
        password: hashedPassword
      }
    ]);

  if (error) {
    return res.json({
      success: false,
      error
    });
  }

  res.json({
    success: true,
    message: "회원가입 성공 (암호화 저장)",
    data
  });
});

// =====================
// 로그인 (JWT 발급)
// =====================
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("login 요청:", email);

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !data) {
    return res.json({
      success: false,
      message: "유저 없음"
    });
  }

  // 🔐 비밀번호 비교
  const isMatch = await bcrypt.compare(password, data.password);

  if (!isMatch) {
    return res.json({
      success: false,
      message: "비밀번호 틀림"
    });
  }

  // 🔑 JWT 생성
  const token = jwt.sign(
    { id: data.id, email: data.email },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({
    success: true,
    message: "로그인 성공",
    token
  });
});

// =====================
// 서버 실행
// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
