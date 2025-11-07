import { PrismaClient } from '@prisma/client';

const DATABASE_URL = 'postgresql://neondb_owner:npg_d4YQPHG3lsAO@ep-soft-bonus-adifdkuy-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  },
  log: ['query', 'info', 'warn', 'error']
});

async function testAuth() {
  console.log('Testing auth operations...\n');
  
  // Test 1: Create a test user
  console.log('1. Creating test user...');
  try {
    const user = await prisma.user.create({
      data: {
        email: 'test-' + Date.now() + '@example.com',
        name: 'Test User'
      }
    });
    console.log('✓ User created:', user.id);
    
    // Test 2: Create an account (simulating OAuth)
    console.log('\n2. Creating OAuth account...');
    const account = await prisma.account.create({
      data: {
        userId: user.id,
        type: 'oauth',
        provider: 'google',
        providerAccountId: 'test-' + Date.now(),
        refresh_token: 'ya29.' + 'x'.repeat(500), // Long token
        access_token: 'ya29.' + 'y'.repeat(500),  // Long token
        id_token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ.' + 'z'.repeat(500), // Long JWT
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'Bearer',
        scope: 'openid profile email'
      }
    });
    console.log('✓ Account created:', account.id);
    
    // Test 3: Create a session
    console.log('\n3. Creating session...');
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        sessionToken: 'test-session-' + Date.now(),
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });
    console.log('✓ Session created:', session.id);
    
    // Test 4: Verify we can read the account with tokens
    console.log('\n4. Reading account back...');
    const readAccount = await prisma.account.findUnique({
      where: { id: account.id }
    });
    console.log('✓ Account read successfully');
    console.log('  - refresh_token length:', readAccount.refresh_token?.length || 0);
    console.log('  - access_token length:', readAccount.access_token?.length || 0);
    console.log('  - id_token length:', readAccount.id_token?.length || 0);
    
    // Cleanup
    console.log('\n5. Cleaning up test data...');
    await prisma.account.delete({ where: { id: account.id } });
    await prisma.session.delete({ where: { id: session.id } });
    await prisma.user.delete({ where: { id: user.id } });
    console.log('✓ Cleanup complete');
    
    console.log('\n✅ ALL TESTS PASSED - Database can handle OAuth tokens correctly!');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nFull error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testAuth().catch(console.error);
