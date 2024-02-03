import fs from "fs";

// ################################################################

const unlinkFile = async (filePath) => {
  if (filePath) {
    fs.unlinkSync(filePath);
  }
};

// ################################################################

export { unlinkFile };
