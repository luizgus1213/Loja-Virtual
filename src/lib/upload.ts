import multer from "multer";
import crypto from "crypto";

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./public/uploads");
  },
  filename: (req, file, callback) => {
    callback(
      null,
      file.originalname.split(".")[0] +
        "_" +
        crypto.randomBytes(46).toString("hex") +
        "." +
        file.originalname.split(".")[1],
    );
  },
});

const upload = multer({ storage });

export default upload;
