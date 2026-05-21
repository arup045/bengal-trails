/**
 * NO-OP seed file.
 * Original seed-content.js seeded fake users, blog posts, forum threads,
 * and test reviews. ALL fake content has been removed from the platform.
 *
 * To restore the fake seed data (development only), copy seed-content.js.disabled
 * to seed-content.js. Do NOT do this in production.
 */
async function seed() {
  console.log('ℹ️  seed-content.js is a no-op — fake data seeding is permanently disabled.');
  console.log('   Use clean-fake-data.js to remove any leftover fake data from the DB.');
}

if (require.main === module) seed();
module.exports = seed;
