import bcrypt from "bcryptjs";
const hashPassword = (password: string): string => {
  return bcrypt.hashSync(password, 10);
};

const comparePassword = (userPassword: string, dbPassword: string): boolean => {
  return bcrypt.compareSync(userPassword, dbPassword);
};

export { hashPassword, comparePassword };
