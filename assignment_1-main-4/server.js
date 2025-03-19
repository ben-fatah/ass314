const express = require("express");
const path = require("path");
const database = require("./database/database.js");

const app = express();
const port = 3000;

// تفعيل قراءة JSON والـ form-data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// تقديم الملفات الثابتة
app.use(express.static(path.join(__dirname, "public")));

// ✅ تعديل الـ POST لتسجيل الدخول
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.redirect("/?error=true");
  }

  try {
    const user = { username, password };
    const result = await database.authenticate(user);

    if (result.length > 0) {
      res.json({ message: "Login successful!", user: result[0] });
    } else {
      res.redirect("/?error=true");
    }
  } catch (err) {
    console.error("Error during login:", err);
    res.redirect("/?error=true");
  }
});

// ✅ إضافة طريق لتسجيل الحساب (Sign Up)
app.post("/submitSignup", async (req, res) => {
  const { username, password } = req.body;

  // تأكد من وجود البيانات
  if (!username || !password) {
    return res.redirect("/signup?error=true");
  }

  try {
    // تحقق مما إذا كان اسم المستخدم موجودًا بالفعل في قاعدة البيانات
    const existingUser = await database.findUserByUsername(username);

    if (existingUser.length > 0) {
      // إذا كان اسم المستخدم موجودًا بالفعل
      return res.redirect("/signup?error=true");
    }

    // إذا كان المستخدم غير موجود، قم بإضافته إلى قاعدة البيانات
    await database.signup({ username, password });

    // إعادة التوجيه إلى صفحة تسجيل الدخول بعد النجاح
    res.redirect("/login");
  } catch (err) {
    console.error("Error during signup:", err);
    res.redirect("/signup?error=true");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
