import { PeerServer } from "peer";
import fs from "fs"
import path from "path"
PeerServer({ 
  port: 9001, 
  path: "/",
  ssl: {
	  key: fs.readFileSync(path.resolve(__dirname, '../../ssl/wangyu.cloud.key'), "utf8"),
	  cert: fs.readFileSync(path.resolve(__dirname, '../../ssl/wangyu.cloud_bundle.crt'), "utf8"),
	},
}); 