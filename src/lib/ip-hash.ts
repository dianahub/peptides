import { createHash } from "crypto";

export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? "default-dev-salt";
  return createHash("sha256")
    .update(salt + ip)
    .digest("hex");
}
