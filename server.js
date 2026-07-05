const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

// =====================
// Supabase 연결 (완성)
// =====================
const supabase = createClient(
  "https://uroheuvtwkldvwxniqyr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyb2hldXZ0d2tsZHZ3eG5pcXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwOTY5ODgsImV4cCI6MjA5ODY3Mjk4OH0.u45rZSRe3BUT7-2251mupuWpEjl5ETeCHYki4pkoaaM"
);

// =====================
// JWT SECRET
// =====================
const JWT_SECRET = "mana_secret_key_123";

// =====================
// 기본 라우트
// =====================
app.get("/", (req, res) => {
  res.send("MANA server running");
});

// =====================
// 회원가입 (bcrypt + DB 저장)
// =====================
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  console.log("signup 요청:", email);

  try {
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
        message: "회원가입 실패",
        error
      });
    }

    res.json({
      success: true,
      message: "회원가입 성공",
      data
    });
  } catch (err) {
    res.json({
      success: false,
      message: "서버 에러",
      error: err.message
    });
  }
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

  const isMatch = await bcrypt.compare(password, data.password);

  if (!isMatch) {
    return res.json({
      success: false,
      message: "비밀번호 틀림"
    });
  }

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
// JWT 인증 미들웨어
// =====================
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.json({
      success: false,
      message: "토큰 없음 (로그인 필요)"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.json({
      success: false,
      message: "토큰 인증 실패"
    });
  }
};

// =====================
// 보호된 API (/me)
// =====================
app.get("/me", authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "인증 성공",
    user: req.user
  });
});

// =====================
// 서버 실행
// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
