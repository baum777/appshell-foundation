export const safeParse = <T>(str: string, fallback: T): T => {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

