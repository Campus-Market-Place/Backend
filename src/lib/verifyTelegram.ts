import crypto from "crypto";

export function verifyTelegram(initData: string, botToken: string) {
  const params = new URLSearchParams(initData);

  const hash = params.get("hash");
  params.delete("hash");

  const dataCheckArr: string[] = [];

  params.sort();

  for (const [key, value] of params.entries()) {
    dataCheckArr.push(`${key}=${value}`);
  }

  const dataCheckString = dataCheckArr.join("\n");

  const secret = crypto
    .createHash("sha256")
    .update(botToken)
    .digest();

  const hmac = crypto
    .createHmac("sha256", secret)
    .update(dataCheckString)
    .digest("hex");

  return hmac === hash;
}
