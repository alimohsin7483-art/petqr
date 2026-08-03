export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "•••• ••••";
  const last2 = digits.slice(-2);
  return `+•• •••• ••${last2}`;
}
