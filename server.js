const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();

// 🔥 필수 설정
app.use(cors());
app.use(express.json());

// ✅ Supabase 연결 (여기 2개는 너 키로 교체해야 함)
const supabase = createClient(
  "YOUR_SUPABASE_URL",
  "YOUR_SUPABASE_ANON_KEY"
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
