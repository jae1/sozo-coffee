import bcrypt from 'bcryptjs';

const rawPin = '1234';
const hashFromEnv = process.env.BARISTA_PIN_HASH;
console.log('Testing PIN validation...');
console.log('Raw PIN:', rawPin);
console.log('Hash in .env.local:', hashFromEnv);

async function test() {
  if (!hashFromEnv) {
    console.error('No hash found');
    return;
  }
  const match = await bcrypt.compare(rawPin, hashFromEnv);
  console.log('Match?', match);
  
  // also let's check what a new hash of 1234 looks like
  const newHash = await bcrypt.hash(rawPin, 12);
  console.log('New hash of 1234:', newHash);
}

test();
