import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import bcrypt from 'bcryptjs';

async function main(): Promise<void> {
  let password = process.argv[2];

  if (!password) {
    const rl = readline.createInterface({ input, output });
    try {
      password = await rl.question('Enter password to hash: ');
    } finally {
      rl.close();
    }
  }

  if (!password || password.length === 0) {
    console.error('Error: Password cannot be empty.');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);
  console.log('\nGenerated bcrypt hash (copy into ADMIN_PASSWORD_HASH in .env):');
  console.log(hash);
}

main().catch((err: unknown) => {
  console.error('Failed to hash password:', err);
  process.exit(1);
});
