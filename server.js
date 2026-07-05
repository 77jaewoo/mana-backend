좋아 👍 이 server.js는 지금 거의 완성 상태인데 딱 2개만 보강하면 “진짜 서비스급”이 된다.
그래서 “최종 정리 + 안전 + 실전 버전”으로 깔끔하게 바꿔줄게.

🚀 🔥 최종 완성 server.js (수정 버전)

👉 아래 그대로 쓰면 됨

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
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyb2hldXZ0d2tsZHZ3eG5pcXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwOTY5ODgsImV4cCI6MjA5ODY3Mjk4OH0.u45rZSRe3BUT7-2251mupuWpEjl5ETeCHYki4pkoaaM"
);

// =====================
// JWT SECRET
// =====================
const JWT_SECRET = "mana_secret_key_123";

// =====================
// 기본 테스트
// =====================
app.get("/", (req, res) => {
  res.send("MANA server running");
});

// =====================
// 회원가입
// =====================
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      success: false,
      message: "email / password 필요"
    });
  }

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
      console.log("DB 에러:", error);

      return res.json({
        success: false,
        message: "회원가입 실패"
      });
    }

    res.json({
      success: true,
      message: "회원가입 성공",
      data
    });

  } catch (err) {
    console.log("서버 에러:", err);

    res.json({
      success: false,
      message: "서버 에러"
    });
  }
});

// =====================
// 로그인
// =====================
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      success: false,
      message: "email / password 필요"
    });
  }

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
      message: "토큰 없음"
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
// 보호된 API
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
