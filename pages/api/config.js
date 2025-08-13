import fs from "fs";
import path from "path";

const configFilePath = path.join(process.cwd(), "data", "config.json");

const readConfig = () => {
  if (!fs.existsSync(configFilePath)) {
    return {
      username: "",
      password: "",
      calendarOnly: false,
      notifications: true,
    };
  }
  const fileContent = fs.readFileSync(configFilePath, "utf-8");
  const data = JSON.parse(fileContent);

  // Ensure backward compatibility by adding new fields if they don't exist
  return {
    username: data.username || "",
    password: data.password || "",
    calendarOnly: data.calendarOnly || false,
    notifications: data.notifications !== undefined ? data.notifications : true,
  };
};

const writeConfig = (data) => {
  fs.writeFileSync(configFilePath, JSON.stringify(data, null, 2));
};

export default function handler(req, res) {
  if (req.method === "GET") {
    const config = readConfig();
    res.status(200).json(config);
  } else if (req.method === "POST") {
    const { username, password, calendarOnly, notifications } = req.body;
    if (typeof username !== "string" || typeof password !== "string") {
      return res
        .status(400)
        .json({ message: "Username and password must be strings." });
    }
    const config = {
      username,
      password,
      calendarOnly: calendarOnly || false,
      notifications: notifications !== undefined ? notifications : true,
    };
    writeConfig(config);
    res.status(200).json({ message: "Configuration updated successfully." });
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
