const suffixes = ["_", "-", ".", ""];

export function generateUsername(firstName, lastName, attempt = 0) {
  /* Первые 1-3 буквы имени */
  const firstPart = firstName.substring(0, Math.min(3, firstName.length));

  /* Первые 1-3 буквы фамилии */
  const lastPart = lastName.substring(0, Math.min(3, lastName.length));

  /* Генерирация случайного числа */
  const randomNum = Math.floor(Math.random() * 990) + 10;

  /* Выбор случайного суффикса */
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

  /* Варианты генерации */
  const variants = [
    `${firstPart}${lastPart}${randomNum}`,
    `${firstPart}${suffix}${lastPart}${randomNum}`,
    `${firstPart.charAt(0)}${suffix}${lastPart}${randomNum}`,
  ];

  /* Выбор варианта в зависимости от попытки */
  return variants[attempt % variants.length];
}
