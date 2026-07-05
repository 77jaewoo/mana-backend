const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();

// 🔥 필수 설정
app.use(cors());
app.use(express.json());

// ✅ Supabase 연결 (완성)
const supabase = createClient(
  "https://uroheuvtwkldvwxniqyr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyb2hldXZ0d2tsZHZ3eG5pcXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwOTY5ODgsImV4cCI6MjA5ODY3Mjk4OH0.u45rZSRe3BUT7-2251mupuWpEjl5ETeCHYki4pkoaaM"
);

// 테스트용 기본 라우트
app.get("/", (req, res) => {
  res.send("MANA server running");
});

// ✅ 회원가입 API (DB 저장 버전)
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  console.log("signup 요청:", email);

  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        email,
        password
      }
    ]);

  if (error) {
    console.log("DB 에러:", error);

    return res.json({
      success: false,
      error
    });
  }

  res.json({
    success: true,
    message: "DB 저장 성공",
    data
  });
});

// 서버 실행
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
