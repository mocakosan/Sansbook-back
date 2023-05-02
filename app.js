const express = require("express");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const dotenv = require("dotenv");
const morgan = require("morgan");
const path = require("path");
const hpp = require("hpp");
const helmet = require("helmet");

const postRouter = require("./routes/post");
const postsRouter = require("./routes/posts");
const userRouter = require("./routes/user");
const hashtagRouter = require("./routes/hashtag");
const db = require("./models");
const passportConfig = require("./passport");

dotenv.config();
const app = express((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
});
db.sequelize
  .sync()
  .then(() => {
    console.log("db 연결성공");
  })
  .catch(console.error);
passportConfig();
//모드변경
if (process.env.NODE_ENV === "production") {
  //배포용
  app.use(morgan("combined"));
  app.use(hpp());
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(
    cors({
      origin: "http://sansbook.co.kr",
      credentials: true,
    })
  );
} else {
  //개발용
  app.use(morgan("dev"));
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );
}
//
// app.use(
//   cors({
//     origin: [
//       "http://localhost:3000",
//       "http://sansbook.co.kr",
//       "http://43.200.92.114",
//     ],
//     credentials: true,
//   })
// );
app.use("/", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
//secret session
app.use(
  session({
    saveUninitialized: false,
    resave: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
      domain: process.env.NODE_ENV === "production" && ".sansbook.co.kr",
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.send("hello express");
});
app.use("/posts", postsRouter);
app.use("/post", postRouter);
app.use("/user", userRouter);
app.use("/hashtag", hashtagRouter);

// 배포용: 80 , 개발용: 3001
app.listen(80, () => {
  console.log("서버실행중!");
});
